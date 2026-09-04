function Aperture({ opennessPct, size = 64 }) {
    const blades = 8;
    const outerR = 30, cx = 32, cy = 32;
    const innerR = 5 + opennessPct * 20;
    const closeAmount = 1 - opennessPct;
    return (<svg width={size} height={size} viewBox="0 0 64 64">
      <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="var(--panel-border)" strokeWidth="1.3"/>
      {Array.from({ length: blades }).map((_, i) => {
            const a1 = (360 / blades) * i * Math.PI / 180;
            const a2 = (360 / blades) * (i + 1) * Math.PI / 180;
            return (<path key={i} d={`M${cx} ${cy} L${cx + outerR * Math.cos(a1)} ${cy + outerR * Math.sin(a1)} L${cx + outerR * Math.cos(a2)} ${cy + outerR * Math.sin(a2)} Z`} fill="var(--accent)" opacity="0.22" style={{
                    transformOrigin: `${cx}px ${cy}px`,
                    transform: `rotate(${closeAmount * (360 / blades / 2.2)}deg) scale(${1 - opennessPct * 0.22})`,
                    transition: "transform 1.2s var(--ease-measure)"
                }}/>);
        })}
      <circle cx={cx} cy={cy} r={innerR} fill="var(--bg)" style={{ transition: "r 1.2s var(--ease-measure)" }}/>
      <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="var(--gold)" strokeWidth="1.4" opacity="0.75" style={{ transition: "r 1.2s var(--ease-measure)" }}/>
    </svg>);
}

export { Aperture };
