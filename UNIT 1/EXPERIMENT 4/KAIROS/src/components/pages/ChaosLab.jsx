import { useState, useEffect, useRef, useMemo } from "react";
import { TemporalParticles } from "../shared/TemporalParticles";
import { ObservatoryHeader, TelemetryStrip } from "../shared/ObservatoryHeader";
import { mockApiRequest } from "../../state/eventStore";

function HeavyList({ count }) {
    const items = useMemo(() => Array.from({ length: count }, (_, i) => i), [count]);
    return (<div style={{ maxHeight: 220, overflow: "auto", border: "1px solid var(--panel-border)", borderRadius: 10, padding: 8 }}>
      {items.map(i => <div key={i} style={{ fontSize: 11, padding: "3px 0", color: "var(--muted)" }}>chaos item #{i + 1}</div>)}
    </div>);
}

function ChaosLab({ onSurvived }) {
    const [datasetSize, setDatasetSize] = useState(0);
    const [mountMs, setMountMs] = useState(null);
    const [slowRenderMs, setSlowRenderMs] = useState(null);
    const [rapidActive, setRapidActive] = useState(false);
    const [rapidCount, setRapidCount] = useState(0);
    const [apiChaosLog, setApiChaosLog] = useState([]);
    const rapidIntervalRef = useRef(null);
    const startRef = useRef(0);
    const chaosInjectedRef = useRef(false);
    function injectLarge() {
        chaosInjectedRef.current = true;
        startRef.current = performance.now();
        setDatasetSize(8000);
    }
    useEffect(() => {
        if (datasetSize > 0) {
            setMountMs(performance.now() - startRef.current);
        }
    }, [datasetSize]);
    function injectSlowRender() {
        chaosInjectedRef.current = true;
        const start = performance.now();
        let x = 0;
        while (performance.now() - start < 180) {
            x += Math.random();
        }
        setSlowRenderMs(performance.now() - start);
    }
    function injectRapid() {
        chaosInjectedRef.current = true;
        setRapidActive(true);
        setRapidCount(0);
        let n = 0;
        rapidIntervalRef.current = setInterval(() => {
            n += 1;
            setRapidCount(n);
            if (n >= 80) {
                clearInterval(rapidIntervalRef.current);
                rapidIntervalRef.current = null;
                setRapidActive(false);
            }
        }, 30);
    }
    async function injectApiFailure() {
        chaosInjectedRef.current = true;
        const id = Date.now();
        setApiChaosLog(l => [{ id, state: "pending" }, ...l].slice(0, 10));
        try {
            await mockApiRequest("GET", "/api/events", { status: 503, delay: 400 });
        }
        catch (e) {
            setApiChaosLog(l => l.map(x => x.id === id ? { ...x, state: "fail", status: e.status } : x));
        }
    }
    useEffect(() => () => {
        if (rapidIntervalRef.current) {
            clearInterval(rapidIntervalRef.current);
            rapidIntervalRef.current = null;
        }
    }, []);
    function restore() {
        if (rapidIntervalRef.current) {
            clearInterval(rapidIntervalRef.current);
            rapidIntervalRef.current = null;
        }
        setDatasetSize(0);
        setMountMs(null);
        setSlowRenderMs(null);
        setRapidActive(false);
        setRapidCount(0);
        setApiChaosLog([]);
        if (chaosInjectedRef.current && onSurvived)
            onSurvived();
        chaosInjectedRef.current = false;
    }
    return (<div className="page-scan" style={{ position: "relative" }}>
      <TemporalParticles type="falling" active={datasetSize > 0 || rapidActive} count={16}/>
      <ObservatoryHeader title="Chaos Lab" status="LIVE STRESS" subtitle="Each injection genuinely stresses the browser. Timings are real measurements; the API scenario remains explicitly simulated.">
        <button className="btn" onClick={restore}>Restore KAIROS</button>
      </ObservatoryHeader>
      <TelemetryStrip items={[
        { label: "DOM INJECTION", value: datasetSize ? datasetSize.toLocaleString() : "0", note: "real rows mounted" },
        { label: "BLOCK", value: slowRenderMs == null ? "—" : `${slowRenderMs.toFixed(1)}ms`, note: "main-thread stall" },
        { label: "UPDATES", value: rapidCount, note: "state updates triggered" },
        { label: "API FAILURES", value: apiChaosLog.filter(x => x.state === "fail").length, note: "simulated 503s" }
      ]} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
        <div className="card" style={{ padding: 20 }}>
          <div className="stat-label">Large dataset</div>
          <button className="btn" style={{ marginTop: 8 }} onClick={injectLarge}>Render 8,000 real DOM rows</button>
          {mountMs !== null && <div style={{ marginTop: 10, fontSize: 13 }}>Mounted in <b>{mountMs.toFixed(1)}ms</b></div>}
          {datasetSize > 0 && <div style={{ marginTop: 10 }}><HeavyList count={datasetSize}/></div>}
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div className="stat-label">Slow render</div>
          <button className="btn" style={{ marginTop: 8 }} onClick={injectSlowRender}>Block the main thread for ~180ms</button>
          {slowRenderMs !== null && <div style={{ marginTop: 10, fontSize: 13 }}>Actually blocked for <b>{slowRenderMs.toFixed(1)}ms</b></div>}
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div className="stat-label">Rapid state updates</div>
          <button className="btn" style={{ marginTop: 8 }} onClick={injectRapid} disabled={rapidActive}>{rapidActive ? "Running…" : "Fire 80 updates at 30ms intervals"}</button>
          <div style={{ marginTop: 10, fontSize: 13 }}>State updates triggered so far: <b>{rapidCount}</b></div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div className="stat-label">API failure</div>
          <button className="btn" style={{ marginTop: 8 }} onClick={injectApiFailure}>Simulate a 503 from the mock backend</button>
          {apiChaosLog.map(x => (<div key={x.id} className="log-line" style={{ marginTop: 10 }}>
              <span>GET /api/events</span>
              <span className={x.state === "fail" ? "status-fail" : "status-pending"}>{x.state === "fail" ? `${x.status} rejected` : "pending…"}</span>
            </div>))}
        </div>
      </div>
    </div>);
}

export { HeavyList, ChaosLab };
