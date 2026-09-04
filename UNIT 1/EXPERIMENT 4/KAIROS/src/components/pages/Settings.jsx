import { useState, useEffect } from "react";
import { ROLES, THEMES, applyTheme } from "../../data/theme";

function Settings({ session, setSession, calm, setCalm, onLogout, secretUnlocked, muted, setMuted, autoReduced, onResetWorkspace }) {
    const [theme, setTheme] = useState(session.theme);
    useEffect(() => { applyTheme(theme); }, [theme]);
    const visibleThemes = Object.entries(THEMES).filter(([, t]) => !t.secret || secretUnlocked);
    return (<div className="fade-in">
      <div className="topbar">
        <div className="serif" style={{ fontSize: 24 }}>Settings</div>
      </div>
      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <div className="section-title">Atmosphere{secretUnlocked ? " · a secret world has been found" : ""}</div>
        <div className="theme-grid">
          {visibleThemes.map(([key, t]) => (<div key={key} className={"theme-chip" + (theme === key ? " active" : "")} style={{ background: `linear-gradient(135deg, ${t.accent}, ${t.accent2})` }} onClick={() => { setTheme(key); setSession(s => ({ ...s, theme: key })); }}>
              {t.label}
            </div>))}
        </div>
      </div>
      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <div className="toggle-row">
          <span>Calm mode — reduce all motion</span>
          <label className="switch"><input type="checkbox" checked={calm} onChange={e => setCalm(e.target.checked)}/><span className="slider"/></label>
        </div>
        <div className="toggle-row">
          <span>Sound effects</span>
          <label className="switch"><input type="checkbox" checked={!muted} onChange={e => setMuted(!e.target.checked)}/><span className="slider"/></label>
        </div>
      </div>
      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <div className="section-title">Adaptive Performance</div>
        <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>Not a toggle — this measures real frame rate continuously and automatically reduces cursor/tilt/particle effects if it drops below ~30fps, restoring them once it recovers above ~50fps. Stress it for real in the Chaos Lab or Benchmark Arena and watch this change.</div>
        <span className="pill" style={{ color: autoReduced ? "var(--gold)" : "var(--accent2)" }}>{autoReduced ? "⚙ currently reduced — measured strain" : "✓ running at full effects"}</span>
      </div>
      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <div className="section-title">Workspace memory</div>
        <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.7, marginBottom: 12 }}>Calendar events and content are now remembered in this browser, so KAIROS survives a refresh without pretending there is a remote backend.</div>
        <button className="btn" onClick={() => { if (window.confirm("Reset your local KAIROS calendar to its starter state?")) onResetWorkspace?.(); }}>Reset calendar workspace</button>
      </div>
      <div className="card" style={{ padding: 20 }}>
        <div className="section-title">Role</div>
        <div className="role-row">
          {Object.entries(ROLES).map(([key, r]) => (<div key={key} className={"role-chip" + (session.role === key ? " active" : "")} onClick={() => setSession(s => ({ ...s, role: key }))}>{r.label}</div>))}
        </div>
        <button className="btn" style={{ marginTop: 18 }} onClick={onLogout}>Sign out</button>
      </div>
    </div>);
}

export { Settings };
