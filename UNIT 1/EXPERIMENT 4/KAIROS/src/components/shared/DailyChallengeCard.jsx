import { useState, useEffect, useMemo, Fragment } from "react";
import { Aperture } from "./Aperture";
import { Ouroboros } from "./Ouroboros";
import { todaysChallenge } from "../../lib/challenge";

function DailyChallengeCard({ activityLog, onClaim, claimed }) {
    const challenge = useMemo(() => todaysChallenge(), []);
    const today = new Date().toDateString();
    const done = challenge.check(activityLog, today);
    const progress = challenge.progress(activityLog, today);
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(id);
    }, []);
    const minutesElapsed = now.getHours() * 60 + now.getMinutes();
    const opennessPct = Math.max(0, 1 - (minutesElapsed / 1440));
    return (<div className="card" style={{ padding: "16px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ position: "relative", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
          {done ? "🏆" : "🎯"}
          <div style={{ position: "absolute", width: 4, height: 4, borderRadius: "50%", background: "var(--accent2)", top: "50%", left: "50%", "--orbit": "18px", animation: "orbitSpark 3.4s linear infinite", boxShadow: "0 0 5px 1px var(--accent2)" }} title="This challenge orbits back tomorrow — recurrence, not repetition."/>
        </div>
        <div style={{ flex: 1 }}>
          <div className="stat-label">Today's Challenge</div>
          <div style={{ fontSize: 14, fontWeight: 600, margin: "4px 0" }}>{challenge.label}</div>
          <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{progress} · +{challenge.xp} XP {done ? "— complete!" : "when finished"}</div>
        </div>
        <Aperture opennessPct={opennessPct} size={56}/>
        {done && !claimed && <button className="btn btn-primary" onClick={() => onClaim(challenge)}>Claim</button>}
        {done && claimed && <span className="pill" style={{ color: "var(--accent2)" }}>Claimed ✓</span>}
      </div>
      <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--panel-border)", display: "flex", alignItems: "center", gap: 8 }}>
        {done && claimed
            ? <Fragment><Ouroboros size={20}/><span>This challenge resets at midnight — today's end feeds tomorrow's beginning.</span></Fragment>
            : <span>The aperture on the right is today's actual KAIROS window — it closes for real, at midnight, whether or not you've used it.</span>}
      </div>
    </div>);
}

export { DailyChallengeCard };
