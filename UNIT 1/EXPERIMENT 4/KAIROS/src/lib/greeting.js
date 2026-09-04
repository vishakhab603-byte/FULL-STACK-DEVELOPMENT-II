import { dateKeyFromDate, eventDateKey } from "./dateUtils";

function computeContextualGreeting(hour, activityLog, events, today) {
    if (hour >= 0 && hour < 5) {
        return { text: "The day is ending. Not everything needs to.", tone: "quiet" };
    }
    if (!activityLog || activityLog.length === 0) {
        return { text: "Welcome. Your first moment begins here.", tone: "first" };
    }
    const todayKey = dateKeyFromDate(today);
    const todayCount = events.filter(e => eventDateKey(e) === todayKey).length;
    if (todayCount === 0) {
        return { text: "There is space ahead of you. What will you place inside it?", tone: "empty" };
    }
    if (todayCount >= 4) {
        return { text: "You have a dense horizon today. Breathe between the lines.", tone: "dense" };
    }
    const timeGreet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
    return { text: `${timeGreet}. The day is still unwritten.`, tone: "normal" };
}

export { computeContextualGreeting };
