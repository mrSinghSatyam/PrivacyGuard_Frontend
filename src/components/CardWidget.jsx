import React from "react";
import "../style/CardWidget.css"; // custom CSS

export default function CardWidget({ title, value, subtitle, right }) {
  return (
    <div className="card-widget">
      <div className="card-content">
        <div>
          <p className="card-title">{title}</p>
          <h3 className="card-value">{value}</h3>
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>
        <div className="card-icon">{right}</div>
      </div>
    </div>
  );
}
