import { useEffect, useMemo, useRef, useState } from "react";
import { playSfx } from "../../lib/audio";
import { THEMES, applyTheme } from "../../data/theme";

const OMENS = [
  "Make one small thing beautiful before you make it bigger.",
  "The next five minutes are still yours.",
  "A good system should disappear beneath the experience.",
  "Choose the task that makes tomorrow lighter.",
  "Momentum is a collection of tiny permissions to begin.",
  "Don't optimize the life you haven't lived yet.",
  "Your attention is the rarest resource in this room.",
  "Leave a little room for the unexpected.",
];

function TemporalNexus({ session, setSession, setPage, activity }) {
  const [open, setOpen] = useState(false);
  const [omen, setOmen] = useState(OMENS[0]);
  const [pulse, setPulse] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [time, setTime] = useState(() => new Date());
  const [warp, setWarp] = useState(false);
  const ref = useRef(null);
  const tiltFrame = useRef(0);
  const pendingTilt = useRef({ x: 0, y: 0 });
  const themeKeys = useMemo(() => Object.keys(THEMES).filter(k => !THEMES[k].secret || session?.theme === k), [session?.theme]);

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => { clearInterval(id); if (tiltFrame.current) cancelAnimationFrame(tiltFrame.current); document.body.classList.remove("kairos-timewarp", "kairos-supernova"); };
  }, []);

  useEffect(() => {
    function onKey(e) {
      const target = e.target;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT" || target.isContentEditable)) return;
      if (e.key.toLowerCase() === "n") setOpen(v => !v);
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function handleMove(e) {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    pendingTilt.current = { x: -y * 12, y: x * 12 };
    if (tiltFrame.current) return;
    tiltFrame.current = requestAnimationFrame(() => {
      tiltFrame.current = 0;
      setTilt(pendingTilt.current);
    });
  }

  function ignite() {
    playSfx("success");
    document.body.classList.add("kairos-supernova");
    window.setTimeout(() => document.body.classList.remove("kairos-supernova"), 1300);
  }

  function toggleWarp() {
    playSfx("click");
    setWarp(v => {
      const next = !v;
      document.body.classList.toggle("kairos-timewarp", next);
      return next;
    });
  }

  function spark() {
    playSfx("unlock");
    setPulse(true);
    setOmen(OMENS[Math.floor(Math.random() * OMENS.length)]);
    activity?.bump?.("Opened a KAIROS moment", 1);
    window.setTimeout(() => setPulse(false), 900);
  }

  function cycleTheme() {
    const visible = Object.keys(THEMES).filter(k => !THEMES[k].secret || session?.theme === k || session?.theme === "nebula");
    const index = Math.max(0, visible.indexOf(session.theme));
    const next = visible[(index + 1) % visible.length];
    setSession(s => ({ ...s, theme: next }));
    applyTheme(next);
    playSfx("click");
  }

  const hour = time.getHours();
  const minute = time.getMinutes();
  const phase = hour < 5 ? "deep night" : hour < 12 ? "rising" : hour < 18 ? "golden hours" : hour < 22 ? "afterglow" : "deep night";
  const minuteProgress = ((hour * 60 + minute) / 1440) * 100;

  return <>
    <button type="button" className={`nexus-trigger ${open ? "is-open" : ""}`} onClick={() => { playSfx("click"); setOpen(v => !v); }} aria-label="Open Temporal Nexus" title="Temporal Nexus · N">
      <span className="nexus-trigger-core"/><span className="nexus-trigger-ring r1"/><span className="nexus-trigger-ring r2"/><span className="nexus-trigger-spark"/>
      <span className="nexus-trigger-label">NEXUS</span>
    </button>

    {open && <div className="nexus-overlay" role="dialog" aria-modal="true" aria-label="Temporal Nexus">
      <button type="button" className="nexus-backdrop" aria-label="Close Temporal Nexus" onClick={() => setOpen(false)}/>
      <div className={`nexus-panel ${pulse ? "nexus-pulse" : ""}`} ref={ref} onMouseMove={handleMove} onMouseLeave={() => setTilt({ x: 0, y: 0 })} style={{ "--tilt-x": `${tilt.x}deg`, "--tilt-y": `${tilt.y}deg` }}>
        <div className="nexus-orbit orbit-a"/><div className="nexus-orbit orbit-b"/><div className="nexus-orbit orbit-c"/>
        <div className="nexus-stars" aria-hidden="true">{Array.from({ length: 18 }, (_, i) => <i key={i} style={{ left: `${(i * 17) % 100}%`, top: `${(i * 37) % 100}%`, animationDelay: `${-i * 0.23}s` }}/>)}</div>
        <div className="nexus-header"><span className="eyebrow">KAIROS // TEMPORAL NEXUS</span><button type="button" className="nexus-close" onClick={() => setOpen(false)}>ESC</button></div>
        <div className="nexus-core-stage">
          <div className="nexus-prism" aria-hidden="true"><span/><span/><span/><b/></div>
          <div className="nexus-time serif">{time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</div>
          <div className="nexus-phase">{phase} · {session?.name || "traveler"}</div>
        </div>
        <div className="nexus-grid">
          <div className="nexus-card nexus-omen"><span className="nexus-card-label">SERENDIPITY SIGNAL</span><p>{omen}</p><button type="button" className="btn btn-primary" onClick={spark}>Generate a moment</button></div>
          <div className="nexus-card"><span className="nexus-card-label">DAY PROGRESS</span><div className="nexus-progress"><span style={{ width: `${minuteProgress}%` }}/></div><div className="nexus-progress-meta"><span>00:00</span><strong>{minuteProgress.toFixed(1)}%</strong><span>24:00</span></div><div className="nexus-stat-row"><span>XP</span><b>{activity?.xp ?? 0}</b><span>actions</span><b>{activity?.count ?? 0}</b></div></div>
          <div className="nexus-card"><span className="nexus-card-label">QUICK JUMP</span><div className="nexus-actions"><button type="button" className="btn" onClick={() => { setPage("command"); setOpen(false); }}>⌂ Command</button><button type="button" className="btn" onClick={() => { setPage("schedulerlab"); setOpen(false); }}>⟡ Scheduler</button><button type="button" className="btn" onClick={() => { setPage("benchmark"); setOpen(false); }}>◈ Benchmark</button><button type="button" className="btn" onClick={() => { setPage("timemachine"); setOpen(false); }}>↺ Time Machine</button><button type="button" className="btn nexus-special" onClick={ignite}>✦ Ignite</button><button type="button" className={`btn ${warp ? "btn-primary" : ""}`} onClick={toggleWarp}>{warp ? "◌ Restore time" : "◌ Time warp"}</button></div></div>
          <div className="nexus-card"><span className="nexus-card-label">WORLD SKIN</span><div className="nexus-theme-line"><span className="nexus-theme-orb"/><div><b>{THEMES[session?.theme]?.label || "Cosmic"}</b><small>cycle the atmosphere</small></div><button type="button" className="btn" onClick={cycleTheme}>Shuffle ↻</button></div><div className="nexus-keyhint">Press <kbd>N</kbd> anytime · <kbd>Esc</kbd> closes</div></div>
        </div>
        <div className="nexus-footer"><span>Attention is the portal.</span><span className="mono">{themeKeys.length} worlds online</span></div>
      </div>
    </div>}
  </>;
}

export { TemporalNexus };
