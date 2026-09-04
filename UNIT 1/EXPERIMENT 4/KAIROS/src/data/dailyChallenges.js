import { sameDay } from "../lib/dateUtils";

const DAILY_CHALLENGES = [
    { id: "sched3", label: "Schedule 3 events today", xp: 15, check: (log, today) => log.filter(l => sameDay(l.ts, today) && l.text.startsWith("Scheduled")).length >= 3, progress: (log, today) => Math.min(3, log.filter(l => sameDay(l.ts, today) && l.text.startsWith("Scheduled")).length) + "/3" },
    { id: "content1", label: "Move content forward a pipeline stage", xp: 12, check: (log, today) => log.filter(l => sameDay(l.ts, today) && l.text.includes("→")).length >= 1, progress: (log, today) => Math.min(1, log.filter(l => sameDay(l.ts, today) && l.text.includes("→")).length) + "/1" },
    { id: "chaos1", label: "Survive the Chaos Lab", xp: 15, check: (log, today) => log.some(l => sameDay(l.ts, today) && l.text.includes("temporal integrity restored")), progress: (log, today) => log.some(l => sameDay(l.ts, today) && l.text.includes("temporal integrity restored")) ? "1/1" : "0/1" },
    { id: "focus1", label: "Complete one Focus Session", xp: 15, check: (log, today) => log.some(l => sameDay(l.ts, today) && l.text.includes("focus session")), progress: (log, today) => log.some(l => sameDay(l.ts, today) && l.text.includes("focus session")) ? "1/1" : "0/1" },
    { id: "test1", label: "Get every test passing", xp: 15, check: (log, today) => log.some(l => sameDay(l.ts, today) && l.text.includes("all tests passing")), progress: (log, today) => log.some(l => sameDay(l.ts, today) && l.text.includes("all tests passing")) ? "1/1" : "0/1" },
];

export { DAILY_CHALLENGES };
