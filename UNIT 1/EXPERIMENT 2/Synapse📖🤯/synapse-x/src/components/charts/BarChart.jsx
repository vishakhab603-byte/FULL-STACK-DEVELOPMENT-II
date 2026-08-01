/**
 * data: [{ label, value, color? }]
 */
export default function BarChart({ data, height = 220, valueSuffix = '' }) {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div className="chart chart--bar" style={{ height }}>
      {data.map((d) => (
        <div className="chart-bar-col" key={d.label}>
          <div className="chart-bar-track">
            <div
              className="chart-bar-fill"
              style={{
                height: `${(d.value / max) * 100}%`,
                background: d.color || 'var(--accent)'
              }}
              title={`${d.label}: ${d.value}${valueSuffix}`}
            />
          </div>
          <span className="chart-bar-value mono">{d.value}{valueSuffix}</span>
          <span className="chart-bar-label">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
