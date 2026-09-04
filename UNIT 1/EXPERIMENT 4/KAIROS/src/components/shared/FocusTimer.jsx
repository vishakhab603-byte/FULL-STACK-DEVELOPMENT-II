import { useState, useEffect, useRef } from "react";

function FocusTimer({ onComplete }) {
    const DURATION = 25 * 60;
    const [remaining, setRemaining] = useState(DURATION);
    const [running, setRunning] = useState(false);
    const doneRef = useRef(false);
    useEffect(() => {
        if (!running)
            return;
        const id = setInterval(() => {
            setRemaining(r => {
                if (r <= 1) {
                    clearInterval(id);
                    setRunning(false);
                    if (!doneRef.current) {
                        doneRef.current = true;
                        if (onComplete)
                            onComplete();
                    }
                    return 0;
                }
                return r - 1;
            });
        }, 1000);
        return () => clearInterval(id);
    }, [running]);
    const pct = 1 - remaining / DURATION;
    const r = 46;
    const circumference = 2 * Math.PI * r;
    const mins = Math.floor(remaining / 60), secs = remaining % 60;
    function toggle() {
        if (remaining === 0) {
            setRemaining(DURATION);
            doneRef.current = false;
            setRunning(true);
        }
        else
            setRunning(x => !x);
    }
    function reset() { setRunning(false); setRemaining(DURATION); doneRef.current = false; }
    return (<div className="card" style={{ padding: 20, display: "flex", gap: 18, alignItems: "center" }}>
      <div className="timer-ring-wrap">
        <svg width="110" height="110" viewBox="0 0 110 110">
          <circle cx="55" cy="55" r={r} fill="none" stroke="var(--panel-border)" strokeWidth="6"/>
          <circle cx="55" cy="55" r={r} fill="none" stroke="var(--accent)" strokeWidth="6" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - pct)} transform="rotate(-90 55 55)" style={{ transition: "stroke-dashoffset 1s linear" }}/>
        </svg>
        <div className="timer-text">{String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}</div>
      </div>
      <div>
        <div className="stat-label">Focus Session</div>
        <div style={{ fontSize: 12, color: "var(--muted)", margin: "4px 0 10px" }}>A real 25-minute countdown — completing one logs a real activity.</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-primary" onClick={toggle}>{running ? "Pause" : remaining === 0 ? "Restart" : "Start"}</button>
          <button className="btn" onClick={reset}>Reset</button>
        </div>
      </div>
    </div>);
}

export { FocusTimer };
