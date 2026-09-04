import { useState, useMemo } from "react";
import { TemporalWheel } from "../shared/TemporalWheel";
import { playSfx } from "../../lib/audio";
import { daysInMonth } from "../../lib/calendarUtils";
import { recommendFreeSlots } from "../../lib/scheduling";
import { detectConflicts } from "../../state/eventStore";
import { dateKey, eventDateKey } from "../../lib/dateUtils";

function Calendar({ events, onAdd, onRemove, onMove, maDays, setMaDays }) {
    const today = new Date();
    const [cursor, setCursor] = useState({ y: today.getFullYear(), m: today.getMonth() });
    const [dragOverDay, setDragOverDay] = useState(null);
    const [modalDay, setModalDay] = useState(null);
    const [draftTitle, setDraftTitle] = useState("");
    const [showFreeSlots, setShowFreeSlots] = useState(false);
    const [showWheel, setShowWheel] = useState(false);
    const total = daysInMonth(cursor.y, cursor.m);
    const firstWeekday = new Date(cursor.y, cursor.m, 1).getDay();
    const monthLabel = new Date(cursor.y, cursor.m, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });
    const isCurrentMonth = cursor.y === today.getFullYear() && cursor.m === today.getMonth();
    const fromDay = isCurrentMonth ? today.getDate() : 1;
    const monthKey = `${cursor.y}-${String(cursor.m + 1).padStart(2, "0")}`;
    const freeSlots = useMemo(() => recommendFreeSlots(events, total, fromDay, monthKey), [events, total, fromDay, monthKey]);
    const cells = [];
    for (let i = 0; i < firstWeekday; i++)
        cells.push(null);
    for (let d = 1; d <= total; d++)
        cells.push(d);
    function moveMonth(delta) {
        let m = cursor.m + delta, y = cursor.y;
        if (m < 0) {
            m = 11;
            y -= 1;
        }
        if (m > 11) {
            m = 0;
            y += 1;
        }
        setCursor({ y, m });
    }
    function handleDrop(day) {
        const id = Number(sessionStorage.getItem("kairos-drag-id"));
        onMove(id, day, dateKey(cursor.y, cursor.m, day));
        setDragOverDay(null);
    }
    function addEvent(day) {
        if (!draftTitle.trim())
            return;
        const palette = ["#8b7ff0", "#4cd3c2", "#f2994a", "#7dd3fc", "#e2607a", "#e8b34c"];
        const color = palette[Math.floor(Math.random() * palette.length)];
        onAdd(day, draftTitle.trim(), color, dateKey(cursor.y, cursor.m, day));
        setDraftTitle("");
        setMaDays(prev => {
            const key = dateKey(cursor.y, cursor.m, day);
            if (!prev.has(key)) return prev;
            const next = new Set(prev); next.delete(key); return next;
        });
        setModalDay(null);
    }
    function leaveAsMa(day) {
        setMaDays(prev => new Set(prev).add(dateKey(cursor.y, cursor.m, day)));
        setModalDay(null);
        playSfx("toggle");
    }
    const conflicts = useMemo(() => detectConflicts(events, cursor.y, cursor.m), [events, cursor.y, cursor.m]);
    const eventsByDay = useMemo(() => {
        const map = {};
        events.forEach(e => { const key = eventDateKey(e, cursor.y, cursor.m); if (key && key.startsWith(monthKey + "-")) (map[e.day] ||= []).push(e); });
        return map;
    }, [events, cursor.y, cursor.m, monthKey]);
    return (<div className="page-slide">
      <div className="topbar">
        <div>
          <div className="serif" style={{ fontSize: 24 }}>{monthLabel}</div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>{total} days this month · drag any chip onto another day to reschedule it</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className={"btn" + (showWheel ? " selected" : "")} onClick={() => setShowWheel(s => !s)}>🎡 Wheel</button>
          <button className={"btn" + (showFreeSlots ? " selected" : "")} onClick={() => setShowFreeSlots(s => !s)}>🧠 Find free time</button>
          <button className="btn" onClick={() => moveMonth(-1)}>← Prev</button>
          <button className="btn" onClick={() => setCursor({ y: today.getFullYear(), m: today.getMonth() })}>Today</button>
          <button className="btn" onClick={() => moveMonth(1)}>Next →</button>
        </div>
      </div>

      {showWheel &&
            <div className="card" style={{ padding: "16px 20px", marginBottom: 16, display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
          <TemporalWheel cursor={cursor} onSelectMonth={(m) => { playSfx("nav"); setCursor(c => ({ ...c, m })); }}/>
          <div style={{ fontSize: 12, color: "var(--muted)", maxWidth: 220 }}>The Temporal Wheel — months as a cycle, not a line. Click any month to jump there directly.</div>
        </div>}

      {showFreeSlots &&
            <div className="card" style={{ padding: "16px 20px", marginBottom: 16 }}>
          <div className="section-title" style={{ marginBottom: 10 }}>Recommended open days {isCurrentMonth ? "" : "(rest of month shown; current month uses today onward)"}</div>
          {freeSlots.length === 0 &&
                    <div style={{ fontSize: 13, color: "var(--muted)" }}>No fully open days left this month — every remaining day already has something on it.</div>}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
            {freeSlots.map(slot => {
                    const weekday = new Date(cursor.y, cursor.m, slot.day).toLocaleDateString(undefined, { weekday: "long" });
                    return (<div key={slot.day} style={{ padding: "12px 14px", borderRadius: 10, border: "1px solid var(--panel-border)", background: "rgba(255,255,255,0.03)" }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>Day {slot.day} · {weekday}</div>
                  <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 6, lineHeight: 1.6 }}>
                    ✓ No events scheduled that day<br />
                    {slot.gapBefore > 0 && <>✓ {slot.gapBefore} clear day{slot.gapBefore === 1 ? "" : "s"} right before<br /></>}
                    {slot.gapAfter > 0 && <>✓ {slot.gapAfter} clear day{slot.gapAfter === 1 ? "" : "s"} right after<br /></>}
                  </div>
                  <button className="btn btn-primary" style={{ marginTop: 10, fontSize: 12, padding: "7px 12px" }} onClick={() => setModalDay(slot.day)}>Schedule here</button>
                </div>);
                })}
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 12 }}>Recommendations are computed live from your actual events — days with more clear space on either side rank higher. Nothing here is guessed.</div>
        </div>}

      <div className="cal-grid" style={{ marginBottom: 8 }}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => <div key={d} className="cal-head">{d}</div>)}
      </div>
      <div className="cal-grid">
        {cells.map((day, i) => {
            if (day === null)
                return <div key={i} className="cal-cell empty"/>;
            const isToday = isCurrentMonth && day === today.getDate();
            const dayEvents = eventsByDay[day] || [];
            const cellDate = new Date(cursor.y, cursor.m, day);
            const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const chronoClass = cellDate < todayMidnight ? "shadow-historical" : cellDate > todayMidnight ? "shadow-future" : "shadow-current";
            return (<div key={i} className={"cal-cell" + (isToday ? " today" : "") + (dragOverDay === day ? " dragover" : "")} onDragOver={e => { e.preventDefault(); setDragOverDay(day); }} onDragLeave={() => setDragOverDay(prev => prev === day ? null : prev)} onDrop={e => { e.preventDefault(); handleDrop(day); }} onClick={() => { if (dayEvents.length === 0)
                setModalDay(day); }}>
              <div className={"cal-daynum" + (isToday ? " today" : "")}>{day}</div>
              {conflicts[dateKey(cursor.y, cursor.m, day)] && <div className="cal-busy" title="Knot — these events are tied together, whether they meant to be or not.">🪢 busy</div>}
              {dayEvents.length === 0 && maDays.has(dateKey(cursor.y, cursor.m, day)) &&
                    <div className="cal-ma" title="Unclaimed time — left open on purpose, not forgotten.">間 Ma</div>}
              {dayEvents.map(ev => (<div key={ev.id} className={"event-chip " + chronoClass} draggable style={{ background: ev.color }} onDragStart={() => sessionStorage.setItem("kairos-drag-id", ev.id)}>
                  <span>{ev.title}</span>
                  <span className="event-x" onClick={(e) => { e.stopPropagation(); onRemove(ev.id); }}>✕</span>
                </div>))}
              {dayEvents.length > 0 &&
                    <div style={{ marginTop: 6, fontSize: 10, color: "var(--muted)", cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); setModalDay(day); }}>+ add</div>}
            </div>);
        })}
      </div>

      {modalDay !== null &&
            <div className="modal-backdrop" onClick={() => setModalDay(null)}>
          <div className="card modal" onClick={e => e.stopPropagation()}>
            <div className="section-title">Day {modalDay} — what will this become?</div>
            <input type="text" autoFocus placeholder="Event title" value={draftTitle} onChange={e => setDraftTitle(e.target.value)} onKeyDown={e => { if (e.key === "Enter")
                addEvent(modalDay); }}/>
            <div style={{ display: "flex", gap: 8, marginTop: 14, justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button className="btn" onClick={() => setModalDay(null)}>Cancel</button>
              <button className="btn" onClick={() => leaveAsMa(modalDay)} title="間 — unclaimed time, left open on purpose">✋ Leave as Ma</button>
              <button className="btn btn-primary" onClick={() => addEvent(modalDay)}>Add</button>
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 10 }}>Ma (間) is the deliberate choice to leave time unclaimed — not an empty cell, a decision.</div>
          </div>
        </div>}
    </div>);
}

export { Calendar };
