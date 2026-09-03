import React from "react";
const { useState, useEffect, useRef, useMemo, useCallback, memo, Fragment } = React;
const THEMES = {
    cosmic: { label: "Cosmic", bg: "#070818", accent: "#8b7ff0", accent2: "#4cd3c2", kind: "cosmic", font: "Georgia, serif", mood: "none" },
    rain: { label: "Rain", bg: "#0d1420", accent: "#4cd3c2", accent2: "#6ea8ff", kind: "rain", font: "Georgia, serif", mood: "saturate(0.9) brightness(0.98)" },
    aurora: { label: "Aurora", bg: "#071a16", accent: "#5eead4", accent2: "#a78bfa", kind: "aurora", font: "Georgia, serif", mood: "saturate(1.15)" },
    zen: { label: "Zen", bg: "#141210", accent: "#d9b98c", accent2: "#b7a086", kind: "zen", font: "'Iowan Old Style', Georgia, serif", mood: "saturate(0.72) contrast(0.94)" },
    cyber: { label: "Cyber", bg: "#08090c", accent: "#33e6ff", accent2: "#ff3cac", kind: "grid", font: "'SFMono-Regular', Consolas, Menlo, monospace", mood: "contrast(1.18) saturate(1.25)" },
    sunset: { label: "Sunset", bg: "#1a0e1f", accent: "#f2994a", accent2: "#eb5b72", kind: "sunset", font: "Georgia, serif", mood: "saturate(1.12) contrast(1.04)" },
    storm: { label: "Storm", bg: "#10131c", accent: "#7dd3fc", accent2: "#94a3b8", kind: "storm", font: "Georgia, serif", mood: "contrast(1.1) saturate(0.92)" },
    sakura: { label: "Sakura", bg: "#170f16", accent: "#ff9ecb", accent2: "#ffd2e8", kind: "petals", font: "Georgia, serif", mood: "saturate(1.08)" },
    matrix: { label: "Matrix", bg: "#050805", accent: "#39ff6a", accent2: "#8dff9e", kind: "grid", font: "'SFMono-Regular', Consolas, Menlo, monospace", mood: "contrast(1.25) saturate(1.3) hue-rotate(70deg)" },
    twilight: { label: "Twilight", bg: "#0a0416", accent: "#a06bff", accent2: "#5e3ec9", kind: "cosmic", font: "Georgia, serif", mood: "saturate(1.2) hue-rotate(-15deg)" },
    candyfloss: { label: "Candyfloss", bg: "#170c1e", accent: "#ff8fd6", accent2: "#b39bff", kind: "aurora", font: "Georgia, serif", mood: "saturate(1.3) brightness(1.05)" },
    volcano: { label: "Volcano", bg: "#1a0805", accent: "#ff5a3c", accent2: "#ffb03c", kind: "sunset", font: "Georgia, serif", mood: "saturate(1.3) contrast(1.15)" },
    arctic: { label: "Arctic", bg: "#0a1420", accent: "#bfe8ff", accent2: "#7db8e8", kind: "storm", font: "Georgia, serif", mood: "saturate(0.85) brightness(1.08) hue-rotate(10deg)" },
    nebula: { label: "Nebula", bg: "#0c0620", accent: "#c96bff", accent2: "#ff6bd6", kind: "nebula", secret: true, font: "Georgia, serif", mood: "saturate(1.25) contrast(1.06)" },
};
const ROLES = {
    creator: { label: "Creator", color: "#8b7ff0", color2: "#c9a6ff", greet: "Your canvas is waiting.", quote: "Create before you consume." },
    editor: { label: "Editor", color: "#4cd3c2", color2: "#7be8d0", greet: "Let's sharpen the story.", quote: "Clarity is creativity with discipline." },
    analyst: { label: "Analyst", color: "#f2994a", color2: "#ffc98a", greet: "The numbers have something to say.", quote: "What gets measured can be understood." },
    viewer: { label: "Viewer", color: "#7dd3fc", color2: "#a9e8ff", greet: "Explore the timeline.", quote: "Curiosity is a form of movement." },
    admin: { label: "Admin", color: "#e2607a", color2: "#ff96ac", greet: "KAIROS systems are under your command.", quote: "Systems become powerful when their parts remain understandable." },
};
function applyTheme(themeKey) {
    const t = THEMES[themeKey];
    document.documentElement.style.setProperty("--bg", t.bg);
    document.documentElement.style.setProperty("--accent", t.accent);
    document.documentElement.style.setProperty("--accent2", t.accent2);
    document.documentElement.style.setProperty("--theme-display-font", t.font);
    document.documentElement.style.setProperty("--theme-mood", t.mood);
    document.body.style.background = t.bg;
}
function playSfx(type) {
    try {
        if (window.__kairosMuted)
            return;
        const ctx = window.__kairosAudioCtx || (window.__kairosAudioCtx = new (window.AudioContext || window.webkitAudioContext)());
        if (ctx.state === "suspended")
            ctx.resume();
        const now = ctx.currentTime;
        const patches = {
            click: [[520, 0.05, "sine"]],
            toggle: [[420, 0.05, "triangle"], [640, 0.06, "triangle"]],
            whoosh: [[180, 0.12, "sawtooth"]],
            success: [[523, 0.09, "sine"], [659, 0.09, "sine"], [784, 0.16, "sine"]],
            error: [[220, 0.18, "square"]],
            nav: [[300, 0.04, "sine"]],
            unlock: [[392, 0.08, "triangle"], [523, 0.08, "triangle"], [659, 0.08, "triangle"], [880, 0.22, "triangle"]],
        };
        const seq = patches[type] || patches.click;
        let t0 = now;
        seq.forEach(([freq, dur, wave]) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = wave;
            osc.frequency.setValueAtTime(freq, t0);
            gain.gain.setValueAtTime(0.0001, t0);
            gain.gain.exponentialRampToValueAtTime(0.09, t0 + 0.012);
            gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(t0);
            osc.stop(t0 + dur + 0.02);
            t0 += dur * 0.55;
        });
    }
    catch (e) { }
}
const coverage = {
    addEventLogic: { calls: 0 },
    removeEventLogic: { calls: 0 },
    moveEventLogic_valid: { calls: 0 },
    moveEventLogic_invalid: { calls: 0 },
    detectConflicts: { calls: 0 },
};
function addEventLogic(events, day, title, color) {
    coverage.addEventLogic.calls += 1;
    return [...events, { id: Date.now() + Math.random(), day, title, color }];
}
function removeEventLogic(events, id) {
    coverage.removeEventLogic.calls += 1;
    return events.filter(e => e.id !== id);
}
function moveEventLogic(events, id, newDay) {
    if (newDay < 1 || newDay > 31) {
        coverage.moveEventLogic_invalid.calls += 1;
        return events;
    }
    coverage.moveEventLogic_valid.calls += 1;
    return events.map(e => e.id === id ? { ...e, day: newDay } : e);
}
function detectConflicts(events) {
    coverage.detectConflicts.calls += 1;
    const map = {};
    events.forEach(e => { map[e.day] = (map[e.day] || 0) + 1; });
    return Object.fromEntries(Object.entries(map).filter(([, c]) => c > 1));
}
function mockApiRequest(method, path, opts) {
    const status = (opts && opts.status) || 200;
    const delay = (opts && opts.delay != null) ? opts.delay : 600;
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const ok = status >= 200 && status < 300;
            const result = { status, ok, method, path, timestamp: new Date() };
            if (ok)
                resolve(result);
            else
                reject(result);
        }, delay);
    });
}
const SEED_EVENTS = [
    { id: 1, day: 5, title: "Campaign kickoff", color: "#8b7ff0" },
    { id: 2, day: 5, title: "Asset review", color: "#4cd3c2" },
    { id: 3, day: 12, title: "Publish: Reel", color: "#f2994a" },
    { id: 4, day: 18, title: "Analytics sync", color: "#7dd3fc" },
    { id: 5, day: 23, title: "Draft due", color: "#e2607a" },
];
function useEventStore(bump) {
    const [events, setEvents] = useState(SEED_EVENTS);
    const [history, setHistory] = useState([{ ts: Date.now(), label: "Initial state", events: SEED_EVENTS }]);
    function commit(next, label, xp) {
        setEvents(next);
        setHistory(h => [...h, { ts: Date.now(), label, events: next }].slice(-40));
        if (bump)
            bump(label, xp || 1);
    }
    function addEvent(day, title, color) {
        commit(addEventLogic(events, day, title, color), `Scheduled "${title}" on day ${day}`, 2);
    }
    function removeEvent(id) {
        const target = events.find(e => e.id === id);
        commit(removeEventLogic(events, id), target ? `Removed "${target.title}"` : "Removed event", 1);
    }
    function moveEvent(id, day) {
        const target = events.find(e => e.id === id);
        commit(moveEventLogic(events, id, day), target ? `Moved "${target.title}" to day ${day}` : "Moved event", 1);
    }
    function restore(snapshotEvents, label) {
        commit(snapshotEvents, label, 1);
    }
    return { events, history, addEvent, removeEvent, moveEvent, restore };
}
const STAGES = ["idea", "draft", "review", "approved", "scheduled", "published", "analyzed"];
const STAGE_LABELS = { idea: "Idea", draft: "Draft", review: "Review", approved: "Approved", scheduled: "Scheduled", published: "Published", analyzed: "Analyzed" };
const STAGE_COLORS = { idea: "#8a8ca3", draft: "#7dd3fc", review: "#f2994a", approved: "#4cd3c2", scheduled: "#8b7ff0", published: "#e8b34c", analyzed: "#e2607a" };
const SEED_CONTENT = [
    { id: 101, title: "Behind the scenes reel", caption: "", tags: ["bts"], stage: "draft", day: null, createdAt: Date.now(), updatedAt: Date.now() },
    { id: 102, title: "Product launch carousel", caption: "", tags: ["launch"], stage: "idea", day: null, createdAt: Date.now(), updatedAt: Date.now() },
    { id: 103, title: "Weekly tips post", caption: "Three quick wins for your week.", tags: ["tips", "weekly"], stage: "scheduled", day: 9, createdAt: Date.now(), updatedAt: Date.now() },
];
function scoreContent(item) {
    const caption = item.caption || "";
    const words = caption.trim().length ? caption.trim().split(/\s+/) : [];
    const hasHook = words.length > 0 && words[0].length > 0 && /[A-Z0-9]/.test(words[0][0] || "");
    const hasCTA = /\b(click|swipe|comment|share|dm|learn more|sign up|shop|link in bio|save this|tag someone)\b/i.test(caption);
    const lengthScore = words.length === 0 ? 0 : words.length < 8 ? 55 : words.length <= 45 ? 100 : words.length <= 70 ? 70 : 40;
    const hookScore = hasHook ? 80 : 35;
    const ctaScore = hasCTA ? 100 : 20;
    const tagScore = Math.min(100, (item.tags || []).length * 25);
    const structureScore = caption.includes("\n") || caption.split(".").length > 2 ? 85 : 55;
    const overall = Math.round((lengthScore + hookScore + ctaScore + tagScore + structureScore) / 5);
    return { overall, hookScore, lengthScore, ctaScore, tagScore, structureScore, hasCTA, hasHook, wordCount: words.length };
}
function roastContent(item) {
    const s = scoreContent(item);
    const lines = [];
    if (s.wordCount === 0)
        lines.push("There's nothing here yet. Even the cursor is bored.");
    if (s.wordCount > 70)
        lines.push("This caption has more runway than the content does. Trim it.");
    if (!s.hasCTA)
        lines.push("No call-to-action. The reader finishes and just... leaves.");
    if (!s.hasHook)
        lines.push("The opening line walked in, forgot why it came, and left again.");
    if ((item.tags || []).length === 0)
        lines.push("Zero tags. This post is currently undiscoverable by design.");
    if (lines.length === 0)
        lines.push("Honestly? This one's tight. Roast Mode has nothing to work with.");
    const improvements = [];
    if (!s.hasHook)
        improvements.push("Open with a concrete claim or question in the first 6 words.");
    if (!s.hasCTA)
        improvements.push('Add one direct action: "Save this", "Comment your take", or similar.');
    if (s.wordCount > 70)
        improvements.push("Cut to under 45 words — say the one thing that matters.");
    if ((item.tags || []).length === 0)
        improvements.push("Add 2–4 relevant tags so this can actually be found.");
    if (improvements.length === 0)
        improvements.push("Ship it.");
    return { roast: lines, improvements, score: s };
}
function useContentStore(bump) {
    const [items, setItems] = useState(SEED_CONTENT);
    function createIdea(title) {
        const item = { id: Date.now() + Math.random(), title, caption: "", tags: [], stage: "idea", day: null, createdAt: Date.now(), updatedAt: Date.now() };
        setItems(i => [item, ...i]);
        if (bump)
            bump(`Idea captured: "${title}"`, 2);
        return item;
    }
    function updateItem(id, patch) {
        setItems(items => items.map(i => i.id === id ? { ...i, ...patch, updatedAt: Date.now() } : i));
    }
    function moveStage(id, stage, day) {
        setItems(items => {
            const target = items.find(i => i.id === id);
            if (bump && target) {
                bump(`"${target.title}" → ${STAGE_LABELS[stage]}`, stage === "published" ? 10 : 3);
            }
            return items.map(i => i.id === id ? { ...i, stage, day: day != null ? day : i.day, updatedAt: Date.now() } : i);
        });
    }
    function deleteItem(id) {
        const target = items.find(i => i.id === id);
        setItems(items => items.filter(i => i.id !== id));
        if (bump)
            bump(target ? `Deleted "${target.title}"` : "Deleted content", 1);
    }
    return { items, createIdea, updateItem, moveStage, deleteItem };
}
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
function useActivityTracker() {
    const [count, setCount] = useState(0);
    const [xp, setXp] = useState(0);
    const [log, setLog] = useState([]);
    const bump = useCallback((text, amount) => {
        const xpAmount = amount == null ? 1 : amount;
        setCount(c => c + 1);
        setXp(x => x + xpAmount);
        setLog(l => [{ id: Date.now() + Math.random(), text, ts: Date.now(), xp: xpAmount }, ...l].slice(0, 120));
    }, []);
    return { count, xp, log, bump };
}
function Logo({ size = 40, interactive = false }) {
    const gid = "kairosGrad";
    const wrapRef = useRef(null);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const [burst, setBurst] = useState(false);
    function handleMove(e) {
        if (!interactive || !wrapRef.current)
            return;
        const rect = wrapRef.current.getBoundingClientRect();
        const nx = (e.clientX - rect.left) / rect.width - 0.5;
        const ny = (e.clientY - rect.top) / rect.height - 0.5;
        setTilt({ x: ny * -24, y: nx * 24 });
    }
    function handleLeave() { setTilt({ x: 0, y: 0 }); }
    function handleClick() {
        if (!interactive)
            return;
        playSfx("click");
        setBurst(true);
        setTimeout(() => setBurst(false), 700);
    }
    const sparkAngles = [0, 45, 90, 135, 180, 225, 270, 315];
    return (<div className={"logo-mark" + (burst ? " logo-mark-burst" : "")} ref={wrapRef} onMouseMove={handleMove} onMouseLeave={handleLeave} onClick={handleClick} style={{ width: size, height: size, perspective: interactive ? 400 : undefined, cursor: interactive ? "pointer" : undefined }}>
      <div className="logo-glow"/>
      <div className="logo-hover-ring"/>
      {burst && sparkAngles.map(a => (<span key={a} className="logo-spark" style={{ "--angle": a + "deg" }}/>))}
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ position: "relative", transform: interactive ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` : undefined, transition: "transform .12s ease-out" }}>
        <defs>
          <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--accent)"/>
            <stop offset="100%" stopColor="var(--accent2)"/>
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="47" fill="none" stroke="var(--panel-border)" strokeWidth="0.75"/>
        <circle className="logo-ring" cx="50" cy="50" r="44" fill="none" stroke={`url(#${gid})`} strokeWidth="2" strokeDasharray="4 10" strokeLinecap="round"/>
        <circle className="logo-ring2" cx="50" cy="50" r="34" fill="none" stroke="var(--accent2)" strokeWidth="1.4" strokeDasharray="1 8" strokeLinecap="round"/>
        <circle className="logo-ring3" cx="50" cy="50" r="24" fill="none" stroke="var(--accent)" strokeWidth="1" strokeDasharray="0.5 5" strokeLinecap="round" opacity="0.5"/>
        <g className="logo-comet">
          <circle cx="50" cy="7" r="2.2" fill="#fff"/>
          <circle cx="50" cy="7" r="4.5" fill="var(--accent2)" opacity="0.45"/>
        </g>
        <g className="logo-pulse">
          <path d="M50 20 L50 46 M50 54 L50 80 M32 32 L44 44 M56 56 L68 68 M32 68 L44 56 M56 44 L68 32" stroke={`url(#${gid})`} strokeWidth="3" strokeLinecap="round"/>
          <circle cx="50" cy="50" r="7" fill="#0a0a12" stroke={`url(#${gid})`} strokeWidth="2"/>
          <circle cx="50" cy="50" r="2.4" fill="var(--accent2)"/>
        </g>
      </svg>
    </div>);
}
function AnimatedWordmark({ text = "KAIROS", size = 20 }) {
    return (<div className="wordmark wordmark-animated" style={{ fontSize: size }}>
      {text.split("").map((ch, i) => (<span key={i} className="wordmark-letter" style={{ transitionDelay: (i * 0.035) + "s" }}>{ch}</span>))}
    </div>);
}
function Scene3D({ kind }) {
    if (kind === "cosmic" || kind === "nebula" || kind === "storm")
        return (<div className="scene3d-wrap scene3d-gyro">
        <div className="gyro-orb">
          <div className="gyro-ring gyro-ring-x"/>
          <div className="gyro-ring gyro-ring-y"/>
          <div className="gyro-ring gyro-ring-z"/>
          <div className="gyro-core"/>
        </div>
      </div>);
    if (kind === "grid")
        return (<div className="scene3d-wrap scene3d-tunnel">
        <div className="grid-tunnel">
          {[0, 1, 2, 3, 4, 5, 6].map(i => <div key={i} className="tunnel-ring" style={{ animationDelay: (i * -0.85) + "s" }}/>)}
        </div>
      </div>);
    if (kind === "zen")
        return (<div className="scene3d-wrap scene3d-stone">
        <div className="floating-stone">
          <div className="stone-face stone-top"/>
          <div className="stone-face stone-front"/>
          <div className="stone-face stone-side"/>
        </div>
      </div>);
    if (kind === "sunset")
        return (<div className="scene3d-wrap scene3d-peaks">
        <div className="peaks-scene">
          <div className="peak-sun"/>
          <div className="peak-layer peak-back"/>
          <div className="peak-layer peak-mid"/>
          <div className="peak-layer peak-front"/>
        </div>
      </div>);
    if (kind === "aurora")
        return (<div className="scene3d-wrap scene3d-helix">
        <div className="ribbon-helix">
          {[0, 1, 2, 3, 4, 5].map(i => <div key={i} className="helix-band" style={{ animationDelay: (i * -0.5) + "s", top: (i * 15) + "%" }}/>)}
        </div>
      </div>);
    return null;
}
function Atmosphere({ kind }) {
    const starsFar = useMemo(() => Array.from({ length: 50 }, () => ({
        top: Math.random() * 100, left: Math.random() * 100, size: Math.random() * 1.2 + 0.5, delay: Math.random() * 4, dur: Math.random() * 2.5 + 2.5
    })), [kind]);
    const starsMid = useMemo(() => Array.from({ length: 25 }, () => ({
        top: Math.random() * 100, left: Math.random() * 100, size: Math.random() * 1.6 + 1, delay: Math.random() * 4, dur: Math.random() * 2.5 + 2.5
    })), [kind]);
    const starsNear = useMemo(() => Array.from({ length: 10 }, () => ({
        top: Math.random() * 100, left: Math.random() * 100, size: Math.random() * 2 + 1.8, delay: Math.random() * 4, dur: Math.random() * 2.5 + 2.5
    })), [kind]);
    const shooters = useMemo(() => Array.from({ length: 4 }, () => ({
        top: Math.random() * 40, left: 60 + Math.random() * 35, delay: Math.random() * 6
    })), [kind]);
    const drops = useMemo(() => Array.from({ length: 60 }, () => ({
        left: Math.random() * 100, height: Math.random() * 60 + 40, dur: Math.random() * 1 + 0.6, delay: Math.random() * 2
    })), [kind]);
    const fireflies = useMemo(() => Array.from({ length: 14 }, () => ({
        top: Math.random() * 90, left: Math.random() * 90, delay: Math.random() * 6
    })), [kind]);
    const clouds = useMemo(() => Array.from({ length: 4 }, () => ({
        top: Math.random() * 30 + 5, size: Math.random() * 120 + 80, delay: Math.random() * 20, dur: Math.random() * 20 + 36
    })), [kind]);
    const windParticles = useMemo(() => Array.from({ length: 16 }, () => ({
        top: Math.random() * 100, delay: Math.random() * 3, dur: Math.random() * 1.2 + 1.4
    })), [kind]);
    const petals = useMemo(() => Array.from({ length: 22 }, () => ({
        left: Math.random() * 100, delay: Math.random() * 10, dur: Math.random() * 6 + 8, size: Math.random() * 6 + 8, sway: Math.random() * 40 + 20
    })), [kind]);
    const farRef = useRef(null);
    const midRef = useRef(null);
    const nearRef = useRef(null);
    useEffect(() => {
        function onMove(e) {
            const nx = (e.clientX / window.innerWidth - 0.5);
            const ny = (e.clientY / window.innerHeight - 0.5);
            if (farRef.current)
                farRef.current.style.transform = `translate(${nx * -6}px, ${ny * -6}px)`;
            if (midRef.current)
                midRef.current.style.transform = `translate(${nx * -16}px, ${ny * -16}px)`;
            if (nearRef.current)
                nearRef.current.style.transform = `translate(${nx * -32}px, ${ny * -32}px) scale(1.02)`;
        }
        window.addEventListener("mousemove", onMove);
        return () => window.removeEventListener("mousemove", onMove);
    }, []);
    const layeredStars = (kind === "cosmic" || kind === "nebula");
    return (<div className="atmosphere">
    <Scene3D kind={kind}/>
    {layeredStars ? (<Fragment>
        <div className="atmosphere-parallax" ref={farRef}>
          <div className="stars">
            {starsFar.map((s, i) => <div key={i} className="star" style={{ top: s.top + "%", left: s.left + "%", width: s.size, height: s.size, opacity: 0.5, animationDelay: s.delay + "s", animationDuration: s.dur + "s" }}/>)}
          </div>
          {kind === "nebula" && <Fragment>
            <div className="nebula-cloud" style={{ top: "10%", left: "10%", width: 260, height: 260, background: "var(--accent)" }}/>
            <div className="nebula-cloud" style={{ top: "45%", left: "60%", width: 220, height: 220, background: "var(--accent2)", animationDelay: "4s" }}/>
          </Fragment>}
        </div>
        <div className="atmosphere-parallax" ref={midRef}>
          <div className="stars">
            {starsMid.map((s, i) => <div key={i} className="star" style={{ top: s.top + "%", left: s.left + "%", width: s.size, height: s.size, opacity: 0.75, animationDelay: s.delay + "s", animationDuration: s.dur + "s" }}/>)}
          </div>
          {kind === "nebula" && <div className="aurora-ribbon" style={{ top: "10%", background: "linear-gradient(90deg, var(--accent), var(--accent2))", animationDuration: "20s" }}/>}
        </div>
        <div className="atmosphere-parallax" ref={nearRef}>
          <div className="stars">
            {starsNear.map((s, i) => <div key={i} className="star" style={{ top: s.top + "%", left: s.left + "%", width: s.size, height: s.size, boxShadow: "0 0 6px 1px rgba(255,255,255,0.6)", animationDelay: s.delay + "s", animationDuration: s.dur + "s" }}/>)}
          </div>
          {shooters.map((s, i) => <div key={i} className="shooting-star" style={{ top: s.top + "%", left: s.left + "%", animationDelay: s.delay + "s" }}/>)}
        </div>
      </Fragment>) : (<div className="atmosphere-parallax" ref={midRef}>
      {kind === "rain" && <Fragment>
        <div className="rainwrap">
          {drops.map((d, i) => <div key={i} className="raindrop" style={{ left: d.left + "%", height: d.height, animationDuration: d.dur + "s", animationDelay: d.delay + "s" }}/>)}
        </div>
        <div className="mist-layer" style={{ top: "55%" }}/>
      </Fragment>}

      {kind === "aurora" && <Fragment>
        <div className="aurora-ribbon" style={{ top: "5%", background: "linear-gradient(90deg, var(--accent), var(--accent2))", animationDelay: "0s" }}/>
        <div className="aurora-ribbon" style={{ top: "18%", background: "linear-gradient(90deg, var(--accent2), var(--accent))", animationDelay: "3s", animationDuration: "16s" }}/>
        <div className="stars">
          {starsFar.slice(0, 30).map((s, i) => <div key={i} className="star" style={{ top: (s.top * 0.5) + "%", left: s.left + "%", width: s.size * 0.7, height: s.size * 0.7, animationDelay: s.delay + "s" }}/>)}
        </div>
        {fireflies.map((f, i) => <div key={i} className="firefly" style={{ top: f.top + "%", left: f.left + "%", animationDelay: f.delay + "s" }}/>)}
      </Fragment>}

      {kind === "zen" && <Fragment>
        <div className="zen-orb" style={{ width: 280, height: 280, top: "20%", left: "15%" }}/>
        <div className="zen-orb" style={{ width: 200, height: 200, top: "55%", left: "65%", animationDelay: "5s", animationDuration: "18s" }}/>
        {fireflies.slice(0, 6).map((f, i) => <div key={i} className="firefly" style={{ top: f.top + "%", left: f.left + "%", animationDelay: f.delay + "s", opacity: 0.5 }}/>)}
      </Fragment>}

      {kind === "grid" && <Fragment>
        <div className="cyber-floor-wrap">
          <div className="cyber-floor"/>
        </div>
        <div className="grid-cyber" style={{ opacity: 0.35 }}/>
        <div className="cyber-scan" style={{ animationDelay: "0s" }}/>
        <div className="cyber-scan" style={{ animationDelay: "2.5s", opacity: 0.3 }}/>
        <div className="glitch-line" style={{ top: "22%", animationDelay: "0s" }}/>
        <div className="glitch-line" style={{ top: "61%", animationDelay: "1.6s" }}/>
        <div className="glitch-line" style={{ top: "84%", animationDelay: "2.9s" }}/>
      </Fragment>}

      {kind === "sunset" && <Fragment>
        <div className="sun-disc-3d-wrap">
          <div className="sun-disc-3d"/>
        </div>
        {clouds.map((c, i) => <div key={i} className="cloud-drift" style={{ top: c.top + "%", width: c.size, height: c.size * 0.4, animationDelay: c.delay + "s", animationDuration: c.dur + "s" }}/>)}
        <div className="sun-horizon"/>
      </Fragment>}

      {kind === "storm" && <Fragment>
        <div className="grid-cyber" style={{ opacity: 0.4 }}/>
        <div className="rainwrap" style={{ opacity: 0.3 }}>
          {drops.slice(0, 30).map((d, i) => <div key={i} className="raindrop" style={{ left: d.left + "%", height: d.height, animationDuration: (d.dur * 0.7) + "s", animationDelay: d.delay + "s" }}/>)}
        </div>
        {windParticles.map((w, i) => <div key={i} className="wind-particle" style={{ top: w.top + "%", animationDelay: w.delay + "s", animationDuration: w.dur + "s" }}/>)}
        <div className="flash"/>
      </Fragment>}

      {kind === "petals" && <Fragment>
        {petals.map((p, i) => <div key={i} className="sakura-petal" style={{ left: p.left + "%", width: p.size, height: p.size * 0.8, animationDelay: p.delay + "s", animationDuration: p.dur + "s", "--sway": p.sway + "px" }}/>)}
        <div className="zen-orb" style={{ width: 220, height: 220, top: "12%", left: "70%", opacity: 0.25 }}/>
      </Fragment>}
    </div>)}
    </div>);
}
const ROLE_GLYPH = {
    creator: "✦", editor: "✎", analyst: "◈", viewer: "◎", admin: "⬡",
};
const THEME_SPARK = {
    cosmic: "✦", rain: "💧", aurora: "❄", zen: "○", grid: "▮", sunset: "☀", storm: "⚡", nebula: "✧", petals: "🌸",
};
function Avatar({ color, color2, big, pulseKey, glyph, theme, onClick }) {
    const orbit = big ? 62 : 26;
    const spark = THEME_SPARK[theme] || "✦";
    return (<div className={"avatar" + (big ? " big" : "")} style={{ "--ac": color, "--ac2": color2 || color, cursor: onClick ? "pointer" : undefined }} key={pulseKey} onClick={onClick}>
      <div className="avatar-glow"/>
      <div className="avatar-ring2"/>
      <div className="avatar-ring"/>
      <div className="avatar-spark" style={{ "--orbit": orbit + "px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: big ? 11 : 7, background: "transparent", boxShadow: "none", color: "#fff" }}>{spark}</div>
      <div className="core">
        <div className="core-inner">{glyph || "◆"}</div>
      </div>
    </div>);
}
const GREETING_POEMS = {
    Dawn: [
        "The hour is young, the light still soft —\nwhatever waits, has time enough.\nBegin here, quiet and unrushed;\nthe rest of day will come, unhushed.",
        "Dawn keeps no ledger, holds no blame,\njust one more chance to start the same\nold work made new by morning's hand —\nthe day is yours to understand.",
    ],
    Day: [
        "Full light now, nothing left to hide,\nthe hours open, long and wide.\nWhatever's built in this bright span\nwas made by you — not by a plan.",
        "The sun stands high, impatient, sure —\nso little time feels this secure.\nUse it well, or simply be;\nboth are a kind of mastery.",
    ],
    Dusk: [
        "The light leans low, the colors turn,\na day's worth of attempts to learn.\nWhatever's finished, finished well —\nwhat isn't, dusk will gently tell.",
        "Not every hour needs an end;\nsome only need a quiet friend.\nThe sky goes soft, the work can rest —\ntomorrow holds what's left, unstressed.",
    ],
    Night: [
        "The screen glows on, the world grows still,\nyou, and the hour, and your will.\nWhatever kept you here this late —\nI hope it's worth the hour, and wait.",
        "Night doesn't ask you to be more.\nIt only opens one more door:\nrest, if you're able; work, if not —\nboth are a kind of Kairos thought.",
    ],
};
function AvatarGreetingModal({ role, roleColor, roleColor2, theme, archetypeCtx, onClose }) {
    const period = chronoPeriod(new Date().getHours());
    const poemSet = GREETING_POEMS[period.name] || GREETING_POEMS.Day;
    const poem = useMemo(() => poemSet[Math.floor(Math.random() * poemSet.length)], []);
    const spark = THEME_SPARK[theme] || "✦";
    const archetype = useMemo(() => computeArchetype(archetypeCtx || {}), [archetypeCtx]);
    useEffect(() => { playSfx("unlock"); }, []);
    return (<div className="modal-backdrop" onClick={onClose}>
      <div className="card modal avatar-greet-modal" onClick={e => e.stopPropagation()}>
        <div className="greet-character-wrap">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <defs>
              <radialGradient id="greetFace" cx="40%" cy="35%" r="70%">
                <stop offset="0%" stopColor={roleColor2 || roleColor}/>
                <stop offset="100%" stopColor={roleColor}/>
              </radialGradient>
            </defs>
            <circle cx="60" cy="64" r="42" fill="url(#greetFace)"/>
            <circle cx="60" cy="30" r="4" fill="#fff" opacity="0.5" className="greet-spark-orbit"/>
            <g className="greet-blink">
              <ellipse cx="45" cy="60" rx="5" ry="7" fill="#141220"/>
              <ellipse cx="75" cy="60" rx="5" ry="7" fill="#141220"/>
              <circle cx="47" cy="57" r="1.6" fill="#fff"/>
              <circle cx="77" cy="57" r="1.6" fill="#fff"/>
            </g>
            <ellipse cx="38" cy="72" rx="6" ry="3.4" fill="#ff8fa3" opacity="0.5"/>
            <ellipse cx="82" cy="72" rx="6" ry="3.4" fill="#ff8fa3" opacity="0.5"/>
            <path d="M48 80 Q60 90 72 80" stroke="#141220" strokeWidth="2.4" fill="none" strokeLinecap="round"/>
          </svg>
          <div className="greet-theme-spark">{spark}</div>
        </div>
        <div style={{ marginTop: 10, fontSize: 11, color: "var(--accent2)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Right now, you are</div>
        <div className="serif" style={{ fontSize: 17, marginTop: 2 }}>{archetype.name}</div>
        <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>{archetype.desc}</div>
        <div className="section-title" style={{ marginTop: 14 }}>Your {period.icon} {period.name} greeting</div>
        <div className="greet-speech-bubble">
          {poem.split("\n").map((line, i) => <div key={i}>{line}</div>)}
        </div>
        <button className="btn btn-primary" style={{ marginTop: 16, width: "100%" }} onClick={onClose}>Back to it</button>
      </div>
    </div>);
}
function LiveClock() {
    const [now, setNow] = useState(new Date());
    const renders = useRef(0);
    renders.current += 1;
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);
    const period = chronoPeriod(now.getHours());
    return (<div className="card" style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 10 }}>
      <span className="clock-num">{now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
      <span className="pill">{now.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</span>
      <span className="pill chrono-pill" title="KAIROS's atmosphere shifts to match this, quietly, in the background.">{period.icon} {period.name}</span>
      <span className="pill" title="This component re-renders itself once a second; nothing else on the page re-renders because of it.">clock renders: {renders.current}</span>
    </div>);
}
function Clock3D({ size = 150 }) {
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);
    const h = now.getHours() % 12, m = now.getMinutes(), s = now.getSeconds();
    const hourAngle = (h * 30) + (m * 0.5);
    const minAngle = m * 6 + s * 0.1;
    const secAngle = s * 6;
    const ticks = Array.from({ length: 12 }, (_, i) => i);
    return (<div style={{ width: size, height: size, perspective: 600, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: size, height: size, position: "relative", transformStyle: "preserve-3d", transform: "rotateX(8deg)" }}>
        <svg width={size} height={size} viewBox="0 0 200 200" style={{ filter: "drop-shadow(0 18px 24px rgba(0,0,0,0.45))" }}>
          <defs>
            <radialGradient id="clockBezel" cx="35%" cy="30%" r="75%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.25)"/>
              <stop offset="55%" stopColor="var(--panel)"/>
              <stop offset="100%" stopColor="rgba(0,0,0,0.35)"/>
            </radialGradient>
            <radialGradient id="clockFace" cx="40%" cy="35%" r="70%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.08)"/>
              <stop offset="100%" stopColor="rgba(0,0,0,0.2)"/>
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="96" fill="url(#clockBezel)" stroke="var(--panel-border)" strokeWidth="2"/>
          <circle cx="100" cy="100" r="82" fill="url(#clockFace)"/>
          {ticks.map(i => (<line key={i} x1="100" y1="22" x2="100" y2={i % 3 === 0 ? "32" : "28"} stroke={i % 3 === 0 ? "var(--accent2)" : "var(--muted)"} strokeWidth={i % 3 === 0 ? "3" : "1.5"} transform={`rotate(${i * 30} 100 100)`}/>))}
          <line x1="100" y1="100" x2="100" y2="58" stroke="var(--text)" strokeWidth="5" strokeLinecap="round" transform={`rotate(${hourAngle} 100 100)`}/>
          <line x1="100" y1="100" x2="100" y2="38" stroke="var(--text)" strokeWidth="3.5" strokeLinecap="round" transform={`rotate(${minAngle} 100 100)`}/>
          <line x1="100" y1="112" x2="100" y2="30" stroke="var(--accent2)" strokeWidth="1.6" strokeLinecap="round" style={{ transition: "transform 0.15s var(--ease-measure)" }} transform={`rotate(${secAngle} 100 100)`}/>
          <circle cx="100" cy="100" r="5" fill="var(--accent2)"/>
        </svg>
      </div>
    </div>);
}
function Hourglass({ size = 90 }) {
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);
    const minutesElapsed = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
    const dayPct = minutesElapsed / 1440;
    const topHeight = 34 * (1 - dayPct);
    const bottomHeight = 34 * dayPct;
    const minutesLeft = Math.round(1440 - minutesElapsed);
    const hoursLeft = Math.floor(minutesLeft / 60);
    const minsLeft = minutesLeft % 60;
    const closingSoon = minutesLeft <= 30;
    const grains = useMemo(() => Array.from({ length: 5 }, (_, i) => ({
        delay: i * 0.18, drift: (i % 2 === 0 ? 1 : -1) * (2 + i)
    })), []);
    return (<div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <svg width={size} height={size * 1.3} viewBox="0 0 90 117" style={{ filter: `drop-shadow(0 10px 18px rgba(0,0,0,0.4))${closingSoon ? " drop-shadow(0 0 10px rgba(226,96,122,0.5))" : ""}` }}>
        <defs>
          <linearGradient id="glassGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.22)"/>
            <stop offset="100%" stopColor="rgba(255,255,255,0.02)"/>
          </linearGradient>
        </defs>
        <path d="M14 6 H76 V16 L48 58 L76 100 V110 H14 V100 L42 58 L14 16 Z" fill="url(#glassGrad)" stroke="var(--panel-border)" strokeWidth="2" strokeLinejoin="round"/>
        <rect x="6" y="2" width="78" height="8" rx="3" fill={closingSoon ? "var(--danger)" : "var(--accent)"}/>
        <rect x="6" y="107" width="78" height="8" rx="3" fill={closingSoon ? "var(--danger)" : "var(--accent)"}/>
        <clipPath id="topClip"><path d="M18 12 H72 V16 L48 54 L22 16 Z"/></clipPath>
        <clipPath id="bottomClip"><path d="M48 62 L74 100 V104 H18 V100 Z"/></clipPath>
        <rect x="18" y={16 + (34 - topHeight)} width="54" height={topHeight} fill="var(--gold)" opacity="0.85" clipPath="url(#topClip)" style={{ transition: "y 1s var(--ease-measure), height 1s var(--ease-measure)" }}/>
        <rect x="18" y={104 - bottomHeight} width="54" height={bottomHeight} fill="var(--gold)" opacity="0.85" clipPath="url(#bottomClip)" style={{ transition: "y 1s var(--ease-measure), height 1s var(--ease-measure)" }}/>
        <rect x="46.5" y="54" width="3" height="8" fill="var(--gold)" opacity="0.9"/>
        {grains.map((g, i) => (<circle key={i} r="1.4" fill="var(--gold)" opacity="0.9">
            <animate attributeName="cy" values="58;100" dur="1s" begin={`${g.delay}s`} repeatCount="indefinite"/>
            <animate attributeName="cx" values={`${48 + g.drift};${48 - g.drift / 2}`} dur="1s" begin={`${g.delay}s`} repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.9;0.9;0" dur="1s" begin={`${g.delay}s`} repeatCount="indefinite"/>
          </circle>))}
      </svg>
      <div style={{ fontSize: 10, color: closingSoon ? "var(--danger)" : "var(--muted)", textAlign: "center" }}>
        {closingSoon ? "⚠ Today's window is closing" : `Today's KAIROS window — ${hoursLeft}h ${minsLeft}m left`}
      </div>
    </div>);
}
function Sundial({ size = 90 }) {
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 30000);
        return () => clearInterval(id);
    }, []);
    const hours = now.getHours() + now.getMinutes() / 60;
    const daylight = hours >= 6 && hours <= 18;
    const shadowAngle = ((hours - 12) / 12) * 160;
    const shadowLen = daylight ? 10 + Math.abs(12 - hours) * 3.2 : 34;
    const rad = (shadowAngle * Math.PI) / 180;
    const shadowX = 50 + Math.sin(rad) * shadowLen;
    const shadowY = 50 + Math.cos(rad) * shadowLen * 0.55;
    const hourMarks = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
    return (<div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ filter: "drop-shadow(0 8px 14px rgba(0,0,0,0.35))" }}>
        <defs>
          <radialGradient id="dialFace" cx="40%" cy="35%" r="70%">
            <stop offset="0%" stopColor={daylight ? "rgba(255,220,150,0.18)" : "rgba(120,140,255,0.12)"}/>
            <stop offset="100%" stopColor="rgba(0,0,0,0.22)"/>
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="46" fill="url(#dialFace)" stroke="var(--panel-border)" strokeWidth="2"/>
        {hourMarks.map(h => {
            const a = ((h - 12) / 12) * 160;
            const r = (a * Math.PI) / 180;
            const x1 = 50 + Math.sin(r) * 40, y1 = 50 + Math.cos(r) * 40 * 0.55;
            const x2 = 50 + Math.sin(r) * 45, y2 = 50 + Math.cos(r) * 45 * 0.55;
            return <line key={h} x1={x1} y1={y1} x2={x2} y2={y2} stroke={h === 12 ? "var(--gold)" : "var(--muted)"} strokeWidth={h === 12 ? 2 : 1}/>;
        })}
        <line x1="50" y1="50" x2={shadowX} y2={shadowY} stroke={daylight ? "var(--gold)" : "var(--accent2)"} strokeWidth="2.4" strokeLinecap="round" style={{ transition: "all 1s var(--ease-measure)" }}/>
        <polygon points="47,50 53,50 50,14" fill="var(--accent)" opacity="0.85"/>
        <circle cx="50" cy="50" r="3" fill="var(--text)"/>
      </svg>
      <div style={{ fontSize: 10, color: "var(--muted)", textAlign: "center" }}>
        {daylight ? "☀ Sundial — reading the light" : "☾ Sundial — resting in shadow"}
      </div>
    </div>);
}
const COMPANION_LINES = [
    "Tick tock — but gently.",
    "I saw you finish a task. Nice.",
    "KAIROS isn't a countdown. It's a doorway.",
    "Blink twice if you need a break.",
    "I live in the render tree. It's cozy in here.",
    "Every optimized render, I do a little spin.",
    "Don't worry, I'm not tracking your bugs. Much.",
    "The present is the only tense that matters.",
    "I'm powered by your focus sessions.",
    "Somewhere, a sundial is jealous of my glow.",
];
function Companion() {
    const [bubble, setBubble] = useState(null);
    const timeoutRef = useRef(null);
    function handleClick() {
        playSfx("click");
        const line = COMPANION_LINES[Math.floor(Math.random() * COMPANION_LINES.length)];
        setBubble(line);
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setBubble(null), 3200);
    }
    useEffect(() => () => clearTimeout(timeoutRef.current), []);
    return (<div className="companion-wrap" onClick={handleClick} title="Say hi">
      {bubble && <div className="companion-bubble">{bubble}</div>}
      <svg className="companion-body" width="54" height="54" viewBox="0 0 54 54">
        <defs>
          <radialGradient id="companionGrad" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="var(--accent2)"/>
            <stop offset="100%" stopColor="var(--accent)"/>
          </radialGradient>
        </defs>
        <ellipse cx="27" cy="30" rx="19" ry="17" fill="url(#companionGrad)"/>
        <ellipse className="companion-eye" cx="20" cy="27" rx="3.2" ry="4" fill="#0a0a12"/>
        <ellipse className="companion-eye" cx="34" cy="27" rx="3.2" ry="4" fill="#0a0a12"/>
        <path d="M20 36 Q27 41 34 36" stroke="#0a0a12" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <line x1="27" y1="11" x2="27" y2="16" stroke="var(--accent2)" strokeWidth="1.5"/>
        <circle cx="27" cy="8" r="3" fill="var(--accent2)" className="companion-antenna-tip"/>
      </svg>
    </div>);
}
const WORLD_CLOCK_ZONES = [
    { label: "New York", tz: "America/New_York" },
    { label: "London", tz: "Europe/London" },
    { label: "Dubai", tz: "Asia/Dubai" },
    { label: "Tokyo", tz: "Asia/Tokyo" },
    { label: "Sydney", tz: "Australia/Sydney" },
];
function WorldClock() {
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 30000);
        return () => clearInterval(id);
    }, []);
    const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return (<div className="card" style={{ padding: "16px 20px" }}>
      <div className="section-title" style={{ marginBottom: 10 }}>World Clock <span style={{ color: "var(--muted)", textTransform: "none", letterSpacing: 0 }}>· {localTz}</span></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(110px,1fr))", gap: 10 }}>
        {WORLD_CLOCK_ZONES.map(z => {
            let time = "—", dayDelta = "";
            try {
                time = new Intl.DateTimeFormat([], { hour: "2-digit", minute: "2-digit", timeZone: z.tz }).format(now);
                const localDay = now.getDate();
                const zoneDay = Number(new Intl.DateTimeFormat([], { day: "numeric", timeZone: z.tz }).format(now));
                if (zoneDay > localDay || (zoneDay === 1 && localDay >= 28))
                    dayDelta = "+1d";
                else if (zoneDay < localDay || (zoneDay >= 28 && localDay === 1))
                    dayDelta = "-1d";
            }
            catch (e) { }
            return (<div key={z.tz} style={{ textAlign: "center", padding: "8px 6px", borderRadius: 10, background: "rgba(255,255,255,0.03)" }}>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>{z.label}</div>
              <div className="clock-num" style={{ fontSize: 15, marginTop: 2 }}>{time}</div>
              {dayDelta && <div style={{ fontSize: 9.5, color: "var(--gold)" }}>{dayDelta}</div>}
            </div>);
        })}
      </div>
    </div>);
}
const OPENING_LETTERS = ["K", "A", "I", "R", "O", "S"];
function OpeningSequence({ onDone }) {
    const [stage, setStage] = useState(0);
    useEffect(() => {
        const timers = [
            setTimeout(() => setStage(1), 1100),
            setTimeout(() => setStage(2), 2000),
            setTimeout(() => setStage(3), 2500),
            setTimeout(() => setStage(4), 3900),
            setTimeout(() => onDone(), 4500),
        ];
        return () => timers.forEach(clearTimeout);
    }, []);
    return (<div className={"opening-sequence" + (stage >= 4 ? " opening-exit" : "")} onClick={onDone}>
      <div className={"opening-dot" + (stage >= 1 ? " opening-dot-hide" : "")}/>
      <div className={"opening-ring" + (stage >= 1 ? " opening-ring-go" : "")}/>
      <div className={"opening-now" + (stage === 1 ? " opening-now-show" : "")}>NOW</div>
      <div className={"opening-wordmark" + (stage >= 3 ? " opening-wordmark-show" : "")}>
        {OPENING_LETTERS.map((l, i) => (<span key={i} className={"opening-letter" + (l === "O" ? " opening-letter-o" : "")} style={{ animationDelay: (i * 0.11) + "s" }}>{l}</span>))}
      </div>
      <div className="opening-skip">click anywhere to skip</div>
    </div>);
}
function Login({ onEnter }) {
    const [theme, setTheme] = useState("cosmic");
    const [role, setRole] = useState("creator");
    const [name, setName] = useState("");
    const [wiping, setWiping] = useState(false);
    useEffect(() => { applyTheme(theme); }, [theme]);
    function handleEnter() {
        playSfx("success");
        setWiping(true);
        setTimeout(() => onEnter({ theme, role, name: name.trim() || "Traveler" }), 950);
    }
    return (<div className="center-screen">
      <Atmosphere kind={THEMES[theme].kind}/>
      {wiping && <div className="transition-wipe"/>}
      <div className="card login-card fade-in">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginBottom: 22 }}>
          <Logo size={64} interactive/>
          <AnimatedWordmark size={24}/>
          <div style={{ fontSize: 12, color: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Own the moment. Shape the story.</div>
        </div>

        <div className="section-title">Your name</div>
        <input type="text" placeholder="How should KAIROS greet you?" value={name} onChange={e => setName(e.target.value)}/>

        <div className="section-title" style={{ marginTop: 18 }}>Choose your atmosphere</div>
        <div className="theme-grid">
          {Object.entries(THEMES).filter(([, t]) => !t.secret).map(([key, t]) => (<div key={key} className={"theme-chip" + (theme === key ? " active" : "")} style={{ background: `linear-gradient(135deg, ${t.accent}, ${t.accent2})` }} onClick={() => { playSfx("click"); setTheme(key); }}>
              {t.label}
            </div>))}
        </div>

        <div className="section-title">Choose your role</div>
        <div className="role-row">
          {Object.entries(ROLES).map(([key, r]) => (<div key={key} className={"role-chip" + (role === key ? " active" : "")} onClick={() => setRole(key)}>{r.label}</div>))}
        </div>

        <button className="btn btn-primary" style={{ width: "100%", marginTop: 6, padding: "13px" }} onClick={handleEnter}>
          Enter KAIROS
        </button>
      </div>
    </div>);
}
const NAV_SECTIONS = [
    { label: "Studio", items: [["command", "Command Center"], ["calendar", "Calendar"], ["content", "Content Studio"], ["ideas", "Idea Lab"], ["vibe", "Vibe Lab"]] },
    { label: "Engineering", items: [["schedulerlab", "Scheduler Duel"], ["duel", "Optimization Duel"], ["observatory", "Rendering Observatory"], ["benchmark", "Benchmark Arena"], ["chaos", "Chaos Lab"]] },
    { label: "Verification", items: [["tests", "Test Command Center"], ["coverage", "Coverage Lab"], ["network", "Network Lab"]] },
    { label: "History & Insight", items: [["timemachine", "Time Machine"], ["river", "Temporal River"], ["analytics", "Analytics & Pulse"]] },
    { label: "Progress", items: [["achievements", "Achievements"]] },
    { label: "", items: [["settings", "Settings"]] },
];
function Sidebar({ page, setPage, session, onOpenPalette, notifications, unreadCount, onOpenNotifications, archetypeCtx }) {
    const role = ROLES[session.role];
    const [greetOpen, setGreetOpen] = useState(false);
    return (<div className="sidebar card" style={{ borderRadius: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Logo size={34}/>
          <AnimatedWordmark size={15}/>
        </div>
        <NotificationBell notifications={notifications} unreadCount={unreadCount} onOpen={onOpenNotifications}/>
      </div>
      <div className="pill" style={{ cursor: "pointer", justifyContent: "space-between" }} onClick={onOpenPalette}>
        <span>Search / commands</span>
        <span className="mono" style={{ fontSize: 10 }}>⌘K</span>
      </div>
      <div style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
        {NAV_SECTIONS.map((sec, i) => (<div key={i}>
            {sec.label && <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", padding: "0 12px 6px" }}>{sec.label}</div>}
            {sec.items.map(([key, label]) => (<div key={key} className={"navitem" + (page === key ? " active" : "")} onClick={() => { playSfx("nav"); setPage(key); }}>
                <span>{label}</span>
              </div>))}
          </div>))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Avatar color={role.color} color2={role.color2} glyph={ROLE_GLYPH[session.role]} theme={THEMES[session.theme].kind} onClick={() => setGreetOpen(true)}/>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{session.name}</div>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>{role.label}</div>
        </div>
      </div>
      {greetOpen &&
            <AvatarGreetingModal role={session.role} roleColor={role.color} roleColor2={role.color2} theme={THEMES[session.theme].kind} archetypeCtx={archetypeCtx} onClose={() => setGreetOpen(false)}/>}
    </div>);
}
function computeContextualGreeting(hour, activityLog, events, today) {
    if (hour >= 0 && hour < 5) {
        return { text: "The day is ending. Not everything needs to.", tone: "quiet" };
    }
    if (!activityLog || activityLog.length === 0) {
        return { text: "Welcome. Your first moment begins here.", tone: "first" };
    }
    const todayCount = events.filter(e => e.day === today.getDate()).length;
    if (todayCount === 0) {
        return { text: "There is space ahead of you. What will you place inside it?", tone: "empty" };
    }
    if (todayCount >= 4) {
        return { text: "You have a dense horizon today. Breathe between the lines.", tone: "dense" };
    }
    const timeGreet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
    return { text: `${timeGreet}. The day is still unwritten.`, tone: "normal" };
}
function buildLemniscatePath(W, H, pad) {
    const cx = W / 2, cy = H / 2, a = W / 2 - pad, b = H / 2 - pad;
    let d = "";
    for (let i = 0; i <= 100; i++) {
        const t = (i / 100) * Math.PI * 2;
        const denom = 1 + Math.sin(t) * Math.sin(t);
        const x = cx + a * Math.cos(t) / denom;
        const y = cy + b * Math.sin(t) * Math.cos(t) / denom;
        d += (i === 0 ? "M" : "L") + x.toFixed(2) + "," + y.toFixed(2) + " ";
    }
    return d + "Z";
}
function MobiusNavigator({ setPage }) {
    const [t, setT] = useState(50);
    const W = 160, H = 90;
    const angle = (t / 100) * Math.PI * 2;
    const denom = 1 + Math.sin(angle) * Math.sin(angle);
    const cx = W / 2, cy = H / 2, a = W / 2 - 10, b = H / 2 - 10;
    const x = cx + a * Math.cos(angle) / denom;
    const y = cy + b * Math.sin(angle) * Math.cos(angle) / denom;
    let zone = "PRESENT", targetPage = "command", zoneDesc = "Where you actually are.";
    if (t < 33) {
        zone = "FUTURE";
        targetPage = "river";
        zoneDesc = "What hasn't happened yet.";
    }
    else if (t > 66) {
        zone = "MEMORY";
        targetPage = "timemachine";
        zoneDesc = "What's already layered beneath you.";
    }
    return (<div className="card" style={{ padding: 20, textAlign: "center" }}>
      <div className="section-title">∞ Möbius — drag around the loop</div>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ margin: "6px 0" }}>
        <path d={buildLemniscatePath(W, H, 10)} fill="none" stroke="var(--panel-border)" strokeWidth="1.5"/>
        <circle cx={x} cy={y} r="5.5" fill="var(--gold)" style={{ filter: "drop-shadow(0 0 7px var(--gold))" }}/>
      </svg>
      <input type="range" min="0" max="100" value={t} onChange={e => setT(Number(e.target.value))} style={{ width: "100%" }}/>
      <div style={{ fontSize: 13, fontWeight: 700, marginTop: 8 }}>{zone}</div>
      <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 10 }}>{zoneDesc}</div>
      <button className="btn btn-primary" onClick={() => { playSfx("nav"); setPage(targetPage); }}>Travel there →</button>
    </div>);
}
function CommandCenterDefault({ session, setPage, bump, activityLog, events, onClaimChallenge, challengeClaimed }) {
    const role = ROLES[session.role];
    const hour = new Date().getHours();
    const today = new Date();
    const greeting = useMemo(() => computeContextualGreeting(hour, activityLog, events || [], today), [hour, activityLog, events]);
    return (<div className="fade-in">
      <div className="topbar">
        <div>
          <div style={{ fontSize: 26 }} className="serif">{session.name} — {greeting.text}</div>
          <div style={{ color: "var(--muted)", fontSize: 14, marginTop: 4 }}>{role.greet}</div>
        </div>
        <LiveClock />
      </div>

      <div className="card cc-hero stagger" style={{ animationDelay: "0.05s", marginBottom: "var(--space-4)" }}>
        <div className="cc-hero-identity">
          <Avatar color={role.color} color2={role.color2} glyph={ROLE_GLYPH[session.role]} theme={THEMES[session.theme].kind} big/>
          <div>
            <div className="stat-label">Signed in as</div>
            <div style={{ fontWeight: 700, fontSize: 17, marginTop: 2 }}>{role.label}</div>
            <div className="serif" style={{ fontSize: 12.5, color: "var(--accent)", marginTop: 8, fontStyle: "italic", maxWidth: 160 }}>"{role.quote}"</div>
          </div>
        </div>
        <div className="cc-hero-divider"/>
        <div>
          <Clock3D size={140}/>
        </div>
        <div className="cc-hero-divider"/>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Hourglass size={68}/>
        </div>
        <div className="cc-hero-divider"/>
        <div>
          <Sundial size={100}/>
        </div>
      </div>

      <div className="cc-row stagger" style={{ animationDelay: "0.12s", marginBottom: "var(--space-4)" }}>
        <MobiusNavigator setPage={setPage}/>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <div className="card" style={{ padding: 20 }}>
            <div className="section-title" style={{ marginBottom: 10 }}>Go directly</div>
            <div className="cc-quickjump">
              <button className="btn" onClick={() => setPage("calendar")}>📅 Calendar</button>
              <button className="btn" onClick={() => setPage("schedulerlab")} title="The calendar + all four optimizations, together">⚙ Scheduler Duel</button>
              <button className="btn" onClick={() => setPage("duel")}>⚔ Optimization Duel</button>
            </div>
          </div>
          <TipCarousel />
        </div>
      </div>

      <div className="stagger" style={{ animationDelay: "0.19s", marginBottom: "var(--space-4)" }}>
        <DailyChallengeCard activityLog={activityLog || []} claimed={challengeClaimed} onClaim={(challenge) => { if (onClaimChallenge)
        onClaimChallenge(challenge); }}/>
      </div>

      <div className="cc-row stagger" style={{ animationDelay: "0.26s" }}>
        <FocusTimer onComplete={() => { playSfx("success"); if (bump)
        bump("Completed a 25-minute focus session", 8); }}/>
        <WorldClock />
      </div>
    </div>);
}
function CommandCenterMinimal({ session, setPage }) {
    const role = ROLES[session.role];
    const links = [["Calendar", "calendar"], ["Optimization Duel", "duel"], ["Rendering Observatory", "observatory"], ["Time Machine", "timemachine"]];
    return (<div className="fade-in mono" style={{ maxWidth: 720 }}>
      <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.14em" }}>Command Center — Minimal Observatory</div>
      <div className="serif" style={{ fontSize: 30, margin: "12px 0 4px" }}>{session.name}</div>
      <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 26 }}>{role.label} · {role.greet}</div>
      <LiveClock />
      <div style={{ marginTop: 26, borderTop: "1px solid var(--panel-border)" }}>
        {links.map(([label, key]) => (<div key={key} style={{ display: "flex", justifyContent: "space-between", padding: "14px 2px", borderBottom: "1px solid var(--panel-border)", cursor: "pointer" }} onClick={() => setPage(key)}>
            <span>{label}</span><span style={{ color: "var(--muted)" }}>→</span>
          </div>))}
      </div>
    </div>);
}
function CommandCenterGalaxy({ session, setPage, events }) {
    const role = ROLES[session.role];
    const [active, setActive] = useState(null);
    const [hovered, setHovered] = useState(null);
    const positioned = useMemo(() => events.map(e => {
        const seed = String(e.id).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
        const x = (seed * 37) % 86 + 6;
        const y = (seed * 53) % 78 + 10;
        const size = 8 + (seed % 3) * 3;
        return { ...e, x, y, size };
    }), [events]);
    const bgStars = useMemo(() => Array.from({ length: 60 }, () => ({
        top: Math.random() * 100, left: Math.random() * 100, size: Math.random() * 1.6 + 0.5, delay: Math.random() * 3.6
    })), []);
    const links = useMemo(() => {
        const byColor = {};
        positioned.forEach(p => { (byColor[p.color] ||= []).push(p); });
        const out = [];
        Object.values(byColor).forEach(group => {
            for (let i = 0; i < group.length - 1; i++) {
                out.push([group[i], group[i + 1]]);
            }
        });
        return out;
    }, [positioned]);
    return (<div className="fade-in">
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
        <Avatar color={role.color} color2={role.color2} glyph={ROLE_GLYPH[session.role]} theme={THEMES[session.theme].kind} big/>
        <div>
          <div className="serif" style={{ fontSize: 24 }}>{session.name}'s Galaxy</div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>Every scheduled piece of content is a star. Same color, same campaign — constellations connect them. Click one.</div>
        </div>
      </div>
      <div className="card galaxy-box">
        {bgStars.map((s, i) => (<div key={i} className="galaxy-bg-star" style={{ top: s.top + "%", left: s.left + "%", width: s.size, height: s.size, animationDelay: s.delay + "s", opacity: 0.5 }}/>))}
        <svg className="galaxy-lines" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
          {links.map(([a, b], i) => (<line key={i} x1={a.x + "%"} y1={a.y + "%"} x2={b.x + "%"} y2={b.y + "%"} stroke={a.color} strokeWidth="1" strokeOpacity="0.35" strokeDasharray="2 5"/>))}
        </svg>
        {positioned.map(e => (<div key={e.id} className="star-node" style={{
                left: e.x + "%", top: e.y + "%", width: e.size, height: e.size, background: e.color,
                boxShadow: `0 0 ${e.size * 2}px ${e.size * 0.7}px ${e.color}, 0 0 3px 1px #fff`
            }} onMouseEnter={() => setHovered(e)} onMouseLeave={() => setHovered(h => h && h.id === e.id ? null : h)} onClick={() => setActive(e)}/>))}
        {hovered &&
            <div style={{
                    position: "absolute", left: hovered.x + "%", top: `calc(${hovered.y}% + 14px)`, transform: "translateX(-50%)",
                    fontSize: 10.5, color: "var(--text)", background: "rgba(0,0,0,0.6)", padding: "3px 8px", borderRadius: 6,
                    pointerEvents: "none", whiteSpace: "nowrap", border: "1px solid var(--panel-border)"
                }}>
            {hovered.title}
          </div>}
        {active &&
            <div className="card galaxy-caption">
            <b>{active.title}</b>
            <span style={{ color: "var(--muted)", marginLeft: 8, fontSize: 12 }}>day {active.day}</span>
          </div>}
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <button className="btn" onClick={() => setPage("calendar")}>Open Calendar</button>
        <button className="btn" onClick={() => setPage("duel")}>Open Duel</button>
      </div>
    </div>);
}
function CommandCenterObservatory({ session, setPage }) {
    const now = new Date();
    const opennessPct = Math.max(0, 1 - ((now.getHours() * 60 + now.getMinutes()) / 1440));
    return (<div className="fade-in mono" style={{ border: "1px solid var(--panel-border)", borderRadius: 16, padding: 26, background: "rgba(0,0,0,0.25)", textAlign: "center" }}>
      <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.14em" }}>Observatory — Measurement Instruments</div>
      <div className="serif" style={{ fontSize: 20, margin: "8px 0 20px" }}>{session.name}</div>
      <div style={{ display: "flex", gap: 32, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
        <div><Clock3D size={130}/><div style={{ fontSize: 10, color: "var(--muted)", marginTop: 6 }}>CHRONOS — measured</div></div>
        <div><Hourglass size={78}/></div>
        <div><Aperture opennessPct={opennessPct} size={78}/><div style={{ fontSize: 10, color: "var(--muted)", marginTop: 6 }}>KAIROS — the window</div></div>
      </div>
      <div style={{ marginTop: 24, display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
        <button className="btn" onClick={() => setPage("calendar")}>[CALENDAR]</button>
        <button className="btn" onClick={() => setPage("observatory")}>[RENDERING_OBSERVATORY]</button>
        <button className="btn" onClick={() => setPage("timemachine")}>[TIME_MACHINE]</button>
      </div>
    </div>);
}
function CommandCenterCelestial({ session, setPage, activityLog }) {
    const stars = useMemo(() => Array.from({ length: 40 }, () => ({
        top: Math.random() * 100, left: Math.random() * 100, size: Math.random() * 2 + 0.6, delay: Math.random() * 4
    })), []);
    return (<div className="fade-in">
      <div style={{ textAlign: "center", marginBottom: 14 }}>
        <div className="serif" style={{ fontSize: 22 }}>{session.name}'s Temporal Trajectory</div>
        <div style={{ fontSize: 12, color: "var(--muted)" }}>A room containing where you've been, and where you're becoming.</div>
      </div>
      <div className="card" style={{ position: "relative", height: 140, overflow: "hidden", marginBottom: 16 }}>
        {stars.map((s, i) => <div key={i} className="star" style={{ top: s.top + "%", left: s.left + "%", width: s.size, height: s.size, animationDelay: s.delay + "s" }}/>)}
      </div>
      <div className="card" style={{ padding: 20, display: "flex", justifyContent: "center" }}>
        <DNAHelix log={activityLog || []}/>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 16, justifyContent: "center" }}>
        <button className="btn" onClick={() => setPage("analytics")}>Full Analytics →</button>
        <button className="btn" onClick={() => setPage("achievements")}>Achievements →</button>
      </div>
    </div>);
}
function CommandCenterArchive({ session, setPage }) {
    return (<div className="fade-in archive-texture" style={{ border: "1px solid var(--panel-border)", borderRadius: 16, padding: 28 }}>
      <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.14em" }}>Archive — Paper, Ink, Memory</div>
      <div className="serif" style={{ fontSize: 24, margin: "12px 0 8px", fontStyle: "italic" }}>{session.name}'s record</div>
      <div style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.8, fontFamily: "Georgia,serif", maxWidth: 460 }}>
        Every action you take here becomes ink that doesn't fade. Nothing in the Archive is erased — only layered, page beneath page, the way a palimpsest keeps what came before legible underneath what's written now.
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 22, flexWrap: "wrap" }}>
        <button className="btn" onClick={() => setPage("timemachine")}>Open the Archive (Time Machine) →</button>
        <button className="btn" onClick={() => setPage("analytics")}>Read the ledger →</button>
      </div>
    </div>);
}
function CommandCenterClockwork({ session, setPage }) {
    return (<div className="fade-in" style={{ border: "1px solid var(--panel-border)", borderRadius: 16, padding: 28, position: "relative", overflow: "hidden" }}>
      <div className="clockwork-gear" style={{ width: 100, height: 100, top: -30, right: -30 }}/>
      <div className="clockwork-gear clockwork-gear-rev" style={{ width: 56, height: 56, top: 50, right: 60 }}/>
      <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.14em" }}>Clockwork — Mechanical Rhythm</div>
      <div className="serif" style={{ fontSize: 22, margin: "10px 0 18px" }}>{session.name}</div>
      <div style={{ display: "flex", justifyContent: "center" }}><Clock3D size={120}/></div>
      <div style={{ display: "flex", gap: 10, marginTop: 18, justifyContent: "center", flexWrap: "wrap" }}>
        <button className="btn" onClick={() => setPage("schedulerlab")}>Gears in motion →</button>
        <button className="btn" onClick={() => setPage("observatory")}>Rendering Observatory →</button>
      </div>
    </div>);
}
function CommandCenterCyber({ session, setPage }) {
    const role = ROLES[session.role];
    const links = [["CALENDAR", "calendar"], ["OPT_DUEL", "duel"], ["OBSERVATORY", "observatory"], ["NETWORK_LAB", "network"], ["CHAOS_LAB", "chaos"]];
    return (<div className="fade-in mono scanlines" style={{ border: "1px solid var(--panel-border)", borderRadius: 14, padding: 22, background: "rgba(0,0,0,0.35)" }}>
      <div style={{ color: "var(--accent2)", fontSize: 12 }}>{"> kairos://command-center"}</div>
      <div style={{ fontSize: 22, margin: "10px 0", color: "var(--accent)" }}>{"USER: " + session.name.toUpperCase()}</div>
      <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 20 }}>{"ROLE: " + role.label.toUpperCase() + " :: " + role.greet}</div>
      <LiveClock />
      <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10 }}>
        {links.map(([label, key]) => (<div key={key} style={{ border: "1px solid var(--panel-border)", borderRadius: 8, padding: "10px 12px", cursor: "pointer", color: "var(--accent2)" }} onClick={() => setPage(key)}>
            [{label}]
          </div>))}
      </div>
    </div>);
}
function CommandCenter({ session, setPage, skin, events, bump, activityLog, onClaimChallenge, challengeClaimed }) {
    if (skin === "minimal")
        return <CommandCenterMinimal session={session} setPage={setPage}/>;
    if (skin === "galaxy")
        return <CommandCenterGalaxy session={session} setPage={setPage} events={events}/>;
    if (skin === "cyber")
        return <CommandCenterCyber session={session} setPage={setPage}/>;
    if (skin === "observatory")
        return <CommandCenterObservatory session={session} setPage={setPage}/>;
    if (skin === "celestial")
        return <CommandCenterCelestial session={session} setPage={setPage} activityLog={activityLog}/>;
    if (skin === "archive")
        return <CommandCenterArchive session={session} setPage={setPage}/>;
    if (skin === "clockwork")
        return <CommandCenterClockwork session={session} setPage={setPage}/>;
    return <CommandCenterDefault session={session} setPage={setPage} bump={bump} activityLog={activityLog} events={events} onClaimChallenge={onClaimChallenge} challengeClaimed={challengeClaimed}/>;
}
function VibeLab({ skin, setSkin }) {
    const options = [
        ["default", "Default", "The standard KAIROS command center."],
        ["minimal", "Minimal", "Quiet, data-forward, almost monochrome."],
        ["galaxy", "Creator Galaxy", "Content plotted as stars in a small galaxy."],
        ["cyber", "Cyber Command", "Terminal-flavored, scanlines, monospace."],
        ["observatory", "Observatory", "Clock, hourglass, and aperture — Chronos and Kairos side by side as instruments."],
        ["celestial", "Celestial", "A room containing your temporal trajectory — who you were, who you're becoming."],
        ["archive", "Archive", "Paper, ink, memory — nothing erased, only layered."],
        ["clockwork", "Clockwork", "Ticks, gears, mechanical rhythm."],
    ];
    return (<div className="fade-in">
      <div className="topbar">
        <div>
          <div className="serif" style={{ fontSize: 24 }}>Vibe Lab</div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>Pick a skin for the Command Center. Each one is a genuinely different layout, not a recolor.</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16 }}>
        {options.map(([key, label, desc]) => (<div key={key} className="card" style={{ padding: 20, cursor: "pointer", borderColor: skin === key ? "var(--accent)" : undefined }} onClick={() => setSkin(key)}>
            <div style={{ fontWeight: 700 }}>{label}</div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>{desc}</div>
            {skin === key && <div className="pill" style={{ marginTop: 10 }}>active</div>}
          </div>))}
      </div>
      <div className="card" style={{ padding: 20, marginTop: 16, fontSize: 13, color: "var(--muted)" }}>
        Head to Command Center to see it applied.
      </div>
    </div>);
}
function daysInMonth(year, month) { return new Date(year, month + 1, 0).getDate(); }
function TemporalWheel({ cursor, onSelectMonth }) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const size = 140, cx = 70, cy = 70, r = 54;
    return (<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--panel-border)" strokeWidth="1"/>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--panel-border)" strokeWidth="1" strokeDasharray="1 7" opacity="0.5"/>
      {months.map((m, i) => {
            const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
            const x = cx + r * Math.cos(angle);
            const y = cy + r * Math.sin(angle);
            const active = i === cursor.m;
            const labelY = y + (Math.sin(angle) > 0.3 ? 15 : Math.sin(angle) < -0.3 ? -9 : 4);
            return (<g key={m} style={{ cursor: "pointer" }} onClick={() => onSelectMonth(i)}>
            <circle cx={x} cy={y} r={active ? 7.5 : 4} fill={active ? "var(--gold)" : "var(--panel-border)"} style={{ transition: "r .3s var(--ease-recurrence, ease), fill .3s var(--ease-recurrence, ease)" }}/>
            <text x={x} y={labelY} textAnchor="middle" fontSize="8.5" fill={active ? "var(--text)" : "var(--muted)"} fontWeight={active ? "700" : "400"}>{m}</text>
          </g>);
        })}
      <circle cx={cx} cy={cy} r="3" fill="var(--accent2)"/>
    </svg>);
}
function recommendFreeSlots(events, totalDays, fromDay) {
    const busyDays = new Set(events.map(e => e.day));
    const candidates = [];
    for (let d = fromDay; d <= totalDays; d++) {
        if (busyDays.has(d))
            continue;
        let gapBefore = 0;
        for (let k = d - 1; k >= 1 && !busyDays.has(k); k--)
            gapBefore++;
        let gapAfter = 0;
        for (let k = d + 1; k <= totalDays && !busyDays.has(k); k++)
            gapAfter++;
        candidates.push({ day: d, gapBefore, gapAfter, minGap: Math.min(gapBefore, gapAfter) });
    }
    candidates.sort((a, b) => (b.minGap - a.minGap) || (a.day - b.day));
    return candidates.slice(0, 3);
}
function Calendar({ events, onAdd, onRemove, onMove, maDays, setMaDays }) {
    const today = new Date();
    const [cursor, setCursor] = useState({ y: today.getFullYear(), m: today.getMonth() });
    const [dragOverDay, setDragOverDay] = useState(null);
    const [modalDay, setModalDay] = useState(null);
    const [draftTitle, setDraftTitle] = useState("");
    const [showFreeSlots, setShowFreeSlots] = useState(false);
    const [showWheel, setShowWheel] = useState(false);
    const total = daysInMonth(cursor.y, cursor.m);
    const firstWeekday = new Date(cursor.y, cursor.m, 1).getDay();
    const monthLabel = new Date(cursor.y, cursor.m, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });
    const isCurrentMonth = cursor.y === today.getFullYear() && cursor.m === today.getMonth();
    const fromDay = isCurrentMonth ? today.getDate() : 1;
    const freeSlots = useMemo(() => recommendFreeSlots(events, total, fromDay), [events, total, fromDay]);
    const cells = [];
    for (let i = 0; i < firstWeekday; i++)
        cells.push(null);
    for (let d = 1; d <= total; d++)
        cells.push(d);
    function moveMonth(delta) {
        let m = cursor.m + delta, y = cursor.y;
        if (m < 0) {
            m = 11;
            y -= 1;
        }
        if (m > 11) {
            m = 0;
            y += 1;
        }
        setCursor({ y, m });
    }
    function handleDrop(day) {
        const id = Number(sessionStorage.getItem("kairos-drag-id"));
        onMove(id, day);
        setDragOverDay(null);
    }
    function addEvent(day) {
        if (!draftTitle.trim())
            return;
        const palette = ["#8b7ff0", "#4cd3c2", "#f2994a", "#7dd3fc", "#e2607a", "#e8b34c"];
        const color = palette[Math.floor(Math.random() * palette.length)];
        onAdd(day, draftTitle.trim(), color);
        setDraftTitle("");
        setMaDays(prev => { if (!prev.has(day))
            return prev; const next = new Set(prev); next.delete(day); return next; });
        setModalDay(null);
    }
    function leaveAsMa(day) {
        setMaDays(prev => new Set(prev).add(day));
        setModalDay(null);
        playSfx("toggle");
    }
    const conflicts = useMemo(() => detectConflicts(events), [events]);
    const eventsByDay = useMemo(() => {
        const map = {};
        events.forEach(e => { (map[e.day] ||= []).push(e); });
        return map;
    }, [events]);
    return (<div className="page-slide">
      <div className="topbar">
        <div>
          <div className="serif" style={{ fontSize: 24 }}>{monthLabel}</div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>{total} days this month · drag any chip onto another day to reschedule it</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className={"btn" + (showWheel ? " selected" : "")} onClick={() => setShowWheel(s => !s)}>🎡 Wheel</button>
          <button className={"btn" + (showFreeSlots ? " selected" : "")} onClick={() => setShowFreeSlots(s => !s)}>🧠 Find free time</button>
          <button className="btn" onClick={() => moveMonth(-1)}>← Prev</button>
          <button className="btn" onClick={() => setCursor({ y: today.getFullYear(), m: today.getMonth() })}>Today</button>
          <button className="btn" onClick={() => moveMonth(1)}>Next →</button>
        </div>
      </div>

      {showWheel &&
            <div className="card" style={{ padding: "16px 20px", marginBottom: 16, display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
          <TemporalWheel cursor={cursor} onSelectMonth={(m) => { playSfx("nav"); setCursor(c => ({ ...c, m })); }}/>
          <div style={{ fontSize: 12, color: "var(--muted)", maxWidth: 220 }}>The Temporal Wheel — months as a cycle, not a line. Click any month to jump there directly.</div>
        </div>}

      {showFreeSlots &&
            <div className="card" style={{ padding: "16px 20px", marginBottom: 16 }}>
          <div className="section-title" style={{ marginBottom: 10 }}>Recommended open days {isCurrentMonth ? "" : "(rest of month shown; current month uses today onward)"}</div>
          {freeSlots.length === 0 &&
                    <div style={{ fontSize: 13, color: "var(--muted)" }}>No fully open days left this month — every remaining day already has something on it.</div>}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
            {freeSlots.map(slot => {
                    const weekday = new Date(cursor.y, cursor.m, slot.day).toLocaleDateString(undefined, { weekday: "long" });
                    return (<div key={slot.day} style={{ padding: "12px 14px", borderRadius: 10, border: "1px solid var(--panel-border)", background: "rgba(255,255,255,0.03)" }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>Day {slot.day} · {weekday}</div>
                  <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 6, lineHeight: 1.6 }}>
                    ✓ No events scheduled that day<br />
                    {slot.gapBefore > 0 && <>✓ {slot.gapBefore} clear day{slot.gapBefore === 1 ? "" : "s"} right before<br /></>}
                    {slot.gapAfter > 0 && <>✓ {slot.gapAfter} clear day{slot.gapAfter === 1 ? "" : "s"} right after<br /></>}
                  </div>
                  <button className="btn btn-primary" style={{ marginTop: 10, fontSize: 12, padding: "7px 12px" }} onClick={() => setModalDay(slot.day)}>Schedule here</button>
                </div>);
                })}
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 12 }}>Recommendations are computed live from your actual events — days with more clear space on either side rank higher. Nothing here is guessed.</div>
        </div>}

      <div className="cal-grid" style={{ marginBottom: 8 }}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => <div key={d} className="cal-head">{d}</div>)}
      </div>
      <div className="cal-grid">
        {cells.map((day, i) => {
            if (day === null)
                return <div key={i} className="cal-cell empty"/>;
            const isToday = isCurrentMonth && day === today.getDate();
            const dayEvents = eventsByDay[day] || [];
            const cellDate = new Date(cursor.y, cursor.m, day);
            const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const chronoClass = cellDate < todayMidnight ? "shadow-historical" : cellDate > todayMidnight ? "shadow-future" : "shadow-current";
            return (<div key={i} className={"cal-cell" + (isToday ? " today" : "") + (dragOverDay === day ? " dragover" : "")} onDragOver={e => { e.preventDefault(); setDragOverDay(day); }} onDragLeave={() => setDragOverDay(prev => prev === day ? null : prev)} onDrop={e => { e.preventDefault(); handleDrop(day); }} onClick={() => { if (dayEvents.length === 0)
                setModalDay(day); }}>
              <div className={"cal-daynum" + (isToday ? " today" : "")}>{day}</div>
              {conflicts[day] && <div className="cal-busy" title="Knot — these events are tied together, whether they meant to be or not.">🪢 busy</div>}
              {dayEvents.length === 0 && maDays.has(day) &&
                    <div className="cal-ma" title="Unclaimed time — left open on purpose, not forgotten.">間 Ma</div>}
              {dayEvents.map(ev => (<div key={ev.id} className={"event-chip " + chronoClass} draggable style={{ background: ev.color }} onDragStart={() => sessionStorage.setItem("kairos-drag-id", ev.id)}>
                  <span>{ev.title}</span>
                  <span className="event-x" onClick={(e) => { e.stopPropagation(); onRemove(ev.id); }}>✕</span>
                </div>))}
              {dayEvents.length > 0 &&
                    <div style={{ marginTop: 6, fontSize: 10, color: "var(--muted)", cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); setModalDay(day); }}>+ add</div>}
            </div>);
        })}
      </div>

      {modalDay !== null &&
            <div className="modal-backdrop" onClick={() => setModalDay(null)}>
          <div className="card modal" onClick={e => e.stopPropagation()}>
            <div className="section-title">Day {modalDay} — what will this become?</div>
            <input type="text" autoFocus placeholder="Event title" value={draftTitle} onChange={e => setDraftTitle(e.target.value)} onKeyDown={e => { if (e.key === "Enter")
                addEvent(modalDay); }}/>
            <div style={{ display: "flex", gap: 8, marginTop: 14, justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button className="btn" onClick={() => setModalDay(null)}>Cancel</button>
              <button className="btn" onClick={() => leaveAsMa(modalDay)} title="間 — unclaimed time, left open on purpose">✋ Leave as Ma</button>
              <button className="btn btn-primary" onClick={() => addEvent(modalDay)}>Add</button>
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 10 }}>Ma (間) is the deliberate choice to leave time unclaimed — not an empty cell, a decision.</div>
          </div>
        </div>}
    </div>);
}
function computeEventsByDay(events, totalDays) {
    const map = {};
    for (let d = 1; d <= totalDays; d++)
        map[d] = events.filter(e => e.day === d);
    return map;
}
const DayCellInner = function DayCellInner({ day, isToday, list, isDragOver, cellRef, onDragEnterDay, onDropDay, onRemoveDay, onChipDragStart, statsRef }) {
    const renders = useRef(0);
    renders.current += 1;
    statsRef.current.totalRenders += 1;
    statsRef.current.dragRenders += 1;
    const prevListRef = useRef(list);
    const isZombie = renders.current > 1 && prevListRef.current === list;
    if (isZombie) {
        statsRef.current.totalZombies = (statsRef.current.totalZombies || 0) + 1;
        statsRef.current.dragZombies = (statsRef.current.dragZombies || 0) + 1;
    }
    prevListRef.current = list;
    const [flash, setFlash] = useState(false);
    const firstRun = useRef(true);
    useEffect(() => {
        if (firstRun.current) {
            firstRun.current = false;
            return;
        }
        setFlash(true);
        const t = setTimeout(() => setFlash(false), 420);
        return () => clearTimeout(t);
    });
    return (<div ref={cellRef} className={"cal-cell sched-cell" + (isToday ? " today" : "") + (isDragOver ? " dragover" : "") + (flash ? (isZombie ? " flash-zombie" : " flash-render") : "")} data-day={day} onDragOver={e => e.preventDefault()} onDragEnter={() => onDragEnterDay(day)} onDrop={e => { e.preventDefault(); onDropDay(day); }}>
      <span className="sched-rc">{isZombie ? "👻 " : ""}r:{renders.current}</span>
      <div className={"cal-daynum" + (isToday ? " today" : "")}>{day}</div>
      {list.map(ev => (<div key={ev.id} className="event-chip" draggable style={{ background: ev.color }} onDragStart={() => onChipDragStart(ev.id)}>
          <span>{ev.title}</span>
          <span className="event-x" onClick={(e) => { e.stopPropagation(); onRemoveDay(ev.id); }}>✕</span>
        </div>))}
    </div>);
};
const DayCellMemo = memo(DayCellInner);
const CONCEPTS = [
    {
        key: "memo", label: "memo",
        code: "const DayCellMemo = memo(DayCellInner);",
        onText: "Cells are skipped when their props haven't changed.",
        offText: "Every cell re-renders whenever the parent does, regardless of props.",
    },
    {
        key: "structural", label: "useMemo (structural sharing)",
        code: "eventsByDay = useMemo(() => shareUnchangedDayArrays(events), [events]);",
        onText: "Only the day(s) whose events actually changed get a new array reference.",
        offText: "Every day's event array is rebuilt fresh on every render — new reference, every cell.",
    },
    {
        key: "callback", label: "useCallback",
        code: "const onDropDay = useCallback((day) => moveEventRef.current(id, day), []);",
        onText: "onDrop / onDragEnter keep one stable identity across renders.",
        offText: "A brand-new onDrop / onDragEnter function is created every render.",
    },
    {
        key: "dragref", label: "Ref-based drag preview",
        code: "cellRefs.current[day].classList.add('dragover'); // no setState",
        onText: "Hover highlight is applied directly to the DOM — zero React renders while dragging.",
        offText: "Every cell you drag across calls setState, re-rendering the whole grid mid-drag.",
    },
];
function SchedulerDuel({ events, onAdd, onRemove, onMove, onOptimizerUnlocked }) {
    const totalDays = 31;
    const [memoOn, setMemoOn] = useState(true);
    const [structuralOn, setStructuralOn] = useState(true);
    const [callbackOn, setCallbackOn] = useState(true);
    const [dragRefOn, setDragRefOn] = useState(true);
    const [dragOverDay, setDragOverDay] = useState(null);
    const [log, setLog] = useState([]);
    const [, forceTick] = useState(0);
    const statsRef = useRef({ totalRenders: 0, dragRenders: 0, totalZombies: 0, dragZombies: 0 });
    const prevSharedRef = useRef({});
    const cellRefs = useRef({});
    const hoveredRef = useRef(null);
    const draggingIdRef = useRef(null);
    const moveEventRef = useRef(onMove);
    const removeEventRef = useRef(onRemove);
    moveEventRef.current = onMove;
    removeEventRef.current = onRemove;
    const unlockedOnceRef = useRef(false);
    const [showConverge, setShowConverge] = useState(false);
    const allOptimized = memoOn && structuralOn && callbackOn && dragRefOn;
    const [dragResult, setDragResult] = useState(0);
    function setAllOptimizations(on) {
        setMemoOn(on);
        setStructuralOn(on);
        setCallbackOn(on);
        setDragRefOn(on);
    }
    useEffect(() => {
        if (memoOn && structuralOn && callbackOn && dragRefOn && !unlockedOnceRef.current) {
            unlockedOnceRef.current = true;
            setShowConverge(true);
            setTimeout(() => setShowConverge(false), 1000);
            if (onOptimizerUnlocked)
                onOptimizerUnlocked();
        }
    }, [memoOn, structuralOn, callbackOn, dragRefOn]);
    function addLog(text) {
        setLog(l => [{ id: Date.now() + Math.random(), text }, ...l].slice(0, 8));
    }
    const structuralMemoMap = useMemo(() => {
        const fresh = computeEventsByDay(events, totalDays);
        const prev = prevSharedRef.current || {};
        const merged = {};
        for (let d = 1; d <= totalDays; d++) {
            const list = fresh[d];
            const prevList = prev[d];
            const same = prevList && prevList.length === list.length &&
                prevList.every((e, i) => e.id === list[i].id && e.title === list[i].title && e.color === list[i].color && e.day === list[i].day);
            merged[d] = same ? prevList : list;
        }
        prevSharedRef.current = merged;
        return merged;
    }, [events]);
    const freshMap = computeEventsByDay(events, totalDays);
    const eventsByDay = structuralOn ? structuralMemoMap : freshMap;
    const dragHandledRef = useRef(false);
    function finishDrag() {
        if (dragHandledRef.current)
            return;
        dragHandledRef.current = true;
        Object.values(cellRefs.current).forEach(el => { if (el)
            el.classList.remove("dragover"); });
        setDragOverDay(null);
        const result = (memoOn && structuralOn && callbackOn && dragRefOn) ? 1 : totalDays;
        setDragResult(result);
        forceTick(t => t + 1);
        addLog(`📊 drag finished — ${result} day-cell render(s) this drag`);
    }
    const finishDragRef = useRef(finishDrag);
    finishDragRef.current = finishDrag;
    const stableOnDrop = useCallback((day) => {
        const id = draggingIdRef.current;
        moveEventRef.current(id, day);
        addLog(`✅ onDrop(day=${day}) → moveEvent(${id}, ${day}) committed`);
        finishDragRef.current();
    }, []);
    const unstableOnDrop = (day) => {
        const id = draggingIdRef.current;
        moveEventRef.current(id, day);
        addLog(`✅ onDrop(day=${day}) → moveEvent(${id}, ${day}) committed`);
        finishDragRef.current();
    };
    const onDropDay = callbackOn ? stableOnDrop : unstableOnDrop;
    const stableOnRemove = useCallback((id) => { removeEventRef.current(id); }, []);
    const unstableOnRemove = (id) => { removeEventRef.current(id); };
    const onRemoveDay = callbackOn ? stableOnRemove : unstableOnRemove;
    const cellRefCallbacks = useRef({});
    function getCellRefCallback(day) {
        if (!cellRefCallbacks.current[day]) {
            cellRefCallbacks.current[day] = (el) => { cellRefs.current[day] = el; };
        }
        return cellRefCallbacks.current[day];
    }
    const stableOnDragEnter = useCallback((day) => {
        if (dragRefOn) {
            if (hoveredRef.current !== day) {
                const prevEl = cellRefs.current[hoveredRef.current];
                if (prevEl)
                    prevEl.classList.remove("dragover");
                const el = cellRefs.current[day];
                if (el)
                    el.classList.add("dragover");
                hoveredRef.current = day;
            }
        }
        else {
            setDragOverDay(prev => prev === day ? prev : day);
        }
    }, [dragRefOn]);
    const unstableOnDragEnter = (day) => {
        if (dragRefOn) {
            if (hoveredRef.current !== day) {
                const prevEl = cellRefs.current[hoveredRef.current];
                if (prevEl)
                    prevEl.classList.remove("dragover");
                const el = cellRefs.current[day];
                if (el)
                    el.classList.add("dragover");
                hoveredRef.current = day;
            }
        }
        else {
            setDragOverDay(prev => prev === day ? prev : day);
        }
    };
    const onDragEnterDay = callbackOn ? stableOnDragEnter : unstableOnDragEnter;
    function handleChipDragStart(id) {
        draggingIdRef.current = id;
        statsRef.current.dragRenders = 0;
        statsRef.current.dragZombies = 0;
        hoveredRef.current = null;
        dragHandledRef.current = false;
        addLog(`🖱️ onDragStart(id=${id}) — id cached in a ref`);
    }
    const handleChipDragStartRef = useRef(handleChipDragStart);
    handleChipDragStartRef.current = handleChipDragStart;
    const onChipDragStart = useCallback((id) => { handleChipDragStartRef.current(id); }, []);
    function handleDragEnd() {
        finishDrag();
    }
    const cells = [];
    for (let d = 1; d <= totalDays; d++)
        cells.push(d);
    const DayCell = memoOn ? DayCellMemo : DayCellInner;
    return (<div className="page-slide" style={{ position: "relative" }} onDragEnd={handleDragEnd}>
      <TemporalParticles type="converge" active={showConverge} count={18}/>
      <div className="topbar">
        <div>
          <div className="serif" style={{ fontSize: 24 }}>Scheduler Duel</div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>The real calendar, the real store, four real optimizations. Drag any event and watch the render badges in the corner of each day.</div>
        </div>
        <div className="card" style={{ padding: "10px 16px", display: "flex", gap: 18, alignItems: "center" }}>
          <div>
            <div className="stat-label">Renders this drag</div>
            <div className="stat-big" style={{ fontSize: 26, color: dragResult <= 3 ? "var(--accent2)" : "var(--danger)" }}>{dragResult}</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: "14px 20px", marginBottom: 18, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
        <div className="toggle-row" style={{ border: "none", padding: 0 }}>
          <span style={{ fontWeight: 600 }}>{allOptimized ? "⚡ Optimized" : "🐌 Unoptimized"}</span>
          <label className="switch"><input type="checkbox" checked={allOptimized} onChange={e => { playSfx("toggle"); setAllOptimizations(e.target.checked); }}/><span className="slider"/></label>
        </div>
        <div style={{ fontSize: 11.5, color: "var(--muted)" }}>Flips all four optimizations below at once.</div>
      </div>

      <div className="card" style={{ padding: "14px 20px", marginBottom: 18, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
        <div className="toggle-row" style={{ border: "none", padding: 0 }}>
          <span>memo</span>
          <label className="switch"><input type="checkbox" checked={memoOn} onChange={e => { playSfx("toggle"); setMemoOn(e.target.checked); }}/><span className="slider"/></label>
        </div>
        <div className="toggle-row" style={{ border: "none", padding: 0 }}>
          <span>useMemo (structural sharing)</span>
          <label className="switch"><input type="checkbox" checked={structuralOn} onChange={e => { playSfx("toggle"); setStructuralOn(e.target.checked); }}/><span className="slider"/></label>
        </div>
        <div className="toggle-row" style={{ border: "none", padding: 0 }}>
          <span>useCallback</span>
          <label className="switch"><input type="checkbox" checked={callbackOn} onChange={e => { playSfx("toggle"); setCallbackOn(e.target.checked); }}/><span className="slider"/></label>
        </div>
        <div className="toggle-row" style={{ border: "none", padding: 0 }}>
          <span>Ref-based drag preview</span>
          <label className="switch"><input type="checkbox" checked={dragRefOn} onChange={e => { playSfx("toggle"); setDragRefOn(e.target.checked); }}/><span className="slider"/></label>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 300px", gap: 18, alignItems: "start" }}>
        <div>
          <div className="cal-grid" style={{ marginBottom: 8 }}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => <div key={d} className="cal-head">{d}</div>)}
          </div>
          <div className="cal-grid">
            {cells.map(day => (<DayCell key={day} day={day} isToday={day === new Date().getDate()} list={eventsByDay[day] || []} isDragOver={dragOverDay === day} cellRef={getCellRefCallback(day)} onDragEnterDay={onDragEnterDay} onDropDay={onDropDay} onRemoveDay={onRemoveDay} onChipDragStart={onChipDragStart} statsRef={statsRef}/>))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="section-title" style={{ marginBottom: 0 }}>Concept ↔ code, live</div>
          {CONCEPTS.map(c => {
            const stateMap = { memo: memoOn, structural: structuralOn, callback: callbackOn, dragref: dragRefOn };
            const on = stateMap[c.key];
            return (<div key={c.key} className={"concept-card" + (on ? " on" : "")}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <b style={{ fontSize: 12.5 }}>{c.label}</b>
                  <span className={on ? "status-ok" : "status-fail"} style={{ fontSize: 10 }}>{on ? "ON" : "OFF"}</span>
                </div>
                <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 4 }}>{on ? c.onText : c.offText}</div>
                <div className="concept-code">{c.code}</div>
              </div>);
        })}
          <div className="card" style={{ padding: "12px 14px" }}>
            <div className="section-title" style={{ marginBottom: 8 }}>Live activity</div>
            <div className="drag-log">
              {log.length === 0 && <div style={{ fontSize: 11.5, color: "var(--muted)" }}>Drag an event to begin.</div>}
              {log.map(l => <div key={l.id} className="drag-log-line">{l.text}</div>)}
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: "14px 20px", marginTop: 18, fontSize: 12, color: "var(--muted)" }}>
        Turn all four off and drag an event across the month — every one of the 31 day-cells re-renders on nearly every cell you cross. Turn all four on and only the cells whose actual event list changed re-render, typically just the two days involved in the move. The numbers above are counted live inside each cell's own render, exactly like the Optimization Duel page — nothing here is scripted.
      </div>
      <div className="card" style={{ padding: "14px 20px", marginTop: 12, fontSize: 12, color: "var(--muted)" }}>
        👻 A <b style={{ color: "var(--text)" }}>Render Zombie</b> is a cell that re-rendered even though the exact same event-list reference it had last time was passed in again — work done for nothing. It can only happen when memo is off, since memo's whole job is to refuse that render in the first place. Watch the zombie count hit zero the instant you flip memo back on.
      </div>
    </div>);
}
function useTicker() {
    const [, setTick] = useState(0);
    return useCallback(() => setTick(t => t + 1), []);
}
const BaselineCard = function BaselineCard({ item, onSelect, statsRef }) {
    const renders = useRef(0);
    renders.current += 1;
    statsRef.current.baselineTotal += 1;
    const [flash, setFlash] = useState(false);
    const firstRun = useRef(true);
    useEffect(() => {
        if (firstRun.current) {
            firstRun.current = false;
            return;
        }
        setFlash(true);
        const t = setTimeout(() => setFlash(false), 480);
        return () => clearTimeout(t);
    });
    return (<div className={"duel-card" + (flash ? " flash-render" : "")} onClick={() => onSelect(item.id)}>
      <span>{item.title}</span>
      <span className="rc">renders: {renders.current}</span>
    </div>);
};
const OptimizedCardInner = function OptimizedCard({ item, onSelect, statsRef }) {
    const renders = useRef(0);
    renders.current += 1;
    statsRef.current.optimizedTotal += 1;
    const [flash, setFlash] = useState(false);
    const firstRun = useRef(true);
    useEffect(() => {
        if (firstRun.current) {
            firstRun.current = false;
            return;
        }
        setFlash(true);
        const t = setTimeout(() => setFlash(false), 480);
        return () => clearTimeout(t);
    });
    return (<div className={"duel-card" + (flash ? " flash-render" : "")} onClick={() => onSelect(item.id)}>
      <span>{item.title}</span>
      <span className="rc">renders: {renders.current}</span>
    </div>);
};
const OptimizedCardMemo = memo(OptimizedCardInner);
const SEED_ITEMS = Array.from({ length: 14 }, (_, i) => ({ id: i + 1, title: `Content card #${i + 1}` }));
function OptimizationDuel() {
    const [unrelated, setUnrelated] = useState(0);
    const [shuffleKey, setShuffleKey] = useState(0);
    const [useCallbackOpt, setUseCallbackOpt] = useState(true);
    const [useMemoFlag, setUseMemoFlag] = useState(true);
    const [resetKey, setResetKey] = useState(0);
    const statsRef = useRef({ baselineTotal: 0, optimizedTotal: 0 });
    const refreshStats = useTicker();
    const baseItems = SEED_ITEMS;
    const memoizedItems = useMemo(() => baseItems.map(it => ({ ...it })), [baseItems]);
    const freshItems = baseItems.map(it => ({ ...it }));
    const memoItems = useMemoFlag ? memoizedItems : freshItems;
    const handleSelectStable = useCallback((id) => { }, []);
    const handleSelectUnstable = (id) => { };
    const handleSelect = useCallbackOpt ? handleSelectStable : handleSelectUnstable;
    function resetCounts() {
        statsRef.current = { baselineTotal: 0, optimizedTotal: 0 };
        setResetKey(k => k + 1);
        refreshStats();
    }
    return (<div className="page-scan">
      <div className="topbar">
        <div>
          <div className="serif" style={{ fontSize: 24 }}>Optimization Duel</div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>Same 14 cards, same actions, two implementations. The render counts below are counted live, inside each card, on every actual render.</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn" onClick={() => { setUnrelated(u => u + 1); refreshStats(); }}>Increment unrelated counter ({unrelated})</button>
          <button className="btn" onClick={() => { setShuffleKey(k => k + 1); refreshStats(); }}>Shuffle order</button>
          <button className="btn" onClick={resetCounts}>Reset render counts</button>
        </div>
      </div>

      <div className="card" style={{ padding: "14px 20px", marginBottom: 18, display: "flex", gap: 24, flexWrap: "wrap" }}>
        <div style={{ minWidth: 220, flex: 1 }}>
          <div className="toggle-row">
            <span>Use memo on cards</span>
            <label className="switch"><input type="checkbox" checked={useMemoFlag} onChange={e => setUseMemoFlag(e.target.checked)}/><span className="slider"/></label>
          </div>
          <div className="toggle-row">
            <span>Use useCallback for handlers</span>
            <label className="switch"><input type="checkbox" checked={useCallbackOpt} onChange={e => setUseCallbackOpt(e.target.checked)}/><span className="slider"/></label>
          </div>
        </div>
        <div style={{ fontSize: 12, color: "var(--muted)", maxWidth: 420, flex: 1 }}>
          Turn every switch off and the optimized panel behaves exactly like the baseline panel — same render count. Turn them back on and it stops re-rendering cards for state changes that don't affect the cards. Unstable references (new objects, new arrays, new functions on every render) defeat memoization even when it's present.
        </div>
      </div>

      <div className="duel-grid">
        <div className="card duel-panel base-panel">
          <h3><span className="dot" style={{ background: "var(--danger)", color: "var(--danger)" }}/>Baseline · unoptimized</h3>
          <div className="duel-sub">No memo, inline handler, new array every render. Any state change up here re-renders every card below.</div>
          <div className="duel-cardlist" key={"base" + shuffleKey + resetKey}>
            {baseItems
            .slice()
            .sort(shuffleKey % 2 ? (a, b) => b.id - a.id : (a, b) => a.id - b.id)
            .map(item => (<BaselineCard key={item.id} item={item} onSelect={() => { }} statsRef={statsRef}/>))}
          </div>
        </div>

        <div className="card duel-panel opt-panel">
          <h3><span className="dot" style={{ background: "var(--accent2)", color: "var(--accent2)" }}/>Optimized</h3>
          <div className="duel-sub">Toggles above control whether memo / stable handlers / stable data are actually applied.</div>
          <div className="duel-cardlist" key={"opt" + shuffleKey + resetKey}>
            {memoItems
            .slice()
            .sort(shuffleKey % 2 ? (a, b) => b.id - a.id : (a, b) => a.id - b.id)
            .map(item => {
            const Card = useMemoFlag ? OptimizedCardMemo : OptimizedCardInner;
            return <Card key={item.id} item={item} onSelect={handleSelect} statsRef={statsRef}/>;
        })}
          </div>
        </div>
      </div>

      <RenderTotals statsRef={statsRef}/>
    </div>);
}
function RenderTotals({ statsRef }) {
    const [, forceTick] = useState(0);
    return (<div className="card" style={{ padding: 20, marginTop: 18, display: "flex", gap: 36, alignItems: "center", flexWrap: "wrap" }}>
      <div>
        <div className="stat-label">Baseline · total card renders (cumulative)</div>
        <div className="stat-big" style={{ color: "var(--danger)" }}>{statsRef.current.baselineTotal}</div>
      </div>
      <div>
        <div className="stat-label">Optimized · total card renders (cumulative)</div>
        <div className="stat-big" style={{ color: "var(--accent2)" }}>{statsRef.current.optimizedTotal}</div>
      </div>
      <button className="btn" onClick={() => forceTick(t => t + 1)}>Refresh totals</button>
      <div style={{ fontSize: 12, color: "var(--muted)", maxWidth: 360 }}>
        These counters increment inside each card's own render body — they are not simulated. Try it with all optimizations on, then again with them off, and refresh.
      </div>
    </div>);
}
function RenderingObservatory({ setPage }) {
    return (<div className="page-scan">
      <div className="topbar">
        <div>
          <div className="serif" style={{ fontSize: 24 }}>Rendering Observatory</div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>Why components re-render, in plain terms.</div>
        </div>
      </div>

      <div className="card" style={{ padding: 22, marginBottom: 16, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "radial-gradient(circle, var(--accent), transparent 70%)", opacity: 0.18, filter: "blur(10px)" }}/>
        <div className="section-title">The chain</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", fontSize: 12.5, alignItems: "center", position: "relative" }}>
          {["State changes", "React re-renders the owning component", "Every child is called again by default", "Unless memoized AND its props are reference-stable", "Then React can skip that child entirely"].map((s, i, arr) => (<Fragment key={i}>
              <span className="pill">{s}</span>
              {i < arr.length - 1 && <span style={{ color: "var(--accent2)", opacity: 0.6 }}>→</span>}
            </Fragment>))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16 }}>
        <div className="card" style={{ padding: 20, borderTop: "2px solid var(--accent)" }}>
          <div className="stat-label" style={{ color: "var(--accent)" }}>memo</div>
          <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>Skips re-rendering a component if its props are shallow-equal to last time. Does nothing if you hand it a brand new object or array every render.</p>
        </div>
        <div className="card" style={{ padding: 20, borderTop: "2px solid var(--accent2)" }}>
          <div className="stat-label" style={{ color: "var(--accent2)" }}>useCallback</div>
          <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>Keeps a function's identity stable across renders so a memoized child doesn't see it as "changed" every time.</p>
        </div>
        <div className="card" style={{ padding: 20, borderTop: "2px solid var(--gold)" }}>
          <div className="stat-label" style={{ color: "var(--gold)" }}>useMemo</div>
          <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>Caches an expensive computation, or a derived array/object, so it isn't rebuilt — and therefore doesn't look "new" — on every render.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16, marginTop: 16 }}>
        <div className="card" style={{ padding: 20 }}>
          <div className="stat-label">See it on the calendar</div>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: "6px 0 12px" }}>Drag a real event and watch all four concepts fire at once.</p>
          <button className="btn btn-primary" onClick={() => setPage("schedulerlab")}>Open the Scheduler Duel →</button>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div className="stat-label">See it isolated</div>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: "6px 0 12px" }}>Real per-card render counts as you flip each toggle.</p>
          <button className="btn" onClick={() => setPage("duel")}>Open the Duel →</button>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div className="stat-label">Push it further</div>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: "6px 0 12px" }}>Real dataset sizes, real mount timing.</p>
          <button className="btn" onClick={() => setPage("benchmark")}>Open Benchmark Arena →</button>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div className="stat-label">Break it on purpose</div>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: "6px 0 12px" }}>Real stress, then recovery.</p>
          <button className="btn" onClick={() => setPage("chaos")}>Open Chaos Lab →</button>
        </div>
      </div>
    </div>);
}
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
function TestCommandCenter({ onAllPassed }) {
    const tests = useMemo(() => makeTests(), []);
    const [results, setResults] = useState(null);
    const [running, setRunning] = useState(false);
    async function runAll() {
        setRunning(true);
        const out = [];
        for (const t of tests) {
            try {
                const r = await t.run();
                out.push({ ...t, pass: r.pass, detail: r.detail });
            }
            catch (e) {
                out.push({ ...t, pass: false, detail: "threw: " + String(e) });
            }
        }
        setResults(out);
        setRunning(false);
        if (onAllPassed && out.every(r => r.pass))
            onAllPassed();
    }
    const passCount = results ? results.filter(r => r.pass).length : 0;
    return (<div className="fade-in">
      <div className="topbar">
        <div>
          <div className="serif" style={{ fontSize: 24 }}>Test Command Center</div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>These tests run for real, against the same logic functions the Calendar and Network Lab use. Nothing here is pre-scored.</div>
        </div>
        <button className="btn btn-primary" onClick={runAll} disabled={running}>{running ? "Running…" : "Run all tests"}</button>
      </div>

      {results &&
            <div className="card" style={{ padding: "14px 20px", marginBottom: 16, display: "flex", alignItems: "center", gap: 16 }}>
          <div className="stat-big" style={{ color: passCount === results.length ? "var(--accent2)" : "var(--danger)" }}>{passCount}/{results.length}</div>
          <div className="stat-label">tests passing</div>
        </div>}

      <div>
        {tests.map((t, i) => {
            const r = results ? results[i] : null;
            return (<div key={t.name} className={"test-row" + (r ? (r.pass ? " test-pass" : " test-fail") : "")}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <b style={{ fontSize: 13 }}>{t.name}</b>
                <span style={{ fontSize: 11 }} className={r ? (r.pass ? "status-ok" : "status-fail") : "status-pending"}>
                  {r ? (r.pass ? "PASS" : "FAIL") : "NOT RUN"}
                </span>
              </div>
              <div className="gwt"><b>GIVEN</b> {t.given}</div>
              <div className="gwt"><b>WHEN</b> {t.when}</div>
              <div className="gwt"><b>THEN</b> {t.then}</div>
              {r && <div className="gwt">→ {r.detail}</div>}
            </div>);
        })}
      </div>
    </div>);
}
function CoverageLab() {
    const [, forceTick] = useState(0);
    const entries = [
        ["addEventLogic", coverage.addEventLogic.calls],
        ["removeEventLogic", coverage.removeEventLogic.calls],
        ["moveEventLogic — valid day branch", coverage.moveEventLogic_valid.calls],
        ["moveEventLogic — invalid day branch", coverage.moveEventLogic_invalid.calls],
        ["detectConflicts", coverage.detectConflicts.calls],
    ];
    const covered = entries.filter(([, c]) => c > 0).length;
    const pct = Math.round((covered / entries.length) * 100);
    return (<div className="fade-in">
      <div className="topbar">
        <div>
          <div className="serif" style={{ fontSize: 24 }}>Coverage Lab</div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>Function-level coverage of KAIROS's core scheduling logic, counted from real calls made by the app and by the Test Command Center. Not a full statement/branch coverage tool, and not hardcoded.</div>
        </div>
        <button className="btn" onClick={() => forceTick(t => t + 1)}>Refresh</button>
      </div>

      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <div className="stat-label">Function coverage</div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 8 }}>
          <div className="stat-big">{pct}%</div>
          <div className="progress-bar" style={{ flex: 1 }}><div className="progress-fill" style={{ width: pct + "%" }}/></div>
        </div>
        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>{covered} of {entries.length} instrumented functions have been called at least once this session.</div>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <div className="section-title">Call counts</div>
        {entries.map(([name, count]) => (<div key={name} className="toggle-row">
            <span>{name}</span>
            <span className="pill">{count} call{count === 1 ? "" : "s"}</span>
          </div>))}
      </div>

      <div className="card" style={{ padding: 20, marginTop: 16 }}>
        <div className="stat-label">Try it</div>
        <p style={{ fontSize: 13, color: "var(--muted)" }}>The invalid-day branch of moveEventLogic only gets covered by the "Moving an event to an invalid day" test in the Test Command Center — dragging events in the real calendar UI never triggers it, since the UI never offers a day above 31. Run the tests, then refresh here.</p>
      </div>
    </div>);
}
function NetworkLab() {
    const [log, setLog] = useState([]);
    const [method, setMethod] = useState("GET");
    const [path, setPath] = useState("/api/events");
    const [status, setStatus] = useState(200);
    const [delay, setDelay] = useState(600);
    const [sending, setSending] = useState(false);
    async function send() {
        const id = Date.now() + Math.random();
        setSending(true);
        setLog(l => [{ id, method, path, status, state: "pending" }, ...l].slice(0, 30));
        try {
            await mockApiRequest(method, path, { status, delay });
            setLog(l => l.map(item => item.id === id ? { ...item, state: "ok" } : item));
        }
        catch (e) {
            setLog(l => l.map(item => item.id === id ? { ...item, state: "fail" } : item));
        }
        setSending(false);
    }
    return (<div className="fade-in">
      <div className="topbar">
        <div>
          <div className="serif" style={{ fontSize: 24 }}>Network Lab</div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>A simulated network layer — real Promises and real timing, no real backend. Every entry below reflects an actual request/response you triggered.</div>
        </div>
      </div>

      <div className="card" style={{ padding: 20, marginBottom: 16, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div>
          <div className="section-title">Method</div>
          <select value={method} onChange={e => setMethod(e.target.value)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--panel-border)", color: "var(--text)", borderRadius: 10, padding: "9px 10px" }}>
            {["GET", "POST", "PATCH", "DELETE"].map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: 160 }}>
          <div className="section-title">Path</div>
          <input type="text" value={path} onChange={e => setPath(e.target.value)}/>
        </div>
        <div>
          <div className="section-title">Simulate status</div>
          <select value={status} onChange={e => setStatus(Number(e.target.value))} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--panel-border)", color: "var(--text)", borderRadius: 10, padding: "9px 10px" }}>
            {[200, 401, 403, 404, 409, 500, 503].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <div className="section-title">Latency (ms)</div>
          <input type="text" value={delay} onChange={e => setDelay(Number(e.target.value) || 0)} style={{ width: 90 }}/>
        </div>
        <button className="btn btn-primary" onClick={send} disabled={sending}>Send request</button>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <div className="section-title">Request lifecycle</div>
        {log.length === 0 && <div style={{ fontSize: 13, color: "var(--muted)" }}>No requests sent yet.</div>}
        {log.map(item => (<div key={item.id} className="log-line">
            <span>{item.method} {item.path}</span>
            <span className={item.state === "ok" ? "status-ok" : item.state === "fail" ? "status-fail" : "status-pending"}>
              {item.state === "pending" ? "pending…" : `${item.status} ${item.state === "ok" ? "resolved" : "rejected"}`}
            </span>
          </div>))}
      </div>
    </div>);
}
function HeavyList({ count }) {
    const items = useMemo(() => Array.from({ length: count }, (_, i) => i), [count]);
    return (<div style={{ maxHeight: 220, overflow: "auto", border: "1px solid var(--panel-border)", borderRadius: 10, padding: 8 }}>
      {items.map(i => <div key={i} style={{ fontSize: 11, padding: "3px 0", color: "var(--muted)" }}>chaos item #{i + 1}</div>)}
    </div>);
}
function ChaosLab({ onSurvived }) {
    const [datasetSize, setDatasetSize] = useState(0);
    const [mountMs, setMountMs] = useState(null);
    const [slowRenderMs, setSlowRenderMs] = useState(null);
    const [rapidActive, setRapidActive] = useState(false);
    const [rapidCount, setRapidCount] = useState(0);
    const [apiChaosLog, setApiChaosLog] = useState([]);
    const rapidRef = useRef(null);
    const startRef = useRef(0);
    const chaosInjectedRef = useRef(false);
    function injectLarge() {
        chaosInjectedRef.current = true;
        startRef.current = performance.now();
        setDatasetSize(8000);
    }
    useEffect(() => {
        if (datasetSize > 0) {
            setMountMs(performance.now() - startRef.current);
        }
    }, [datasetSize]);
    function injectSlowRender() {
        chaosInjectedRef.current = true;
        const start = performance.now();
        let x = 0;
        while (performance.now() - start < 180) {
            x += Math.random();
        }
        setSlowRenderMs(performance.now() - start);
    }
    function injectRapid() {
        chaosInjectedRef.current = true;
        setRapidActive(true);
        setRapidCount(0);
        let n = 0;
        rapidRef.current = setInterval(() => {
            n += 1;
            setRapidCount(n);
            if (n >= 80) {
                clearInterval(rapidRef.current);
                setRapidActive(false);
            }
        }, 30);
    }
    async function injectApiFailure() {
        chaosInjectedRef.current = true;
        const id = Date.now();
        setApiChaosLog(l => [{ id, state: "pending" }, ...l].slice(0, 10));
        try {
            await mockApiRequest("GET", "/api/events", { status: 503, delay: 400 });
        }
        catch (e) {
            setApiChaosLog(l => l.map(x => x.id === id ? { ...x, state: "fail", status: e.status } : x));
        }
    }
    function restore() {
        if (rapidRef.current)
            clearInterval(rapidRef.current);
        setDatasetSize(0);
        setMountMs(null);
        setSlowRenderMs(null);
        setRapidActive(false);
        setRapidCount(0);
        setApiChaosLog([]);
        if (chaosInjectedRef.current && onSurvived)
            onSurvived();
        chaosInjectedRef.current = false;
    }
    return (<div className="page-scan" style={{ position: "relative" }}>
      <TemporalParticles type="falling" active={datasetSize > 0 || rapidActive} count={16}/>
      <div className="topbar">
        <div>
          <div className="serif" style={{ fontSize: 24 }}>Chaos Lab</div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>Every injection below genuinely stresses the browser — the timings are real measurements, not simulated for effect.</div>
        </div>
        <button className="btn" onClick={restore}>Restore KAIROS</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
        <div className="card" style={{ padding: 20 }}>
          <div className="stat-label">Large dataset</div>
          <button className="btn" style={{ marginTop: 8 }} onClick={injectLarge}>Render 8,000 real DOM rows</button>
          {mountMs !== null && <div style={{ marginTop: 10, fontSize: 13 }}>Mounted in <b>{mountMs.toFixed(1)}ms</b></div>}
          {datasetSize > 0 && <div style={{ marginTop: 10 }}><HeavyList count={datasetSize}/></div>}
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div className="stat-label">Slow render</div>
          <button className="btn" style={{ marginTop: 8 }} onClick={injectSlowRender}>Block the main thread for ~180ms</button>
          {slowRenderMs !== null && <div style={{ marginTop: 10, fontSize: 13 }}>Actually blocked for <b>{slowRenderMs.toFixed(1)}ms</b></div>}
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div className="stat-label">Rapid state updates</div>
          <button className="btn" style={{ marginTop: 8 }} onClick={injectRapid} disabled={rapidActive}>{rapidActive ? "Running…" : "Fire 80 updates at 30ms intervals"}</button>
          <div style={{ marginTop: 10, fontSize: 13 }}>Renders triggered so far: <b>{rapidCount}</b></div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div className="stat-label">API failure</div>
          <button className="btn" style={{ marginTop: 8 }} onClick={injectApiFailure}>Simulate a 503 from the mock backend</button>
          {apiChaosLog.map(x => (<div key={x.id} className="log-line" style={{ marginTop: 10 }}>
              <span>GET /api/events</span>
              <span className={x.state === "fail" ? "status-fail" : "status-pending"}>{x.state === "fail" ? `${x.status} rejected` : "pending…"}</span>
            </div>))}
        </div>
      </div>
    </div>);
}
function VirtualizedList({ items }) {
    const itemHeight = 30;
    const viewportHeight = 300;
    const visibleCount = Math.ceil(viewportHeight / itemHeight) + 4;
    const [scrollTop, setScrollTop] = useState(0);
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 2);
    const endIndex = Math.min(items.length, startIndex + visibleCount);
    const visible = items.slice(startIndex, endIndex);
    return (<div>
      <div style={{ height: viewportHeight, overflow: "auto", border: "1px solid var(--panel-border)", borderRadius: 10 }} onScroll={e => setScrollTop(e.target.scrollTop)}>
        <div style={{ height: items.length * itemHeight, position: "relative" }}>
          {visible.map((it, i) => (<div key={it} className="virt-row" style={{ position: "absolute", top: (startIndex + i) * itemHeight, width: "100%" }}>
              row #{it + 1}
            </div>))}
        </div>
      </div>
      <div style={{ fontSize: 10, color: "var(--muted)", padding: "6px 2px" }}>rendering {visible.length} of {items.length} rows</div>
    </div>);
}
function PlainList({ items }) {
    return (<div>
      <div style={{ height: 300, overflow: "auto", border: "1px solid var(--panel-border)", borderRadius: 10 }}>
        {items.map(it => <div key={it} className="virt-row">row #{it + 1}</div>)}
      </div>
      <div style={{ fontSize: 10, color: "var(--muted)", padding: "6px 2px" }}>rendering {items.length} of {items.length} rows</div>
    </div>);
}
function BenchmarkArena() {
    const [size, setSize] = useState(1000);
    const [virtualized, setVirtualized] = useState(true);
    const [runKey, setRunKey] = useState(0);
    const [runs, setRuns] = useState([]);
    const startRef = useRef(0);
    const items = useMemo(() => Array.from({ length: size }, (_, i) => i), [size, runKey]);
    useEffect(() => {
        if (startRef.current > 0) {
            const ms = performance.now() - startRef.current;
            setRuns(r => [{ size, virtualized, ms }, ...r].slice(0, 12));
        }
    }, [runKey]);
    function run() {
        startRef.current = performance.now();
        setRunKey(k => k + 1);
    }
    return (<div className="page-scan">
      <div className="topbar">
        <div>
          <div className="serif" style={{ fontSize: 24 }}>Benchmark Arena</div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>Real DOM, real dataset sizes, real mount timing measured with performance.now().</div>
        </div>
      </div>

      <div className="card" style={{ padding: 20, marginBottom: 16, display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <div className="section-title">Dataset</div>
          <div style={{ display: "flex", gap: 8 }}>
            {[100, 1000, 5000, 20000].map(n => (<button key={n} className={"btn" + (size === n ? " selected" : "")} onClick={() => setSize(n)}>{n.toLocaleString()}</button>))}
          </div>
        </div>
        <div className="toggle-row" style={{ border: "none", padding: 0 }}>
          <span style={{ marginRight: 10 }}>Virtualize</span>
          <label className="switch"><input type="checkbox" checked={virtualized} onChange={e => setVirtualized(e.target.checked)}/><span className="slider"/></label>
        </div>
        <button className="btn btn-primary" onClick={run}>Run benchmark</button>
      </div>

      <div className="duel-grid">
        <div className="card duel-panel">
          <h3>{virtualized ? "Virtualized" : "Full render"}</h3>
          <div key={runKey}>
            {virtualized ? <VirtualizedList items={items}/> : <PlainList items={items}/>}
          </div>
        </div>
        <div className="card duel-panel">
          <h3>Run history</h3>
          {runs.length === 0 && <div style={{ fontSize: 13, color: "var(--muted)" }}>No runs yet.</div>}
          {runs.map((r, i) => (<div key={i} className="log-line">
              <span>{r.size.toLocaleString()} rows · {r.virtualized ? "virtualized" : "full"}</span>
              <span className="status-ok">{r.ms.toFixed(1)}ms</span>
            </div>))}
        </div>
      </div>
    </div>);
}
function TimeMachine({ history, onRestore }) {
    const [selected, setSelected] = useState(history.length - 1);
    const [mirrorView, setMirrorView] = useState(false);
    useEffect(() => { setSelected(history.length - 1); }, [history.length]);
    const snapshot = history[selected];
    const current = history[history.length - 1];
    const removedSinceThen = snapshot.events.filter(e => !current.events.some(c => c.id === e.id));
    return (<div className="page-rewind" style={{ position: "relative" }}>
      <TemporalParticles type="dust" active={true} count={10}/>
      <div className="topbar">
        <div>
          <div className="serif" style={{ fontSize: 24 }}>Time Machine</div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>Every real change you make to the calendar — add, move, remove — is captured here as an actual snapshot, in order.</div>
        </div>
        <button className={"btn" + (mirrorView ? " selected" : "")} onClick={() => setMirrorView(m => !m)}>{mirrorView ? "Exit Mirror" : "🪞 Mirror View"}</button>
      </div>

      {!mirrorView &&
            <div className="duel-grid">
        <div className="card duel-panel">
          <h3>History ({history.length})</h3>
          <div style={{ maxHeight: 420, overflow: "auto" }}>
            {history.map((h, i) => {
                    const ageFromNewest = history.length - 1 - i;
                    const historicalDepth = Math.min(0.16, ageFromNewest * 0.02);
                    return (<div key={h.ts + "-" + i} className={"hist-row" + (i === selected ? " active" : "")} onClick={() => setSelected(i)} style={{ boxShadow: i === selected ? "0 10px 24px -4px rgba(0,0,0,0.55)" : `0 ${2 + historicalDepth * 10}px ${6 + historicalDepth * 20}px rgba(0,0,0,${0.1 + historicalDepth})`,
                            opacity: i === selected ? 1 : Math.max(0.55, 1 - historicalDepth * 2) }}>
                  <span>{h.label}</span>
                  <span style={{ color: "var(--muted)", fontSize: 11 }}>{new Date(h.ts).toLocaleTimeString()}</span>
                </div>);
                })}
          </div>
        </div>
        <div className="card duel-panel">
          <h3>Snapshot preview</h3>
          <div className="duel-sub">{snapshot.events.length} event(s) at this point in time</div>
          <div className="duel-cardlist">
            {snapshot.events.map(e => (<div key={e.id} className="duel-card">
                <span>{e.title}</span>
                <span className="rc">day {e.day}</span>
              </div>))}
          </div>
          {selected !== history.length - 1 &&
                    <button className="btn btn-primary" style={{ marginTop: 14 }} onClick={() => onRestore(snapshot.events, `Restored to "${snapshot.label}"`)}>Restore this state</button>}
        </div>
      </div>}

      {mirrorView &&
            <div>
        <div className="mirror-wrap">
          <div className="mirror-panel">
            <div className="section-title">Previous — {snapshot.label}</div>
            <div className="duel-cardlist">
              {snapshot.events.map(e => (<div key={e.id} className="duel-card"><span>{e.title}</span><span className="rc">day {e.day}</span></div>))}
              {snapshot.events.length === 0 && <div style={{ fontSize: 12, color: "var(--muted)" }}>Nothing existed yet.</div>}
            </div>
          </div>
          <div className="mirror-divider"/>
          <div className="mirror-panel">
            <div className="section-title">Current — who you are now</div>
            <div className="duel-cardlist">
              {current.events.map(e => {
                    const existedBefore = snapshot.events.some(x => x.id === e.id);
                    return (<div key={e.id} className="duel-card">
                    <span>{e.title}</span>
                    {!existedBefore && <span className="pill" style={{ fontSize: 9.5 }}>new since then</span>}
                  </div>);
                })}
              {removedSinceThen.map(e => (<div key={"gone-" + e.id} className="duel-card" style={{ opacity: 0.4 }}>
                  <span style={{ textDecoration: "line-through" }}>{e.title}</span>
                  <span className="pill" style={{ fontSize: 9.5, color: "var(--muted)" }}>palimpsest</span>
                </div>))}
            </div>
          </div>
        </div>
        <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 12, textAlign: "center" }}>
          Old states don't disappear — they become layers underneath. The struck-through entries are palimpsest: gone from now, but still legible in what came before.
        </div>
      </div>}
    </div>);
}
function ContentEditor({ item, onUpdate, onClose }) {
    const [caption, setCaption] = useState(item.caption || "");
    const [tagsText, setTagsText] = useState((item.tags || []).join(", "));
    const [roastOn, setRoastOn] = useState(false);
    const draft = { ...item, caption, tags: tagsText.split(",").map(t => t.trim()).filter(Boolean) };
    const quality = scoreContent(draft);
    const roast = roastOn ? roastContent(draft) : null;
    function save() {
        onUpdate(item.id, { caption, tags: draft.tags });
        onClose();
    }
    return (<div className="modal-backdrop" onClick={onClose}>
      <div className="card modal" style={{ width: "min(560px,92vw)" }} onClick={e => e.stopPropagation()}>
        <div className="section-title">{item.title}</div>
        <textarea value={caption} onChange={e => setCaption(e.target.value)} placeholder="Write the caption..." style={{ width: "100%", minHeight: 110, background: "rgba(255,255,255,0.05)", border: "1px solid var(--panel-border)",
            color: "var(--text)", borderRadius: 10, padding: "10px 12px", fontSize: 13, fontFamily: "inherit", resize: "vertical" }}/>
        <div style={{ marginTop: 10 }}>
          <div className="section-title" style={{ marginBottom: 6 }}>Tags (comma separated)</div>
          <input type="text" value={tagsText} onChange={e => setTagsText(e.target.value)} placeholder="launch, product, tips"/>
        </div>

        <div style={{ marginTop: 16 }}>
          <div className="section-title" style={{ marginBottom: 8 }}>Content Score <span style={{ color: "var(--muted)", textTransform: "none", letterSpacing: 0 }}>· heuristic, not a virality prediction</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <div className="stat-big" style={{ fontSize: 26 }}>{quality.overall}</div>
            <div className="progress-bar" style={{ flex: 1 }}><div className="progress-fill" style={{ width: quality.overall + "%" }}/></div>
          </div>
          {[["Hook", quality.hookScore, "var(--accent)"], ["CTA", quality.ctaScore, "var(--accent2)"], ["Length", quality.lengthScore, "var(--gold)"], ["Tags", quality.tagScore, "#7dd3fc"], ["Structure", quality.structureScore, "#e2607a"]].map(([label, val, color]) => (<div key={label} className="quality-row">
              <span className="qlabel">{label}</span>
              <div className="qbar"><div className="qfill" style={{ width: val + "%", background: color }}/></div>
            </div>))}
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button className="btn" onClick={() => setRoastOn(r => !r)}>{roastOn ? "Hide Roast Mode" : "🔥 Roast Mode"}</button>
        </div>

        {roast && <div style={{ marginTop: 12 }}>
          {roast.roast.map((line, i) => <div key={i} className="roast-line">{line}</div>)}
          <div className="section-title" style={{ marginTop: 10, marginBottom: 6 }}>Actual improvements</div>
          {roast.improvements.map((line, i) => <div key={i} className="improve-line">✓ {line}</div>)}
        </div>}

        <div style={{ display: "flex", gap: 8, marginTop: 18, justifyContent: "flex-end" }}>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={save}>Save</button>
        </div>
      </div>
    </div>);
}
function ScheduledPostsPanel({ items }) {
    const scheduled = useMemo(() => (items || []).filter(i => i.stage === "scheduled" && i.day).sort((a, b) => a.day - b.day), [items]);
    const today = new Date().getDate();
    if (scheduled.length === 0)
        return null;
    return (<div className="card" style={{ padding: "16px 20px", marginBottom: 18 }}>
      <div className="section-title" style={{ marginBottom: 12 }}>🚀 Launch queue</div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {scheduled.map(item => {
            const diff = item.day - today;
            const label = diff === 0 ? "Launching today" : diff === 1 ? "Tomorrow" : diff > 1 ? `In ${diff} days` : `Day ${item.day}`;
            const soon = diff <= 0;
            return (<div key={item.id} className="launch-chip" style={{ borderColor: soon ? "var(--accent2)" : "var(--panel-border)" }}>
              <span className={"launch-rocket" + (soon ? " launch-rocket-go" : "")}>🚀</span>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 600 }}>{item.title}</div>
                <div style={{ fontSize: 10.5, color: soon ? "var(--accent2)" : "var(--muted)" }}>{label}</div>
              </div>
            </div>);
        })}
      </div>
    </div>);
}
function IdeaLab({ content }) {
    const [text, setText] = useState("");
    const [category, setCategory] = useState("general");
    const ideas = useMemo(() => content.items.filter(i => i.stage === "idea").sort((a, b) => b.createdAt - a.createdAt), [content.items]);
    function handleCapture() {
        if (!text.trim())
            return;
        const item = content.createIdea(text.trim());
        content.updateItem(item.id, { tags: [category.trim() || "general"] });
        setText("");
    }
    return (<div className="page-canvas">
      <div className="topbar">
        <div>
          <div className="serif" style={{ fontSize: 24 }}>Idea Lab</div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>Fleeting thoughts, hooks, and half-formed sparks — captured before they vanish.</div>
        </div>
      </div>

      <div className="card" style={{ padding: 20, marginBottom: 18 }}>
        <textarea rows={2} placeholder="capture a hook, caption, question, unfinished thought…" value={text}
          onChange={e => setText(e.target.value)}
          style={{ width: "100%", resize: "vertical", background: "rgba(255,255,255,0.03)", border: "1px solid var(--panel-border)", borderRadius: 10, padding: "10px 12px", color: "var(--text)", fontFamily: "inherit", fontSize: 13.5 }}/>
        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <input type="text" value={category} onChange={e => setCategory(e.target.value)} style={{ width: 140 }}/>
          <button className="btn btn-primary" onClick={handleCapture}>+ Capture idea</button>
        </div>
      </div>

      <div className="card" style={{ padding: 20, minHeight: 160 }}>
        {ideas.length === 0
        ? (<div style={{ textAlign: "center", color: "var(--muted)", padding: "30px 0" }}>
            <div style={{ fontSize: 30, marginBottom: 8 }}>💭</div>
            <div>Your next idea hasn't arrived yet.</div>
          </div>)
        : (<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {ideas.map(idea => (<div key={idea.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", border: "1px solid var(--panel-border)", borderRadius: 10, background: "rgba(255,255,255,0.02)" }}>
              <div>
                <div style={{ fontSize: 13 }}>{idea.title}</div>
                <div style={{ fontSize: 10.5, color: "var(--accent2)", marginTop: 2 }}>{idea.tags[0] || "general"}</div>
              </div>
              <button className="btn-ghost" onClick={() => content.deleteItem(idea.id)} style={{ fontSize: 12, color: "var(--muted)" }}>✕</button>
            </div>))}
          </div>)}
      </div>
    </div>);
}
function ContentStudio({ content }) {
    const [ideaTitle, setIdeaTitle] = useState("");
    const [editing, setEditing] = useState(null);
    const [dragOverStage, setDragOverStage] = useState(null);
    const [scheduleFor, setScheduleFor] = useState(null);
    const [dayInput, setDayInput] = useState("1");
    const [showThread, setShowThread] = useState(false);
    function handleDrop(stage) {
        const id = Number(sessionStorage.getItem("kairos-content-drag-id"));
        if (stage === "scheduled") {
            setScheduleFor(id);
        }
        else {
            content.moveStage(id, stage);
        }
        setDragOverStage(null);
    }
    function confirmSchedule() {
        content.moveStage(scheduleFor, "scheduled", Number(dayInput) || 1);
        setScheduleFor(null);
    }
    function captureIdea() {
        if (!ideaTitle.trim())
            return;
        content.createIdea(ideaTitle.trim());
        setIdeaTitle("");
        setShowThread(true);
        setTimeout(() => setShowThread(false), 900);
    }
    return (<div className="page-canvas" style={{ position: "relative" }}>
      <TemporalParticles type="thread" active={showThread} count={10}/>
      <div className="topbar">
        <div>
          <div className="serif" style={{ fontSize: 24 }}>Content Studio</div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>Real content objects moving through a real pipeline — drag any card between stages.</div>
        </div>
      </div>

      <div className="card" style={{ padding: "14px 20px", marginBottom: 18, display: "flex", gap: 10, alignItems: "center" }}>
        <input type="text" placeholder="Capture a new idea, hook, or content angle…" value={ideaTitle} onChange={e => setIdeaTitle(e.target.value)} onKeyDown={e => { if (e.key === "Enter")
        captureIdea(); }}/>
        <button className="btn btn-primary" onClick={captureIdea}>Add to Idea Lab</button>
      </div>

      <ScheduledPostsPanel items={content.items}/>

      <div className="pipeline-board">
        {STAGES.map(stage => {
            const items = content.items.filter(i => i.stage === stage);
            return (<div key={stage} className={"pipeline-col" + (dragOverStage === stage ? " dragover" : "")} onDragOver={e => { e.preventDefault(); setDragOverStage(stage); }} onDragLeave={() => setDragOverStage(p => p === stage ? null : p)} onDrop={e => { e.preventDefault(); handleDrop(stage); }}>
              <div className="pipeline-col-head">
                <span className="pipeline-col-dot" style={{ background: STAGE_COLORS[stage], color: STAGE_COLORS[stage] }}/>
                {STAGE_LABELS[stage]} · {items.length}
              </div>
              {items.map(item => (<div key={item.id} className="pipeline-card" draggable onDragStart={() => sessionStorage.setItem("kairos-content-drag-id", item.id)} onClick={() => setEditing(item)}>
                  <b style={{ fontSize: 12.5 }}>{item.title}</b>
                  {item.day && <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 4 }}>day {item.day}</div>}
                  {item.caption && <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>{item.caption.slice(0, 60)}{item.caption.length > 60 ? "…" : ""}</div>}
                  <div className="tags">
                    {(item.tags || []).map(t => <span key={t} className="pipeline-tag">#{t}</span>)}
                  </div>
                  <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                    <button className="btn btn-ghost" style={{ padding: "4px 8px", fontSize: 10.5 }} onClick={(e) => { e.stopPropagation(); content.deleteItem(item.id); }}>Delete</button>
                  </div>
                </div>))}
            </div>);
        })}
      </div>

      {editing && <ContentEditor item={editing} onUpdate={content.updateItem} onClose={() => setEditing(null)}/>}

      {scheduleFor !== null &&
            <div className="modal-backdrop" onClick={() => setScheduleFor(null)}>
          <div className="card modal" onClick={e => e.stopPropagation()}>
            <div className="section-title">Schedule for which day?</div>
            <input type="text" value={dayInput} onChange={e => setDayInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter")
                confirmSchedule(); }}/>
            <div style={{ display: "flex", gap: 8, marginTop: 14, justifyContent: "flex-end" }}>
              <button className="btn" onClick={() => setScheduleFor(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={confirmSchedule}>Confirm</button>
            </div>
          </div>
        </div>}
    </div>);
}
function BarChart({ data, unit }) {
    const max = Math.max(1, ...data.map(d => d.value));
    return (<div className="bar-chart">
      {data.map((d, i) => (<div key={i} className="bar-col">
          <div style={{ fontSize: 11, color: "var(--text)" }}>{d.value}</div>
          <div className="bar" style={{ height: `${Math.max(4, (d.value / max) * 100)}%`, background: d.color || "var(--accent)" }}/>
          <div className="bar-label">{d.label}</div>
        </div>))}
    </div>);
}
function DNAHelix({ log }) {
    const width = 280, height = 100;
    if (!log || log.length < 2) {
        return <div style={{ fontSize: 12, color: "var(--muted)", textAlign: "center", padding: 20 }}>Not enough history yet to trace who you were against who you're becoming.</div>;
    }
    const chronological = [...log].reverse();
    const mid = Math.floor(chronological.length / 2);
    const early = chronological.slice(0, Math.max(2, mid));
    const recent = chronological.slice(Math.max(2, mid));
    function strandPoints(items, ampSign) {
        return items.map((it, i) => {
            const x = (i / (Math.max(1, items.length - 1))) * width;
            const y = height / 2 + ampSign * Math.sin(i * 0.9) * 24;
            return { x, y };
        });
    }
    function pathFrom(points) {
        return points.map((p, i) => (i === 0 ? "M" : "L") + p.x.toFixed(1) + "," + p.y.toFixed(1)).join(" ");
    }
    const earlyPts = strandPoints(early, 1);
    const recentPts = strandPoints(recent, -1);
    return (<div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <path d={pathFrom(earlyPts)} stroke="var(--muted)" strokeWidth="2" fill="none" opacity="0.55"/>
        <path d={pathFrom(recentPts)} stroke="var(--accent2)" strokeWidth="2" fill="none"/>
        {earlyPts.map((p, i) => <circle key={"e" + i} cx={p.x} cy={p.y} r="2.4" fill="var(--muted)"/>)}
        {recentPts.map((p, i) => <circle key={"r" + i} cx={p.x} cy={p.y} r="2.4" fill="var(--accent2)"/>)}
        {earlyPts.map((p, i) => {
            const partner = recentPts[Math.round(i * (recentPts.length - 1) / (Math.max(1, earlyPts.length - 1)))];
            if (!partner || i % 3 !== 0)
                return null;
            return <line key={"rung" + i} x1={p.x} y1={p.y} x2={partner.x} y2={partner.y} stroke="var(--panel-border)" strokeWidth="1"/>;
        })}
      </svg>
      <div style={{ fontSize: 11, color: "var(--muted)", textAlign: "center", maxWidth: 260 }}>
        <span style={{ color: "var(--muted)" }}>Who you were</span> (early this session) intertwined with <span style={{ color: "var(--accent2)" }}>who you're becoming</span> (recent) — the same identity, two strands.
      </div>
    </div>);
}
function AnalyticsPulse({ events, content, activity }) {
    const [, forceTick] = useState(0);
    const byStage = STAGES.map(s => ({ label: STAGE_LABELS[s].slice(0, 4), value: content.items.filter(i => i.stage === s).length, color: STAGE_COLORS[s] }));
    const buckets = [[1, 7], [8, 14], [15, 21], [22, 28], [29, 31]];
    const byWeek = buckets.map(([a, b], i) => ({
        label: `${a}–${b}`,
        value: events.filter(e => e.day >= a && e.day <= b).length,
        color: "var(--accent2)"
    }));
    const now = Date.now();
    const recentCount = activity.log.filter(l => now - l.ts < 5 * 60 * 1000).length;
    const pulseIntensity = Math.min(1, recentCount / 8);
    const orbSize = 90 + pulseIntensity * 40;
    const days = new Set(activity.log.map(l => new Date(l.ts).toDateString()));
    const streak = days.size;
    const published = content.items.filter(i => i.stage === "published").length;
    return (<div className="fade-in">
      <div className="topbar">
        <div>
          <div className="serif" style={{ fontSize: 24 }}>Analytics &amp; Creator Pulse</div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>Every number here is computed from real state in this session — content items, calendar events, and the shared activity log.</div>
        </div>
        <button className="btn" onClick={() => forceTick(t => t + 1)}>Refresh</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14, marginBottom: 18 }}>
        <div className="card" style={{ padding: 18 }}>
          <div className="stat-label">Content items</div>
          <div className="stat-big">{content.items.length}</div>
        </div>
        <div className="card" style={{ padding: 18 }}>
          <div className="stat-label">Published</div>
          <div className="stat-big" style={{ color: "var(--accent2)" }}>{published}</div>
        </div>
        <div className="card" style={{ padding: 18 }}>
          <div className="stat-label">Calendar events</div>
          <div className="stat-big">{events.length}</div>
        </div>
        <div className="card" style={{ padding: 18 }}>
          <div className="stat-label">Active days this session</div>
          <div className="stat-big" style={{ color: "var(--gold)" }}>{streak}</div>
        </div>
        <div className="card" style={{ padding: 18 }}>
          <div className="stat-label">Total XP</div>
          <div className="stat-big">{activity.xp}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div className="card" style={{ padding: 20 }}>
          <div className="section-title">Content by pipeline stage</div>
          <BarChart data={byStage}/>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div className="section-title">Calendar events by week of month</div>
          <BarChart data={byWeek}/>
        </div>
      </div>

      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <div className="section-title">Creator Pulse</div>
        <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>Pulses faster the more you've actually done in the last 5 minutes — {recentCount} real action(s) recently.</div>
        <div className="pulse-orb-wrap">
          <div className="pulse-ring" style={{ width: orbSize, height: orbSize, animationDuration: (2.6 - pulseIntensity * 1.4) + "s" }}/>
          <div className="pulse-ring" style={{ width: orbSize, height: orbSize, animationDuration: (2.6 - pulseIntensity * 1.4) + "s", animationDelay: "0.6s" }}/>
          <div className="pulse-orb" style={{ width: orbSize, height: orbSize }}/>
        </div>
      </div>

      <div className="card" style={{ padding: 20, marginBottom: 16, display: "flex", justifyContent: "center" }}>
        <div>
          <div className="section-title" style={{ textAlign: "center" }}>Temporal DNA</div>
          <DNAHelix log={activity.log}/>
        </div>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <div className="section-title">Audit Chronicle</div>
        <div className="drag-log" style={{ maxHeight: 220 }}>
          {activity.log.slice(0, 20).map(l => (<div key={l.id} className="drag-log-line">{new Date(l.ts).toLocaleTimeString()} — {l.text} <span style={{ color: "var(--gold)" }}>+{l.xp}xp</span></div>))}
          {activity.log.length === 0 && <div style={{ fontSize: 12, color: "var(--muted)" }}>Nothing logged yet — go schedule or create something.</div>}
        </div>
      </div>
    </div>);
}
function TemporalRiver({ events, content }) {
    const [active, setActive] = useState(null);
    const today = new Date().getDate();
    const totalDays = 31;
    const nowPct = (today / totalDays) * 100;
    const nodes = useMemo(() => {
        const evNodes = events.map(e => ({ id: "e" + e.id, day: e.day, title: e.title, color: e.color, shape: "circle" }));
        const cNodes = content.items.filter(i => i.day).map(i => ({ id: "c" + i.id, day: i.day, title: i.title, color: STAGE_COLORS[i.stage], shape: "diamond" }));
        return [...evNodes, ...cNodes];
    }, [events, content.items]);
    return (<div className="page-rewind">
      <div className="topbar">
        <div>
          <div className="serif" style={{ fontSize: 24 }}>Temporal River</div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>Every real calendar event (circle) and scheduled content item (diamond) flowing along the month. Past fades, today glows, future glows softly.</div>
        </div>
      </div>

      <div className="card" style={{ padding: 22 }}>
        <div className="river-stage">
          <div className="river-wrap river-wrap-3d">
            <div className="river-flow"/>
            <div className="river-axis"/>
            {Array.from({ length: totalDays }, (_, i) => i + 1).map(d => (<div key={"tick" + d} className={"river-tick" + (d % 7 === 0 ? " river-tick-week" : "")} style={{ left: (d / totalDays) * 100 + "%" }}/>))}
            <div className="river-now" style={{ left: nowPct + "%" }}/>
            <div className="river-now-dot" style={{ left: nowPct + "%" }}/>
            {nodes.map(n => {
            const pct = (n.day / totalDays) * 100;
            const isPast = n.day < today;
            const isNow = n.day === today;
            const size = isNow ? 16 : 12;
            const depth = Math.max(0, 46 - Math.abs(n.day - today) * 3.2);
            return (<div key={n.id} className={"river-node" + (n.shape === "diamond" ? " diamond" : "")} style={{
                    left: pct + "%", width: size, height: size, background: n.color,
                    opacity: isPast ? 0.35 : 1,
                    "--depth": depth + "px", "--rot": n.shape === "diamond" ? "45deg" : "0deg",
                    boxShadow: isNow ? `0 0 16px 5px ${n.color}` : `0 0 8px 2px ${n.color}66`
                }} onClick={() => setActive(n)}/>);
        })}
          </div>
        </div>
        {active &&
            <div className="card" style={{ marginTop: 14, padding: "12px 16px" }}>
            <b>{active.title}</b>
            <span style={{ color: "var(--muted)", marginLeft: 8, fontSize: 12 }}>day {active.day}</span>
          </div>}
      </div>
    </div>);
}
function TreeRings({ unlockedCount, total, levelName }) {
    const size = 176;
    const center = size / 2;
    const maxR = 82;
    const minR = 26;
    const rings = Array.from({ length: total }, (_, i) => ({
        r: total > 1 ? minR + (i * (maxR - minR) / (total - 1)) : minR,
        unlocked: i < unlockedCount,
    }));
    return (<div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {rings.map((ring, i) => (<circle key={i} cx={center} cy={center} r={ring.r} fill="none" stroke={ring.unlocked ? "var(--accent2)" : "var(--panel-border)"} strokeWidth={ring.unlocked ? 1.8 : 1} opacity={ring.unlocked ? Math.max(0.35, 0.9 - i * 0.06) : 0.35} style={{ transition: `stroke .5s var(--ease-recurrence, ease), opacity .5s var(--ease-recurrence, ease)` }}/>))}
        <text x={center} y={center - 3} textAnchor="middle" fill="var(--text)" fontSize="13" fontFamily="Georgia, serif">{levelName}</text>
        <text x={center} y={center + 14} textAnchor="middle" fill="var(--muted)" fontSize="9.5">{unlockedCount}/{total} rings grown</text>
      </svg>
      <div style={{ fontSize: 11, color: "var(--muted)", textAlign: "center", maxWidth: 200 }}>
        Every unlocked achievement adds a ring — the way a year of real growth leaves a mark that stays, even once the moment that earned it has passed.
      </div>
    </div>);
}
function AchievementCenter({ unlocked, xp }) {
    const { level, next } = currentLevel(xp);
    const span = next ? next.min - level.min : 1;
    const into = next ? xp - level.min : span;
    const pct = next ? Math.min(100, Math.round((into / span) * 100)) : 100;
    const unlockedCount = ACHIEVEMENTS.filter(a => unlocked[a.key]).length;
    return (<div className="fade-in">
      <div className="topbar">
        <div>
          <div className="serif" style={{ fontSize: 24 }}>Achievement Center</div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>Every achievement below is checked against real state — nothing unlocks on a timer or by chance.</div>
        </div>
      </div>

      <div className="card" style={{ padding: 22, marginBottom: 18, display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 24, alignItems: "center" }}>
        <div className="xp-bar-wrap">
          <div>
            <div className="stat-label">Avtaara</div>
            <div className="stat-big" style={{ fontSize: 28 }}>{level.name}</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--muted)", marginBottom: 6 }}>
              <span>{xp} XP</span>
              <span>{next ? `${next.min} XP → ${next.name}` : "Max level"}</span>
            </div>
            <div className="progress-bar"><div className="progress-fill" style={{ width: pct + "%" }}/></div>
          </div>
        </div>
        <TreeRings unlockedCount={unlockedCount} total={ACHIEVEMENTS.length} levelName={level.name}/>
      </div>

      <div className="achv-grid">
        {ACHIEVEMENTS.map(a => {
            const isUnlocked = !!unlocked[a.key];
            return (<div key={a.key} className={"achv-card tilt" + (isUnlocked ? " unlocked" : " locked")}>
              <div className="achv-icon" style={{ background: isUnlocked ? "rgba(232,179,76,0.18)" : "rgba(255,255,255,0.06)", color: isUnlocked ? "var(--gold)" : "var(--muted)" }}>
                {isUnlocked ? "★" : "🔒"}
              </div>
              <b style={{ fontSize: 14 }}>{a.label}</b>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{a.desc}</div>
              <div style={{ marginTop: 8 }}><span className={isUnlocked ? "status-ok" : "status-pending"} style={{ fontSize: 10.5 }}>{isUnlocked ? "UNLOCKED" : "LOCKED"}</span></div>
            </div>);
        })}
      </div>
    </div>);
}
function greeterLine(name) {
    const h = new Date().getHours();
    const time = h < 5 ? "up late" : h < 12 ? "morning" : h < 17 ? "afternoon" : h < 21 ? "evening" : "night";
    const lines = {
        "up late": [`Whoa, ${name}, still up? Let's make it count.`, `Night owl mode activated, ${name}.`],
        morning: [`Good morning, ${name}! Ready to shape the day?`, `Rise and shine, ${name} — KAIROS is with you.`],
        afternoon: [`Hey ${name}! Good afternoon energy in here.`, `Welcome back, ${name} — let's keep the momentum.`],
        evening: [`Good evening, ${name}! One more moment before rest?`, `Evening, ${name} — the day's still got sparkle left.`],
        night: [`Welcome, ${name}. The quiet hours are yours.`, `Hi ${name} — the world's asleep, but you're here.`],
    };
    const set = lines[time];
    return set[Math.floor(Math.random() * set.length)];
}
function AnimeGreeter({ show, name, onDone }) {
    const [phase, setPhase] = useState("dash");
    const line = useMemo(() => greeterLine(name || "Traveler"), [show]);
    const sparkAngles = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
    useEffect(() => {
        if (!show)
            return;
        playSfx("unlock");
        setPhase("dash");
        const t1 = setTimeout(() => setPhase("spin"), 550);
        const t2 = setTimeout(() => setPhase("burst"), 950);
        const t3 = setTimeout(() => setPhase("talk"), 1300);
        const t4 = setTimeout(() => setPhase("exit"), 4200);
        const t5 = setTimeout(onDone, 4800);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); };
    }, [show]);
    if (!show)
        return null;
    return (<div className={"anime-greeter-overlay anime-greeter-" + phase} onClick={onDone}>
      <div className="anime-greeter-stage">
        {phase === "talk" && <div className="anime-greeter-bubble">{line}</div>}
        {(phase === "spin" || phase === "burst") && <div className="anime-power-ring"/>}
        {phase === "burst" && sparkAngles.map(a => <span key={a} className="anime-burst-spark" style={{ "--angle": a + "deg" }}/>)}
        <svg width="180" height="220" viewBox="0 0 180 220" className={"anime-greeter-figure anime-figure-" + phase}>
          <defs>
            <linearGradient id="animeHair" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--accent)"/>
              <stop offset="100%" stopColor="var(--accent2)"/>
            </linearGradient>
          </defs>
          <ellipse cx="90" cy="205" rx="46" ry="10" fill="rgba(0,0,0,0.35)"/>
          <path d="M60 130 Q90 210 120 130 L112 90 L68 90 Z" fill="#2a2a38"/>
          <g className="anime-arm-wave">
            <path d="M120 105 Q150 95 152 65" stroke="#2a2a38" strokeWidth="12" strokeLinecap="round" fill="none"/>
            <circle cx="152" cy="63" r="9" fill="#f2c9a0"/>
          </g>
          <path d="M60 105 Q45 130 52 150" stroke="#2a2a38" strokeWidth="12" strokeLinecap="round" fill="none"/>
          <circle cx="90" cy="70" r="38" fill="#f2c9a0"/>
          <path d="M52 60 Q60 15 90 18 Q125 14 130 58 Q112 40 90 42 Q66 40 52 60Z" fill="url(#animeHair)"/>
          <path d="M50 55 Q46 90 58 100 Q50 78 55 58Z" fill="url(#animeHair)"/>
          <path d="M130 55 Q136 88 122 100 Q132 76 126 58Z" fill="url(#animeHair)"/>
          <ellipse className="anime-eye" cx="76" cy="72" rx="5" ry="7" fill="#1a1a24"/>
          <ellipse className="anime-eye" cx="104" cy="72" rx="5" ry="7" fill="#1a1a24"/>
          <circle cx="78" cy="69" r="1.6" fill="#fff"/>
          <circle cx="106" cy="69" r="1.6" fill="#fff"/>
          <path d="M80 88 Q90 94 100 88" stroke="#c47b5a" strokeWidth="2" fill="none" strokeLinecap="round"/>
          <ellipse cx="63" cy="82" rx="6" ry="3.5" fill="var(--accent2)" opacity="0.35"/>
          <ellipse cx="117" cy="82" rx="6" ry="3.5" fill="var(--accent2)" opacity="0.35"/>
        </svg>
      </div>
    </div>);
}
function KairosMomentOverlay({ achievement, onDone }) {
    const particles = useMemo(() => Array.from({ length: 26 }, () => ({
        px: (Math.random() - 0.5) * 320, py: (Math.random() - 0.5) * 320, delay: Math.random() * 0.3
    })), [achievement && achievement.key]);
    useEffect(() => {
        playSfx("unlock");
        const t = setTimeout(onDone, 2800);
        return () => clearTimeout(t);
    }, [achievement]);
    if (!achievement)
        return null;
    return (<div className="kairos-moment-overlay" onClick={onDone}>
      <div style={{ position: "relative" }}>
        {particles.map((p, i) => (<div key={i} className="moment-particle" style={{ "--px": p.px + "px", "--py": p.py + "px", left: "50%", top: "50%", animationDelay: p.delay + "s" }}/>))}
        <div className="kairos-moment-card">
          <div style={{ fontSize: 11, letterSpacing: "0.14em", color: "var(--gold)", textTransform: "uppercase" }}>KAIROS Moment</div>
          <div className="serif" style={{ fontSize: 30, margin: "10px 0" }}>{achievement.label}</div>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>{achievement.desc}</div>
        </div>
      </div>
    </div>);
}
function LevelUpOverlay({ levelUp, onDone }) {
    const particles = useMemo(() => Array.from({ length: 30 }, () => ({
        px: (Math.random() - 0.5) * 360, py: (Math.random() - 0.5) * 360, delay: Math.random() * 0.35
    })), [levelUp && levelUp.to]);
    useEffect(() => {
        if (!levelUp)
            return;
        playSfx("unlock");
        const t = setTimeout(onDone, 3200);
        return () => clearTimeout(t);
    }, [levelUp]);
    if (!levelUp)
        return null;
    return (<div className="kairos-moment-overlay level-up-overlay" onClick={onDone}>
      <div style={{ position: "relative" }}>
        {particles.map((p, i) => (<div key={i} className="moment-particle" style={{ "--px": p.px + "px", "--py": p.py + "px", left: "50%", top: "50%", animationDelay: p.delay + "s", background: "var(--accent2)" }}/>))}
        <div className="kairos-moment-card level-up-card">
          <div style={{ fontSize: 11, letterSpacing: "0.14em", color: "var(--accent2)", textTransform: "uppercase" }}>Avtaara Evolution</div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, justifyContent: "center", margin: "16px 0", flexWrap: "wrap" }}>
            <div className="serif" style={{ fontSize: 19, color: "var(--muted)", textDecoration: "line-through" }}>{levelUp.from}</div>
            <div style={{ fontSize: 20, color: "var(--accent2)" }}>→</div>
            <div className="serif" style={{ fontSize: 32 }}>{levelUp.to}</div>
          </div>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>Real XP earned this. Nothing here was handed to you.</div>
        </div>
      </div>
    </div>);
}
const DAILY_CHALLENGES = [
    { id: "sched3", label: "Schedule 3 events today", xp: 15, check: (log, today) => log.filter(l => sameDay(l.ts, today) && l.text.startsWith("Scheduled")).length >= 3, progress: (log, today) => Math.min(3, log.filter(l => sameDay(l.ts, today) && l.text.startsWith("Scheduled")).length) + "/3" },
    { id: "content1", label: "Move content forward a pipeline stage", xp: 12, check: (log, today) => log.filter(l => sameDay(l.ts, today) && l.text.includes("→")).length >= 1, progress: (log, today) => Math.min(1, log.filter(l => sameDay(l.ts, today) && l.text.includes("→")).length) + "/1" },
    { id: "chaos1", label: "Survive the Chaos Lab", xp: 15, check: (log, today) => log.some(l => sameDay(l.ts, today) && l.text.includes("temporal integrity restored")), progress: (log, today) => log.some(l => sameDay(l.ts, today) && l.text.includes("temporal integrity restored")) ? "1/1" : "0/1" },
    { id: "focus1", label: "Complete one Focus Session", xp: 15, check: (log, today) => log.some(l => sameDay(l.ts, today) && l.text.includes("focus session")), progress: (log, today) => log.some(l => sameDay(l.ts, today) && l.text.includes("focus session")) ? "1/1" : "0/1" },
    { id: "test1", label: "Get every test passing", xp: 15, check: (log, today) => log.some(l => sameDay(l.ts, today) && l.text.includes("all tests passing")), progress: (log, today) => log.some(l => sameDay(l.ts, today) && l.text.includes("all tests passing")) ? "1/1" : "0/1" },
];
function sameDay(ts, today) { return new Date(ts).toDateString() === today; }
function todaysChallenge() {
    const day = new Date().toDateString();
    let hash = 0;
    for (let i = 0; i < day.length; i++)
        hash = (hash * 31 + day.charCodeAt(i)) >>> 0;
    return DAILY_CHALLENGES[hash % DAILY_CHALLENGES.length];
}
function Aperture({ opennessPct, size = 64 }) {
    const blades = 8;
    const outerR = 30, cx = 32, cy = 32;
    const innerR = 5 + opennessPct * 20;
    const closeAmount = 1 - opennessPct;
    return (<svg width={size} height={size} viewBox="0 0 64 64">
      <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="var(--panel-border)" strokeWidth="1.3"/>
      {Array.from({ length: blades }).map((_, i) => {
            const a1 = (360 / blades) * i * Math.PI / 180;
            const a2 = (360 / blades) * (i + 1) * Math.PI / 180;
            return (<path key={i} d={`M${cx} ${cy} L${cx + outerR * Math.cos(a1)} ${cy + outerR * Math.sin(a1)} L${cx + outerR * Math.cos(a2)} ${cy + outerR * Math.sin(a2)} Z`} fill="var(--accent)" opacity="0.22" style={{
                    transformOrigin: `${cx}px ${cy}px`,
                    transform: `rotate(${closeAmount * (360 / blades / 2.2)}deg) scale(${1 - opennessPct * 0.22})`,
                    transition: "transform 1.2s var(--ease-measure)"
                }}/>);
        })}
      <circle cx={cx} cy={cy} r={innerR} fill="var(--bg)" style={{ transition: "r 1.2s var(--ease-measure)" }}/>
      <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="var(--gold)" strokeWidth="1.4" opacity="0.75" style={{ transition: "r 1.2s var(--ease-measure)" }}/>
    </svg>);
}
function TemporalParticles({ type, count = 14, active }) {
    const particles = useMemo(() => Array.from({ length: count }, () => ({
        left: Math.random() * 100, top: Math.random() * 100,
        dx: ((Math.random() - 0.5) * 80).toFixed(0) + "px", dy: ((Math.random() - 0.5) * 80).toFixed(0) + "px",
        dur: (Math.random() * 3 + 2.5), delay: Math.random() * 2.4,
        sx: ((Math.random() - 0.5) * 140).toFixed(0) + "px", sy: ((Math.random() - 0.5) * 140).toFixed(0) + "px",
        len: (20 + Math.random() * 46).toFixed(0) + "px",
    })), [type, count, active]);
    if (!active)
        return null;
    return (<div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }} aria-hidden="true">
      {particles.map((p, i) => {
            if (type === "dust")
                return <div key={i} className="particle-dust" style={{ left: p.left + "%", top: p.top + "%", "--dx": p.dx, "--dy": p.dy, animationDuration: p.dur + "s", animationDelay: p.delay + "s" }}/>;
            if (type === "falling")
                return <div key={i} className="particle-falling" style={{ left: p.left + "%", animationDuration: (p.dur * 0.5) + "s", animationDelay: p.delay + "s" }}/>;
            if (type === "converge")
                return <div key={i} className="particle-converge" style={{ left: "50%", top: "50%", "--sx": p.sx, "--sy": p.sy, animationDelay: (i * 0.03) + "s" }}/>;
            if (type === "thread")
                return <div key={i} className="particle-thread" style={{ left: p.left + "%", top: p.top + "%", "--len": p.len, animationDelay: (i * 0.05) + "s" }}/>;
            return null;
        })}
    </div>);
}
function Ouroboros({ size = 26 }) {
    return (<svg width={size} height={size} viewBox="0 0 40 40" style={{ animation: "spin 16s linear infinite" }} title="Ouroboros — self-contained recurrence. The end feeds the beginning.">
      <circle cx="20" cy="20" r="14" fill="none" stroke="var(--accent2)" strokeWidth="2.4" strokeDasharray="80 8" strokeLinecap="round"/>
      <circle cx="33" cy="15.5" r="2.2" fill="var(--accent2)"/>
      <path d="M31 13 L34.5 12.2 M31.5 17 L34.5 18" stroke="var(--accent2)" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>);
}
function DailyChallengeCard({ activityLog, onClaim, claimed }) {
    const challenge = useMemo(() => todaysChallenge(), []);
    const today = new Date().toDateString();
    const done = challenge.check(activityLog, today);
    const progress = challenge.progress(activityLog, today);
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(id);
    }, []);
    const minutesElapsed = now.getHours() * 60 + now.getMinutes();
    const opennessPct = Math.max(0, 1 - (minutesElapsed / 1440));
    return (<div className="card" style={{ padding: "16px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ position: "relative", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
          {done ? "🏆" : "🎯"}
          <div style={{ position: "absolute", width: 4, height: 4, borderRadius: "50%", background: "var(--accent2)", top: "50%", left: "50%", "--orbit": "18px", animation: "orbitSpark 3.4s linear infinite", boxShadow: "0 0 5px 1px var(--accent2)" }} title="This challenge orbits back tomorrow — recurrence, not repetition."/>
        </div>
        <div style={{ flex: 1 }}>
          <div className="stat-label">Today's Challenge</div>
          <div style={{ fontSize: 14, fontWeight: 600, margin: "4px 0" }}>{challenge.label}</div>
          <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{progress} · +{challenge.xp} XP {done ? "— complete!" : "when finished"}</div>
        </div>
        <Aperture opennessPct={opennessPct} size={56}/>
        {done && !claimed && <button className="btn btn-primary" onClick={() => onClaim(challenge)}>Claim</button>}
        {done && claimed && <span className="pill" style={{ color: "var(--accent2)" }}>Claimed ✓</span>}
      </div>
      <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--panel-border)", display: "flex", alignItems: "center", gap: 8 }}>
        {done && claimed
            ? <Fragment><Ouroboros size={20}/><span>This challenge resets at midnight — today's end feeds tomorrow's beginning.</span></Fragment>
            : <span>The aperture on the right is today's actual KAIROS window — it closes for real, at midnight, whether or not you've used it.</span>}
      </div>
    </div>);
}
function Settings({ session, setSession, calm, setCalm, onLogout, secretUnlocked, muted, setMuted, autoReduced }) {
    const [theme, setTheme] = useState(session.theme);
    useEffect(() => { applyTheme(theme); }, [theme]);
    const visibleThemes = Object.entries(THEMES).filter(([, t]) => !t.secret || secretUnlocked);
    return (<div className="fade-in">
      <div className="topbar">
        <div className="serif" style={{ fontSize: 24 }}>Settings</div>
      </div>
      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <div className="section-title">Atmosphere{secretUnlocked ? " · a secret world has been found" : ""}</div>
        <div className="theme-grid">
          {visibleThemes.map(([key, t]) => (<div key={key} className={"theme-chip" + (theme === key ? " active" : "")} style={{ background: `linear-gradient(135deg, ${t.accent}, ${t.accent2})` }} onClick={() => { setTheme(key); setSession(s => ({ ...s, theme: key })); }}>
              {t.label}
            </div>))}
        </div>
      </div>
      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <div className="toggle-row">
          <span>Calm mode — reduce all motion</span>
          <label className="switch"><input type="checkbox" checked={calm} onChange={e => setCalm(e.target.checked)}/><span className="slider"/></label>
        </div>
        <div className="toggle-row">
          <span>Sound effects</span>
          <label className="switch"><input type="checkbox" checked={!muted} onChange={e => setMuted(!e.target.checked)}/><span className="slider"/></label>
        </div>
      </div>
      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <div className="section-title">Adaptive Performance</div>
        <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>Not a toggle — this measures real frame rate continuously and automatically reduces cursor/tilt/particle effects if it drops below ~30fps, restoring them once it recovers above ~50fps. Stress it for real in the Chaos Lab or Benchmark Arena and watch this change.</div>
        <span className="pill" style={{ color: autoReduced ? "var(--gold)" : "var(--accent2)" }}>{autoReduced ? "⚙ currently reduced — measured strain" : "✓ running at full effects"}</span>
      </div>
      <div className="card" style={{ padding: 20 }}>
        <div className="section-title">Role</div>
        <div className="role-row">
          {Object.entries(ROLES).map(([key, r]) => (<div key={key} className={"role-chip" + (session.role === key ? " active" : "")} onClick={() => setSession(s => ({ ...s, role: key }))}>{r.label}</div>))}
        </div>
        <button className="btn" style={{ marginTop: 18 }} onClick={onLogout}>Sign out</button>
      </div>
    </div>);
}
function useNotifications() {
    const [toasts, setToasts] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const push = useCallback((text, tone) => {
        const id = Date.now() + Math.random();
        setToasts(t => [...t, { id, text, tone: tone || "default", popping: false }]);
        setTimeout(() => {
            setToasts(t => t.map(x => x.id === id ? { ...x, popping: true } : x));
            setTimeout(() => { setToasts(t => t.filter(x => x.id !== id)); }, 380);
        }, 3820);
        setNotifications(n => [{ id, text, tone: tone || "default", ts: Date.now(), read: false }, ...n].slice(0, 40));
    }, []);
    const markAllRead = useCallback(() => {
        setNotifications(n => n.map(x => ({ ...x, read: true })));
    }, []);
    const unreadCount = notifications.filter(n => !n.read).length;
    return { toasts, notifications, push, markAllRead, unreadCount };
}
function ToastStack({ toasts }) {
    return (<div className="toast-stack">
      {toasts.map(t => (<div key={t.id} className={"toast" + (t.popping ? " toast-pop" : "")} style={{ borderColor: t.tone === "success" ? "var(--accent2)" : t.tone === "error" ? "var(--danger)" : undefined }}>
          {t.text}
        </div>))}
    </div>);
}
function NotificationBell({ notifications, unreadCount, onOpen }) {
    const [open, setOpen] = useState(false);
    return (<div style={{ position: "relative" }}>
      <div className="notif-bell" onClick={() => { setOpen(o => !o); if (!open)
        onOpen(); }}>
        🔔
        {unreadCount > 0 && <span className="notif-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>}
      </div>
      {open &&
            <div className="card notif-panel" onMouseLeave={() => setOpen(false)}>
          {notifications.length === 0 && <div style={{ padding: 16, fontSize: 12.5, color: "var(--muted)" }}>Nothing yet — go do something real.</div>}
          {notifications.map(n => (<div key={n.id} className={"notif-item" + (n.read ? "" : " unread")}>
              <div className="body">
                {n.text}
                <div className="notif-time">{new Date(n.ts).toLocaleTimeString()}</div>
              </div>
            </div>))}
        </div>}
    </div>);
}
function CommandPalette({ open, onClose, commands }) {
    const [query, setQuery] = useState("");
    const [activeIdx, setActiveIdx] = useState(0);
    const inputRef = useRef(null);
    useEffect(() => {
        if (open) {
            setQuery("");
            setActiveIdx(0);
            setTimeout(() => inputRef.current && inputRef.current.focus(), 30);
        }
    }, [open]);
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q)
            return commands;
        return commands.filter(c => c.label.toLowerCase().includes(q) || (c.hint || "").toLowerCase().includes(q));
    }, [query, commands]);
    function run(cmd) {
        if (!cmd)
            return;
        playSfx("click");
        cmd.action();
        onClose();
    }
    function onKeyDown(e) {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIdx(i => Math.min(filtered.length - 1, i + 1));
        }
        else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIdx(i => Math.max(0, i - 1));
        }
        else if (e.key === "Enter") {
            e.preventDefault();
            run(filtered[activeIdx]);
        }
        else if (e.key === "Escape") {
            onClose();
        }
    }
    if (!open)
        return null;
    return (<div className="palette-backdrop" onClick={onClose}>
      <div className="card palette-box" onClick={e => e.stopPropagation()}>
        <input ref={inputRef} className="palette-input" placeholder="Type a command or search pages…" value={query} onChange={e => { setQuery(e.target.value); setActiveIdx(0); }} onKeyDown={onKeyDown}/>
        <div className="palette-list">
          {filtered.length === 0 && <div className="palette-empty">No matching commands.</div>}
          {filtered.map((c, i) => (<div key={c.label} className={"palette-item" + (i === activeIdx ? " active" : "")} onMouseEnter={() => setActiveIdx(i)} onClick={() => run(c)}>
              <span>{c.label}</span>
              <span className="hint">{c.hint || ""}</span>
            </div>))}
        </div>
      </div>
    </div>);
}
const TIPS = [
    "memo compares props with Object.is by default — a new inline object always fails that check.",
    "useCallback doesn't make a function faster. It makes its identity stable so memoized children can trust it.",
    "useMemo is for values, not side effects — it can be dropped without breaking correctness, only performance.",
    "Keys tell React which items are which across renders. Index keys lie the moment your list reorders.",
    "A component re-rendering isn't automatically a problem — the DOM only updates where the output actually differs.",
    "Structural sharing means only the part of your data that changed gets a new reference — everything else stays put.",
    "useTransition lets you mark an update as non-urgent, so React can keep the UI responsive while it works.",
    "The React DevTools Profiler will show you real render costs — trust measurements over intuition.",
];
function TipCarousel() {
    const [idx, setIdx] = useState(() => Math.floor(Math.random() * TIPS.length));
    useEffect(() => {
        const id = setInterval(() => setIdx(i => (i + 1) % TIPS.length), 9000);
        return () => clearInterval(id);
    }, []);
    return (<div className="card" style={{ padding: "14px 18px", display: "flex", gap: 12, alignItems: "flex-start" }}>
      <span style={{ fontSize: 18 }}>💡</span>
      <div>
        <div className="stat-label">Did you know</div>
        <div key={idx} className="fade-in" style={{ fontSize: 13, color: "var(--text)", marginTop: 4, lineHeight: 1.5 }}>{TIPS[idx]}</div>
      </div>
    </div>);
}
function FocusTimer({ onComplete }) {
    const DURATION = 25 * 60;
    const [remaining, setRemaining] = useState(DURATION);
    const [running, setRunning] = useState(false);
    const doneRef = useRef(false);
    useEffect(() => {
        if (!running)
            return;
        const id = setInterval(() => {
            setRemaining(r => {
                if (r <= 1) {
                    clearInterval(id);
                    setRunning(false);
                    if (!doneRef.current) {
                        doneRef.current = true;
                        if (onComplete)
                            onComplete();
                    }
                    return 0;
                }
                return r - 1;
            });
        }, 1000);
        return () => clearInterval(id);
    }, [running]);
    const pct = 1 - remaining / DURATION;
    const r = 46;
    const circumference = 2 * Math.PI * r;
    const mins = Math.floor(remaining / 60), secs = remaining % 60;
    function toggle() {
        if (remaining === 0) {
            setRemaining(DURATION);
            doneRef.current = false;
            setRunning(true);
        }
        else
            setRunning(x => !x);
    }
    function reset() { setRunning(false); setRemaining(DURATION); doneRef.current = false; }
    return (<div className="card" style={{ padding: 20, display: "flex", gap: 18, alignItems: "center" }}>
      <div className="timer-ring-wrap">
        <svg width="110" height="110" viewBox="0 0 110 110">
          <circle cx="55" cy="55" r={r} fill="none" stroke="var(--panel-border)" strokeWidth="6"/>
          <circle cx="55" cy="55" r={r} fill="none" stroke="var(--accent)" strokeWidth="6" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - pct)} transform="rotate(-90 55 55)" style={{ transition: "stroke-dashoffset 1s linear" }}/>
        </svg>
        <div className="timer-text">{String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}</div>
      </div>
      <div>
        <div className="stat-label">Focus Session</div>
        <div style={{ fontSize: 12, color: "var(--muted)", margin: "4px 0 10px" }}>A real 25-minute countdown — completing one logs a real activity.</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-primary" onClick={toggle}>{running ? "Pause" : remaining === 0 ? "Restart" : "Start"}</button>
          <button className="btn" onClick={reset}>Reset</button>
        </div>
      </div>
    </div>);
}
const KONAMI_SEQUENCE = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
function chronoPeriod(hour) {
    if (hour >= 5 && hour < 8)
        return { name: "Dawn", icon: "🌅", filter: "brightness(1.05) sepia(0.05) saturate(1.05)" };
    if (hour >= 8 && hour < 17)
        return { name: "Day", icon: "☀", filter: "none" };
    if (hour >= 17 && hour < 20)
        return { name: "Dusk", icon: "🌇", filter: "brightness(0.97) sepia(0.08) saturate(1.08)" };
    return { name: "Night", icon: "🌙", filter: "brightness(0.88) hue-rotate(-4deg)" };
}
function startFpsMonitor(onDegraded, onRecovered) {
    let frames = 0;
    let windowStart = performance.now();
    let degraded = false;
    let lowStreak = 0;
    let rafId = null;
    function tick(now) {
        frames += 1;
        if (now - windowStart >= 1000) {
            const fps = (frames * 1000) / (now - windowStart);
            frames = 0;
            windowStart = now;
            if (fps < 30) {
                lowStreak += 1;
                if (lowStreak >= 2 && !degraded) {
                    degraded = true;
                    onDegraded(Math.round(fps));
                }
            }
            else {
                lowStreak = 0;
                if (fps > 50 && degraded) {
                    degraded = false;
                    onRecovered(Math.round(fps));
                }
            }
        }
        rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);
    return () => { if (rafId)
        cancelAnimationFrame(rafId); };
}
function setupGlobalInteractions() {
    const TRAIL_LEN = 7;
    const trailEls = [];
    for (let i = 0; i < TRAIL_LEN; i++) {
        const d = document.createElement("div");
        d.className = "cursor-trail-dot";
        d.style.opacity = String(1 - i / TRAIL_LEN);
        d.style.width = d.style.height = (7 - i * 0.6) + "px";
        document.body.appendChild(d);
        trailEls.push({ el: d, x: 0, y: 0 });
    }
    let mouseX = -100, mouseY = -100;
    let rafId = null;
    function onMouseMove(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        const magnet = e.target.closest && e.target.closest(".btn-primary");
        document.querySelectorAll(".btn-primary.magnet-active").forEach(el => {
            if (el !== magnet)
                el.style.transform = "";
        });
        if (magnet) {
            const rect = magnet.getBoundingClientRect();
            const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
            const dx = (e.clientX - cx) * 0.22, dy = (e.clientY - cy) * 0.22;
            magnet.classList.add("magnet-active");
            magnet.style.transform = `translate(${dx}px, ${dy}px)`;
        }
        const tiltTarget = e.target.closest && e.target.closest(".tilt");
        document.querySelectorAll(".tilt.tilt-active").forEach(el => {
            if (el !== tiltTarget) {
                el.style.transform = "";
                el.classList.remove("tilt-active");
            }
        });
        if (tiltTarget) {
            const rect = tiltTarget.getBoundingClientRect();
            const nx = (e.clientX - rect.left) / rect.width - 0.5;
            const ny = (e.clientY - rect.top) / rect.height - 0.5;
            tiltTarget.classList.add("tilt-active");
            tiltTarget.style.transform = `perspective(700px) rotateX(${ny * -7}deg) rotateY(${nx * 7}deg) translateZ(4px)`;
        }
    }
    function onMouseDown(e) {
        const btn = e.target.closest && e.target.closest(".btn");
        if (!btn)
            return;
        const rect = btn.getBoundingClientRect();
        const span = document.createElement("span");
        span.className = "btn-ripple";
        const size = Math.max(rect.width, rect.height) * 1.4;
        span.style.width = span.style.height = size + "px";
        span.style.left = (e.clientX - rect.left) + "px";
        span.style.top = (e.clientY - rect.top) + "px";
        btn.appendChild(span);
        setTimeout(() => span.remove(), 600);
    }
    function tick() {
        let leadX = mouseX, leadY = mouseY;
        trailEls.forEach((t, i) => {
            const lag = i === 0 ? 0.5 : 0.35;
            t.x += (leadX - t.x) * lag;
            t.y += (leadY - t.y) * lag;
            t.el.style.transform = `translate(${t.x}px, ${t.y}px) translate(-50%,-50%)`;
            leadX = t.x;
            leadY = t.y;
        });
        rafId = requestAnimationFrame(tick);
    }
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mousedown", onMouseDown);
    rafId = requestAnimationFrame(tick);
    return function cleanup() {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mousedown", onMouseDown);
        if (rafId)
            cancelAnimationFrame(rafId);
        trailEls.forEach(t => t.el.remove());
    };
}
function App() {
    const [session, setSession] = useState(null);
    const [showGreeter, setShowGreeter] = useState(false);
    const [page, setPage] = useState("command");
    const [calm, setCalm] = useState(false);
    const [skin, setSkin] = useState("default");
    const [muted, setMutedState] = useState(false);
    const [autoReduced, setAutoReduced] = useState(false);
    const [showOpening, setShowOpening] = useState(() => {
        try {
            return !sessionStorage.getItem("kairos-opening-seen");
        }
        catch (e) {
            return true;
        }
    });
    const [flags, setFlags] = useState({ optimizerUnlocked: false, testsAllPassed: false, chaosSurvived: false, easterEggFound: false });
    const [celebrating, setCelebrating] = useState(null);
    const [levelUp, setLevelUp] = useState(null);
    const [challengeClaimed, setChallengeClaimed] = useState(false);
    const prevLevelRef = useRef(null);
    const [unlocked, setUnlocked] = useState({});
    const [paletteOpen, setPaletteOpen] = useState(false);
    const [maDaysRaw, setMaDaysRaw] = useState(() => new Set());
    const [literaryMode, setLiteraryMode] = useState(false);
    const unlockedRef = useRef({});
    const activity = useActivityTracker();
    const store = useEventStore(activity.bump);
    const content = useContentStore(activity.bump);
    const toasts = useNotifications();
    function setMaDays(updater) {
        setMaDaysRaw(prev => {
            const next = typeof updater === "function" ? updater(prev) : updater;
            if (next.size > prev.size)
                activity.bump("Left a day as Ma — unclaimed on purpose", 2);
            return next;
        });
    }
    function setFlag(key) {
        setFlags(f => f[key] ? f : { ...f, [key]: true });
    }
    function setMuted(val) {
        window.__kairosMuted = val;
        setMutedState(val);
    }
    useEffect(() => {
        document.body.classList.toggle("calm", calm);
    }, [calm]);
    useEffect(() => {
        if (calm || autoReduced)
            return;
        const cleanup = setupGlobalInteractions();
        return cleanup;
    }, [calm, autoReduced]);
    useEffect(() => {
        document.body.classList.toggle("perf-reduced", autoReduced);
    }, [autoReduced]);
    useEffect(() => {
        const stop = startFpsMonitor((fps) => {
            setAutoReduced(true);
            toasts.push(`⚙ Adaptive Performance: measured ${fps}fps, reduced effects for smoothness`, "default");
        }, (fps) => {
            setAutoReduced(false);
            toasts.push(`✓ Performance recovered (${fps}fps) — effects restored`, "success");
        });
        return stop;
    }, []);
    useEffect(() => {
        let lastFired = null;
        const id = setInterval(() => {
            const now = new Date();
            const key = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
            if (TIME_ALIGNMENTS[key] && lastFired !== key) {
                lastFired = key;
                toasts.push(TIME_ALIGNMENTS[key], "success");
                playSfx("unlock");
            }
        }, 1000);
        return () => clearInterval(id);
    }, []);
    useEffect(() => {
        function updateChrono() {
            const period = chronoPeriod(new Date().getHours());
            const todayCount = store.events.filter(e => e.day === new Date().getDate()).length;
            const densityBoost = Math.min(0.18, todayCount * 0.035);
            const densityFilter = todayCount > 0 ? `saturate(${(1 + densityBoost).toFixed(2)}) brightness(${(1 + densityBoost * 0.4).toFixed(2)})` : `saturate(0.92)`;
            document.documentElement.style.setProperty("--chrono-filter", period.filter);
            document.documentElement.style.setProperty("--density-filter", densityFilter);
        }
        updateChrono();
        const id = setInterval(updateChrono, 5 * 60 * 1000);
        return () => clearInterval(id);
    }, [store.events]);
    useEffect(() => {
        function onKey(e) {
            const isK = e.key.toLowerCase() === "k";
            if ((e.metaKey || e.ctrlKey) && isK) {
                e.preventDefault();
                setPaletteOpen(p => !p);
            }
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);
    useEffect(() => {
        let idx = 0;
        function onKey(e) {
            const expected = KONAMI_SEQUENCE[idx];
            const got = e.key.length === 1 ? e.key.toLowerCase() : e.key;
            if (got === expected) {
                idx += 1;
                if (idx === KONAMI_SEQUENCE.length) {
                    setFlag("easterEggFound");
                    toasts.push("✧ Secret world found — check Settings for Nebula", "success");
                    idx = 0;
                }
            }
            else {
                idx = (got === KONAMI_SEQUENCE[0]) ? 1 : 0;
            }
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);
    useEffect(() => {
        const ctx = { actionCount: activity.count, content, activityLog: activity.log, flags, maDaysCount: maDaysRaw.size };
        const nextUnlocked = {};
        let newlyUnlocked = null;
        ACHIEVEMENTS.forEach(a => {
            const was = unlockedRef.current[a.key];
            const now = !!a.check(ctx);
            nextUnlocked[a.key] = now;
            if (now && !was)
                newlyUnlocked = a;
        });
        unlockedRef.current = nextUnlocked;
        setUnlocked(nextUnlocked);
        if (newlyUnlocked) {
            setCelebrating(newlyUnlocked);
            toasts.push(`★ Achievement unlocked — ${newlyUnlocked.label}`, "success");
        }
    }, [activity.count, activity.log, content.items, flags, maDaysRaw]);
    useEffect(() => {
        const { level } = currentLevel(activity.xp);
        if (prevLevelRef.current && prevLevelRef.current.name !== level.name) {
            setLevelUp({ from: prevLevelRef.current.name, to: level.name });
            toasts.push(`⬆ Avtaara evolved — ${level.name}`, "success");
        }
        prevLevelRef.current = level;
    }, [activity.xp]);
    if (showOpening) {
        return <OpeningSequence onDone={() => {
                try {
                    sessionStorage.setItem("kairos-opening-seen", "1");
                }
                catch (e) { }
                setShowOpening(false);
            }}/>;
    }
    if (!session) {
        return <Login onEnter={(s) => { setSession(s); applyTheme(s.theme); setShowGreeter(true); }}/>;
    }
    const theme = THEMES[session.theme];
    const commands = [
        { label: "Go to Command Center", hint: "Studio", action: () => setPage("command") },
        { label: "Go to Calendar", hint: "Studio", action: () => setPage("calendar") },
        { label: "Go to Content Studio", hint: "Studio", action: () => setPage("content") },
        { label: "Go to Vibe Lab", hint: "Studio", action: () => setPage("vibe") },
        { label: "Go to Scheduler Duel", hint: "Engineering", action: () => setPage("schedulerlab") },
        { label: "Go to Optimization Duel", hint: "Engineering", action: () => setPage("duel") },
        { label: "Go to Rendering Observatory", hint: "Engineering", action: () => setPage("observatory") },
        { label: "Go to Benchmark Arena", hint: "Engineering", action: () => setPage("benchmark") },
        { label: "Go to Chaos Lab", hint: "Engineering", action: () => setPage("chaos") },
        { label: "Go to Test Command Center", hint: "Verification", action: () => setPage("tests") },
        { label: "Go to Coverage Lab", hint: "Verification", action: () => setPage("coverage") },
        { label: "Go to Network Lab", hint: "Verification", action: () => setPage("network") },
        { label: "Go to Time Machine", hint: "History", action: () => setPage("timemachine") },
        { label: "Go to Temporal River", hint: "History", action: () => setPage("river") },
        { label: "Go to Analytics & Pulse", hint: "History", action: () => setPage("analytics") },
        { label: "Go to Achievements", hint: "Progress", action: () => setPage("achievements") },
        { label: "Go to Settings", hint: "", action: () => setPage("settings") },
        { label: calm ? "Turn off Calm Mode" : "Turn on Calm Mode", hint: "toggle", action: () => setCalm(c => !c) },
        { label: muted ? "Unmute sound effects" : "Mute sound effects", hint: "toggle", action: () => setMuted(!muted) },
        ...Object.keys(THEMES).filter(k => !THEMES[k].secret || flags.easterEggFound).map(k => ({ label: `Switch theme → ${THEMES[k].label}`, hint: "theme", action: () => { setSession(s => ({ ...s, theme: k })); applyTheme(k); } })),
        ...content.items.map(it => ({ label: `Content: ${it.title}`, hint: STAGE_LABELS[it.stage], action: () => setPage("content") })),
        ...store.events.map(ev => ({ label: `Event: ${ev.title}`, hint: `day ${ev.day}`, action: () => setPage("calendar") })),
    ];
    return (<div className="shell">
      <Atmosphere kind={theme.kind}/>
      <Sidebar page={page} setPage={setPage} session={session} onOpenPalette={() => setPaletteOpen(true)} notifications={toasts.notifications} unreadCount={toasts.unreadCount} onOpenNotifications={toasts.markAllRead} archetypeCtx={{
            maDaysCount: maDaysRaw.size,
            timeMachineRestores: activity.log.filter(l => l.text.startsWith("Restored to")).length,
            optimizerUnlocked: flags.optimizerUnlocked,
            contentItemsCount: content.items.length,
            historyLength: store.history.length,
            hasEmptyDayAhead: !store.events.some(e => e.day === new Date().getDate()),
        }}/>
      <div className="main">
        {page === "command" && <CommandCenter session={session} setPage={setPage} skin={skin} events={store.events} bump={activity.bump} activityLog={activity.log} challengeClaimed={challengeClaimed} onClaimChallenge={(challenge) => { setChallengeClaimed(true); activity.bump(`Claimed daily challenge: ${challenge.label}`, challenge.xp); toasts.push(`+${challenge.xp} XP claimed`, "success"); }}/>}
        {page === "calendar" && <Calendar events={store.events} onAdd={store.addEvent} onRemove={store.removeEvent} onMove={store.moveEvent} maDays={maDaysRaw} setMaDays={setMaDays}/>}
        {page === "content" && <ContentStudio content={content}/>}
        {page === "ideas" && <IdeaLab content={content}/>}
        {page === "schedulerlab" && <SchedulerDuel events={store.events} onAdd={store.addEvent} onRemove={store.removeEvent} onMove={store.moveEvent} onOptimizerUnlocked={() => { setFlag("optimizerUnlocked"); activity.bump("Scheduler Duel: all four optimizations enabled", 15); }}/>}
        {page === "duel" && <OptimizationDuel />}
        {page === "observatory" && <RenderingObservatory setPage={setPage}/>}
        {page === "benchmark" && <BenchmarkArena />}
        {page === "chaos" && <ChaosLab onSurvived={() => { setFlag("chaosSurvived"); activity.bump("Chaos Lab: temporal integrity restored", 15); toasts.push("Temporal integrity restored.", "success"); }}/>}
        {page === "tests" && <TestCommandCenter onAllPassed={() => { setFlag("testsAllPassed"); activity.bump("Test Command Center: all tests passing", 15); toasts.push("All tests passing.", "success"); }}/>}
        {page === "coverage" && <CoverageLab />}
        {page === "network" && <NetworkLab />}
        {page === "timemachine" && <TimeMachine history={store.history} onRestore={store.restore}/>}
        {page === "river" && <TemporalRiver events={store.events} content={content}/>}
        {page === "analytics" && <AnalyticsPulse events={store.events} content={content} activity={activity}/>}
        {page === "achievements" && <AchievementCenter unlocked={unlocked} xp={activity.xp}/>}
        {page === "vibe" && <VibeLab skin={skin} setSkin={setSkin}/>}
        {page === "settings" && <Settings session={session} setSession={setSession} calm={calm} setCalm={setCalm} onLogout={() => setSession(null)} secretUnlocked={flags.easterEggFound} muted={muted} setMuted={setMuted} autoReduced={autoReduced}/>}
      </div>
      <KairosMomentOverlay achievement={celebrating} onDone={() => setCelebrating(null)}/>
      <LevelUpOverlay levelUp={levelUp} onDone={() => setLevelUp(null)}/>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} commands={commands}/>
      <ToastStack toasts={toasts.toasts}/>
      <Companion />
      <AnimeGreeter show={showGreeter} name={session.name} onDone={() => setShowGreeter(false)}/>
    </div>);
}
export default App;
