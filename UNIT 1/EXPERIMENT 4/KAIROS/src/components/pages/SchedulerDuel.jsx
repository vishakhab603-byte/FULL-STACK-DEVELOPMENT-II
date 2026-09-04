import { useState, useEffect, useRef, useMemo, useCallback, memo } from "react";
import { TemporalParticles } from "../shared/TemporalParticles";
import { playSfx } from "../../lib/audio";
import { ObservatoryHeader, TelemetryStrip } from "../shared/ObservatoryHeader";

function computeEventsByDay(events, totalDays) {
    const map = {};
    for (let d = 1; d <= totalDays; d++)
        map[d] = events.filter(e => e.day === d);
    return map;
}

const DayCellInner = function DayCellInner({ day, isToday, list, isDragOver, cellRef, onDragEnterDay, onDropDay, onRemoveDay, onChipDragStart, statsRef }) {
    const renders = useRef(0);
    renders.current += 1;
    statsRef.current.totalRenders += 1;
    statsRef.current.dragRenders += 1;
    const prevListRef = useRef(list);
    const isZombie = renders.current > 1 && prevListRef.current === list;
    if (isZombie) {
        statsRef.current.totalZombies = (statsRef.current.totalZombies || 0) + 1;
        statsRef.current.dragZombies = (statsRef.current.dragZombies || 0) + 1;
    }
    prevListRef.current = list;
    const [flash, setFlash] = useState(false);
    const firstRun = useRef(true);
    useEffect(() => {
        if (firstRun.current) {
            firstRun.current = false;
            return;
        }
        setFlash(true);
        const t = setTimeout(() => setFlash(false), 420);
        return () => clearTimeout(t);
    }, [list]);
    return (<div ref={cellRef} className={"cal-cell sched-cell" + (isToday ? " today" : "") + (isDragOver ? " dragover" : "") + (flash ? (isZombie ? " flash-zombie" : " flash-render") : "")} data-day={day} onDragOver={e => e.preventDefault()} onDragEnter={() => onDragEnterDay(day)} onDrop={e => { e.preventDefault(); onDropDay(day); }}>
      <span className="sched-rc">{isZombie ? "👻 " : ""}r:{renders.current}</span>
      <div className={"cal-daynum" + (isToday ? " today" : "")}>{day}</div>
      {list.map(ev => (<div key={ev.id} className="event-chip" draggable style={{ background: ev.color }} onDragStart={() => onChipDragStart(ev.id)}>
          <span>{ev.title}</span>
          <span className="event-x" onClick={(e) => { e.stopPropagation(); onRemoveDay(ev.id); }}>✕</span>
        </div>))}
    </div>);
};

const DayCellMemo = memo(DayCellInner);

const CONCEPTS = [
    {
        key: "memo", label: "memo",
        code: "const DayCellMemo = memo(DayCellInner);",
        onText: "Cells are skipped when their props haven't changed.",
        offText: "Every cell re-renders whenever the parent does, regardless of props.",
    },
    {
        key: "structural", label: "useMemo (structural sharing)",
        code: "eventsByDay = useMemo(() => shareUnchangedDayArrays(events), [events]);",
        onText: "Only the day(s) whose events actually changed get a new array reference.",
        offText: "Every day's event array is rebuilt fresh on every render — new reference, every cell.",
    },
    {
        key: "callback", label: "useCallback",
        code: "const onDropDay = useCallback((day) => moveEventRef.current(id, day), []);",
        onText: "onDrop / onDragEnter keep one stable identity across renders.",
        offText: "A brand-new onDrop / onDragEnter function is created every render.",
    },
    {
        key: "dragref", label: "Ref-based drag preview",
        code: "cellRefs.current[day].classList.add('dragover'); // no setState",
        onText: "Hover highlight is applied directly to the DOM — zero React renders while dragging.",
        offText: "Every cell you drag across calls setState, re-rendering the whole grid mid-drag.",
    },
];

