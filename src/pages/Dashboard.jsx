// Frontend/src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import CardWidget from "../components/CardWidget";
import { Shield, Users, FileText, EyeOff } from "lucide-react";
import "../style/Dashboard.css";
import { api, logAudit } from "../Services/api";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [stealthBusy, setStealthBusy] = useState(false);
  const [stealthOn, setStealthOn] = useState(false); // current state of stealth

  // Load dashboard summary
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await api.get("/dashboard");
        setStats(res.data);
      } catch (e) {
        setError(e.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  // Load current stealth state from profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/profile");
        setStealthOn(!!res.data.stealthEnabled);
      } catch (e) {
        console.error("Error loading profile for stealth:", e);
      }
    };
    fetchProfile();
  }, []);

  // TOGGLE Stealth Mode (enable or disable)
  const toggleStealthMode = async () => {
    if (stealthBusy) return;
    setStealthBusy(true);

    try {
      const next = !stealthOn; // if off -> on, if on -> off

      await api.post("/profile/stealth", { enabled: next });

      // write to audit trail
      await logAudit(
        next
          ? "Enabled Stealth Mode from Dashboard"
          : "Disabled Stealth Mode from Dashboard",
        "Satyam"
      );

      setStealthOn(next);
      alert(
        next
          ? "Stealth Mode enabled for this session."
          : "Stealth Mode disabled."
      );
    } catch (e) {
      console.error(e);
      alert("Could not update Stealth Mode.");
    } finally {
      setStealthBusy(false);
    }
  };

  return (
    <div className="dashboard">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-text">
          <h1>Privacy Management Dashboard</h1>
          <p>
            Manage your personal data, control visibility, and keep your social
            life safe and secure.
          </p>
          <div className="hero-buttons">
            <button
              className={`btn ${stealthOn ? "danger" : "primary"}`}
              onClick={toggleStealthMode}
              disabled={stealthBusy}
            >
              {stealthBusy
                ? "Updating..."
                : stealthOn
                ? "Disable Stealth Mode"
                : "Enable Stealth Mode"}
            </button>
            <button
              className="btn secondary"
              onClick={() => (window.location.href = "/consent")}
            >
              Learn More
            </button>
          </div>
        </div>
        <div className="hero-map">
          <div className="map-placeholder">🔒 Privacy Map</div>
        </div>
      </section>

      {error && (
        <div className="dash-error">
          <p>{error}</p>
        </div>
      )}

      {/* Card Widgets Section */}
      <section className="widgets">
        <h2 className="widgets-title">Your Privacy Overview</h2>

        {loading || !stats ? (
          <p className="loading-text">Loading your privacy overview…</p>
        ) : (
          <div className="card-grid">
            <CardWidget
              title="Active Policies"
              value={stats.activePolicies}
              subtitle="Privacy rules applied"
              right={<Shield size={28} />}
            />
            <CardWidget
              title="Users Monitored"
              value={stats.usersMonitored}
              subtitle="Across your network"
              right={<Users size={28} />}
            />
            <CardWidget
              title="Reports Generated"
              value={stats.reportsGenerated}
              subtitle="Last 30 days"
              right={<FileText size={28} />}
            />
            <CardWidget
              title="Stealth Sessions"
              value={stats.stealthSessions}
              subtitle="This week"
              right={<EyeOff size={28} />}
            />
          </div>
        )}
      </section>

      {/* News Feed Section */}
      <section className="newsfeed">
        <h2>Latest Privacy Updates</h2>

        {loading || !stats ? (
          <p className="loading-text">Loading updates…</p>
        ) : stats.recentUpdates && stats.recentUpdates.length > 0 ? (
          <div className="news-cards">
            {stats.recentUpdates.map((item) => (
              <div key={item.id} className="news-card">
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="loading-text">
            No recent privacy updates. You’re all clear for now.
          </p>
        )}
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>Key Features</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <h3>Granular Controls</h3>
            <p>Set visibility for posts, stories, and personal info.</p>
          </div>
          <div className="feature-card">
            <h3>Stealth Mode</h3>
            <p>Browse profiles and feeds without being seen.</p>
          </div>
          <div className="feature-card">
            <h3>Personal Data Protection</h3>
            <p>Secure your account with advanced encryption.</p>
          </div>
          <div className="feature-card">
            <h3>Fake Identity Detection</h3>
            <p>AI detects and blocks suspicious/fake accounts.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
