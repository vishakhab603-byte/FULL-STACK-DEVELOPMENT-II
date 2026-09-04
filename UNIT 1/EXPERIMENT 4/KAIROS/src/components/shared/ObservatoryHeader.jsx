function ObservatoryHeader({ eyebrow = "KAIROS OBSERVATORY", title, subtitle, status = "LIVE", children }) {
    return (<div className="observatory-header">
      <div className="observatory-title-wrap">
        <div className="observatory-eyebrow"><span className="observatory-pulse"/> {eyebrow}</div>
        <div className="serif observatory-title">{title}</div>
        <div className="observatory-subtitle">{subtitle}</div>
      </div>
      <div className="observatory-actions">
        <span className="observatory-status">{status}</span>
        {children}
      </div>
    </div>);
}

function TelemetryStrip({ items = [] }) {
    return (<div className="telemetry-strip">
      {items.map((item, i) => (<div className="telemetry-item" key={item.label || i}>
        <div className="telemetry-label">{item.label}</div>
        <div className="telemetry-value">{item.value}</div>
        {item.note && <div className="telemetry-note">{item.note}</div>}
      </div>))}
    </div>);
}

export { ObservatoryHeader, TelemetryStrip };
