import { useState, useEffect } from "react";

function Clock3D({ size = 150 }) {
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);
    const h = now.getHours() % 12, m = now.getMinutes(), s = now.getSeconds();
    const hourAngle = (h * 30) + (m * 0.5);
    const minAngle = m * 6 + s * 0.1;
    const secAngle = s * 6;
    const ticks = Array.from({ length: 12 }, (_, i) => i);
    return (<div style={{ width: size, height: size, perspective: 600, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: size, height: size, position: "relative", transformStyle: "preserve-3d", transform: "rotateX(8deg)" }}>
        <svg width={size} height={size} viewBox="0 0 200 200" style={{ filter: "drop-shadow(0 18px 24px rgba(0,0,0,0.45))" }}>
          <defs>
            <radialGradient id="clockBezel" cx="35%" cy="30%" r="75%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.25)"/>
              <stop offset="55%" stopColor="var(--panel)"/>
              <stop offset="100%" stopColor="rgba(0,0,0,0.35)"/>
            </radialGradient>
            <radialGradient id="clockFace" cx="40%" cy="35%" r="70%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.08)"/>
              <stop offset="100%" stopColor="rgba(0,0,0,0.2)"/>
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="96" fill="url(#clockBezel)" stroke="var(--panel-border)" strokeWidth="2"/>
          <circle cx="100" cy="100" r="82" fill="url(#clockFace)"/>
          {ticks.map(i => (<line key={i} x1="100" y1="22" x2="100" y2={i % 3 === 0 ? "32" : "28"} stroke={i % 3 === 0 ? "var(--accent2)" : "var(--muted)"} strokeWidth={i % 3 === 0 ? "3" : "1.5"} transform={`rotate(${i * 30} 100 100)`}/>))}
          <line x1="100" y1="100" x2="100" y2="58" stroke="var(--text)" strokeWidth="5" strokeLinecap="round" transform={`rotate(${hourAngle} 100 100)`}/>
          <line x1="100" y1="100" x2="100" y2="38" stroke="var(--text)" strokeWidth="3.5" strokeLinecap="round" transform={`rotate(${minAngle} 100 100)`}/>
          <line x1="100" y1="112" x2="100" y2="30" stroke="var(--accent2)" strokeWidth="1.6" strokeLinecap="round" style={{ transition: "transform 0.15s var(--ease-measure)" }} transform={`rotate(${secAngle} 100 100)`}/>
          <circle cx="100" cy="100" r="5" fill="var(--accent2)"/>
        </svg>
      </div>
    </div>);
}

export { Clock3D };
