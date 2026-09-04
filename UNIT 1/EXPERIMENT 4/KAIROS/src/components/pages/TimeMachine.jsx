import { useState, useEffect } from "react";
import { TemporalParticles } from "../shared/TemporalParticles";

function TimeMachine({ history, onRestore, activity }) {
    const [selected, setSelected] = useState(history.length - 1);
    const [mirrorView, setMirrorView] = useState(false);
    useEffect(() => { setSelected(history.length - 1); }, [history.length]);
    const snapshot = history[selected];
    const current = history[history.length - 1];
    const removedSinceThen = snapshot.events.filter(e => !current.events.some(c => c.id === e.id));
    const addedSinceThen = current.events.filter(e => !snapshot.events.some(c => c.id === e.id));
    const movedSinceThen = current.events.filter(e => {
        const before = snapshot.events.find(c => c.id === e.id);
        return before && (before.date || before.day) !== (e.date || e.day);
    });
    const snapshotActions = (activity?.log || []).filter(a => new Date(a.ts || 0).getTime() <= new Date(snapshot.ts).getTime()).slice(-6).reverse();
    const deltaScore = addedSinceThen.length + movedSinceThen.length + removedSinceThen.length;
    return (<div className="page-rewind" style={{ position: "relative" }}>
      <TemporalParticles type="dust" active={true} count={10}/>
      <div className="topbar">
        <div>
          <div className="serif" style={{ fontSize: 24 }}>Time Machine</div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>Every real change you make to the calendar — add, move, remove — is captured here as an actual snapshot, in order.</div>
        </div>
        <button className={"btn" + (mirrorView ? " selected" : "")} onClick={() => setMirrorView(m => !m)}>{mirrorView ? "Exit Mirror" : "🪞 Mirror View"}</button>
      </div>

      {!mirrorView &&
            <div className="duel-grid">
        <div className="card duel-panel">
          <h3>History ({history.length})</h3>
          <div style={{ maxHeight: 420, overflow: "auto" }}>
            {history.map((h, i) => {
                    const ageFromNewest = history.length - 1 - i;
                    const historicalDepth = Math.min(0.16, ageFromNewest * 0.02);
                    return (<div key={h.ts + "-" + i} className={"hist-row" + (i === selected ? " active" : "")} onClick={() => setSelected(i)} style={{ boxShadow: i === selected ? "0 10px 24px -4px rgba(0,0,0,0.55)" : `0 ${2 + historicalDepth * 10}px ${6 + historicalDepth * 20}px rgba(0,0,0,${0.1 + historicalDepth})`,
                            opacity: i === selected ? 1 : Math.max(0.55, 1 - historicalDepth * 2) }}>
                  <span>{h.label}</span>
                  <span style={{ color: "var(--muted)", fontSize: 11 }}>{new Date(h.ts).toLocaleTimeString()}</span>
                </div>);
                })}
          </div>
        </div>
        <div className="card duel-panel">
          <h3>Snapshot preview</h3>
          <div className="duel-sub">{snapshot.events.length} event(s) at this point in time</div>
          <div className="duel-cardlist">
            {snapshot.events.map(e => (<div key={e.id} className="duel-card">
                <span>{e.title}</span>
                <span className="rc">day {e.day}</span>
              </div>))}
          </div>
          {selected !== history.length - 1 &&
                    <button className="btn btn-primary" style={{ marginTop: 14 }} onClick={() => onRestore(snapshot.events, `Restored to "${snapshot.label}"`)}>Restore this state</button>}
        </div>
      </div>}

      {mirrorView &&
            <div>
        <div className="mirror-wrap">
          <div className="mirror-panel">
            <div className="section-title">Previous — {snapshot.label}</div>
            <div className="duel-cardlist">
              {snapshot.events.map(e => (<div key={e.id} className="duel-card"><span>{e.title}</span><span className="rc">day {e.day}</span></div>))}
              {snapshot.events.length === 0 && <div style={{ fontSize: 12, color: "var(--muted)" }}>Nothing existed yet.</div>}
            </div>
          </div>
          <div className="mirror-divider"/>
          <div className="mirror-panel mirror-panel-now">
            <div className="section-title">Current — who you are now</div>
            <div className="duel-cardlist">
              {current.events.map(e => {
                    const existedBefore = snapshot.events.some(x => x.id === e.id);
                    return (<div key={e.id} className="duel-card">
                    <span>{e.title}</span>
                    {!existedBefore && <span className="pill" style={{ fontSize: 9.5 }}>new since then</span>}
                  </div>);
                })}
              {removedSinceThen.map(e => (<div key={"gone-" + e.id} className="duel-card" style={{ opacity: 0.4 }}>
                  <span style={{ textDecoration: "line-through" }}>{e.title}</span>
                  <span className="pill" style={{ fontSize: 9.5, color: "var(--muted)" }}>palimpsest</span>
                </div>))}
            </div>
          </div>
        </div>
        <div className="temporal-mirror-metrics">
          <div className="mirror-metric"><span>EVOLVED</span><b>{deltaScore}</b><small>state changes</small></div>
          <div className="mirror-metric"><span>ADDED</span><b>{addedSinceThen.length}</b><small>new moments</small></div>
          <div className="mirror-metric"><span>MOVED</span><b>{movedSinceThen.length}</b><small>rescheduled</small></div>
          <div className="mirror-metric"><span>REMOVED</span><b>{removedSinceThen.length}</b><small>lost layers</small></div>
        </div>
        <div className="mirror-chronicle card">
          <div>
            <div className="river-kicker">CHRONICLE TRACE</div>
            <div className="serif" style={{ fontSize: 18 }}>What was happening around that version of you?</div>
          </div>
          <div className="mirror-activity-list">
            {snapshotActions.length ? snapshotActions.map((a, i) => <div className="mirror-activity" key={(a.ts || i) + a.text}>
              <span className="mirror-activity-dot"/>
              <span>{a.text}</span>
              <time>{new Date(a.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time>
            </div>) : <div className="mirror-empty">The chronicle is quiet here. That silence is part of the archive.</div>}
          </div>
        </div>
        <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 12, textAlign: "center" }}>
          Old states don't disappear — they become layers underneath. The struck-through entries are palimpsest: gone from now, but still legible in what came before.
        </div>
      </div>}
    </div>);
}

export { TimeMachine };
