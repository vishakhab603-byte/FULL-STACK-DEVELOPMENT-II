const ACHIEVEMENTS = [
    { key: "first_moment", label: "First Moment", desc: "Take your first real action in KAIROS.", check: (ctx) => ctx.actionCount >= 1 },
    { key: "timekeeper", label: "Timekeeper", desc: "Reach 10 real actions across the app.", check: (ctx) => ctx.actionCount >= 10 },
    { key: "content_creator", label: "Content Creator", desc: "Move a piece of content all the way to Published.", check: (ctx) => ctx.content.items.some(i => i.stage === "published") },
    { key: "chrononaut", label: "Chrononaut", desc: "Restore a snapshot from the Time Machine.", check: (ctx) => ctx.activityLog.some(l => l.text.startsWith("Restored to")) },
    { key: "optimizer", label: "Optimizer", desc: "Turn on all four optimizations in the Scheduler Duel at once.", check: (ctx) => ctx.flags.optimizerUnlocked },
    { key: "test_guardian", label: "Test Guardian", desc: "Get every test passing in the Test Command Center.", check: (ctx) => ctx.flags.testsAllPassed },
    { key: "chaos_survivor", label: "Chaos Survivor", desc: "Inject chaos, then restore KAIROS.", check: (ctx) => ctx.flags.chaosSurvived },
    { key: "easter_egg", label: "Secret Found", desc: "Discover a hidden interaction.", check: (ctx) => ctx.flags.easterEggFound },
    { key: "the_silent", label: "The Silent", desc: "Leave three days as Ma — earned by deliberately doing nothing.", check: (ctx) => (ctx.maDaysCount || 0) >= 3, secretCharacter: true },
    { key: "kairos", label: "KAIROS", desc: "Reach 40 real actions — true mastery of the system.", check: (ctx) => ctx.actionCount >= 40 },
];

export { ACHIEVEMENTS };