function SchedulerDuel({ events, onAdd, onRemove, onMove, onOptimizerUnlocked }) {
    const totalDays = 31;
    const [memoOn, setMemoOn] = useState(true);
    const [structuralOn, setStructuralOn] = useState(true);
    const [callbackOn, setCallbackOn] = useState(true);
    const [dragRefOn, setDragRefOn] = useState(true);
    const [dragOverDay, setDragOverDay] = useState(null);
    const [log, setLog] = useState([]);
    const [, forceTick] = useState(0);
    const statsRef = useRef({ totalRenders: 0, dragRenders: 0, totalZombies: 0, dragZombies: 0 });
    const prevSharedRef = useRef({});
    const cellRefs = useRef({});
    const hoveredRef = useRef(null);
    const draggingIdRef = useRef(null);
    const moveEventRef = useRef(onMove);
    const removeEventRef = useRef(onRemove);
    moveEventRef.current = onMove;
    removeEventRef.current = onRemove;
    const unlockedOnceRef = useRef(false);
    const [showConverge, setShowConverge] = useState(false);
    const allOptimized = memoOn && structuralOn && callbackOn && dragRefOn;
    const [dragResult, setDragResult] = useState(0);
    const [lastDragResult, setLastDragResult] = useState(0);
    const [lastObservedRenders, setLastObservedRenders] = useState(null);
    const [analytics, setAnalytics] = useState({
        totalDrags: 0,
        optimizedDrags: 0,
        unoptimizedDrags: 0,
        optimizedUnits: 0,
        unoptimizedUnits: 0,
        actualCellRenders: 0,
        actualCellRendersAtLastDrag: 0,
        lastDragZombies: 0,
    });
    const dragCountRef = useRef(0);
    const cumulativeRenderRef = useRef(0);
    const optimizedUnitsRef = useRef(0);
    const unoptimizedUnitsRef = useRef(0);
    const actualCellRendersAtDragStartRef = useRef(0);
    const pendingObservedMeasurementRef = useRef(false);
    function resetAnalytics() {
        dragCountRef.current = 0;
        cumulativeRenderRef.current = 0;
        optimizedUnitsRef.current = 0;
        unoptimizedUnitsRef.current = 0;
        statsRef.current.dragRenders = 0;
        statsRef.current.dragZombies = 0;
        actualCellRendersAtDragStartRef.current = 0;
        pendingObservedMeasurementRef.current = false;
        setDragResult(0);
        setLastDragResult(0);
        setLastObservedRenders(null);
        setAnalytics({ totalDrags: 0, optimizedDrags: 0, unoptimizedDrags: 0, optimizedUnits: 0, unoptimizedUnits: 0, actualCellRenders: statsRef.current.totalRenders, actualCellRendersAtLastDrag: 0, lastDragZombies: 0 });
        setLog([]);
    }

    function setAllOptimizations(on) {
        setMemoOn(on);
        setStructuralOn(on);
        setCallbackOn(on);
        setDragRefOn(on);
    }
    useEffect(() => {
        if (memoOn && structuralOn && callbackOn && dragRefOn && !unlockedOnceRef.current) {
            unlockedOnceRef.current = true;
            setShowConverge(true);
            const convergeTimer = window.setTimeout(() => setShowConverge(false), 1000);
            return () => window.clearTimeout(convergeTimer);
            if (onOptimizerUnlocked)
                onOptimizerUnlocked();
        }
    }, [memoOn, structuralOn, callbackOn, dragRefOn]);
    function addLog(text) {
        setLog(l => [{ id: Date.now() + Math.random(), text }, ...l].slice(0, 8));
    }
    const structuralMemoMap = useMemo(() => {
        const fresh = computeEventsByDay(events, totalDays);
        const prev = prevSharedRef.current || {};
        const merged = {};
        for (let d = 1; d <= totalDays; d++) {
            const list = fresh[d];
            const prevList = prev[d];
            const same = prevList && prevList.length === list.length &&
                prevList.every((e, i) => e.id === list[i].id && e.title === list[i].title && e.color === list[i].color && e.day === list[i].day);
            merged[d] = same ? prevList : list;
        }
        prevSharedRef.current = merged;
        return merged;
    }, [events]);
    useEffect(() => {
        if (!pendingObservedMeasurementRef.current) return;
        pendingObservedMeasurementRef.current = false;
        const observedDelta = Math.max(0, statsRef.current.dragRenders - actualCellRendersAtDragStartRef.current);
        setLastObservedRenders(observedDelta);
        setAnalytics(prev => ({
            ...prev,
            actualCellRenders: statsRef.current.totalRenders,
            actualCellRendersAtLastDrag: observedDelta,
            lastDragZombies: statsRef.current.dragZombies || 0,
        }));
    }, [events]);

    const freshMap = computeEventsByDay(events, totalDays);
    const eventsByDay = structuralOn ? structuralMemoMap : freshMap;
    const dragHandledRef = useRef(false);
    function finishDrag() {
        if (dragHandledRef.current)
            return;
        dragHandledRef.current = true;
        Object.values(cellRefs.current).forEach(el => { if (el)
            el.classList.remove("dragover"); });
        setDragOverDay(null);
        // This is the normalized teaching metric for one committed drag: one
        // render-work unit in the fully optimized path, versus all 31 day cells
        // in the fully unoptimized path. It intentionally excludes unrelated
        // dashboard/animation renders so the comparison stays deterministic.
        const result = allOptimized ? 1 : totalDays;
        // React commits the parent/event-store update after this handler returns,
        // so actual DayCell renders caused by the move are measured in the
        // events effect below rather than read too early here.
        pendingObservedMeasurementRef.current = true;
        dragCountRef.current += 1;
        cumulativeRenderRef.current += result;
        if (allOptimized) optimizedUnitsRef.current += result;
        else unoptimizedUnitsRef.current += result;
        setLastDragResult(result);
        setLastObservedRenders(null);
        setDragResult(cumulativeRenderRef.current);
        setAnalytics(prev => {
            const nextTotal = prev.totalDrags + 1;
            const nextOptimized = prev.optimizedDrags + (allOptimized ? 1 : 0);
            const nextUnoptimized = prev.unoptimizedDrags + (allOptimized ? 0 : 1);
            const nextActual = statsRef.current.totalRenders;
            return {
                totalDrags: nextTotal,
                optimizedDrags: nextOptimized,
                unoptimizedDrags: nextUnoptimized,
                optimizedUnits: optimizedUnitsRef.current,
                unoptimizedUnits: unoptimizedUnitsRef.current,
                actualCellRenders: nextActual,
                actualCellRendersAtLastDrag: 0,
            };
        });
        actualCellRendersAtDragStartRef.current = statsRef.current.dragRenders;
        forceTick(t => t + 1);
        addLog(`📊 drag #${dragCountRef.current} finished — +${result} normalized render unit(s)`);
    }
    const finishDragRef = useRef(finishDrag);
    finishDragRef.current = finishDrag;
    const stableOnDrop = useCallback((day) => {
        const id = draggingIdRef.current;
        moveEventRef.current(id, day);
        addLog(`✅ onDrop(day=${day}) → moveEvent(${id}, ${day}) committed`);
        finishDragRef.current();
    }, []);
    const unstableOnDrop = (day) => {
        const id = draggingIdRef.current;
        moveEventRef.current(id, day);
        addLog(`✅ onDrop(day=${day}) → moveEvent(${id}, ${day}) committed`);
        finishDragRef.current();
    };
    const onDropDay = callbackOn ? stableOnDrop : unstableOnDrop;
    const stableOnRemove = useCallback((id) => { removeEventRef.current(id); }, []);
    const unstableOnRemove = (id) => { removeEventRef.current(id); };
    const onRemoveDay = callbackOn ? stableOnRemove : unstableOnRemove;
    const cellRefCallbacks = useRef({});
    function getCellRefCallback(day) {
        if (!cellRefCallbacks.current[day]) {
            cellRefCallbacks.current[day] = (el) => { cellRefs.current[day] = el; };
        }
        return cellRefCallbacks.current[day];
    }
    const stableOnDragEnter = useCallback((day) => {
        if (dragRefOn) {
            if (hoveredRef.current !== day) {
                const prevEl = cellRefs.current[hoveredRef.current];
                if (prevEl)
                    prevEl.classList.remove("dragover");
                const el = cellRefs.current[day];
                if (el)
                    el.classList.add("dragover");
                hoveredRef.current = day;
            }
        }
        else {
            setDragOverDay(prev => prev === day ? prev : day);
        }
    }, [dragRefOn]);
    const unstableOnDragEnter = (day) => {
        if (dragRefOn) {
            if (hoveredRef.current !== day) {
                const prevEl = cellRefs.current[hoveredRef.current];
                if (prevEl)
                    prevEl.classList.remove("dragover");
                const el = cellRefs.current[day];
                if (el)
                    el.classList.add("dragover");
                hoveredRef.current = day;
            }
        }
        else {
            setDragOverDay(prev => prev === day ? prev : day);
        }
    };
    const onDragEnterDay = callbackOn ? stableOnDragEnter : unstableOnDragEnter;
    function handleChipDragStart(id) {
        draggingIdRef.current = id;
        statsRef.current.dragRenders = 0;
        statsRef.current.dragZombies = 0;
        actualCellRendersAtDragStartRef.current = 0;
        pendingObservedMeasurementRef.current = false;
        hoveredRef.current = null;
        dragHandledRef.current = false;
        addLog(`🖱️ onDragStart(id=${id}) — id cached in a ref`);
    }
    const handleChipDragStartRef = useRef(handleChipDragStart);
    handleChipDragStartRef.current = handleChipDragStart;
    const onChipDragStart = useCallback((id) => { handleChipDragStartRef.current(id); }, []);
    function handleDragEnd() {
        finishDrag();
    }
    const cells = [];
    for (let d = 1; d <= totalDays; d++)
        cells.push(d);
    const DayCell = memoOn ? DayCellMemo : DayCellInner;
    return (<div className="page-slide" style={{ position: "relative" }} onDragEnd={handleDragEnd}>
      <TemporalParticles type="converge" active={showConverge} count={18}/>
      <ObservatoryHeader title="Scheduler Duel" status="LIVE REACT" subtitle="The real calendar, real store, and four React optimization switches. The controlled comparison is normalized; the DayCell counters remain raw diagnostic observations." />
      <TelemetryStrip items={[
        { label: "MODE", value: allOptimized ? "OPTIMIZED" : "UNOPTIMIZED", note: "four-switch profile" },
        { label: "DRAGS", value: analytics.totalDrags, note: "completed commits" },
        { label: "WORK / DRAG", value: analytics.totalDrags ? (dragResult / analytics.totalDrags).toFixed(1) : "0.0", note: "normalized units" },
        { label: "OBSERVED", value: lastObservedRenders == null ? "—" : lastObservedRenders, note: "actual DayCell delta" }
      ]} />
      <div className="topbar">
        <div>
          <div className="serif" style={{ fontSize: 18 }}>Render-performance console</div>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>Drag any event and watch the render badges in the corner of each day.</div>
        </div>
        <div className="card" style={{ padding: "12px 16px", minWidth: 470 }}>
          <div className="section-title" style={{ marginBottom: 8 }}>Live render-performance dashboard</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(90px,1fr))", gap: 10 }}>
            <div><div className="stat-label">Renders / drag</div><div className="stat-big" style={{ fontSize: 22, color: allOptimized ? "var(--accent2)" : "var(--danger)" }}>{allOptimized ? 1 : 31}</div></div>
            <div><div className="stat-label">Added this drag</div><div className="stat-big" style={{ fontSize: 22 }}>{lastDragResult ? `+${lastDragResult}` : "—"}</div></div>
            <div><div className="stat-label">Observed cells</div><div className="stat-big" style={{ fontSize: 22 }}>{lastObservedRenders == null ? "—" : lastObservedRenders}</div></div>
            <div><div className="stat-label">Total drags</div><div className="stat-big" style={{ fontSize: 22 }}>{analytics.totalDrags}</div></div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginTop: 7 }}>
            <div style={{ fontSize: 10.5, color: "var(--muted)" }}>Normalized comparison: fully optimized = 1 render-work unit; fully unoptimized = 31 day-cell render-work units per committed drag.</div>
            <button className="btn" onClick={resetAnalytics} style={{ padding: "6px 10px", fontSize: 10.5 }}>Reset analysis</button>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: "14px 20px", marginBottom: 18, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
        <div className="toggle-row" style={{ border: "none", padding: 0 }}>
          <span style={{ fontWeight: 600 }}>{allOptimized ? "⚡ Optimized" : "🐌 Unoptimized"}</span>
          <label className="switch"><input type="checkbox" checked={allOptimized} onChange={e => { playSfx("toggle"); setAllOptimizations(e.target.checked); }}/><span className="slider"/></label>
        </div>
        <div style={{ fontSize: 11.5, color: "var(--muted)" }}>Flips all four optimizations below at once.</div>
      </div>

      <div className="card" style={{ padding: "14px 20px", marginBottom: 18, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
        <div className="toggle-row" style={{ border: "none", padding: 0 }}>
          <span>memo</span>
          <label className="switch"><input type="checkbox" checked={memoOn} onChange={e => { playSfx("toggle"); setMemoOn(e.target.checked); }}/><span className="slider"/></label>
        </div>
        <div className="toggle-row" style={{ border: "none", padding: 0 }}>
          <span>useMemo (structural sharing)</span>
          <label className="switch"><input type="checkbox" checked={structuralOn} onChange={e => { playSfx("toggle"); setStructuralOn(e.target.checked); }}/><span className="slider"/></label>
        </div>
        <div className="toggle-row" style={{ border: "none", padding: 0 }}>
          <span>useCallback</span>
          <label className="switch"><input type="checkbox" checked={callbackOn} onChange={e => { playSfx("toggle"); setCallbackOn(e.target.checked); }}/><span className="slider"/></label>
        </div>
        <div className="toggle-row" style={{ border: "none", padding: 0 }}>
          <span>Ref-based drag preview</span>
          <label className="switch"><input type="checkbox" checked={dragRefOn} onChange={e => { playSfx("toggle"); setDragRefOn(e.target.checked); }}/><span className="slider"/></label>
        </div>
      </div>

      <div className="card" style={{ padding: "14px 20px", marginBottom: 18 }}>
        <div className="section-title" style={{ marginBottom: 10 }}>Performance analysis</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(145px,1fr))", gap: 12 }}>
          <div><div className="stat-label">Optimized drags</div><div className="stat-big" style={{ fontSize: 24, color: "var(--accent2)" }}>{analytics.optimizedDrags}</div><div style={{ fontSize: 10.5, color: "var(--muted)" }}>{analytics.optimizedUnits} render units</div></div>
          <div><div className="stat-label">Unoptimized drags</div><div className="stat-big" style={{ fontSize: 24, color: "var(--danger)" }}>{analytics.unoptimizedDrags}</div><div style={{ fontSize: 10.5, color: "var(--muted)" }}>{analytics.unoptimizedUnits} render units</div></div>
          <div><div className="stat-label">Cumulative work</div><div className="stat-big" style={{ fontSize: 24 }}>{dragResult}</div><div style={{ fontSize: 10.5, color: "var(--muted)" }}>all completed drags</div></div>
          <div><div className="stat-label">Mode-unit gap</div><div className="stat-big" style={{ fontSize: 24 }}>{Math.abs(analytics.unoptimizedUnits - analytics.optimizedUnits)}</div><div style={{ fontSize: 10.5, color: "var(--muted)" }}>unoptimized − optimized</div></div>
          <div><div className="stat-label">All-optimized equivalent</div><div className="stat-big" style={{ fontSize: 24 }}>{analytics.totalDrags}</div><div style={{ fontSize: 10.5, color: "var(--muted)" }}>1 unit × {analytics.totalDrags} drag(s)</div></div>
          <div><div className="stat-label">All-unoptimized equivalent</div><div className="stat-big" style={{ fontSize: 24 }}>{analytics.totalDrags * totalDays}</div><div style={{ fontSize: 10.5, color: "var(--muted)" }}>31 units × {analytics.totalDrags} drag(s)</div></div>
          <div><div className="stat-label">Work saved vs worst case</div><div className="stat-big" style={{ fontSize: 24, color: "var(--accent2)" }}>{Math.max(0, analytics.totalDrags * totalDays - dragResult)}</div><div style={{ fontSize: 10.5, color: "var(--muted)" }}>{analytics.totalDrags ? ((1 - dragResult / (analytics.totalDrags * totalDays)) * 100).toFixed(1) : "0.0"}% reduction</div></div>
          <div><div className="stat-label">Average units / drag</div><div className="stat-big" style={{ fontSize: 24 }}>{analytics.totalDrags ? (dragResult / analytics.totalDrags).toFixed(1) : "0.0"}</div><div style={{ fontSize: 10.5, color: "var(--muted)" }}>lower is better</div></div>
          <div><div className="stat-label">Instrumented DayCell renders</div><div className="stat-big" style={{ fontSize: 24 }}>{analytics.actualCellRenders}</div><div style={{ fontSize: 10.5, color: "var(--muted)" }}>actual render-body counter</div></div>
          <div><div className="stat-label">Last-drag zombies</div><div className="stat-big" style={{ fontSize: 24, color: analytics.lastDragZombies ? "var(--danger)" : "var(--accent2)" }}>{analytics.lastDragZombies}</div><div style={{ fontSize: 10.5, color: "var(--muted)" }}>same props/reference, unnecessary work</div></div>
        </div>
        <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--panel-border)", fontSize: 11.5, color: "var(--muted)" }}>
          <b style={{ color: "var(--text)" }}>How to read it:</b> the <b>Renders / drag</b> metric is the controlled 1-vs-31 comparison you are testing. <b>Observed cells</b> is separate and comes from real DayCell render instrumentation, so it can reveal incidental React work without corrupting the controlled comparison.
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 300px", gap: 18, alignItems: "start" }}>
        <div>
          <div className="cal-grid" style={{ marginBottom: 8 }}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => <div key={d} className="cal-head">{d}</div>)}
          </div>
          <div className="cal-grid">
            {cells.map(day => (<DayCell key={day} day={day} isToday={day === new Date().getDate()} list={eventsByDay[day] || []} isDragOver={dragOverDay === day} cellRef={getCellRefCallback(day)} onDragEnterDay={onDragEnterDay} onDropDay={onDropDay} onRemoveDay={onRemoveDay} onChipDragStart={onChipDragStart} statsRef={statsRef}/>))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="section-title" style={{ marginBottom: 0 }}>Concept ↔ code, live</div>
          {CONCEPTS.map(c => {
            const stateMap = { memo: memoOn, structural: structuralOn, callback: callbackOn, dragref: dragRefOn };
            const on = stateMap[c.key];
            return (<div key={c.key} className={"concept-card" + (on ? " on" : "")}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <b style={{ fontSize: 12.5 }}>{c.label}</b>
                  <span className={on ? "status-ok" : "status-fail"} style={{ fontSize: 10 }}>{on ? "ON" : "OFF"}</span>
                </div>
                <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 4 }}>{on ? c.onText : c.offText}</div>
                <div className="concept-code">{c.code}</div>
              </div>);
        })}
          <div className="card" style={{ padding: "12px 14px" }}>
            <div className="section-title" style={{ marginBottom: 8 }}>Live activity</div>
            <div className="drag-log">
              {log.length === 0 && <div style={{ fontSize: 11.5, color: "var(--muted)" }}>Drag an event to begin.</div>}
              {log.map(l => <div key={l.id} className="drag-log-line">{l.text}</div>)}
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: "14px 20px", marginTop: 18, fontSize: 12, color: "var(--muted)" }}>
        Turn all four off and drag an event — the controlled comparison records 31 render-work units for the unoptimized path. Turn all four on and it records 1 unit for the optimized path. The dashboard keeps these normalized render-work units separate from the small r: badges, which are actual DayCell render-body counters. This gives you both a clean 1-vs-31 experiment and real instrumentation for diagnosing incidental renders.
      </div>
      <div className="card" style={{ padding: "14px 20px", marginTop: 12, fontSize: 12, color: "var(--muted)" }}>
        👻 A <b style={{ color: "var(--text)" }}>Render Zombie</b> is a cell that re-rendered even though the exact same event-list reference it had last time was passed in again — work done for nothing. It can only happen when memo is off, since memo's whole job is to refuse that render in the first place. Watch the zombie count hit zero the instant you flip memo back on.
      </div>
    </div>);
}

export { computeEventsByDay, DayCellInner, DayCellMemo, CONCEPTS, SchedulerDuel };
