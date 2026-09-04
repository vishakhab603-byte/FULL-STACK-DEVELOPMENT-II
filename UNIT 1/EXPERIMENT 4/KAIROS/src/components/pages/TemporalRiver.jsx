import { useMemo, useState } from "react";
import { STAGE_COLORS } from "../../state/contentStore";
import { dateKey, eventDateKey } from "../../lib/dateUtils";

function TemporalRiver({ events, content }) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = now.getDate();
    const [cursor, setCursor] = useState(today);
    const [active, setActive] = useState(null);
    const [mode, setMode] = useState("all");

    const nodes = useMemo(() => {
        const evNodes = events.map(e => {
            const key = eventDateKey(e, year, month);
            const day = key ? Number(key.slice(-2)) : e.day;
            return { id: "e" + e.id, day, title: e.title, color: e.color, shape: "circle", kind: "calendar", date: key };
        }).filter(n => n.day >= 1 && n.day <= daysInMonth);
        const cNodes = content.items.filter(i => i.day).map(i => ({
            id: "c" + i.id, day: Math.min(daysInMonth, Number(i.day)), title: i.title,
            color: STAGE_COLORS[i.stage], shape: "diamond", kind: "content", date: dateKey(year, month, Math.min(daysInMonth, Number(i.day)))
        }));
        return [...evNodes, ...cNodes];
    }, [events, content.items, year, month, daysInMonth]);

    const visibleNodes = nodes.filter(n => mode === "all" || n.kind === mode);
    const before = visibleNodes.filter(n => n.day < cursor).length;
    const onCursor = visibleNodes.filter(n => n.day === cursor).length;
    const after = visibleNodes.filter(n => n.day > cursor).length;
    const cursorDate = new Date(year, month, cursor);
    const monthLabel = cursorDate.toLocaleDateString(undefined, { month: "long", year: "numeric" });
    const dayLabel = cursorDate.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });

    return (<div className="page-rewind temporal-river-page">
      <div className="topbar">
        <div>
          <div className="serif" style={{ fontSize: 24 }}>Temporal River</div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>A navigable current of the present month. Scrub the river to ask one simple question: <em>what existed before this moment?</em></div>
        </div>
        <div className="river-mode-switch">
          {[['all','ALL'],['calendar','EVENTS'],['content','CONTENT']].map(([key,label]) => <button key={key} className={"btn" + (mode === key ? " selected" : "")} onClick={() => setMode(key)}>{label}</button>)}
        </div>
      </div>

      <div className="river-command-card card">
        <div className="river-command-head">
          <div>
            <div className="river-kicker">TEMPORAL CURSOR</div>
            <div className="serif river-date-title">{dayLabel}</div>
            <div className="river-date-copy">{cursor === today ? "You are here." : cursor < today ? `${today - cursor} day(s) behind now.` : `${cursor - today} day(s) ahead of now.`}</div>
          </div>
          <div className="river-stats">
            <span><b>{before}</b> before</span><span><b>{onCursor}</b> here</span><span><b>{after}</b> ahead</span>
          </div>
        </div>
        <input aria-label="Temporal river date" className="river-slider" type="range" min="1" max={daysInMonth} value={cursor} onChange={e => { setCursor(Number(e.target.value)); setActive(null); }}/>
        <div className="river-slider-labels"><span>1</span><span>{monthLabel}</span><span>{daysInMonth}</span></div>
      </div>

      <div className="card" style={{ padding: 22 }}>
        <div className="river-stage river-stage-awake">
          <div className="river-wrap river-wrap-3d">
            <div className="river-flow"/>
            <div className="river-axis"/>
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => <div key={"tick" + d} className={"river-tick" + (d % 7 === 0 ? " river-tick-week" : "")} style={{ left: (d / daysInMonth) * 100 + "%" }}/>) }
            <div className="river-now" style={{ left: (today / daysInMonth) * 100 + "%" }}/>
            <div className="river-now-dot" style={{ left: (today / daysInMonth) * 100 + "%" }}/>
            <div className="river-cursor-line" style={{ left: (cursor / daysInMonth) * 100 + "%" }}/>
            {visibleNodes.map(n => {
                const pct = (n.day / daysInMonth) * 100;
                const distance = Math.abs(n.day - cursor);
                const isCursor = n.day === cursor;
                const isPast = n.day < today;
                const size = isCursor ? 18 : 12;
                return <button aria-label={`${n.title}, day ${n.day}`} key={n.id} className={"river-node river-node-button" + (n.shape === "diamond" ? " diamond" : "") + (isCursor ? " cursor-hit" : "")} style={{ left: pct + "%", width: size, height: size, background: n.color, opacity: Math.max(isCursor ? 1 : .25, 1 - Math.min(.75, distance * .045)), "--depth": Math.max(0, 46 - distance * 3.2) + "px", "--rot": n.shape === "diamond" ? "45deg" : "0deg", boxShadow: isCursor ? `0 0 18px 6px ${n.color}` : `0 0 8px 2px ${n.color}66` }} onClick={() => setActive(n)} />;
            })}
          </div>
        </div>
        <div className="river-legend"><span><i className="legend-dot"/> Event</span><span><i className="legend-diamond"/> Content</span><span><i className="legend-line"/> Today</span><span><i className="legend-cursor"/> Cursor</span></div>
        {active && <div className="river-inspector">
          <div><div className="river-kicker">{active.kind.toUpperCase()}</div><b>{active.title}</b></div>
          <span className="pill">{active.date || `${year}-${String(month + 1).padStart(2, "0")}-${String(active.day).padStart(2, "0")}`}</span>
        </div>}
      </div>
    </div>);
}

export { TemporalRiver };
