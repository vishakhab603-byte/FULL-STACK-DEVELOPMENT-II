import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Grid3x3, PenTool, Fingerprint, Layers, ScrollText, Clock, Palette, LogOut } from "lucide-react";
import { selectRole, selectJwtExp, logout } from "../features/auth/authSlice";
import { selectTheme, cycleTheme } from "../features/theme/themeSlice";
import { useNow } from "../hooks/useNow";
import PrismIcon from "../components/PrismIcon";

const PAGES = [
  { to: "/", label: "Command Center", icon: Grid3x3, end: true },
  { to: "/studio", label: "Creator Studio", icon: PenTool },
  { to: "/vault", label: "Identity Vault", icon: Fingerprint },
  { to: "/matrix", label: "Permission Matrix", icon: Layers },
  { to: "/audit", label: "Audit Chronicle", icon: ScrollText },
];

function jwtHealth(remaining) {
  if (remaining <= 0) return { label: "Expired", color: "#E14B4B" };
  if (remaining < 60) return { label: "Near Expiry", color: "#E0A030" };
  return { label: "Valid", color: "#22B57F" };
}

export default function DashboardLayout() {
  const role = useSelector(selectRole);
  const jwtExp = useSelector(selectJwtExp);
  const theme = useSelector(selectTheme);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const now = useNow();

  const remaining = jwtExp ? Math.max(0, Math.floor((jwtExp - now) / 1000)) : 0;
  const health = jwtHealth(remaining);
  const Icon = role.icon;

  const onLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  return (
    <div style={{ minHeight: "100vh", background: theme.bg, color: "#F1F3F8", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ height: 56, borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <PrismIcon color={theme.accent} size={22} />
          <span style={{ fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", fontSize: 15 }}>PRISM</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#8A93A6", fontSize: 12 }}>
            <Clock size={13} /> {new Date(now).toLocaleTimeString()}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, color: health.color }}>
            <span style={{ width: 7, height: 7, borderRadius: 99, background: health.color }} /> JWT {health.label}
          </div>
          <button onClick={() => dispatch(cycleTheme())} title={`Theme: ${theme.label}`} style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "5px 9px", color: "#8A93A6", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontSize: 11.5 }}>
            <Palette size={13} /> {theme.label}
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: `${role.color}18`, border: `1px solid ${role.color}44`, borderRadius: 8, padding: "4px 10px", fontSize: 11.5, color: role.color }}>
            <Icon size={12} /> {role.label}
          </div>
          <button onClick={onLogout} style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "6px 9px", color: "#8A93A6", cursor: "pointer", display: "flex", alignItems: "center" }}>
            <LogOut size={14} />
          </button>
        </div>
      </div>

      <div style={{ display: "flex" }}>
        <div style={{ width: 210, flexShrink: 0, borderRight: "1px solid rgba(255,255,255,0.06)", padding: "20px 12px", display: "flex", flexDirection: "column", gap: 4, minHeight: "calc(100vh - 56px)" }}>
          {PAGES.map((p) => {
            const PIcon = p.icon;
            return (
              <NavLink
                key={p.to}
                to={p.to}
                end={p.end}
                style={({ isActive }) => ({
                  display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 9,
                  background: isActive ? `${role.color}18` : "transparent",
                  border: isActive ? `1px solid ${role.color}44` : "1px solid transparent",
                  color: isActive ? "#F1F3F8" : "#8A93A6", fontSize: 13, textDecoration: "none",
                })}
              >
                <PIcon size={15} /> {p.label}
              </NavLink>
            );
          })}
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: 99, background: `${role.color}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon size={14} color={role.color} />
            </div>
            <div>
              <div style={{ fontSize: 11.5 }}>{role.name}</div>
              <div style={{ color: "#586176", fontSize: 10 }}>{role.label}</div>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, padding: 20 }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
