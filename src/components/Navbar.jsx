import React from "react";
import { NavLink } from "react-router-dom";
import "../style/Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="logo">PrivacyGuard</div>

      {/* Menu */}
      <div className="links">
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? "active" : ""}>Home</NavLink>
        <NavLink to="/audits" className={({ isActive }) => isActive ? "active" : ""}>Audits</NavLink>
        <NavLink to="/consent" className={({ isActive }) => isActive ? "active" : ""}>Consent</NavLink>
        <NavLink to="/integrations" className={({ isActive }) => isActive ? "active" : ""}>Integrations</NavLink>
        <NavLink to="/profile" className={({ isActive }) => isActive ? "active" : ""}>Profile</NavLink>
      </div>
    </nav>
  );
}

export default Navbar;
