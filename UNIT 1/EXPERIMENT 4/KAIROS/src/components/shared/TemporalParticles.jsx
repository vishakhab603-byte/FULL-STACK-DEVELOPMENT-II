import { useMemo } from "react";

function TemporalParticles({ type, count = 14, active }) {
    const particles = useMemo(() => Array.from({ length: count }, () => ({
        left: Math.random() * 100, top: Math.random() * 100,
        dx: ((Math.random() - 0.5) * 80).toFixed(0) + "px", dy: ((Math.random() - 0.5) * 80).toFixed(0) + "px",
        dur: (Math.random() * 3 + 2.5), delay: Math.random() * 2.4,
        sx: ((Math.random() - 0.5) * 140).toFixed(0) + "px", sy: ((Math.random() - 0.5) * 140).toFixed(0) + "px",
        len: (20 + Math.random() * 46).toFixed(0) + "px",
    })), [type, count, active]);
    if (!active)
        return null;
    return (<div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }} aria-hidden="true">
      {particles.map((p, i) => {
            if (type === "dust")
                return <div key={i} className="particle-dust" style={{ left: p.left + "%", top: p.top + "%", "--dx": p.dx, "--dy": p.dy, animationDuration: p.dur + "s", animationDelay: p.delay + "s" }}/>;
            if (type === "falling")
                return <div key={i} className="particle-falling" style={{ left: p.left + "%", animationDuration: (p.dur * 0.5) + "s", animationDelay: p.delay + "s" }}/>;
            if (type === "converge")
                return <div key={i} className="particle-converge" style={{ left: "50%", top: "50%", "--sx": p.sx, "--sy": p.sy, animationDelay: (i * 0.03) + "s" }}/>;
            if (type === "thread")
                return <div key={i} className="particle-thread" style={{ left: p.left + "%", top: p.top + "%", "--len": p.len, animationDelay: (i * 0.05) + "s" }}/>;
            return null;
        })}
    </div>);
}

export { TemporalParticles };
