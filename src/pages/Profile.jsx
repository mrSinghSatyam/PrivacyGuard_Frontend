// Frontend/src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import Shell from "../components/Shell";
import { api } from "../Services/api";
import "../style/Profile.css";

export default function Profile() {
  const [profile, setProfile] = useState({
    name: "Guest",
    email: "guest@example.com",
    role: "Viewer",
    joined: "—",
    stealthEnabled: false,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await api.get("/profile");
        const u = res.data;
        setProfile({
          name: u.name,
          email: u.email,
          role: u.role,
          joined: u.joined ? new Date(u.joined).toLocaleDateString() : "—",
          stealthEnabled: u.stealthEnabled,
        });
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // 👉 Show only the FIRST LETTER as avatar
  const initials =
    profile.name && profile.name.trim().length > 0
      ? profile.name.trim().charAt(0).toUpperCase()
      : "P";

  return (
    <Shell>
      {/* 🔹 ONLY THIS TITLE WILL BE CENTERED */}
      <h1 className="profile-title-center">Profile</h1>

      <div className="profile-page">
        <div className="profile-card">
          {loading ? (
            <p className="profile-loading">Loading profile…</p>
          ) : (
            <>
              {/* Avatar */}
              <div className="profile-header-center">
                <div className="profile-avatar-large">
                  <span>{initials}</span>
                </div>
              </div>

              {/* Name + Email */}
              <div className="profile-name-center">{profile.name}</div>
              <p className="profile-email-center">{profile.email}</p>

              {/* Role + Joined */}
              <div className="profile-grid">
                <div className="profile-info-card">
                  <p className="profile-info-label">Role</p>
                  <p className="profile-info-value">{profile.role}</p>
                </div>
                <div className="profile-info-card">
                  <p className="profile-info-label">Joined</p>
                  <p className="profile-info-value">{profile.joined}</p>
                </div>
              </div>

              {/* Stealth Mode */}
              <div className="profile-section">
                <div className="profile-section-header">
                  <span className="profile-section-title">Stealth Mode</span>
                  <span
                    className={
                      "stealth-pill " +
                      (profile.stealthEnabled ? "stealth-on" : "stealth-off")
                    }
                  >
                    {profile.stealthEnabled ? "Enabled" : "Disabled"}
                  </span>
                </div>
                <p className="profile-section-text">
                  When enabled, your activity is hidden from analytics and logs.
                </p>
              </div>

              <button className="profile-edit-btn">Edit Profile</button>
            </>
          )}
        </div>
      </div>
    </Shell>
  );
}
