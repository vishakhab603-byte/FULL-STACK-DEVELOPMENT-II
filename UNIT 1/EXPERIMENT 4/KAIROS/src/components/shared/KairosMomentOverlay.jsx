import { useEffect, useMemo } from "react";
import { playSfx } from "../../lib/audio";

function KairosMomentOverlay({ achievement, onDone }) {
    const particles = useMemo(() => Array.from({ length: 26 }, () => ({
        px: (Math.random() - 0.5) * 320, py: (Math.random() - 0.5) * 320, delay: Math.random() * 0.3
    })), [achievement && achievement.key]);
    useEffect(() => {
        playSfx("unlock");
        const t = setTimeout(onDone, 2800);
        return () => clearTimeout(t);
    }, [achievement]);
    if (!achievement)
        return null;
    return (<div className="kairos-moment-overlay" onClick={onDone}>
      <div style={{ position: "relative" }}>
        {particles.map((p, i) => (<div key={i} className="moment-particle" style={{ "--px": p.px + "px", "--py": p.py + "px", left: "50%", top: "50%", animationDelay: p.delay + "s" }}/>))}
        <div className="kairos-moment-card">
          <div style={{ fontSize: 11, letterSpacing: "0.14em", color: "var(--gold)", textTransform: "uppercase" }}>KAIROS Moment</div>
          <div className="serif" style={{ fontSize: 30, margin: "10px 0" }}>{achievement.label}</div>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>{achievement.desc}</div>
        </div>
      </div>
    </div>);
}

export { KairosMomentOverlay };
