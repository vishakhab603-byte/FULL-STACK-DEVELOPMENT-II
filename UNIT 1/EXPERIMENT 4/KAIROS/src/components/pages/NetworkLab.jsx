import { useState } from "react";
import { ObservatoryHeader, TelemetryStrip } from "../shared/ObservatoryHeader";
import { mockApiRequest } from "../../state/eventStore";

function NetworkLab() {
    const [log, setLog] = useState([]);
    const [method, setMethod] = useState("GET");
    const [path, setPath] = useState("/api/events");
    const [status, setStatus] = useState(200);
    const [delay, setDelay] = useState(600);
    const [sending, setSending] = useState(false);
    async function send() {
        const id = Date.now() + Math.random();
        setSending(true);
        setLog(l => [{ id, method, path, status, state: "pending" }, ...l].slice(0, 30));
        try {
            await mockApiRequest(method, path, { status, delay });
            setLog(l => l.map(item => item.id === id ? { ...item, state: "ok" } : item));
        }
        catch (e) {
            setLog(l => l.map(item => item.id === id ? { ...item, state: "fail" } : item));
        }
        setSending(false);
    }
    return (<div className="fade-in">
      <ObservatoryHeader title="Network Lab" status="SIMULATED" subtitle="A simulated network layer: real Promises and real timing, but no real backend or HTTP traffic. Every packet below reflects an actual interaction you triggered." />
      <TelemetryStrip items={[
        { label: "REQUESTS", value: log.length, note: "captured in session" },
        { label: "PENDING", value: log.filter(x => x.state === "pending").length, note: "in flight" },
        { label: "RESOLVED", value: log.filter(x => x.state === "ok").length, note: "successful simulations" },
        { label: "REJECTED", value: log.filter(x => x.state === "fail").length, note: "failed simulations" }
      ]} />

      <div className="card" style={{ padding: 20, marginBottom: 16, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div>
          <div className="section-title">Method</div>
          <select value={method} onChange={e => setMethod(e.target.value)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--panel-border)", color: "var(--text)", borderRadius: 10, padding: "9px 10px" }}>
            {["GET", "POST", "PATCH", "DELETE"].map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: 160 }}>
          <div className="section-title">Path</div>
          <input type="text" value={path} onChange={e => setPath(e.target.value)}/>
        </div>
        <div>
          <div className="section-title">Simulate status</div>
          <select value={status} onChange={e => setStatus(Number(e.target.value))} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--panel-border)", color: "var(--text)", borderRadius: 10, padding: "9px 10px" }}>
            {[200, 401, 403, 404, 409, 500, 503].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <div className="section-title">Latency (ms)</div>
          <input type="text" value={delay} onChange={e => setDelay(Number(e.target.value) || 0)} style={{ width: 90 }}/>
        </div>
        <button className="btn btn-primary" onClick={send} disabled={sending}>Send request</button>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <div className="section-title">Request lifecycle</div>
        {log.length === 0 && <div style={{ fontSize: 13, color: "var(--muted)" }}>No requests sent yet.</div>}
        {log.map(item => (<div key={item.id} className={`network-packet ${item.state}`}>
            <div className="network-node"><span className="network-node-dot"/>CLIENT</div>
            <div className="network-beam"><span className="network-packet-label">{item.method} {item.path}</span><span className="network-beam-line"/></div>
            <div className="network-node"><span className="network-node-dot"/>MOCK API</div>
            <div className={item.state === "ok" ? "status-ok" : item.state === "fail" ? "status-fail" : "status-pending"}>
              {item.state === "pending" ? "pending…" : `${item.status} ${item.state === "ok" ? "resolved" : "rejected"}`}
            </div>
          </div>))}
      </div>
    </div>);
}

export { NetworkLab };
