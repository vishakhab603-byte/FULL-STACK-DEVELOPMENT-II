import { useState, useEffect, useRef, useMemo, useCallback, memo } from "react";

const WEEK_TAGS = [
    { key: "meeting", label: "Meeting", color: "var(--violet)" },
    { key: "deadline", label: "Deadline", color: "var(--danger)" },
    { key: "focus", label: "Focus block", color: "var(--teal)" },
    { key: "personal", label: "Personal", color: "var(--gold)" },
];

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const WEEK_DEMO_SEED = [
    { id: "wk1", title: "Design review", time: "10:00", day: 0, tag: "meeting" },
    { id: "wk2", title: "Ship v2.3", time: "16:00", day: 0, tag: "deadline" },
    { id: "wk3", title: "1:1 with Sam", time: "09:30", day: 1, tag: "meeting" },
    { id: "wk4", title: "Write proposal", time: "13:00", day: 2, tag: "focus" },
    { id: "wk5", title: "Client demo", time: "15:00", day: 3, tag: "meeting" },
    { id: "wk6", title: "Portfolio review", time: "18:00", day: 3, tag: "focus" },
    { id: "wk7", title: "Grocery run", time: "10:00", day: 5, tag: "personal" },
    { id: "wk8", title: "Sprint planning", time: "11:00", day: 6, tag: "meeting" },
];

function tagColor(tag) { return (WEEK_TAGS.find(t => t.key === tag) || {}).color || "var(--muted)"; }

const WeekEventCardInner = function WeekEventCardInner({ event, onRemove, onDragStart, statsRef }) {
    const renders = useRef(0);
    renders.current += 1;
    statsRef.current.totalRenders += 1;
    statsRef.current.perCard[event.id] = (statsRef.current.perCard[event.id] || 0) + 1;
    const [flash, setFlash] = useState(false);
    const firstRun = useRef(true);
    useEffect(() => {
        if (firstRun.current) { firstRun.current = false; return; }
        setFlash(true);
        const t = setTimeout(() => setFlash(false), 420);
        return () => clearTimeout(t);
    });
    return (<div className={"event-chip" + (flash ? " flash-render" : "")} draggable style={{ borderLeft: "3px solid " + tagColor(event.tag), background: "rgba(255,255,255,0.05)", display: "block", marginBottom: 6 }} onDragStart={() => onDragStart(event.id)}>
      <div style={{ fontSize: 10, color: "var(--muted)" }}>{event.time}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
        <b style={{ fontSize: 12.5 }}>{event.title}</b>
        <span className="event-x" onClick={(e) => { e.stopPropagation(); onRemove(event.id); }}>✕</span>
      </div>
    </div>);
};

const WeekEventCardMemo = memo(WeekEventCardInner);

const WEEK_CONCEPTS = [
    { key: "memo", label: "React.memo on cards", onText: "Skip a card's re-render when its own props haven't changed.", offText: "Every card re-renders whenever the parent does, regardless of props." },
    { key: "callback", label: "useCallback for handlers", onText: "Keep drag handlers referentially stable so memo isn't fooled.", offText: "A brand-new handler function is created every render, defeating memo even with stable data." },
    { key: "structural", label: "useMemo for agenda filter", onText: "Cache the filtered list; recompute only when events or day changes.", offText: "The filtered list is rebuilt (with fresh object copies) on every render, so every card looks \"new\"." },
];

