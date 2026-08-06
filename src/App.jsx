// Frontend/src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Dashboard from "./pages/Dashboard";
import Audits from "./pages/Audit";
import Consent from "./pages/Consent";
import Reports from "./pages/ReportIssue";
import Profile from "./pages/Profile";
import Integrations from "./pages/Integrations";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/audits" element={<Audits />} />
            <Route path="/consent" element={<Consent />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/integrations" element={<Integrations />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
