import React from "react";

export function Card({ children, style }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.035)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 16,
        padding: 18,
        backdropFilter: "blur(10px)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function CardLabel({ children }) {
  return (
    <div style={{ color: "#8A93A6", fontSize: 10.5, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 10 }}>
      {children}
    </div>
  );
}
