function BarChart({ data, unit }) {
    const max = Math.max(1, ...data.map(d => d.value));
    return (<div className="bar-chart">
      {data.map((d, i) => (<div key={i} className="bar-col">
          <div style={{ fontSize: 11, color: "var(--text)" }}>{d.value}</div>
          <div className="bar" style={{ height: `${Math.max(4, (d.value / max) * 100)}%`, background: d.color || "var(--accent)" }}/>
          <div className="bar-label">{d.label}</div>
        </div>))}
    </div>);
}

export { BarChart };
