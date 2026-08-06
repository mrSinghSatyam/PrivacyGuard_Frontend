// Frontend/src/components/Shell.jsx
import React from "react";

export default function Shell({ title, children }) {
  return (
    <div className="shell">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {title && (
          <h1 className="text-2xl font-bold mb-4">
            {title}
          </h1>
        )}
        {children}
      </div>
    </div>
  );
}
