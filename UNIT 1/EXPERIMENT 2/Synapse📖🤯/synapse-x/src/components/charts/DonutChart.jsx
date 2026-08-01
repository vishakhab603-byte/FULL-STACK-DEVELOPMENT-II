/**
 * data: [{ label, value, color }]
 */
export default function DonutChart({ data, size = 180, strokeWidth = 26 }) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let offsetAccum = 0;

  return (
    <div className="chart chart--donut">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={strokeWidth}
        />
        {data.map((d) => {
          const fraction = d.value / total;
          const dash = fraction * circumference;
          const gap = circumference - dash;
          const rotation = (offsetAccum / total) * 360 - 90;
          offsetAccum += d.value;
          return (
            <circle
              key={d.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={d.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dash} ${gap}`}
              strokeLinecap="butt"
              transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
              style={{ transition: 'stroke-dasharray 400ms ease' }}
            >
              <title>{d.label}: {d.value} ({Math.round(fraction * 100)}%)</title>
            </circle>
          );
        })}
        <text x="50%" y="48%" textAnchor="middle" className="donut-total-value" fill="var(--text-primary)">
          {total}
        </text>
        <text x="50%" y="62%" textAnchor="middle" className="donut-total-label" fill="var(--text-tertiary)">
          total
        </text>
      </svg>
      <ul className="chart-legend">
        {data.map((d) => (
          <li key={d.label}>
            <span className="chart-legend-dot" style={{ background: d.color }} />
            {d.label} <span className="mono">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
