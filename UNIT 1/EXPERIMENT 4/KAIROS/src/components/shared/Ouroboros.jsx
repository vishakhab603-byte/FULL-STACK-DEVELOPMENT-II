function Ouroboros({ size = 26 }) {
    return (<svg width={size} height={size} viewBox="0 0 40 40" style={{ animation: "spin 16s linear infinite" }} title="Ouroboros — self-contained recurrence. The end feeds the beginning.">
      <circle cx="20" cy="20" r="14" fill="none" stroke="var(--accent2)" strokeWidth="2.4" strokeDasharray="80 8" strokeLinecap="round"/>
      <circle cx="33" cy="15.5" r="2.2" fill="var(--accent2)"/>
      <path d="M31 13 L34.5 12.2 M31.5 17 L34.5 18" stroke="var(--accent2)" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>);
}

export { Ouroboros };
