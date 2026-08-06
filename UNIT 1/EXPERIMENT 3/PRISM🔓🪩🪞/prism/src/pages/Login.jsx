import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AlertCircle, ChevronDown, ChevronUp, Eye, EyeOff } from "lucide-react";
import { ROLES, roleByKey, verifyCredentials, QUOTES } from "../features/roles/roles";
import { login } from "../features/auth/authSlice";
import { grantedCount } from "../utils/permission.utils";
import PrismIcon from "../components/PrismIcon";

const AUTH_STEPS = ["Verifying credentials…", "Generating JWT…", "Decoding payload…", "Signing token…", "Determining access level…", "Assembling Command Center…"];
const STEP_DELAYS = [50, 550, 1150, 1750, 2350, 2950];
const NAVIGATE_DELAY = 3500;

function AuthOverlay({ step, role }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "#05070cee", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 50, backdropFilter: "blur(4px)" }}>
      <PrismIcon color={role.color} size={84} spinning={step >= 4} pulse={step >= 1} />
      <div style={{ color: "#8A93A6", fontSize: 12.5, marginTop: 18 }}>{AUTH_STEPS[Math.min(step, AUTH_STEPS.length - 1)]}</div>
      <div style={{ width: 380, maxWidth: "90vw", marginTop: 26, fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5 }}>
        {step >= 1 && (
          <div className="jwt-fade" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 14px", marginBottom: 8 }}>
            <div style={{ color: "#586176", fontSize: 9.5, marginBottom: 4 }}>HEADER</div>
            <div style={{ color: "#9AA5B1" }}>{`{ "alg": "HS256", "typ": "JWT" }`}</div>
          </div>
        )}
        {step >= 2 && (
          <div className="jwt-fade" style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${role.color}44`, borderRadius: 10, padding: "10px 14px", marginBottom: 8 }}>
            <div style={{ color: "#586176", fontSize: 9.5, marginBottom: 4 }}>PAYLOAD</div>
            <div style={{ color: "#C7CEDB" }}>sub: {role.id}</div>
            <div style={{ color: role.color, fontWeight: 700 }}>role: {role.label}</div>
            <div style={{ color: "#C7CEDB" }}>permissions: [{grantedCount(role.key)}]</div>
          </div>
        )}
        {step >= 3 && (
          <div className="jwt-fade" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 14px" }}>
            <div style={{ color: "#586176", fontSize: 9.5, marginBottom: 4 }}>SIGNATURE</div>
            <div style={{ color: "#4E8FF2" }}>▉▉▉▉▉ verified ▉▉▉▉▉</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Login() {
  const [authRoleKey, setAuthRoleKey] = useState(null);
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [showDemoCreds, setShowDemoCreds] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const timeouts = useRef([]);

  useEffect(() => () => timeouts.current.forEach(clearTimeout), []);

  const beginAuth = (roleKey) => {
    setAuthRoleKey(roleKey);
    setStep(0);
    STEP_DELAYS.forEach((d, i) => {
      timeouts.current.push(setTimeout(() => setStep(i), d));
    });
    timeouts.current.push(
      setTimeout(() => {
        dispatch(login({ roleKey }));
        navigate("/", { replace: true });
      }, NAVIGATE_DELAY)
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("Enter both a username and a password.");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      const result = verifyCredentials(username, password);
      setSubmitting(false);
      if (!result.ok) {
        setError(result.error);
        setShake(true);
        setTimeout(() => setShake(false), 500);
        return;
      }
      beginAuth(result.roleKey);
    }, 500);
  };

  if (authRoleKey) {
    return <AuthOverlay step={step} role={roleByKey(authRoleKey)} />;
  }

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(circle at 20% -10%, #1c2b4a 0%, #0b0e17 55%, #060811 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 20px", color: "#F1F3F8", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
          <PrismIcon color="#5B8DEF" size={72} pulse />
        </div>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 40, letterSpacing: 1 }}>PRISM</div>
        <div style={{ color: "#8A93A6", fontSize: 13, letterSpacing: 2, textTransform: "uppercase", marginTop: 4 }}>Identity Operating System</div>
        <div style={{ color: "#C7CEDB", fontSize: 15, marginTop: 18, fontFamily: "'Space Grotesk', sans-serif" }}>One Identity. Infinite Perspectives.</div>
      </div>

      <form
        onSubmit={handleSubmit}
        className={shake ? "shake" : ""}
        style={{ width: "100%", maxWidth: 340, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 22, backdropFilter: "blur(10px)" }}
      >
        <div style={{ color: "#6C7688", fontSize: 11, marginBottom: 14, letterSpacing: 1, textTransform: "uppercase" }}>Authenticate to continue</div>

        <label style={{ display: "block", fontSize: 11.5, color: "#8A93A6", marginBottom: 5 }}>Username</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="e.g. ava.sterling"
          autoComplete="username"
          style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 9, color: "#F1F3F8", padding: "9px 11px", fontSize: 13, marginBottom: 12 }}
        />

        <label style={{ display: "block", fontSize: 11.5, color: "#8A93A6", marginBottom: 5 }}>Password</label>
        <div style={{ position: "relative", marginBottom: 14 }}>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 9, color: "#F1F3F8", padding: "9px 34px 9px 11px", fontSize: 13 }}
          />
          <button type="button" onClick={() => setShowPassword((v) => !v)} style={{ position: "absolute", right: 8, top: 8, background: "none", border: "none", color: "#586176", cursor: "pointer", display: "flex" }}>
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>

        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#E14B4B", fontSize: 12, marginBottom: 12 }}>
            <AlertCircle size={13} /> {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          style={{ width: "100%", background: "#5B8DEF22", border: "1px solid #5B8DEF66", color: "#5B8DEF", borderRadius: 9, padding: "10px 0", fontSize: 13, fontWeight: 600, cursor: submitting ? "wait" : "pointer" }}
        >
          {submitting ? "Verifying…" : "Sign In"}
        </button>

        <button
          type="button"
          onClick={() => setShowDemoCreds((v) => !v)}
          style={{ width: "100%", background: "none", border: "none", color: "#586176", fontSize: 11, marginTop: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}
        >
          Demo credentials {showDemoCreds ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

        {showDemoCreds && (
          <div style={{ marginTop: 10, borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 10, display: "flex", flexDirection: "column", gap: 6, maxHeight: 180, overflowY: "auto" }}>
            {ROLES.map((r) => (
              <div key={r.key} style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, fontFamily: "'JetBrains Mono', monospace", color: "#8A93A6" }}>
                <span style={{ color: r.color }}>{r.label}</span>
                <span>{r.username} / {r.password}</span>
              </div>
            ))}
          </div>
        )}
      </form>

      <div style={{ color: "#586176", fontSize: 11, marginTop: 26, fontStyle: "italic" }}>"{QUOTES[0]}"</div>
    </div>
  );
}
