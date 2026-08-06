import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";
import "../style/Audit.css";   // make sure this path is correct

const socket = io("http://localhost:5000");

export default function Audit() {
  const [logs, setLogs] = useState([]);

  // Fetch initial logs
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/audit");
        setLogs(res.data.logs || []);
      } catch (err) {
        console.error("Error fetching logs:", err);
      }
    };
    fetchLogs();
  }, []);

  // Listen for real-time updates
  useEffect(() => {
    socket.on("newAudit", (newLog) => {
      setLogs((prevLogs) => [newLog, ...prevLogs]);
    });

    return () => {
      socket.off("newAudit");
    };
  }, []);

  // 🔹 Helper: split combined text like
  // "System Enabled Stealth Mode from Dashboard"
  const normalizeLog = (log) => {
    let actor = log.actor || "System";
    let action = log.action || "";

    // If action is empty but actor contains whole sentence, split it
    if (!action && actor.includes(" ")) {
      const firstSpace = actor.indexOf(" ");
      const possibleActor = actor.slice(0, firstSpace); // "System"
      const rest = actor.slice(firstSpace + 1);         // "Enabled Stealth Mode..."

      actor = possibleActor;
      action = rest;
    }

    return { actor, action };
  };

  return (
    <div className="audit-page">
      <h1 className="audit-title">Audit &amp; Transparency Log</h1>

      <div className="audit-table-wrapper">
        <table className="audit-table">
          <thead>
            <tr>
              <th>Actor</th>
              <th>Action</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {logs.length > 0 ? (
              logs.map((log, index) => {
                const { actor, action } = normalizeLog(log);
                return (
                  <tr key={log._id || index}>
                    <td>{actor}</td>
                    <td>{action}</td>
                    <td className="audit-time">
                      {log.createdAt
                        ? new Date(log.createdAt).toLocaleString()
                        : "-"}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="3" className="audit-empty">
                  No audit logs found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
