import { useState, useEffect, useMemo } from "react";

function Hourglass({ size = 90 }) {
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);
    const minutesElapsed = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
    const dayPct = minutesElapsed / 1440;
    const topHeight = 34 * (1 - dayPct);
    const bottomHeight = 34 * dayPct;
    const minutesLeft = Math.round(1440 - minutesElapsed);
    const hoursLeft = Math.floor(minutesLeft / 60);
    const minsLeft = minutesLeft % 60;
    const closingSoon = minutesLeft <= 30;
    const grains = useMemo(() => Array.from({ length: 5 }, (_, i) => ({
        delay: i * 0.18, drift: (i % 2 === 0 ? 1 : -1) * (2 + i)
    })), []);
    return (<div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <svg width={size} height={size * 1.3} viewBox="0 0 90 117" style={{ filter: `drop-shadow(0 10px 18px rgba(0,0,0,0.4))${closingSoon ? " drop-shadow(0 0 10px rgba(226,96,122,0.5))" : ""}` }}>
        <defs>
          <linearGradient id="glassGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.22)"/>
            <stop offset="100%" stopColor="rgba(255,255,255,0.02)"/>
          </linearGradient>
        </defs>
        <path d="M14 6 H76 V16 L48 58 L76 100 V110 H14 V100 L42 58 L14 16 Z" fill="url(#glassGrad)" stroke="var(--panel-border)" strokeWidth="2" strokeLinejoin="round"/>
        <rect x="6" y="2" width="78" height="8" rx="3" fill={closingSoon ? "var(--danger)" : "var(--accent)"}/>
        <rect x="6" y="107" width="78" height="8" rx="3" fill={closingSoon ? "var(--danger)" : "var(--accent)"}/>
        <clipPath id="topClip"><path d="M18 12 H72 V16 L48 54 L22 16 Z"/></clipPath>
        <clipPath id="bottomClip"><path d="M48 62 L74 100 V104 H18 V100 Z"/></clipPath>
        <rect x="18" y={16 + (34 - topHeight)} width="54" height={topHeight} fill="var(--gold)" opacity="0.85" clipPath="url(#topClip)" style={{ transition: "y 1s var(--ease-measure), height 1s var(--ease-measure)" }}/>
        <rect x="18" y={104 - bottomHeight} width="54" height={bottomHeight} fill="var(--gold)" opacity="0.85" clipPath="url(#bottomClip)" style={{ transition: "y 1s var(--ease-measure), height 1s var(--ease-measure)" }}/>
        <rect x="46.5" y="54" width="3" height="8" fill="var(--gold)" opacity="0.9"/>
        {grains.map((g, i) => (<circle key={i} r="1.4" fill="var(--gold)" opacity="0.9">
            <animate attributeName="cy" values="58;100" dur="1s" begin={`${g.delay}s`} repeatCount="indefinite"/>
            <animate attributeName="cx" values={`${48 + g.drift};${48 - g.drift / 2}`} dur="1s" begin={`${g.delay}s`} repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.9;0.9;0" dur="1s" begin={`${g.delay}s`} repeatCount="indefinite"/>
          </circle>))}
      </svg>
      <div style={{ fontSize: 10, color: closingSoon ? "var(--danger)" : "var(--muted)", textAlign: "center" }}>
        {closingSoon ? "⚠ Today's window is closing" : `Today's KAIROS window — ${hoursLeft}h ${minsLeft}m left`}
      </div>
    </div>);
}

export { Hourglass };
