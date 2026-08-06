import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RefreshCw, Lock, PenTool, ShieldCheck, User, BarChart3, Shield, Code2 } from "lucide-react";
import { selectRole, selectJwtExp, selectLoginAt, switchRole, refreshJWT } from "../features/auth/authSlice";
import { selectAuditLog } from "../features/audit/auditSlice";
import { ROLES } from "../features/roles/roles";
import { CAPABILITIES, GRANTS, grantedCount } from "../utils/permission.utils";
import { useNow } from "../hooks/useNow";
import { Card, CardLabel } from "../components/Card";
import Gauge from "../components/Gauge";
import PrismIcon from "../components/PrismIcon";

const QUICK_ACTIONS = [
  { cap: "createPost", label: "New Post", icon: PenTool },
  { cap: "approvePost", label: "Approval Queue", icon: ShieldCheck },
  { cap: "manageUsers", label: "Manage Users", icon: User },
  { cap: "viewAnalytics", label: "Insight Observatory", icon: BarChart3 },
  { cap: "manageSecurity", label: "Security Nexus", icon: Shield },
  { cap: "accessDeveloperTools", label: "Developer Forge", icon: Code2 },
];

const pad2 = (n) => String(n).padStart(2, "0");

function jwtHealth(remaining) {
  if (remaining <= 0) return { label: "Expired", color: "#E14B4B" };
  if (remaining < 60) return { label: "Near Expiry", color: "#E0A030" };
  return { label: "Valid", color: "#22B57F" };
}

export default function CommandCenter() {
  const role = useSelector(selectRole);
  const jwtExp = useSelector(selectJwtExp);
  const loginAt = useSelector(selectLoginAt);
  const auditLog = useSelector(selectAuditLog);
  const dispatch = useDispatch();
  const [switching, setSwitching] = useState(false);
  const now = useNow();

  const remaining = jwtExp ? Math.max(0, Math.floor((jwtExp - now) / 1000)) : 0;
  const health = jwtHealth(remaining);
  const sessionSeconds = loginAt ? Math.floor((now - loginAt) / 1000) : 0;
  const Icon = role.icon;

  const cycleRole = () => {
    const idx = ROLES.findIndex((r) => r.key === role.key);
    const next = ROLES[(idx + 1) % ROLES.length];
    setSwitching(true);
    setTimeout(() => {
      dispatch(switchRole(next.key));
      setSwitching(false);
    }, 450);
  };

  return (
    <div className="stagger-parent" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 16 }}>
      <Card style={{ gridColumn: "span 2", display: "flex", alignItems: "center", gap: 20, minWidth: 280 }}>
        <button onClick={cycleRole} title="Rotate the Identity Prism — simulate another identity" style={{ background: "none", border: "none", cursor: "pointer", padding: 6 }}>
          <PrismIcon color={role.color} size={70} spinning={switching} pulse />
        </button>
        <div style={{ flex: 1 }}>
          <CardLabel>Identity Prism · Demo Mode</CardLabel>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", display: "flex", alignItems: "center", gap: 8 }}>
            <Icon size={17} color={role.color} /> {role.label}
            <span style={{ color: "#586176", fontWeight: 400, fontSize: 12 }}>· {role.sub}</span>
          </div>
          <div style={{ color: "#8A93A6", fontSize: 12.5, marginTop: 4, fontStyle: "italic" }}>"{role.greeting}"</div>
          <button onClick={cycleRole} style={{ marginTop: 10, background: `${role.color}18`, border: `1px solid ${role.color}55`, color: role.color, fontSize: 11.5, padding: "6px 12px", borderRadius: 8, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <RefreshCw size={12} /> Click prism to refract into another identity
          </button>
        </div>
      </Card>

      <Card>
        <CardLabel>Welcome</CardLabel>
        <div style={{ fontSize: 16, fontWeight: 600 }}>{role.name.split(" ")[0]}</div>
        <div style={{ color: "#586176", fontSize: 11, marginTop: 2 }}>{new Date(now).toLocaleTimeString()}</div>
      </Card>

      <Card>
        <CardLabel>JWT Health</CardLabel>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: 99, background: health.color }} />
          <span style={{ color: health.color, fontSize: 13, fontWeight: 600 }}>{health.label}</span>
        </div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, marginTop: 8 }}>
          {pad2(Math.floor(remaining / 60))}:{pad2(remaining % 60)}
        </div>
        <button onClick={() => dispatch(refreshJWT())} style={{ marginTop: 8, fontSize: 10.5, color: "#8A93A6", background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "4px 8px", cursor: "pointer" }}>
          Refresh token
        </button>
      </Card>

      <Card>
        <CardLabel>Security Score</CardLabel>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Gauge value={role.score} color={role.color} />
          <div style={{ color: "#8A93A6", fontSize: 11 }}>Based on role risk,<br />session health &<br />JWT integrity.</div>
        </div>
      </Card>

      <Card>
        <CardLabel>Session</CardLabel>
        <div style={{ fontSize: 20, fontFamily: "'JetBrains Mono', monospace" }}>{pad2(Math.floor(sessionSeconds / 60))}:{pad2(sessionSeconds % 60)}</div>
        <div style={{ color: "#586176", fontSize: 11, marginTop: 4 }}>Active this session</div>
        <div style={{ color: "#8A93A6", fontSize: 11.5, marginTop: 8 }}>
          Permissions granted: <b style={{ color: role.color }}>{grantedCount(role.key)}</b> / {CAPABILITIES.length}
        </div>
      </Card>

      <Card style={{ gridColumn: "span 2", minWidth: 280 }}>
        <CardLabel>Quick Actions</CardLabel>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {QUICK_ACTIONS.map((a) => {
            const AIcon = a.icon;
            const allowed = !!GRANTS[role.key][a.cap];
            return (
              <button
                key={a.label}
                disabled={!allowed}
                title={allowed ? a.label : `Requires "${CAPABILITIES.find((c) => c.id === a.cap)?.label}" — not granted to ${role.label}`}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: allowed ? `${role.color}18` : "rgba(255,255,255,0.03)",
                  border: `1px solid ${allowed ? role.color + "55" : "rgba(255,255,255,0.06)"}`,
                  color: allowed ? "#F1F3F8" : "#586176",
                  borderRadius: 9, padding: "8px 12px", fontSize: 12, cursor: allowed ? "pointer" : "not-allowed",
                }}
              >
                {allowed ? <AIcon size={13} /> : <Lock size={12} />} {a.label}
              </button>
            );
          })}
        </div>
      </Card>

      <Card style={{ gridColumn: "span 2", minWidth: 280 }}>
        <CardLabel>Recent Activity</CardLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 130, overflowY: "auto" }}>
          {auditLog.slice(0, 5).map((e) => (
            <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11.5, color: "#8A93A6" }}>
              <span style={{ width: 6, height: 6, borderRadius: 99, background: e.color, flexShrink: 0 }} />
              <span style={{ color: "#586176", fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>{e.time}</span>
              {e.message}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
