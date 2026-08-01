import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setView, cycleThemeMode, pushToast } from "../../store/slices/uiSlice";
import { getPeriod, PERIODS } from "../../utils/timeOfDay";
import { computeStreak } from "../../utils/streak";
import { fireConfetti } from "../../utils/confetti";

const NAV = [
  { id: "compose", label: "Compose", icon: "🖋️" },
  { id: "drafts", label: "Drafts", icon: "🗂️" },
  { id: "schedule", label: "Schedule", icon: "🗓️" },
  { id: "published", label: "Published", icon: "📬" },
  { id: "analytics", label: "Analytics", icon: "📈" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

const MODE_LABEL = { auto: "Auto", light: "Light", dark: "Dark" };

const HANDSHAKE_LINES = [
  "🪄 The Muse winks at you.",
  "🎩 A quill, a rabbit, and a deadline walk into a feed...",
  "✨ You found the secret handshake. The Muse is charmed.",
  "🕊️ Somewhere, a very small parade just happened.",
];

export default function Sidebar() {
  const dispatch = useDispatch();
  const view = useSelector((s) => s.ui.view);
  const themeMode = useSelector((s) => s.ui.themeMode);
  const draftCount = useSelector((s) => s.drafts.items.length);
  const queuedCount = useSelector(
    (s) => s.schedule.queue.filter((p) => p.status === "scheduled").length
  );
  const publishedCount = useSelector(
    (s) => s.schedule.queue.filter((p) => p.status === "published").length
  );
  const activityLog = useSelector((s) => s.analytics.activityLog);
  const streak = computeStreak(activityLog);

  const clickCount = useRef(0);
  const clickTimer = useRef(null);

  function handleBadgeClick() {
    clickCount.current += 1;
    clearTimeout(clickTimer.current);
    if (clickCount.current >= 5) {
      fireConfetti(140);
      dispatch(pushToast(HANDSHAKE_LINES[Math.floor(Math.random() * HANDSHAKE_LINES.length)], "success"));
      clickCount.current = 0;
      return;
    }
    clickTimer.current = setTimeout(() => (clickCount.current = 0), 900);
  }

  const effectivePeriod = themeMode === "light" ? "day" : themeMode === "dark" ? "night" : getPeriod();
  const periodInfo = PERIODS[effectivePeriod];

  return (
    <aside
      style={{
        borderRight: "1px solid var(--line)",
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <div style={{ padding: "2px 10px 20px" }}>
        <div className="flex items-center gap-12">
          <button
            className="brand-badge"
            onClick={handleBadgeClick}
            style={{ border: "none", cursor: "pointer" }}
            aria-label="QUILL"
            title="🤫"
          >
            🪶
          </button>
          <div>
            <h1 style={{ fontSize: 23, fontWeight: 600, lineHeight: 1 }}>QUILL</h1>
            <p className="eyebrow" style={{ marginTop: 3 }}>every quill needs a muse</p>
          </div>
        </div>
        <div className="hero-bar" style={{ marginTop: 16, marginBottom: 0 }} />
      </div>

      {NAV.map((item) => {
        const active = view === item.id;
        const badge =
          item.id === "drafts" ? draftCount : item.id === "schedule" ? queuedCount : item.id === "published" ? publishedCount : 0;
        return (
          <button
            key={item.id}
            onClick={() => dispatch(setView(item.id))}
            className="btn-ghost"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: 10,
              border: "none",
              background: active ? "var(--paper-dim)" : "transparent",
              color: active ? "var(--ink)" : "var(--ink-soft)",
              fontWeight: active ? 700 : 500,
              fontSize: 14.5,
              textAlign: "left",
              width: "100%",
            }}
          >
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            <span style={{ flex: 1 }}>{item.label}</span>
            {badge > 0 && (
              <span
                className="mono"
                style={{
                  fontSize: 11,
                  background: active ? "var(--marker)" : "var(--line)",
                  color: active ? "var(--marker-ink)" : "var(--ink-soft)",
                  borderRadius: 999,
                  padding: "1px 7px",
                  fontWeight: 700,
                }}
              >
                {badge}
              </span>
            )}
          </button>
        );
      })}

      <div className="flex-col gap-8" style={{ marginTop: "auto", padding: "16px 6px 0" }}>
        {streak >= 2 && (
          <div
            className="flex items-center gap-8"
            style={{ padding: "0 6px", fontSize: 12.5, fontWeight: 600, color: "var(--marker-ink)", cursor: "pointer" }}
            onDoubleClick={() => {
              fireConfetti(50);
              dispatch(pushToast("🔥 don't jinx it.", "success"));
            }}
            title="🤫"
          >
            <span>🔥</span>
            <span>{streak}-day writing streak</span>
          </div>
        )}
        <button
          className="period-toggle"
          onClick={() => dispatch(cycleThemeMode())}
          title="Cycle Auto → Light → Dark"
        >
          <span style={{ fontSize: 15 }}>{periodInfo.emoji}</span>
          <span style={{ flex: 1, textAlign: "left" }}>
            {periodInfo.label} · {MODE_LABEL[themeMode]}
          </span>
          <span className="text-faint">⇄</span>
        </button>
        <p className="text-faint" style={{ fontSize: 11, lineHeight: 1.5, padding: "0 6px" }}>
          ⌘/Ctrl + Enter to publish · ⌘/Ctrl + S to save
        </p>
      </div>
    </aside>
  );
}
