import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Check } from "lucide-react";
import { selectRoleKey } from "../features/auth/authSlice";
import { ROLES } from "../features/roles/roles";
import { CAPABILITIES, GRANTS } from "../utils/permission.utils";
import { Card, CardLabel } from "../components/Card";

export default function PermissionMatrix() {
  const activeRole = useSelector(selectRoleKey);
  const [hoverCell, setHoverCell] = useState(null);

  return (
    <Card style={{ overflowX: "auto" }}>
      <CardLabel>Permission Matrix — every role, every capability</CardLabel>
      <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 720 }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: "6px 10px", fontSize: 10.5, color: "#586176" }}>ROLE</th>
            {CAPABILITIES.map((c) => (
              <th key={c.id} style={{ padding: "6px 6px", fontSize: 9.5, color: "#586176", writingMode: "vertical-rl", transform: "rotate(180deg)", height: 90, fontWeight: 500 }}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROLES.map((r) => (
            <tr key={r.key} style={{ background: r.key === activeRole ? `${r.color}0d` : "transparent" }}>
              <td style={{ padding: "8px 10px", fontSize: 12, borderLeft: r.key === activeRole ? `3px solid ${r.color}` : "3px solid transparent", whiteSpace: "nowrap" }}>{r.label}</td>
              {CAPABILITIES.map((c) => {
                const on = !!GRANTS[r.key][c.id];
                const key = `${r.key}-${c.id}`;
                return (
                  <td key={c.id} onMouseEnter={() => setHoverCell(key)} onMouseLeave={() => setHoverCell(null)} title={`${r.label}: ${c.label} — ${on ? "granted" : "not granted"}`} style={{ textAlign: "center", padding: 6 }}>
                    <div style={{
                      width: 20, height: 20, margin: "0 auto", borderRadius: 6,
                      background: on ? `${r.color}33` : "rgba(255,255,255,0.03)",
                      border: `1px solid ${on ? r.color : "rgba(255,255,255,0.08)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transform: hoverCell === key ? "scale(1.25)" : "scale(1)",
                      transition: "transform 0.15s ease",
                    }}>
                      {on ? <Check size={11} color={r.color} /> : <span style={{ color: "#3a4152" }}>–</span>}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
