function DNAHelix({ log }) {
    const width = 280, height = 100;
    if (!log || log.length < 2) {
        return <div style={{ fontSize: 12, color: "var(--muted)", textAlign: "center", padding: 20 }}>Not enough history yet to trace who you were against who you're becoming.</div>;
    }
    const chronological = [...log].reverse();
    const mid = Math.floor(chronological.length / 2);
    const early = chronological.slice(0, Math.max(2, mid));
    const recent = chronological.slice(Math.max(2, mid));
    function strandPoints(items, ampSign) {
        return items.map((it, i) => {
            const x = (i / (Math.max(1, items.length - 1))) * width;
            const y = height / 2 + ampSign * Math.sin(i * 0.9) * 24;
            return { x, y };
        });
    }
    function pathFrom(points) {
        return points.map((p, i) => (i === 0 ? "M" : "L") + p.x.toFixed(1) + "," + p.y.toFixed(1)).join(" ");
    }
    const earlyPts = strandPoints(early, 1);
    const recentPts = strandPoints(recent, -1);
    return (<div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <path d={pathFrom(earlyPts)} stroke="var(--muted)" strokeWidth="2" fill="none" opacity="0.55"/>
        <path d={pathFrom(recentPts)} stroke="var(--accent2)" strokeWidth="2" fill="none"/>
        {earlyPts.map((p, i) => <circle key={"e" + i} cx={p.x} cy={p.y} r="2.4" fill="var(--muted)"/>)}
        {recentPts.map((p, i) => <circle key={"r" + i} cx={p.x} cy={p.y} r="2.4" fill="var(--accent2)"/>)}
        {earlyPts.map((p, i) => {
            const partner = recentPts[Math.round(i * (recentPts.length - 1) / (Math.max(1, earlyPts.length - 1)))];
            if (!partner || i % 3 !== 0)
                return null;
            return <line key={"rung" + i} x1={p.x} y1={p.y} x2={partner.x} y2={partner.y} stroke="var(--panel-border)" strokeWidth="1"/>;
        })}
      </svg>
      <div style={{ fontSize: 11, color: "var(--muted)", textAlign: "center", maxWidth: 260 }}>
        <span style={{ color: "var(--muted)" }}>Who you were</span> (early this session) intertwined with <span style={{ color: "var(--accent2)" }}>who you're becoming</span> (recent) — the same identity, two strands.
      </div>
    </div>);
}

export { DNAHelix };
