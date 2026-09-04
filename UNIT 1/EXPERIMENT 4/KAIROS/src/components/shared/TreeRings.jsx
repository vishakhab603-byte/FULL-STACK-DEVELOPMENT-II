function TreeRings({ unlockedCount, total, levelName }) {
    const size = 176;
    const center = size / 2;
    const maxR = 82;
    const minR = 26;
    const rings = Array.from({ length: total }, (_, i) => ({
        r: total > 1 ? minR + (i * (maxR - minR) / (total - 1)) : minR,
        unlocked: i < unlockedCount,
    }));
    return (<div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {rings.map((ring, i) => (<circle key={i} cx={center} cy={center} r={ring.r} fill="none" stroke={ring.unlocked ? "var(--accent2)" : "var(--panel-border)"} strokeWidth={ring.unlocked ? 1.8 : 1} opacity={ring.unlocked ? Math.max(0.35, 0.9 - i * 0.06) : 0.35} style={{ transition: `stroke .5s var(--ease-recurrence, ease), opacity .5s var(--ease-recurrence, ease)` }}/>))}
        <text x={center} y={center - 3} textAnchor="middle" fill="var(--text)" fontSize="13" fontFamily="Georgia, serif">{levelName}</text>
        <text x={center} y={center + 14} textAnchor="middle" fill="var(--muted)" fontSize="9.5">{unlockedCount}/{total} rings grown</text>
      </svg>
      <div style={{ fontSize: 11, color: "var(--muted)", textAlign: "center", maxWidth: 200 }}>
        Every unlocked achievement adds a ring — the way a year of real growth leaves a mark that stays, even once the moment that earned it has passed.
      </div>
    </div>);
}

export { TreeRings };
