function pad2(value) { return String(value).padStart(2, "0"); }

function dateKey(year, month, day) {
    return `${year}-${pad2(month + 1)}-${pad2(day)}`;
}

function dateKeyFromDate(date) {
    return dateKey(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseDateKey(key) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(key || "")) return null;
    const [y, m, d] = key.split("-").map(Number);
    const value = new Date(y, m - 1, d);
    return value.getFullYear() === y && value.getMonth() === m - 1 && value.getDate() === d ? value : null;
}

function sameDay(ts, today) { return new Date(ts).toDateString() === today; }

function eventDateKey(event, fallbackYear, fallbackMonth) {
    if (event?.date) return event.date;
    if (event?.day == null) return null;
    const now = new Date();
    return dateKey(fallbackYear ?? now.getFullYear(), fallbackMonth ?? now.getMonth(), event.day);
}

function eventMatchesDate(event, targetDate) {
    return eventDateKey(event, targetDate.getFullYear(), targetDate.getMonth()) === dateKeyFromDate(targetDate);
}

export { sameDay, dateKey, dateKeyFromDate, parseDateKey, eventDateKey, eventMatchesDate };
