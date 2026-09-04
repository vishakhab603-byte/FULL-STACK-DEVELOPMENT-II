import { eventDateKey } from "./dateUtils";

function recommendFreeSlots(events, totalDays, fromDay, monthKey) {
    const relevant = monthKey ? events.filter(e => { const key = eventDateKey(e); return key ? key.startsWith(monthKey + "-") : true; }) : events;
    const busyDays = new Set(relevant.map(e => Number(e.day)).filter(Boolean));
    const candidates = [];
    for (let d = fromDay; d <= totalDays; d++) {
        if (busyDays.has(d)) continue;
        let gapBefore = 0;
        for (let k = d - 1; k >= 1 && !busyDays.has(k); k--) gapBefore++;
        let gapAfter = 0;
        for (let k = d + 1; k <= totalDays && !busyDays.has(k); k++) gapAfter++;
        candidates.push({ day: d, gapBefore, gapAfter, minGap: Math.min(gapBefore, gapAfter) });
    }
    candidates.sort((a, b) => (b.minGap - a.minGap) || (a.day - b.day));
    return candidates.slice(0, 3);
}

export { recommendFreeSlots };
