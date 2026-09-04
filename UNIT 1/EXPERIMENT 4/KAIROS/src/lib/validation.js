import { parseDateKey, dateKey } from "./dateUtils.js";

function isSafeId(value) {
    return typeof value === "string" || typeof value === "number";
}

function normalizeEventRecord(event, fallbackDate) {
    if (!event || !isSafeId(event.id) || typeof event.title !== "string") return null;
    const explicitDate = typeof event.date === "string" ? event.date : null;
    const fallback = Number.isInteger(event.day) && event.day >= 1 && event.day <= 31 ? fallbackDate(event.day) : null;
    const date = explicitDate && parseDateKey(explicitDate) ? explicitDate : (fallback && parseDateKey(fallback) ? fallback : null);
    const parsed = date ? parseDateKey(date) : null;
    if (!parsed) return null;
    return {
        ...event,
        date,
        day: parsed.getDate(),
    };
}

function normalizeMaDate(value, now = new Date()) {
    if (typeof value !== "string") return null;
    if (parseDateKey(value)) return value;
    return null;
}

function clampDay(year, month, day) {
    const max = new Date(year, month + 1, 0).getDate();
    const numeric = Number(day);
    if (!Number.isFinite(numeric)) return null;
    const safe = Math.max(1, Math.min(max, Math.trunc(numeric)));
    return dateKey(year, month, safe);
}

export { normalizeEventRecord, normalizeMaDate, clampDay };
