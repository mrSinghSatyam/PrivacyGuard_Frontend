// Layout.jsx
import React from "react";
import { Outlet, Link } from "react-router-dom";

function Layout() {
  return (
    <div>
        {/* Content */}
      <main>
        <Outlet /> {/* Child routes render here */}
      </main>
    </div>
  );
}

export default Layout;
