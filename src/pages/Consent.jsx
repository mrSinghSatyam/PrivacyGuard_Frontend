// Frontend/src/pages/Consent.jsx
import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { api, logAudit } from "../Services/api";
import "../style/Consent.css"; // make sure this path is correct

// must be 24 hex chars to be a valid Mongo ObjectId
const DEMO_USER_ID = "64f1abcd1234567890abcdef";

const isValidObjectId = (id) =>
  typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id);

export default function Consent({ userId: propUserId }) {
  const [consents, setConsents] = useState([]);
  const [socket, setSocket] = useState(null);
  const [userId, setUserId] = useState(propUserId || null);
  const [loading, setLoading] = useState(true);

  // 1️⃣ Resolve userId (prop → localStorage → demo id)
  useEffect(() => {
    if (propUserId && isValidObjectId(propUserId)) {
      setUserId(propUserId);
      return;
    }

    const storedUserRaw = localStorage.getItem("user");
    if (storedUserRaw) {
      try {
        const storedUser = JSON.parse(storedUserRaw);
        if (storedUser && isValidObjectId(storedUser._id)) {
          setUserId(storedUser._id);
          return;
        }
      } catch {
        console.warn("Failed to parse stored user JSON");
      }
    }

    // fallback demo user
    setUserId(DEMO_USER_ID);
  }, [propUserId]);

  // 2️⃣ Socket.io setup
  useEffect(() => {
    if (!userId) return;

    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    newSocket.on("connect", () => console.log("🟢 Socket connected"));
    newSocket.on("disconnect", () => console.log("🔴 Socket disconnected"));

    newSocket.on("consentUpdated", (data) => {
      if (String(data.userId) !== String(userId)) return;
      setConsents((prev) =>
        prev.map((c) =>
          c.service === data.service
            ? { ...c, permissions: data.permissions }
            : c
        )
      );
    });

    return () => newSocket.disconnect();
  }, [userId]);

  // 3️⃣ Fetch consents
  useEffect(() => {
    const fetchConsents = async () => {
      if (!userId) return;
      try {
        setLoading(true);
        const res = await api.get(`/consent/${userId}`);
        setConsents(res.data);
      } catch (err) {
        console.error("❌ Error fetching consents:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchConsents();
  }, [userId]);

  // 4️⃣ Toggle permission
  const toggleConsent = async (service) => {
    try {
      const consent = consents.find((c) => c.service === service);
      const currentlyAllowed = consent && consent.permissions.length > 0;
      const updatedPermissions = currentlyAllowed ? [] : ["granted"];

      await api.post("/consent", {
        userId,
        service,
        permissions: updatedPermissions,
      });

      // optimistic update
      setConsents((prev) =>
        prev.map((c) =>
          c.service === service ? { ...c, permissions: updatedPermissions } : c
        )
      );

      const status = updatedPermissions.length > 0 ? "Allowed" : "Blocked";
      await logAudit(`Consent changed: ${service} → ${status}`, "Satyam");
    } catch (err) {
      console.error("❌ Error updating consent:", err);
    }
  };

  // 5️⃣ UI
  return (
    <div className="consent-page">
      <h1 className="consent-title">Consent Management</h1>

      {!userId ? (
        <p className="consent-warning">
          ⚠️ No user found — please log in to view your consents.
        </p>
      ) : loading ? (
        <p>Loading consents…</p>
      ) : consents.length === 0 ? (
        <p>No consents found for this user.</p>
      ) : (
        <div className="consent-grid">
          {consents.map((c) => (
            <div key={c._id || c.service} className="consent-card">
              <div className="consent-info">
                <p className="consent-service">{c.service}</p>
                <p className="consent-permissions">
                  Permissions: {c.permissions.join(", ") || "None"}
                </p>
              </div>

              {/* ✅ same style rule for all services */}
              <button
                onClick={() => toggleConsent(c.service)}
                className={
                  "consent-btn " +
                  (c.permissions.length > 0 ? "allowed" : "blocked")
                }
              >
                {c.permissions.length > 0 ? "Allowed" : "Blocked"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
