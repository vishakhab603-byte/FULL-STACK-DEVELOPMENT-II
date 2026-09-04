import { useState, useEffect } from "react";
import { WORLD_CLOCK_ZONES } from "../../data/worldClockZones";

function WorldClock() {
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 30000);
        return () => clearInterval(id);
    }, []);
    const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return (<div className="card" style={{ padding: "16px 20px" }}>
      <div className="section-title" style={{ marginBottom: 10 }}>World Clock <span style={{ color: "var(--muted)", textTransform: "none", letterSpacing: 0 }}>· {localTz}</span></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(110px,1fr))", gap: 10 }}>
        {WORLD_CLOCK_ZONES.map(z => {
            let time = "—", dayDelta = "";
            try {
                time = new Intl.DateTimeFormat([], { hour: "2-digit", minute: "2-digit", timeZone: z.tz }).format(now);
                const localDay = now.getDate();
                const zoneDay = Number(new Intl.DateTimeFormat([], { day: "numeric", timeZone: z.tz }).format(now));
                if (zoneDay > localDay || (zoneDay === 1 && localDay >= 28))
                    dayDelta = "+1d";
                else if (zoneDay < localDay || (zoneDay >= 28 && localDay === 1))
                    dayDelta = "-1d";
            }
            catch (e) { }
            return (<div key={z.tz} style={{ textAlign: "center", padding: "8px 6px", borderRadius: 10, background: "rgba(255,255,255,0.03)" }}>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>{z.label}</div>
              <div className="clock-num" style={{ fontSize: 15, marginTop: 2 }}>{time}</div>
              {dayDelta && <div style={{ fontSize: 9.5, color: "var(--gold)" }}>{dayDelta}</div>}
            </div>);
        })}
      </div>
    </div>);
}

export { WorldClock };
