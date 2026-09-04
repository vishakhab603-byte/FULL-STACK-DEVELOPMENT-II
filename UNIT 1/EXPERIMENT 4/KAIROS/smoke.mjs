import assert from "node:assert/strict";
import { normalizeEventRecord, clampDay } from "./src/lib/validation.js";
import { parseDateKey, dateKey } from "./src/lib/dateUtils.js";

const fallback = day => `2026-09-${String(day).padStart(2, "0")}`;
const valid = normalizeEventRecord({ id: 1, day: 5, title: "Test", date: "2026-09-05" }, fallback);
assert.equal(valid.day, 5);
assert.equal(valid.date, "2026-09-05");
assert.equal(normalizeEventRecord({ id: 2, day: 31, title: "Impossible", date: "2026-09-31" }, fallback), null);
assert.equal(normalizeEventRecord({ id: 3, day: 5, title: "Legacy" }, fallback).date, "2026-09-05");
assert.equal(clampDay(2026, 1, 31), "2026-02-28");
assert.equal(parseDateKey("2026-02-29"), null);
assert.equal(dateKey(2026, 8, 3), "2026-09-03");
console.log("KAIROS SMOKE: PASS");
