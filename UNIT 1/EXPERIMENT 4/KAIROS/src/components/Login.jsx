import { useState, useEffect, useRef } from "react";
import { AnimatedWordmark } from "./shared/AnimatedWordmark";
import { Atmosphere } from "./shared/Atmosphere";
import { Logo } from "./shared/Logo";
import { ROLES, THEMES, applyTheme } from "../data/theme";
import { playSfx } from "../lib/audio";

function Login({ onEnter }) {
    const [theme, setTheme] = useState("cosmic");
    const [role, setRole] = useState("creator");
    const [name, setName] = useState("");
    const [wiping, setWiping] = useState(false);
    const enterTimerRef = useRef(null);
    useEffect(() => () => { if (enterTimerRef.current) window.clearTimeout(enterTimerRef.current); }, []);
    useEffect(() => { applyTheme(theme); }, [theme]);
    function handleEnter() {
        playSfx("success");
        setWiping(true);
        if (enterTimerRef.current) window.clearTimeout(enterTimerRef.current);
        enterTimerRef.current = window.setTimeout(() => onEnter({ theme, role, name: name.trim() || "Traveler" }), 950);
    }
    return (<div className="center-screen">
      <Atmosphere kind={THEMES[theme].kind}/>
      {wiping && <div className="transition-wipe"/>}
      <div className="card login-card fade-in">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginBottom: 22 }}>
          <Logo size={64} interactive/>
          <AnimatedWordmark size={24}/>
          <div style={{ fontSize: 12, color: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Own the moment. Shape the story.</div>
        </div>

        <div className="section-title">Your name</div>
        <input type="text" placeholder="How should KAIROS greet you?" value={name} onChange={e => setName(e.target.value)}/>

        <div className="section-title" style={{ marginTop: 18 }}>Choose your atmosphere</div>
        <div className="theme-grid">
          {Object.entries(THEMES).filter(([, t]) => !t.secret).map(([key, t]) => (<div key={key} className={"theme-chip" + (theme === key ? " active" : "")} style={{ background: `linear-gradient(135deg, ${t.accent}, ${t.accent2})` }} onClick={() => { playSfx("click"); setTheme(key); }} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); playSfx("click"); setTheme(key); } }} role="button" tabIndex={0} aria-pressed={theme === key}>
              {t.label}
            </div>))}
        </div>

        <div className="section-title">Choose your role</div>
        <div className="role-row">
          {Object.entries(ROLES).map(([key, r]) => (<div key={key} className={"role-chip" + (role === key ? " active" : "")} onClick={() => setRole(key)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setRole(key); } }} role="button" tabIndex={0} aria-pressed={role === key}>{r.label}</div>))}
        </div>

        <button className="btn btn-primary" style={{ width: "100%", marginTop: 6, padding: "13px" }} onClick={handleEnter}>
          Enter KAIROS
        </button>
      </div>
    </div>);
}

export { Login };
