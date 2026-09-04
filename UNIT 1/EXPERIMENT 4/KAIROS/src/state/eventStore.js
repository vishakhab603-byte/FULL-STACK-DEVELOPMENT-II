import { useEffect, useState } from "react";
import { dateKey, eventDateKey, parseDateKey } from "../lib/dateUtils";
import { normalizeEventRecord } from "../lib/validation";

const STORAGE_KEY = "kairos-events-v3";
const HISTORY_KEY = "kairos-event-history-v3";

const coverage = {
    addEventLogic: { calls: 0 },
    removeEventLogic: { calls: 0 },
    moveEventLogic_valid: { calls: 0 },
    moveEventLogic_invalid: { calls: 0 },
    detectConflicts: { calls: 0 },
};

function safeRead(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
}

function seedDate(day) {
    const now = new Date();
    return dateKey(now.getFullYear(), now.getMonth(), day);
}

function normalizeEvent(event) {
    return normalizeEventRecord(event, seedDate);
}

function addEventLogic(events, day, title, color, eventDate) {
    coverage.addEventLogic.calls += 1;
    const date = eventDate || seedDate(day);
    const parsed = parseDateKey(date);
    if (!Number.isInteger(day) || !parsed || parsed.getDate() !== day || typeof title !== "string" || !title.trim()) {
        return events;
    }
    return [...events, { id: Date.now() + Math.random(), day, date, title: title.trim(), color }];
}

function removeEventLogic(events, id) {
    coverage.removeEventLogic.calls += 1;
    return events.filter(e => e.id !== id);
}

function moveEventLogic(events, id, newDay, newDate) {
    const parsedDate = newDate != null ? parseDateKey(newDate) : null;
    if (!Number.isInteger(newDay) || newDay < 1 || newDay > 31 || (newDate != null && (!parsedDate || parsedDate.getDate() !== newDay))) {
        coverage.moveEventLogic_invalid.calls += 1;
        return events;
    }
    coverage.moveEventLogic_valid.calls += 1;
    return events.map(e => e.id === id ? { ...e, day: newDay, ...(newDate ? { date: newDate } : {}) } : e);
}

function detectConflicts(events, fallbackYear, fallbackMonth) {
    coverage.detectConflicts.calls += 1;
    const map = {};
    events.forEach(e => {
        const key = eventDateKey(e, fallbackYear, fallbackMonth) || String(e.day);
        map[key] = (map[key] || 0) + 1;
    });
    return Object.fromEntries(Object.entries(map).filter(([, c]) => c > 1));
}

function mockApiRequest(method, path, opts) {
    const status = (opts && opts.status) || 200;
    const delay = (opts && opts.delay != null) ? opts.delay : 600;
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const ok = status >= 200 && status < 300;
            const result = { status, ok, method, path, timestamp: new Date() };
            if (ok) resolve(result); else reject(result);
        }, delay);
    });
}

const SEED_EVENTS = [
    { id: 1, day: 5, date: seedDate(5), title: "Campaign kickoff", color: "#8b7ff0" },
    { id: 2, day: 5, date: seedDate(5), title: "Asset review", color: "#4cd3c2" },
    { id: 3, day: 12, date: seedDate(12), title: "Publish: Reel", color: "#f2994a" },
    { id: 4, day: 18, date: seedDate(18), title: "Analytics sync", color: "#7dd3fc" },
    { id: 5, day: 23, date: seedDate(23), title: "Draft due", color: "#e2607a" },
];

function useEventStore(bump) {
    const [events, setEvents] = useState(() => safeRead(STORAGE_KEY, SEED_EVENTS).map(normalizeEvent).filter(Boolean));
    const [history, setHistory] = useState(() => safeRead(HISTORY_KEY, [{ ts: Date.now(), label: "Initial state", events: SEED_EVENTS }]).map(h => ({ ...h, events: (h.events || []).map(normalizeEvent).filter(Boolean) })));

    useEffect(() => {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(events)); } catch (e) { }
    }, [events]);
    useEffect(() => {
        try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); } catch (e) { }
    }, [history]);

    function commit(next, label, xp) {
        setEvents(next);
        setHistory(h => [...h, { ts: Date.now(), label, events: next }].slice(-40));
        if (bump) bump(label, xp || 1);
    }
    function addEvent(day, title, color, eventDate) {
        commit(addEventLogic(events, day, title, color, eventDate), `Scheduled "${title}" on day ${day}`, 2);
    }
    function removeEvent(id) {
        const target = events.find(e => e.id === id);
        commit(removeEventLogic(events, id), target ? `Removed "${target.title}"` : "Removed event", 1);
    }
    function moveEvent(id, day, eventDate) {
        const target = events.find(e => e.id === id);
        commit(moveEventLogic(events, id, day, eventDate), target ? `Moved "${target.title}" to day ${day}` : "Moved event", 1);
    }
    function restore(snapshotEvents, label) { commit(snapshotEvents.map(normalizeEvent).filter(Boolean), label, 1); }
    function clearWorkspace() {
        const fresh = SEED_EVENTS.map(normalizeEvent);
        setEvents(fresh);
        setHistory([{ ts: Date.now(), label: "Workspace reset", events: fresh }]);
        if (bump) bump("Calendar workspace reset", 2);
    }
    return { events, history, addEvent, removeEvent, moveEvent, restore, clearWorkspace };
}

export { coverage, addEventLogic, removeEventLogic, moveEventLogic, detectConflicts, mockApiRequest, SEED_EVENTS, useEventStore };
