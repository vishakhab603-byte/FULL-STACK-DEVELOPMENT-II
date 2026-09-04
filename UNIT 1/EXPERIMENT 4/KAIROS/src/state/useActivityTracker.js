import { useState, useCallback } from "react";

const STORAGE_KEY = "kairos-activity-v2";

function safeRead() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : { count: 0, xp: 0, log: [] };
    } catch (e) {
        return { count: 0, xp: 0, log: [] };
    }
}

function useActivityTracker() {
    const initial = safeRead();
    const [count, setCount] = useState(initial.count || 0);
    const [xp, setXp] = useState(initial.xp || 0);
    const [log, setLog] = useState(initial.log || []);
    const bump = useCallback((text, amount) => {
        const xpAmount = amount == null ? 1 : amount;
        setCount(c => {
            const next = c + 1;
            setLog(l => {
                const nextLog = [{ id: Date.now() + Math.random(), text, ts: Date.now(), xp: xpAmount }, ...l].slice(0, 120);
                setXp(currentXp => {
                    const nextXp = currentXp + xpAmount;
                    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ count: next, xp: nextXp, log: nextLog })); } catch (e) { }
                    return nextXp;
                });
                return nextLog;
            });
            return next;
        });
    }, []);
    return { count, xp, log, bump };
}

export { useActivityTracker };
