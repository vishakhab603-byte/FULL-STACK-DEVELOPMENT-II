import { useState, useEffect, useRef } from "react";
import { chronoPeriod } from "../../lib/chrono";

function LiveClock() {
    const [now, setNow] = useState(new Date());
    const renders = useRef(0);
    renders.current += 1;
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);
    const period = chronoPeriod(now.getHours());
    return (<div className="card" style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 10 }}>
      <span className="clock-num">{now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
      <span className="pill">{now.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</span>
      <span className="pill chrono-pill" title="KAIROS's atmosphere shifts to match this, quietly, in the background.">{period.icon} {period.name}</span>
      <span className="pill" title="This component re-renders itself once a second; nothing else on the page re-renders because of it.">clock renders: {renders.current}</span>
    </div>);
}

export { LiveClock };
