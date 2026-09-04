import { useState, useEffect, useRef, useMemo } from "react";
import { ObservatoryHeader, TelemetryStrip } from "../shared/ObservatoryHeader";

function VirtualizedList({ items }) {
    const itemHeight = 30;
    const viewportHeight = 300;
    const visibleCount = Math.ceil(viewportHeight / itemHeight) + 4;
    const [scrollTop, setScrollTop] = useState(0);
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 2);
    const endIndex = Math.min(items.length, startIndex + visibleCount);
    const visible = items.slice(startIndex, endIndex);
    return (<div>
      <div style={{ height: viewportHeight, overflow: "auto", border: "1px solid var(--panel-border)", borderRadius: 10 }} onScroll={e => setScrollTop(e.target.scrollTop)}>
        <div style={{ height: items.length * itemHeight, position: "relative" }}>
          {visible.map((it, i) => (<div key={it} className="virt-row" style={{ position: "absolute", top: (startIndex + i) * itemHeight, width: "100%" }}>
              row #{it + 1}
            </div>))}
        </div>
      </div>
      <div style={{ fontSize: 10, color: "var(--muted)", padding: "6px 2px" }}>rendering {visible.length} of {items.length} rows</div>
    </div>);
}

function PlainList({ items }) {
    return (<div>
      <div style={{ height: 300, overflow: "auto", border: "1px solid var(--panel-border)", borderRadius: 10 }}>
        {items.map(it => <div key={it} className="virt-row">row #{it + 1}</div>)}
      </div>
      <div style={{ fontSize: 10, color: "var(--muted)", padding: "6px 2px" }}>rendering {items.length} of {items.length} rows</div>
    </div>);
}

function BenchmarkArena() {
    const [size, setSize] = useState(1000);
    const [virtualized, setVirtualized] = useState(true);
    const [runKey, setRunKey] = useState(0);
    const [runs, setRuns] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
    const startRef = useRef(0);
    const items = useMemo(() => Array.from({ length: size }, (_, i) => i), [size, runKey]);
    useEffect(() => {
        if (startRef.current > 0) {
            const ms = performance.now() - startRef.current;
            setRuns(r => [{ size, virtualized, ms }, ...r].slice(0, 12));
            setIsRunning(false);
        }
    }, [runKey]);
    function run() {
        startRef.current = performance.now();
        setIsRunning(true);
        setRunKey(k => k + 1);
    }
    return (<div className="page-scan">
      <ObservatoryHeader title="Benchmark Arena" subtitle="Real DOM, real dataset sizes, and browser timing via performance.now(). This is an educational benchmark, not a laboratory-grade performance suite.">
        <button className="btn btn-primary" onClick={run} disabled={isRunning}>{isRunning ? "Measuring…" : "Run benchmark"}</button>
      </ObservatoryHeader>

      <TelemetryStrip items={[
        { label: "DATASET", value: size.toLocaleString(), note: "rows selected" },
        { label: "MODE", value: virtualized ? "WINDOWED" : "FULL DOM", note: virtualized ? "visible rows only" : "all rows mounted" },
        { label: "RUNS", value: runs.length, note: "recent measurements" },
        { label: "LAST", value: runs[0] ? `${runs[0].ms.toFixed(1)}ms` : "—", note: runs[0] ? (runs[0].virtualized ? "virtualized" : "full render") : "no measurement" }
      ]} />

      <div className="card" style={{ padding: 20, marginBottom: 16, display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <div className="section-title">Dataset</div>
          <div style={{ display: "flex", gap: 8 }}>
            {[100, 1000, 5000, 20000].map(n => (<button key={n} className={"btn" + (size === n ? " selected" : "")} onClick={() => setSize(n)}>{n.toLocaleString()}</button>))}
          </div>
        </div>
        <div className="toggle-row" style={{ border: "none", padding: 0 }}>
          <span style={{ marginRight: 10 }}>Virtualize</span>
          <label className="switch"><input type="checkbox" checked={virtualized} onChange={e => setVirtualized(e.target.checked)}/><span className="slider"/></label>
        </div>
        
      </div>

      <div className="duel-grid">
        <div className="card duel-panel">
          <h3>{virtualized ? "Virtualized" : "Full render"}</h3>
          <div key={runKey}>
            {virtualized ? <VirtualizedList items={items}/> : <PlainList items={items}/>}
          </div>
        </div>
        <div className="card duel-panel">
          <h3>Run history <span className="observatory-mini-tag">performance.now()</span></h3>
          {runs.length === 0 && <div style={{ fontSize: 13, color: "var(--muted)" }}>No runs yet.</div>}
          {runs.map((r, i) => (<div key={i} className="log-line">
              <span>{r.size.toLocaleString()} rows · {r.virtualized ? "virtualized" : "full"}</span>
              <span className="status-ok">{r.ms.toFixed(1)}ms</span>
            </div>))}
        </div>
      </div>
    </div>);
}

export { VirtualizedList, PlainList, BenchmarkArena };
