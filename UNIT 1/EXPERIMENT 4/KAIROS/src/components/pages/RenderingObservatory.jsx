import { useMemo, useCallback, memo, Fragment } from "react";

function RenderingObservatory({ setPage }) {
    return (<div className="page-scan">
      <div className="topbar">
        <div>
          <div className="serif" style={{ fontSize: 24 }}>Rendering Observatory</div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>Why components re-render, in plain terms.</div>
        </div>
      </div>

      <div className="card" style={{ padding: 22, marginBottom: 16, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "radial-gradient(circle, var(--accent), transparent 70%)", opacity: 0.18, filter: "blur(10px)" }}/>
        <div className="section-title">The chain</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", fontSize: 12.5, alignItems: "center", position: "relative" }}>
          {["State changes", "React re-renders the owning component", "Every child is called again by default", "Unless memoized AND its props are reference-stable", "Then React can skip that child entirely"].map((s, i, arr) => (<Fragment key={i}>
              <span className="pill">{s}</span>
              {i < arr.length - 1 && <span style={{ color: "var(--accent2)", opacity: 0.6 }}>→</span>}
            </Fragment>))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16 }}>
        <div className="card" style={{ padding: 20, borderTop: "2px solid var(--accent)" }}>
          <div className="stat-label" style={{ color: "var(--accent)" }}>memo</div>
          <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>Skips re-rendering a component if its props are shallow-equal to last time. Does nothing if you hand it a brand new object or array every render.</p>
        </div>
        <div className="card" style={{ padding: 20, borderTop: "2px solid var(--accent2)" }}>
          <div className="stat-label" style={{ color: "var(--accent2)" }}>useCallback</div>
          <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>Keeps a function's identity stable across renders so a memoized child doesn't see it as "changed" every time.</p>
        </div>
        <div className="card" style={{ padding: 20, borderTop: "2px solid var(--gold)" }}>
          <div className="stat-label" style={{ color: "var(--gold)" }}>useMemo</div>
          <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>Caches an expensive computation, or a derived array/object, so it isn't rebuilt — and therefore doesn't look "new" — on every render.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16, marginTop: 16 }}>
        <div className="card" style={{ padding: 20 }}>
          <div className="stat-label">See it on the calendar</div>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: "6px 0 12px" }}>Drag a real event and watch all four concepts fire at once.</p>
          <button className="btn btn-primary" onClick={() => setPage("schedulerlab")}>Open the Scheduler Duel →</button>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div className="stat-label">See it isolated</div>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: "6px 0 12px" }}>Real per-card render counts as you flip each toggle.</p>
          <button className="btn" onClick={() => setPage("duel")}>Open the Duel →</button>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div className="stat-label">Push it further</div>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: "6px 0 12px" }}>Real dataset sizes, real mount timing.</p>
          <button className="btn" onClick={() => setPage("benchmark")}>Open Benchmark Arena →</button>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div className="stat-label">Break it on purpose</div>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: "6px 0 12px" }}>Real stress, then recovery.</p>
          <button className="btn" onClick={() => setPage("chaos")}>Open Chaos Lab →</button>
        </div>
      </div>
    </div>);
}

export { RenderingObservatory };
