import React from "react";
import { getPlatform } from "../../utils/platformRules";

export default function CharacterCounter({ platformId, length, limit, hasError }) {
  const platform = getPlatform(platformId);
  const pct = Math.min((length / limit) * 100, 100);
  const color = hasError ? "var(--coral)" : pct > 90 ? "var(--marker)" : "var(--mint)";

  return (
    <div className="flex items-center gap-8" style={{ minWidth: 150 }}>
      <span className="mono text-faint" style={{ fontSize: 11.5 }}>{platform.name}</span>
      <div
        style={{
          flex: 1,
          height: 5,
          borderRadius: 999,
          background: "var(--paper-dim)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: color,
            transition: "width 0.15s ease, background 0.15s ease",
          }}
        />
      </div>
      <span
        className="mono"
        style={{ fontSize: 11.5, color: hasError ? "var(--coral)" : "var(--ink-faint)", minWidth: 62, textAlign: "right" }}
      >
        {length}/{limit}
      </span>
    </div>
  );
}
