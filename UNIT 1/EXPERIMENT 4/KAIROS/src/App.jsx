import { useState, useEffect, useRef } from "react";
import { Login } from "./components/Login";
import { OpeningSequence } from "./components/OpeningSequence";
import { Sidebar } from "./components/layout/Sidebar";
import { AchievementCenter } from "./components/pages/AchievementCenter";
import { AnalyticsPulse } from "./components/pages/AnalyticsPulse";
import { BenchmarkArena } from "./components/pages/BenchmarkArena";
import { Calendar } from "./components/pages/Calendar";
import { ChaosLab } from "./components/pages/ChaosLab";
import { CommandCenter } from "./components/pages/CommandCenter";
import { ContentStudio } from "./components/pages/ContentStudio";
import { CoverageLab } from "./components/pages/CoverageLab";
import { IdeaLab } from "./components/pages/IdeaLab";
import { NetworkLab } from "./components/pages/NetworkLab";
import { OptimizationDuel } from "./components/pages/OptimizationDuel";
import { RenderingObservatory } from "./components/pages/RenderingObservatory";
import { SchedulerDuel } from "./components/pages/SchedulerDuel";
import { Settings } from "./components/pages/Settings";
import { TemporalRiver } from "./components/pages/TemporalRiver";
import { TestCommandCenter } from "./components/pages/TestCommandCenter";
import { TimeMachine } from "./components/pages/TimeMachine";
import { VibeLab } from "./components/pages/VibeLab";
import { WeekRenderMonitor } from "./components/pages/WeekRenderMonitor";
import { AnimeGreeter } from "./components/shared/AnimeGreeter";
import { Atmosphere } from "./components/shared/Atmosphere";
import { CommandPalette } from "./components/shared/CommandPalette";
import { Companion } from "./components/shared/Companion";
import { KairosMomentOverlay } from "./components/shared/KairosMomentOverlay";
import { LevelUpOverlay } from "./components/shared/LevelUpOverlay";
import { MasterpieceLayer } from "./components/shared/MasterpieceLayer";
import { ToastStack } from "./components/shared/ToastStack";
import { TemporalNexus } from "./components/shared/TemporalNexus";
import { ACHIEVEMENTS } from "./data/achievements";
import { TIME_ALIGNMENTS, currentLevel } from "./data/archetypes";
import { THEMES, applyTheme } from "./data/theme";
import { useNotifications } from "./hooks/useNotifications";
import { playSfx } from "./lib/audio";
import { chronoPeriod } from "./lib/chrono";
import { dateKeyFromDate, eventDateKey } from "./lib/dateUtils";
import { startFpsMonitor } from "./lib/fpsMonitor";
import { setupGlobalInteractions } from "./lib/globalInteractions";
import { KONAMI_SEQUENCE } from "./lib/konami";
import { STAGE_LABELS, useContentStore } from "./state/contentStore";
import { coverage, useEventStore } from "./state/eventStore";
import { useActivityTracker } from "./state/useActivityTracker";

