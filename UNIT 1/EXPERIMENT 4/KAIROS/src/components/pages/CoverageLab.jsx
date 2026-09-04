import { useState } from "react";
import { addEventLogic, coverage, detectConflicts, moveEventLogic, removeEventLogic } from "../../state/eventStore";

function CoverageLab() {
    const [, forceTick] = useState(0);
    const entries = [
        ["addEventLogic", coverage.addEventLogic.calls],
        ["removeEventLogic", coverage.removeEventLogic.calls],
        ["moveEventLogic — valid day branch", coverage.moveEventLogic_valid.calls],
        ["moveEventLogic — invalid day branch", coverage.moveEventLogic_invalid.calls],
        ["detectConflicts", coverage.detectConflicts.calls],
    ];
    const covered = entries.filter(([, c]) => c > 0).length;
    const pct = Math.round((covered / entries.length) * 100);
    return (<div className="fade-in">
      <div className="topbar">
        <div>
          <div className="serif" style={{ fontSize: 24 }}>Coverage Lab</div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>Function-level coverage of KAIROS's core scheduling logic, counted from real calls made by the app and by the Test Command Center. Not a full statement/branch coverage tool, and not hardcoded.</div>
        </div>
        <button className="btn" onClick={() => forceTick(t => t + 1)}>Refresh</button>
      </div>

      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <div className="stat-label">Function coverage</div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 8 }}>
          <div className="stat-big">{pct}%</div>
          <div className="progress-bar" style={{ flex: 1 }}><div className="progress-fill" style={{ width: pct + "%" }}/></div>
        </div>
        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>{covered} of {entries.length} instrumented functions have been called at least once this session.</div>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <div className="section-title">Call counts</div>
        {entries.map(([name, count]) => (<div key={name} className="toggle-row">
            <span>{name}</span>
            <span className="pill">{count} call{count === 1 ? "" : "s"}</span>
          </div>))}
      </div>

      <div className="card" style={{ padding: 20, marginTop: 16 }}>
        <div className="stat-label">Try it</div>
        <p style={{ fontSize: 13, color: "var(--muted)" }}>The invalid-day branch of moveEventLogic only gets covered by the "Moving an event to an invalid day" test in the Test Command Center — dragging events in the real calendar UI never triggers it, since the UI never offers a day above 31. Run the tests, then refresh here.</p>
      </div>
    </div>);
}

export { CoverageLab };
