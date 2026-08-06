import React from "react";
import "../style/Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <p className="foot">© {new Date().getFullYear()} PrivacyGuard. All rights reserved.</p>
        <div className="footer-links">
          <a href="/policy">Privacy Policy</a>
          <a href="/consent">User Consent</a>
          <a href="/report">Report Issue</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
