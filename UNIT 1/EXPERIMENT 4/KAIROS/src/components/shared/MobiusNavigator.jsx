import { useState } from "react";
import { playSfx } from "../../lib/audio";
import { buildLemniscatePath } from "../../lib/lemniscate";

function MobiusNavigator({ setPage }) {
    const [t, setT] = useState(50);
    const W = 160, H = 90;
    const angle = (t / 100) * Math.PI * 2;
    const denom = 1 + Math.sin(angle) * Math.sin(angle);
    const cx = W / 2, cy = H / 2, a = W / 2 - 10, b = H / 2 - 10;
    const x = cx + a * Math.cos(angle) / denom;
    const y = cy + b * Math.sin(angle) * Math.cos(angle) / denom;
    let zone = "PRESENT", targetPage = "command", zoneDesc = "Where you actually are.";
    if (t < 33) {
        zone = "FUTURE";
        targetPage = "river";
        zoneDesc = "What hasn't happened yet.";
    }
    else if (t > 66) {
        zone = "MEMORY";
        targetPage = "timemachine";
        zoneDesc = "What's already layered beneath you.";
    }
    return (<div className="card" style={{ padding: 20, textAlign: "center" }}>
      <div className="section-title">∞ Möbius — drag around the loop</div>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ margin: "6px 0" }}>
        <path d={buildLemniscatePath(W, H, 10)} fill="none" stroke="var(--panel-border)" strokeWidth="1.5"/>
        <circle cx={x} cy={y} r="5.5" fill="var(--gold)" style={{ filter: "drop-shadow(0 0 7px var(--gold))" }}/>
      </svg>
      <input type="range" min="0" max="100" value={t} onChange={e => setT(Number(e.target.value))} style={{ width: "100%" }}/>
      <div style={{ fontSize: 13, fontWeight: 700, marginTop: 8 }}>{zone}</div>
      <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 10 }}>{zoneDesc}</div>
      <button className="btn btn-primary" onClick={() => { playSfx("nav"); setPage(targetPage); }}>Travel there →</button>
    </div>);
}

export { MobiusNavigator };
