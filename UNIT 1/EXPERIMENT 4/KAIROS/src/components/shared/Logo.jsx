import { useState, useRef, useId, useEffect } from "react";
import { playSfx } from "../../lib/audio";

function Logo({ size = 40, interactive = false }) {
    const gid = `kairosGrad-${useId().replace(/:/g, "")}`;
    const wrapRef = useRef(null);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const [burst, setBurst] = useState(false);
    const burstTimerRef = useRef(null);
    useEffect(() => () => window.clearTimeout(burstTimerRef.current), []);
    function handleMove(e) {
        if (!interactive || !wrapRef.current)
            return;
        const rect = wrapRef.current.getBoundingClientRect();
        const nx = (e.clientX - rect.left) / rect.width - 0.5;
        const ny = (e.clientY - rect.top) / rect.height - 0.5;
        setTilt({ x: ny * -24, y: nx * 24 });
    }
    function handleLeave() { setTilt({ x: 0, y: 0 }); }
    function handleClick() {
        if (!interactive)
            return;
        playSfx("click");
        setBurst(true);
        window.clearTimeout(burstTimerRef.current);
        burstTimerRef.current = window.setTimeout(() => setBurst(false), 700);
    }
    const sparkAngles = [0, 45, 90, 135, 180, 225, 270, 315];
    return (<div className={"logo-mark" + (burst ? " logo-mark-burst" : "")} ref={wrapRef} onMouseMove={handleMove} onMouseLeave={handleLeave} onClick={handleClick} style={{ width: size, height: size, perspective: interactive ? 400 : undefined, cursor: interactive ? "pointer" : undefined }}>
      <div className="logo-glow"/>
      <div className="logo-hover-ring"/>
      {burst && sparkAngles.map(a => (<span key={a} className="logo-spark" style={{ "--angle": a + "deg" }}/>))}
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ position: "relative", transform: interactive ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` : undefined, transition: "transform .12s ease-out" }}>
        <defs>
          <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--accent)"/>
            <stop offset="100%" stopColor="var(--accent2)"/>
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="47" fill="none" stroke="var(--panel-border)" strokeWidth="0.75"/>
        <circle className="logo-ring" cx="50" cy="50" r="44" fill="none" stroke={`url(#${gid})`} strokeWidth="2" strokeDasharray="4 10" strokeLinecap="round"/>
        <circle className="logo-ring2" cx="50" cy="50" r="34" fill="none" stroke="var(--accent2)" strokeWidth="1.4" strokeDasharray="1 8" strokeLinecap="round"/>
        <circle className="logo-ring3" cx="50" cy="50" r="24" fill="none" stroke="var(--accent)" strokeWidth="1" strokeDasharray="0.5 5" strokeLinecap="round" opacity="0.5"/>
        <g className="logo-constellation" opacity=".65"><circle cx="19" cy="35" r="1.2" fill="var(--accent2)"/><circle cx="81" cy="64" r="1.2" fill="var(--accent)"/><circle cx="71" cy="19" r="1" fill="#fff"/><path d="M19 35L31 27L50 22M81 64L69 72L50 78" stroke="var(--accent2)" strokeWidth=".55" strokeDasharray="1 3" fill="none"/></g>
        <g className="logo-ticks" opacity=".75">{[0,45,90,135,180,225,270,315].map(a => <path key={a} d="M50 3v5" stroke="var(--text)" strokeWidth="1" transform={`rotate(${a} 50 50)`}/>)}</g>
        <g className="logo-comet">
          <circle cx="50" cy="7" r="2.2" fill="#fff"/>
          <circle cx="50" cy="7" r="4.5" fill="var(--accent2)" opacity="0.45"/>
        </g>
        <g className="logo-pulse">
          <path d="M50 20 L50 46 M50 54 L50 80 M32 32 L44 44 M56 56 L68 68 M32 68 L44 56 M56 44 L68 32" stroke={`url(#${gid})`} strokeWidth="3" strokeLinecap="round"/>
          <circle cx="50" cy="50" r="7" fill="#0a0a12" stroke={`url(#${gid})`} strokeWidth="2"/>
          <circle cx="50" cy="50" r="2.4" fill="var(--accent2)"/>
        </g>
        <circle className="logo-core-halo" cx="50" cy="50" r="11" fill="none" stroke="var(--accent2)" strokeWidth=".7" opacity=".45"/>
      </svg>
    </div>);
}

export { Logo };
