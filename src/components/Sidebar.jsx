import React from "react";
import { NavLink } from "react-router-dom";

const linkClass =
  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition hover:bg-gray-100 dark:hover:bg-gray-800";
const activeClass =
  "bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-600";

export default function Sidebar() {
  const items = [
    { to: "/dashboard", label: "Dashboard", icon: "📊" },
    { to: "/consent", label: "Consent", icon: "✅" },
    { to: "/policy", label: "Policy", icon: "📜" },
    { to: "/integrations", label: "Integrations", icon: "🔗" },
    { to: "/audit", label: "Audit", icon: "🕵️" },
    { to: "/report-issue", label: "Report Issue", icon: "🐞" },
    { to: "/profile", label: "Profile", icon: "👤" },
  ];

  return (
    <aside className="h-full w-full max-w-[240px] shrink-0 p-3">
      <nav className="space-y-1">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : "text-gray-700 dark:text-gray-300"}`
            }
          >
            <span className="text-lg">{it.icon}</span>
            <span>{it.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
