function VibeLab({ skin, setSkin }) {
    const options = [
        ["default", "Default", "The standard KAIROS command center."],
        ["minimal", "Minimal", "Quiet, data-forward, almost monochrome."],
        ["galaxy", "Creator Galaxy", "Content plotted as stars in a small galaxy."],
        ["cyber", "Cyber Command", "Terminal-flavored, scanlines, monospace."],
        ["observatory", "Observatory", "Clock, hourglass, and aperture — Chronos and Kairos side by side as instruments."],
        ["celestial", "Celestial", "A room containing your temporal trajectory — who you were, who you're becoming."],
        ["archive", "Archive", "Paper, ink, memory — nothing erased, only layered."],
        ["clockwork", "Clockwork", "Ticks, gears, mechanical rhythm."],
    ];
    return (<div className="fade-in">
      <div className="topbar">
        <div>
          <div className="serif" style={{ fontSize: 24 }}>Vibe Lab</div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>Pick a skin for the Command Center. Each one is a genuinely different layout, not a recolor.</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16 }}>
        {options.map(([key, label, desc]) => (<div key={key} className="card" style={{ padding: 20, cursor: "pointer", borderColor: skin === key ? "var(--accent)" : undefined }} onClick={() => setSkin(key)}>
            <div style={{ fontWeight: 700 }}>{label}</div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>{desc}</div>
            {skin === key && <div className="pill" style={{ marginTop: 10 }}>active</div>}
          </div>))}
      </div>
      <div className="card" style={{ padding: 20, marginTop: 16, fontSize: 13, color: "var(--muted)" }}>
        Head to Command Center to see it applied.
      </div>
    </div>);
}

export { VibeLab };
