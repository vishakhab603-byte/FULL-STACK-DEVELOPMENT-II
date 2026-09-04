import { THEMES, applyTheme } from "../data/theme";
import { addEventLogic, detectConflicts, mockApiRequest, moveEventLogic, removeEventLogic } from "../state/eventStore";

function makeTests() {
    return [
        {
            name: "Adding an event increases the list by one",
            given: "An events list with 2 items",
            when: "addEventLogic is called with a new title",
            then: "The returned list has 3 items and the last one matches the title",
            run() {
                const base = [{ id: 1, day: 1, title: "A", color: "#fff" }, { id: 2, day: 2, title: "B", color: "#fff" }];
                const result = addEventLogic(base, 4, "New event", "#fff");
                const pass = result.length === 3 && result[2].title === "New event" && result[2].day === 4;
                return { pass, detail: `length=${result.length}` };
            }
        },
        {
            name: "Adding an event rejects an impossible calendar date",
            given: "A month where day 31 does not exist",
            when: "addEventLogic is called for an impossible seeded day",
            then: "The original list reference is preserved",
            run() {
                const base = [{ id: 1, day: 1, title: "A", color: "#fff" }];
                const result = addEventLogic(base, 31, "Impossible", "#fff");
                const pass = result === base;
                return { pass, detail: `same reference=${result === base}` };
            }
        },
        {
            name: "Moving an event rejects a date/day mismatch",
            given: "An event being moved with conflicting day and ISO date",
            when: "moveEventLogic is called with day 12 and a date on day 13",
            then: "The original list reference is preserved",
            run() {
                const base = [{ id: 1, day: 5, date: "2026-09-05", title: "A" }];
                const result = moveEventLogic(base, 1, 12, "2026-09-13");
                const pass = result === base;
                return { pass, detail: `same reference=${result === base}` };
            }
        },
        {
            name: "Removing an event removes only that event",
            given: "An events list with 3 items",
            when: "removeEventLogic is called with id 2",
            then: "The returned list has 2 items and does not include id 2",
            run() {
                const base = [{ id: 1, day: 1, title: "A" }, { id: 2, day: 2, title: "B" }, { id: 3, day: 3, title: "C" }];
                const result = removeEventLogic(base, 2);
                const pass = result.length === 2 && !result.some(e => e.id === 2);
                return { pass, detail: `length=${result.length}` };
            }
        },
        {
            name: "Moving an event to a valid day updates its day",
            given: "An event on day 5",
            when: "moveEventLogic is called with day 12",
            then: "The event's day becomes 12",
            run() {
                const base = [{ id: 1, day: 5, title: "A" }];
                const result = moveEventLogic(base, 1, 12);
                const pass = result[0].day === 12;
                return { pass, detail: `day=${result[0].day}` };
            }
        },
        {
            name: "Moving an event to an invalid day (32) is rejected",
            given: "An event on day 5",
            when: "moveEventLogic is called with day 32",
            then: "The list reference is returned unchanged",
            run() {
                const base = [{ id: 1, day: 5, title: "A" }];
                const result = moveEventLogic(base, 1, 32);
                const pass = result[0].day === 5 && result === base;
                return { pass, detail: `day=${result[0].day}, same reference=${result === base}` };
            }
        },
        {
            name: "detectConflicts flags a day with two or more events",
            given: "Two events on day 5",
            when: "detectConflicts is called",
            then: "Day 5 appears in the conflict map with count 2",
            run() {
                const base = [{ id: 1, day: 5 }, { id: 2, day: 5 }];
                const result = detectConflicts(base);
                const pass = result[5] === 2;
                return { pass, detail: JSON.stringify(result) };
            }
        },
        {
            name: "detectConflicts ignores a day with only one event",
            given: "A single event on day 9",
            when: "detectConflicts is called",
            then: "Day 9 does not appear in the conflict map",
            run() {
                const base = [{ id: 1, day: 9 }];
                const result = detectConflicts(base);
                const pass = result[9] === undefined;
                return { pass, detail: JSON.stringify(result) };
            }
        },
        {
            name: "Mock GET /api/events resolves with status 200",
            given: "A mocked GET request configured to succeed",
            when: "mockApiRequest is awaited",
            then: "The result status is 200 and ok is true",
            async run() {
                const result = await mockApiRequest("GET", "/api/events", { status: 200, delay: 80 });
                return { pass: result.status === 200 && result.ok === true, detail: `status=${result.status}` };
            }
        },
        {
            name: "Mock POST configured to fail with 500 rejects",
            given: "A mocked POST request configured to fail",
            when: "mockApiRequest is called with status 500",
            then: "The promise rejects with status 500",
            async run() {
                try {
                    await mockApiRequest("POST", "/api/events", { status: 500, delay: 80 });
                    return { pass: false, detail: "did not reject" };
                }
                catch (e) {
                    return { pass: e.status === 500, detail: `status=${e.status}` };
                }
            }
        },
        {
            name: "Theme switch updates the --accent CSS variable",
            given: "The cyber theme definition",
            when: "applyTheme('cyber') is called",
            then: "document's --accent variable matches cyber's accent color",
            run() {
                applyTheme("cyber");
                const val = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
                const pass = val.toLowerCase() === THEMES.cyber.accent.toLowerCase();
                return { pass, detail: `--accent=${val}` };
            }
        },
    ];
}

export { makeTests };