function WeekRenderMonitor() {
    const [events, setEvents] = useState(WEEK_DEMO_SEED);
    const [memoOn, setMemoOn] = useState(true);
    const [callbackOn, setCallbackOn] = useState(true);
    const [structuralOn, setStructuralOn] = useState(true);
    const [liveClock, setLiveClock] = useState(false);
    const [activeTag, setActiveTag] = useState(null);
    const [dragOverDay, setDragOverDay] = useState(null);
    const [, forceTick] = useState(0);
    const statsRef = useRef({ totalRenders: 0, perCard: {} });
    const draggingIdRef = useRef(null);
    useEffect(() => {
        if (!liveClock) return;
        const id = setInterval(() => forceTick(t => t + 1), 450);
        return () => clearInterval(id);
    }, [liveClock]);
    const moveEvent = (id, day) => {
        setEvents(prev => prev.map(e => e.id === id ? { ...e, day } : e));
        forceTick(t => t + 1);
    };
    const removeEvent = (id) => { setEvents(prev => prev.filter(e => e.id !== id)); forceTick(t => t + 1); };
    const matchTag = (e) => !activeTag || e.tag === activeTag;
    const filteredMemo = useMemo(() => events.filter(matchTag), [events, activeTag]);
    const filteredFresh = events.filter(matchTag).map(e => ({ ...e }));
    const visibleEvents = structuralOn ? filteredMemo : filteredFresh;
    const stableRemove = useCallback((id) => removeEvent(id), []);
    const unstableRemove = (id) => removeEvent(id);
    const onRemove = callbackOn ? stableRemove : unstableRemove;
    const stableDragStart = useCallback((id) => { draggingIdRef.current = id; sessionStorage.setItem("kairos-week-drag-id", id); }, []);
    const unstableDragStart = (id) => { draggingIdRef.current = id; sessionStorage.setItem("kairos-week-drag-id", id); };
    const onDragStart = callbackOn ? stableDragStart : unstableDragStart;
    const Card = memoOn ? WeekEventCardMemo : WeekEventCardInner;
    function handleDrop(day) {
        const id = draggingIdRef.current || sessionStorage.getItem("kairos-week-drag-id");
        if (id)
            moveEvent(id, day);
        setDragOverDay(null);
    }
    function resetCounters() {
        statsRef.current = { totalRenders: 0, perCard: {} };
        forceTick(t => t + 1);
    }
    const totalCards = events.length;
    const renderedCount = Object.keys(statsRef.current.perCard).filter(id => statsRef.current.perCard[id] > 0).length;
    const maxPerCard = Math.max(1, ...Object.values(statsRef.current.perCard));
    const now = new Date();
    const stateMap = { memo: memoOn, callback: callbackOn, structural: structuralOn };
    const setterMap = { memo: setMemoOn, callback: setCallbackOn, structural: setStructuralOn };
    return (<div className="page-scan">
      <div className="topbar">
        <div>
          <div className="serif" style={{ fontSize: 24 }}>Week Render Monitor</div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>The Scheduler Duel's drag-and-drop, the Optimization Duel's per-card render counting — fused into one live week view. {now.toLocaleString(undefined, { month: "long" })} · Day {now.getDate()} · {now.toLocaleDateString(undefined, { weekday: "long" })}</div>
        </div>
      </div>

      <div className="card" style={{ padding: "14px 20px", marginBottom: 18, display: "flex", flexWrap: "wrap", gap: 24, alignItems: "flex-start", justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 28 }}>
          {WEEK_CONCEPTS.map(c => (<div key={c.key} style={{ minWidth: 220 }}>
              <div className="toggle-row" style={{ border: "none", padding: "0 0 4px" }}>
                <b style={{ fontSize: 13 }}>{c.label}</b>
                <label className="switch"><input type="checkbox" checked={stateMap[c.key]} onChange={e => setterMap[c.key](e.target.checked)}/><span className="slider"/></label>
              </div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>{stateMap[c.key] ? c.onText : c.offText}</div>
            </div>))}
          <div style={{ minWidth: 200 }}>
            <div className="toggle-row" style={{ border: "none", padding: "0 0 4px" }}>
              <b style={{ fontSize: 13 }}>Live clock</b>
              <label className="switch"><input type="checkbox" checked={liveClock} onChange={e => setLiveClock(e.target.checked)}/><span className="slider"/></label>
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>Ticks every 450ms to simulate unrelated state elsewhere in the app.</div>
          </div>
        </div>
        <button className="btn" onClick={resetCounters}>Reset counters</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 300px", gap: 18, alignItems: "start" }}>
        <div className="card" style={{ padding: "16px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
            <div className="section-title" style={{ margin: 0 }}>Week view</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {WEEK_TAGS.map(t => (<span key={t.key} className="pill" style={{ cursor: "pointer", borderColor: t.color, color: activeTag === t.key ? "#0a0a0a" : t.color, background: activeTag === t.key ? t.color : "transparent", fontSize: 11, padding: "4px 10px" }} onClick={() => setActiveTag(activeTag === t.key ? null : t.key)}>{t.label}</span>))}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 8 }}>
            {WEEK_DAYS.map((label, day) => (<div key={label} style={{ display: "flex", flexDirection: "column" }}>
                <div className="cal-head" style={{ textAlign: "left" }}>{label}</div>
                <div className={"cal-cell" + (dragOverDay === day ? " dragover" : "")} style={{ minHeight: 140 }} onDragOver={e => { e.preventDefault(); setDragOverDay(day); }} onDragLeave={() => setDragOverDay(prev => prev === day ? null : prev)} onDrop={e => { e.preventDefault(); handleDrop(day); }}>
                  {visibleEvents.filter(e => e.day === day).map(ev => (<Card key={ev.id} event={ev} onRemove={onRemove} onDragStart={onDragStart} statsRef={statsRef}/>))}
                </div>
              </div>))}
          </div>
        </div>

        <div className="card" style={{ padding: "16px 18px" }}>
          <div className="section-title">Render monitor</div>
          <div style={{ display: "flex", gap: 24, marginBottom: 14 }}>
            <div>
              <div className="stat-big" style={{ fontSize: 26, color: "var(--accent)" }}>{statsRef.current.totalRenders}</div>
              <div className="stat-label">total renders logged</div>
            </div>
            <div>
              <div className="stat-big" style={{ fontSize: 26, color: "var(--accent2)" }}>{renderedCount}/{totalCards}</div>
              <div className="stat-label">cards that have rendered</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {events.map(ev => {
            const count = statsRef.current.perCard[ev.id] || 0;
            const pct = Math.min(100, (count / maxPerCard) * 100);
            return (<div key={ev.id} style={{ fontSize: 11.5 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <span>{ev.title}</span>
                    <span className="mono" style={{ color: "var(--muted)" }}>{count}</span>
                  </div>
                  <div style={{ height: 5, borderRadius: 999, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: pct + "%", background: "var(--accent)", transition: "width .3s ease" }}/>
                  </div>
                </div>);
        })}
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: "14px 20px", marginTop: 18, fontSize: 12, color: "var(--muted)" }}>
        With all three optimizations on, dragging a card to a new day re-renders only that one card — its own props are the only thing that changed, so React.memo skips every other card even though the parent re-rendered. Turn any optimization off and the same drag re-renders every visible card, because either the handler identity, the filtered list's object identity, or memo itself is no longer stable. The counters above are cumulative and real — counted live inside each card's own render body — so they climb with every drag you do, they never reset themselves.
      </div>
    </div>);
}

export { WEEK_TAGS, WEEK_DAYS, WEEK_DEMO_SEED, tagColor, WeekEventCardInner, WeekEventCardMemo, WEEK_CONCEPTS, WeekRenderMonitor };