function App() {
    const [session, setSession] = useState(() => {
        try { return JSON.parse(localStorage.getItem("kairos-session-v1") || "null"); } catch (e) { return null; }
    });
    const [showGreeter, setShowGreeter] = useState(false);
    const [page, setPage] = useState("command");
    const [calm, setCalm] = useState(false);
    const [skin, setSkin] = useState("default");
    const [muted, setMutedState] = useState(() => {
        try { return localStorage.getItem("kairos-muted-v1") === "1"; } catch (e) { return false; }
    });
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
    const [maDaysRaw, setMaDaysRaw] = useState(() => {
        try {
            const raw = JSON.parse(localStorage.getItem("kairos-ma-days-v3") || localStorage.getItem("kairos-ma-days-v2") || "[]");
            const now = new Date();
            return new Set(raw.map(value => {
                if (typeof value === "number") return dateKeyFromDate(new Date(now.getFullYear(), now.getMonth(), value));
                return String(value);
            }).filter(Boolean));
        } catch (e) { return new Set(); }
    });
    const [literaryMode, setLiteraryMode] = useState(false);
    const [themeTransition, setThemeTransition] = useState(false);
    const previousThemeRef = useRef(null);
    const unlockedRef = useRef({});
    const activity = useActivityTracker();
    const store = useEventStore(activity.bump);
    const content = useContentStore(activity.bump);
    const toasts = useNotifications();
    useEffect(() => {
        try {
            if (session) localStorage.setItem("kairos-session-v1", JSON.stringify(session));
            else localStorage.removeItem("kairos-session-v1");
        } catch (e) { }
    }, [session]);
    useEffect(() => {
        try { localStorage.setItem("kairos-muted-v1", muted ? "1" : "0"); } catch (e) { }
    }, [muted]);
    useEffect(() => {
        try { localStorage.setItem("kairos-ma-days-v3", JSON.stringify([...maDaysRaw])); } catch (e) { }
    }, [maDaysRaw]);
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
        const titles = { command: "Command Center", calendar: "Calendar", content: "Content Studio", ideas: "Idea Lab", schedulerlab: "Scheduler Duel", duel: "Optimization Duel", weekmonitor: "Week Render Monitor", observatory: "Rendering Observatory", benchmark: "Benchmark Arena", chaos: "Chaos Lab", tests: "Test Command Center", coverage: "Coverage Lab", network: "Network Lab", timemachine: "Time Machine", river: "Temporal River", analytics: "Analytics & Pulse", achievements: "Achievements", vibe: "Vibe Lab", settings: "Settings" };
        document.title = `KAIROS — ${titles[page] || "Temporal Workspace"}`;
        window.scrollTo({ top: 0, behavior: "auto" });
    }, [page]);
    useEffect(() => {
        document.body.classList.toggle("calm", calm);
    }, [calm]);
    useEffect(() => {
        if (session?.theme) applyTheme(session.theme);
        window.__kairosSession = session;
        return () => { delete window.__kairosSession; };
    }, [session]);
    useEffect(() => {
        if (!session?.theme) return;
        if (previousThemeRef.current === null) {
            previousThemeRef.current = session.theme;
            return;
        }
        if (previousThemeRef.current === session.theme) return;
        previousThemeRef.current = session.theme;
        setThemeTransition(true);
        const id = window.setTimeout(() => setThemeTransition(false), 760);
        return () => window.clearTimeout(id);
    }, [session?.theme]);
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
            const now = new Date();
            const todayKey = dateKeyFromDate(now);
            const todayCount = store.events.filter(e => eventDateKey(e) === todayKey).length;
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
            if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey && !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) {
                e.preventDefault();
                setPaletteOpen(true);
                return;
            }
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
        ...store.events.map(ev => ({ label: `Event: ${ev.title}`, hint: ev.date ? ev.date : `day ${ev.day}`, action: () => setPage("calendar") })),
    ];
    return (<div className="shell">
      <a className="skip-link" href="#kairos-main">Skip to main content</a>
      <Atmosphere kind={theme.kind}/>
      <MasterpieceLayer setPage={setPage} calm={calm} autoReduced={autoReduced}/>
      <div className="ambient-vignette" aria-hidden="true"/>
      {themeTransition && <div className="theme-transition" aria-hidden="true"><span className="theme-transition-ring"/><span className="theme-transition-core"/></div>}
      <Sidebar page={page} setPage={setPage} session={session} onOpenPalette={() => setPaletteOpen(true)} notifications={toasts.notifications} unreadCount={toasts.unreadCount} onOpenNotifications={toasts.markAllRead} archetypeCtx={{
            maDaysCount: maDaysRaw.size,
            timeMachineRestores: activity.log.filter(l => l.text.startsWith("Restored to")).length,
            optimizerUnlocked: flags.optimizerUnlocked,
            contentItemsCount: content.items.length,
            historyLength: store.history.length,
            hasEmptyDayAhead: !store.events.some(e => eventDateKey(e) === dateKeyFromDate(new Date())),
        }}/>
      <main className="main" id="kairos-main" tabIndex={-1}>
        <div key={page} className={`page-shell page-shell-${page}`}>
          {page === "command" && <CommandCenter session={session} setPage={setPage} skin={skin} events={store.events} bump={activity.bump} activityLog={activity.log} challengeClaimed={challengeClaimed} onClaimChallenge={(challenge) => { setChallengeClaimed(true); activity.bump(`Claimed daily challenge: ${challenge.label}`, challenge.xp); toasts.push(`+${challenge.xp} XP claimed`, "success"); }}/>}
          {page === "calendar" && <Calendar events={store.events} onAdd={store.addEvent} onRemove={store.removeEvent} onMove={store.moveEvent} maDays={maDaysRaw} setMaDays={setMaDays}/>}
          {page === "content" && <ContentStudio content={content}/>}
          {page === "ideas" && <IdeaLab content={content}/>}
          {page === "schedulerlab" && <SchedulerDuel events={store.events} onAdd={store.addEvent} onRemove={store.removeEvent} onMove={store.moveEvent} onOptimizerUnlocked={() => { setFlag("optimizerUnlocked"); activity.bump("Scheduler Duel: all four optimizations enabled", 15); }}/>}
          {page === "duel" && <OptimizationDuel />}
          {page === "weekmonitor" && <WeekRenderMonitor />}
          {page === "observatory" && <RenderingObservatory setPage={setPage}/>}
          {page === "benchmark" && <BenchmarkArena />}
          {page === "chaos" && <ChaosLab onSurvived={() => { setFlag("chaosSurvived"); activity.bump("Chaos Lab: temporal integrity restored", 15); toasts.push("Temporal integrity restored.", "success"); }}/>}
          {page === "tests" && <TestCommandCenter onAllPassed={() => { setFlag("testsAllPassed"); activity.bump("Test Command Center: all tests passing", 15); toasts.push("All tests passing.", "success"); }}/>}
          {page === "coverage" && <CoverageLab />}
          {page === "network" && <NetworkLab />}
          {page === "timemachine" && <TimeMachine history={store.history} onRestore={store.restore} activity={activity}/>}
          {page === "river" && <TemporalRiver events={store.events} content={content}/>}
          {page === "analytics" && <AnalyticsPulse events={store.events} content={content} activity={activity}/>}
          {page === "achievements" && <AchievementCenter unlocked={unlocked} xp={activity.xp}/>}
          {page === "vibe" && <VibeLab skin={skin} setSkin={setSkin}/>}
          {page === "settings" && <Settings session={session} setSession={setSession} calm={calm} setCalm={setCalm} onLogout={() => setSession(null)} secretUnlocked={flags.easterEggFound} muted={muted} setMuted={setMuted} autoReduced={autoReduced} onResetWorkspace={() => { store.clearWorkspace(); setMaDaysRaw(new Set()); }}/>}
        </div>
      </main>
      <KairosMomentOverlay achievement={celebrating} onDone={() => setCelebrating(null)}/>
      <LevelUpOverlay levelUp={levelUp} onDone={() => setLevelUp(null)}/>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} commands={commands}/>
      <ToastStack toasts={toasts.toasts}/>
      <TemporalNexus session={session} setSession={setSession} setPage={setPage} activity={activity}/>
      <Companion />
      <AnimeGreeter show={showGreeter} name={session.name} onDone={() => setShowGreeter(false)}/>
    </div>);
}

export { App };
export default App;
