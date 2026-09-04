const TEMPORAL_ARCHETYPES = [
    { key: "still_one", name: "The Still One", desc: "Understands that doing nothing can also be meaningful.", check: (ctx) => ctx.maDaysCount >= 1 },
    { key: "loopwalker", name: "The Loopwalker", desc: "Lives through recurring timelines.", check: (ctx) => ctx.timeMachineRestores >= 2 },
    { key: "reverse", name: "The Reverse", desc: "Moves through memories backward.", check: (ctx) => ctx.timeMachineRestores >= 1 },
    { key: "clockmaker", name: "The Clockmaker", desc: "Believes everything can be measured.", check: (ctx) => ctx.optimizerUnlocked },
    { key: "thread_weaver", name: "The Thread Weaver", desc: "Connects events across time.", check: (ctx) => ctx.contentItemsCount >= 3 },
    { key: "memory_keeper", name: "The Memory Keeper", desc: "Carries fragments of previous versions.", check: (ctx) => ctx.historyLength >= 15 },
    { key: "horizon_child", name: "The Horizon Child", desc: "Can see possibilities but never certainties.", check: (ctx) => ctx.hasEmptyDayAhead },
];

function computeArchetype(ctx) {
    for (const a of TEMPORAL_ARCHETYPES) {
        if (a.check(ctx))
            return a;
    }
    return { key: "unwritten", name: "The Unwritten", desc: "Has not yet chosen a shape — every trajectory is still possible." };
}

const TIME_ALIGNMENTS = {
    "11:11": "✨ Special temporal alignment — 11:11",
    "00:00": "🌑 Midnight state",
    "12:00": "☀ Solar state",
    "03:14": "π Mathematical alignment — 03:14",
};

const AVTAARA_LEVELS = [
    { name: "Novice", min: 0 }, { name: "Explorer", min: 20 }, { name: "Timekeeper", min: 50 },
    { name: "Creator", min: 90 }, { name: "Optimizer", min: 140 }, { name: "Observer", min: 200 },
    { name: "Chrononaut", min: 280 }, { name: "KAIROS", min: 380 },
];

function currentLevel(xp) {
    let level = AVTAARA_LEVELS[0];
    for (const l of AVTAARA_LEVELS) {
        if (xp >= l.min)
            level = l;
    }
    const idx = AVTAARA_LEVELS.indexOf(level);
    const next = AVTAARA_LEVELS[idx + 1];
    return { level, next, idx };
}

export { TEMPORAL_ARCHETYPES, computeArchetype, TIME_ALIGNMENTS, AVTAARA_LEVELS, currentLevel };
