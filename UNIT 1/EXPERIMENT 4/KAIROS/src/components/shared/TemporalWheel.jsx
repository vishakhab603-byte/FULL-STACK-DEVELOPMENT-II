function TemporalWheel({ cursor, onSelectMonth }) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const size = 140, cx = 70, cy = 70, r = 54;
    return (<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--panel-border)" strokeWidth="1"/>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--panel-border)" strokeWidth="1" strokeDasharray="1 7" opacity="0.5"/>
      {months.map((m, i) => {
            const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
            const x = cx + r * Math.cos(angle);
            const y = cy + r * Math.sin(angle);
            const active = i === cursor.m;
            const labelY = y + (Math.sin(angle) > 0.3 ? 15 : Math.sin(angle) < -0.3 ? -9 : 4);
            return (<g key={m} style={{ cursor: "pointer" }} onClick={() => onSelectMonth(i)}>
            <circle cx={x} cy={y} r={active ? 7.5 : 4} fill={active ? "var(--gold)" : "var(--panel-border)"} style={{ transition: "r .3s var(--ease-recurrence, ease), fill .3s var(--ease-recurrence, ease)" }}/>
            <text x={x} y={labelY} textAnchor="middle" fontSize="8.5" fill={active ? "var(--text)" : "var(--muted)"} fontWeight={active ? "700" : "400"}>{m}</text>
          </g>);
        })}
      <circle cx={cx} cy={cy} r="3" fill="var(--accent2)"/>
    </svg>);
}

export { TemporalWheel };
