import React from "react";
import { useSelector } from "react-redux";
import { Check, Lock } from "lucide-react";
import { selectRole, selectJwtExp } from "../features/auth/authSlice";
import { CAPABILITIES, GRANTS } from "../utils/permission.utils";
import { Card, CardLabel } from "../components/Card";

export default function IdentityVault() {
  const role = useSelector(selectRole);
  const jwtExp = useSelector(selectJwtExp);
  const Icon = role.icon;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(240px, 320px) 1fr", gap: 16 }}>
      <Card>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <div style={{ width: 72, height: 72, borderRadius: 99, background: `${role.color}22`, border: `2px solid ${role.color}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
            <Icon size={30} color={role.color} />
          </div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{role.name}</div>
          <div style={{ color: role.color, fontSize: 12.5, marginTop: 2 }}>{role.label} · {role.sub}</div>
          <div style={{ color: "#586176", fontSize: 11, marginTop: 8, fontFamily: "'JetBrains Mono', monospace" }}>{role.id}</div>
          <div style={{ color: "#8A93A6", fontSize: 11.5, marginTop: 6 }}>{role.dept}</div>
        </div>
      </Card>
      <Card>
        <CardLabel>Decoded JWT</CardLabel>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: 10 }}>
            <div style={{ color: "#586176", fontSize: 9.5, marginBottom: 3 }}>HEADER</div>
            <div style={{ color: "#9AA5B1" }}>{`{ "alg": "HS256", "typ": "JWT" }`}</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: 10 }}>
            <div style={{ color: "#586176", fontSize: 9.5, marginBottom: 3 }}>PAYLOAD</div>
            <div style={{ color: "#C7CEDB" }}>sub: {role.id}</div>
            <div style={{ color: "#C7CEDB" }}>role: <span style={{ color: role.color, fontWeight: 700 }}>{role.label}</span></div>
            <div style={{ color: "#C7CEDB" }}>dept: {role.dept}</div>
            <div style={{ color: "#C7CEDB" }}>exp: {jwtExp ? new Date(jwtExp).toLocaleTimeString() : "—"}</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: 10 }}>
            <div style={{ color: "#586176", fontSize: 9.5, marginBottom: 3 }}>SIGNATURE</div>
            <div style={{ color: "#4E8FF2" }}>▉▉▉▉▉ HMACSHA256 ▉▉▉▉▉</div>
          </div>
        </div>
      </Card>
      <Card style={{ gridColumn: "span 2" }}>
        <CardLabel>Capabilities</CardLabel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8 }}>
          {CAPABILITIES.map((c) => {
            const on = !!GRANTS[role.key][c.id];
            return (
              <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: on ? "#F1F3F8" : "#586176" }}>
                {on ? <Check size={13} color="#22B57F" /> : <Lock size={12} color="#586176" />} {c.label}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
