import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import ToastStack from "./components/shared/Toast";
import ThemeManager from "./components/shared/ThemeManager";
import PostComposer from "./components/composer/PostComposer";
import DraftList from "./components/drafts/DraftList";
import ScheduleCalendar from "./components/calendar/ScheduleCalendar";
import PublishedList from "./components/published/PublishedList";
import AnalyticsDashboard from "./components/analytics/AnalyticsDashboard";
import SettingsPanel from "./components/shared/SettingsPanel";
import { markPublished } from "./store/slices/scheduleSlice";
import { logActivity } from "./store/slices/analyticsSlice";
import { pushToast } from "./store/slices/uiSlice";
import { fireConfetti, fireLegendaryConfetti } from "./utils/confetti";
import { playPublishChime } from "./utils/sound";
import { getMilestoneMessage } from "./utils/achievements";
import { rollForSomethingRare } from "./utils/surprises";
import { unlockLegendary } from "./store/slices/uiSlice";
import { useSecretCode } from "./hooks/useSecretCode";
import { getDayContext } from "./utils/timeOfDay";

const VIEWS = {
  compose: PostComposer,
  drafts: DraftList,
  schedule: ScheduleCalendar,
  published: PublishedList,
  analytics: AnalyticsDashboard,
  settings: SettingsPanel,
};

/**
 * The fix for "scheduled but not getting posted": nothing was ever checking
 * the queue against the clock. This watches it continuously (while the app
 * is open) and actually fires off anything whose time has come.
 */
function useScheduleTicker() {
  const dispatch = useDispatch();
  const queue = useSelector((s) => s.schedule.queue);
  const soundEnabled = useSelector((s) => s.ui.soundEnabled);
  const celebrateEnabled = useSelector((s) => s.ui.celebrateEnabled);
  const queueRef = useRef(queue);
  queueRef.current = queue;

  useEffect(() => {
    const id = setInterval(() => {
      const due = queueRef.current.filter(
        (p) => p.status === "scheduled" && new Date(p.scheduledFor) <= new Date()
      );
      let publishedSoFar = queueRef.current.filter((p) => p.status === "published").length;
      due.forEach((post) => {
        dispatch(markPublished(post.id));
        dispatch(logActivity());
        dispatch(pushToast(`Auto-published to ${post.platformIds.length} platform(s) 🎉`, "success"));
        if (celebrateEnabled) fireConfetti(36);
        playPublishChime(soundEnabled);
        publishedSoFar += 1;
        const milestone = getMilestoneMessage(publishedSoFar);
        if (milestone) {
          dispatch(pushToast(milestone, "success"));
          if (celebrateEnabled) fireConfetti(160);
        }
        const rare = rollForSomethingRare();
        if (rare) {
          dispatch(unlockLegendary());
          dispatch(pushToast(rare, "success"));
          if (celebrateEnabled) fireLegendaryConfetti();
        }
      });
    }, 10 * 1000); // check every 10s — snappy for a demo, cheap enough to leave running
    return () => clearInterval(id);
  }, [dispatch, soundEnabled, celebrateEnabled]);
}

/** A quiet, once-per-session confetti moment if today happens to be a notable day. */
function useNotableDayWelcome() {
  const dispatch = useDispatch();
  const celebrateEnabled = useSelector((s) => s.ui.celebrateEnabled);

  useEffect(() => {
    const { notable } = getDayContext();
    if (!notable) return;
    const flagKey = "quill:notable-day-shown:" + new Date().toDateString();
    if (sessionStorage.getItem(flagKey)) return;
    sessionStorage.setItem(flagKey, "1");
    const t = setTimeout(() => {
      dispatch(pushToast(`🎊 ${notable}`, "success"));
      if (celebrateEnabled) fireConfetti(90);
    }, 700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

const IDLE_WHISPERS = [
  "still there? no rush.",
  "the cursor's blinking, patiently.",
  "a draft doesn't judge you for thinking too long.",
  "the Muse is just here. No pressure.",
];

/** After a stretch of no activity, a small, un-annoying nudge. */
function useIdleWhisper() {
  const dispatch = useDispatch();
  const lastActivity = useRef(Date.now());
  const hasWhispered = useRef(false);

  useEffect(() => {
    function markActive() {
      lastActivity.current = Date.now();
      hasWhispered.current = false;
    }
    window.addEventListener("keydown", markActive);
    window.addEventListener("mousemove", markActive);
    const id = setInterval(() => {
      const idleFor = Date.now() - lastActivity.current;
      if (idleFor > 90 * 1000 && !hasWhispered.current) {
        hasWhispered.current = true;
        const line = IDLE_WHISPERS[Math.floor(Math.random() * IDLE_WHISPERS.length)];
        dispatch(pushToast(`🖋️ ${line}`, "default"));
      }
    }, 15 * 1000);
    return () => {
      window.removeEventListener("keydown", markActive);
      window.removeEventListener("mousemove", markActive);
      clearInterval(id);
    };
  }, [dispatch]);
}

export default function App() {
  const dispatch = useDispatch();
  const view = useSelector((s) => s.ui.view);
  const celebrateEnabled = useSelector((s) => s.ui.celebrateEnabled);
  const soundEnabled = useSelector((s) => s.ui.soundEnabled);
  const Active = VIEWS[view] ?? PostComposer;
  useScheduleTicker();
  useNotableDayWelcome();
  useIdleWhisper();

  useSecretCode(() => {
    dispatch(unlockLegendary());
    dispatch(pushToast("🕹️ You know things.", "success"));
    if (celebrateEnabled) fireLegendaryConfetti();
    playPublishChime(soundEnabled);
    document.body.classList.add("flourish-active");
    setTimeout(() => document.body.classList.remove("flourish-active"), 1800);
  });

  return (
    <div className="app-shell">
      <ThemeManager />
      <Sidebar />
      <main className="main-scroll">
        <Header />
        <Active />
      </main>
      <ToastStack />
    </div>
  );
}
