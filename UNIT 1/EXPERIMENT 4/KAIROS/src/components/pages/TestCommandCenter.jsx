import { useState, useMemo } from "react";
import { Calendar } from "./Calendar";
import { makeTests } from "../../lib/tests";

function TestCommandCenter({ onAllPassed }) {
    const tests = useMemo(() => makeTests(), []);
    const [results, setResults] = useState(null);
    const [running, setRunning] = useState(false);
    async function runAll() {
        setRunning(true);
        const out = [];
        for (const t of tests) {
            try {
                const r = await t.run();
                out.push({ ...t, pass: r.pass, detail: r.detail });
            }
            catch (e) {
                out.push({ ...t, pass: false, detail: "threw: " + String(e) });
            }
        }
        setResults(out);
        setRunning(false);
        if (onAllPassed && out.every(r => r.pass))
            onAllPassed();
    }
    const passCount = results ? results.filter(r => r.pass).length : 0;
    return (<div className="fade-in">
      <div className="topbar">
        <div>
          <div className="serif" style={{ fontSize: 24 }}>Test Command Center</div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>These tests run for real, against the same logic functions the Calendar and Network Lab use. Nothing here is pre-scored.</div>
        </div>
        <button className="btn btn-primary" onClick={runAll} disabled={running}>{running ? "Running…" : "Run all tests"}</button>
      </div>

      {results &&
            <div className="card" style={{ padding: "14px 20px", marginBottom: 16, display: "flex", alignItems: "center", gap: 16 }}>
          <div className="stat-big" style={{ color: passCount === results.length ? "var(--accent2)" : "var(--danger)" }}>{passCount}/{results.length}</div>
          <div className="stat-label">tests passing</div>
        </div>}

      <div>
        {tests.map((t, i) => {
            const r = results ? results[i] : null;
            return (<div key={t.name} className={"test-row" + (r ? (r.pass ? " test-pass" : " test-fail") : "")}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <b style={{ fontSize: 13 }}>{t.name}</b>
                <span style={{ fontSize: 11 }} className={r ? (r.pass ? "status-ok" : "status-fail") : "status-pending"}>
                  {r ? (r.pass ? "PASS" : "FAIL") : "NOT RUN"}
                </span>
              </div>
              <div className="gwt"><b>GIVEN</b> {t.given}</div>
              <div className="gwt"><b>WHEN</b> {t.when}</div>
              <div className="gwt"><b>THEN</b> {t.then}</div>
              {r && <div className="gwt">→ {r.detail}</div>}
            </div>);
        })}
      </div>
    </div>);
}

export { TestCommandCenter };
