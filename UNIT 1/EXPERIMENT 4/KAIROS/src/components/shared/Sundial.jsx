import { useState, useEffect } from "react";

function Sundial({ size = 90 }) {
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 30000);
        return () => clearInterval(id);
    }, []);
    const hours = now.getHours() + now.getMinutes() / 60;
    const daylight = hours >= 6 && hours <= 18;
    const shadowAngle = ((hours - 12) / 12) * 160;
    const shadowLen = daylight ? 10 + Math.abs(12 - hours) * 3.2 : 34;
    const rad = (shadowAngle * Math.PI) / 180;
    const shadowX = 50 + Math.sin(rad) * shadowLen;
    const shadowY = 50 + Math.cos(rad) * shadowLen * 0.55;
    const hourMarks = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
    return (<div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ filter: "drop-shadow(0 8px 14px rgba(0,0,0,0.35))" }}>
        <defs>
          <radialGradient id="dialFace" cx="40%" cy="35%" r="70%">
            <stop offset="0%" stopColor={daylight ? "rgba(255,220,150,0.18)" : "rgba(120,140,255,0.12)"}/>
            <stop offset="100%" stopColor="rgba(0,0,0,0.22)"/>
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="46" fill="url(#dialFace)" stroke="var(--panel-border)" strokeWidth="2"/>
        {hourMarks.map(h => {
            const a = ((h - 12) / 12) * 160;
            const r = (a * Math.PI) / 180;
            const x1 = 50 + Math.sin(r) * 40, y1 = 50 + Math.cos(r) * 40 * 0.55;
            const x2 = 50 + Math.sin(r) * 45, y2 = 50 + Math.cos(r) * 45 * 0.55;
            return <line key={h} x1={x1} y1={y1} x2={x2} y2={y2} stroke={h === 12 ? "var(--gold)" : "var(--muted)"} strokeWidth={h === 12 ? 2 : 1}/>;
        })}
        <line x1="50" y1="50" x2={shadowX} y2={shadowY} stroke={daylight ? "var(--gold)" : "var(--accent2)"} strokeWidth="2.4" strokeLinecap="round" style={{ transition: "all 1s var(--ease-measure)" }}/>
        <polygon points="47,50 53,50 50,14" fill="var(--accent)" opacity="0.85"/>
        <circle cx="50" cy="50" r="3" fill="var(--text)"/>
      </svg>
      <div style={{ fontSize: 10, color: "var(--muted)", textAlign: "center" }}>
        {daylight ? "☀ Sundial — reading the light" : "☾ Sundial — resting in shadow"}
      </div>
    </div>);
}

export { Sundial };
