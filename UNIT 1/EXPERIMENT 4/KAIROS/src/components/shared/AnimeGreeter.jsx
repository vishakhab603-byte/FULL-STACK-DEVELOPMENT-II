import { useState, useEffect, useMemo, useRef } from "react";
import { playSfx } from "../../lib/audio";
import { greeterLine } from "../../lib/greeterLine";

function AnimeGreeter({ show, name, onDone }) {
  const [phase, setPhase] = useState("dash");
  const doneRef = useRef(onDone);
  useEffect(() => { doneRef.current = onDone; }, [onDone]);
  const line = useMemo(() => greeterLine(name || "Traveler"), [show, name]);
  useEffect(() => {
    if (!show) return;
    playSfx("unlock"); setPhase("dash");
    const timers = [550, 950, 1300, 4200, 5000].map((ms, i) => setTimeout(() => {
      if (i === 4) doneRef.current(); else setPhase(["spin","burst","talk","exit"][i]);
    }, ms));
    return () => timers.forEach(clearTimeout);
  }, [show]);
  if (!show) return null;
  const sparks = [0,30,60,90,120,150,180,210,240,270,300,330];
  return <div className={`anime-greeter-overlay anime-greeter-${phase}`} role="dialog" aria-label="KAIROS greeting" onClick={onDone}>
    <div className="greeter-stars" aria-hidden="true">{Array.from({length:18},(_,i)=><i key={i} style={{left:`${(i*37)%100}%`,top:`${(i*61)%100}%`,animationDelay:`${(i%7)*.3}s`}}/>)}</div>
    <div className="anime-greeter-stage">
      <div className="anime-greeter-orbit orbit-one"/><div className="anime-greeter-orbit orbit-two"/>
      {phase === "talk" && <div className="anime-greeter-bubble"><span className="bubble-kicker">KAIRO-CHAN • TEMPORAL GUIDE</span>{line}<small>click anywhere to continue</small></div>}
      {(phase === "spin" || phase === "burst") && <div className="anime-power-ring"/>}
      {phase === "burst" && sparks.map(a => <span key={a} className="anime-burst-spark" style={{"--angle":`${a}deg`}}/>)}
      <div className="anime-aura"/>
      <svg width="230" height="270" viewBox="0 0 230 270" className={`anime-greeter-figure anime-figure-${phase}`}>
        <defs><linearGradient id="animeHair2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="var(--accent)"/><stop offset="1" stopColor="var(--accent2)"/></linearGradient><linearGradient id="animeCoat" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#25263b"/><stop offset="1" stopColor="#11121e"/></linearGradient></defs>
        <ellipse cx="115" cy="253" rx="62" ry="12" fill="rgba(0,0,0,.45)"/>
        <g className="anime-cape"><path d="M75 132 Q115 150 155 132 L176 230 Q115 251 54 230Z" fill="url(#animeCoat)" stroke="rgba(255,255,255,.1)"/><path d="M115 143 L115 230" stroke="var(--accent2)" opacity=".55"/></g>
        <g className="anime-arm-wave"><path d="M154 151 Q194 132 193 92" stroke="#191a2a" strokeWidth="17" strokeLinecap="round" fill="none"/><circle cx="193" cy="88" r="12" fill="#f3c9a5"/><path d="M193 77 l7 -12 M193 77 l-2 -15 M193 78 l10 -9" stroke="#f3c9a5" strokeWidth="5" strokeLinecap="round"/></g>
        <path d="M76 151 Q43 168 48 206" stroke="#191a2a" strokeWidth="17" strokeLinecap="round" fill="none"/>
        <circle cx="115" cy="91" r="51" fill="#f3c9a5"/>
        <path d="M65 81 Q72 23 116 27 Q157 22 166 80 Q144 55 116 59 Q84 55 65 81Z" fill="url(#animeHair2)"/>
        <path d="M68 78 Q54 111 72 126 Q62 103 72 77Z M162 78 Q176 109 157 126 Q168 100 158 77Z" fill="url(#animeHair2)"/>
        <path d="M88 51 Q104 39 119 45" stroke="rgba(255,255,255,.4)" strokeWidth="4" strokeLinecap="round" opacity=".45"/>
        <ellipse className="anime-eye" cx="96" cy="93" rx="7" ry="10" fill="#151522"/><ellipse className="anime-eye" cx="134" cy="93" rx="7" ry="10" fill="#151522"/>
        <circle cx="98" cy="89" r="2.5" fill="#fff"/><circle cx="136" cy="89" r="2.5" fill="#fff"/>
        <path d="M103 113 Q115 122 127 113" stroke="#b96d60" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <ellipse cx="83" cy="108" rx="8" ry="4" fill="var(--accent2)" opacity=".25"/><ellipse cx="147" cy="108" rx="8" ry="4" fill="var(--accent2)" opacity=".25"/>
        <path d="M91 144 L139 144 L131 171 L99 171Z" fill="rgba(var(--accent-rgb),.18)" stroke="var(--accent2)" opacity=".8"/>
        <circle cx="115" cy="157" r="7" fill="#fff" opacity=".9"/><circle cx="115" cy="157" r="15" fill="none" stroke="var(--accent2)" opacity=".45"/>
      </svg>
      <div className="anime-sigil" aria-hidden="true"><span/><span/><span/><b>今</b></div><div className="anime-greeter-nameplate"><b>KAIRO</b><span>keeper of the now</span></div>
    </div>
    <button className="anime-skip" type="button" onClick={onDone}>ENTER KAIROS <span>↵</span></button>
  </div>;
}
export { AnimeGreeter };
