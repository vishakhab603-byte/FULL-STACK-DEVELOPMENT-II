import { useEffect, useMemo } from "react";
import { playSfx } from "../../lib/audio";

function LevelUpOverlay({ levelUp, onDone }) {
    const particles = useMemo(() => Array.from({ length: 30 }, () => ({
        px: (Math.random() - 0.5) * 360, py: (Math.random() - 0.5) * 360, delay: Math.random() * 0.35
    })), [levelUp && levelUp.to]);
    useEffect(() => {
        if (!levelUp)
            return;
        playSfx("unlock");
        const t = setTimeout(onDone, 3200);
        return () => clearTimeout(t);
    }, [levelUp]);
    if (!levelUp)
        return null;
    return (<div className="kairos-moment-overlay level-up-overlay" onClick={onDone}>
      <div style={{ position: "relative" }}>
        {particles.map((p, i) => (<div key={i} className="moment-particle" style={{ "--px": p.px + "px", "--py": p.py + "px", left: "50%", top: "50%", animationDelay: p.delay + "s", background: "var(--accent2)" }}/>))}
        <div className="kairos-moment-card level-up-card">
          <div style={{ fontSize: 11, letterSpacing: "0.14em", color: "var(--accent2)", textTransform: "uppercase" }}>Avtaara Evolution</div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, justifyContent: "center", margin: "16px 0", flexWrap: "wrap" }}>
            <div className="serif" style={{ fontSize: 19, color: "var(--muted)", textDecoration: "line-through" }}>{levelUp.from}</div>
            <div style={{ fontSize: 20, color: "var(--accent2)" }}>→</div>
            <div className="serif" style={{ fontSize: 32 }}>{levelUp.to}</div>
          </div>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>Real XP earned this. Nothing here was handed to you.</div>
        </div>
      </div>
    </div>);
}

export { LevelUpOverlay };
