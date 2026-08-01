import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { PLATFORM_LIST } from "../../utils/platformRules";
import { generatePostStats } from "../../utils/postStats";
import { computeStreak } from "../../utils/streak";
import { computeAchievements } from "../../utils/achievements";
import PublishedPostCard from "./PublishedPostCard";

function StatBlock({ value, label, emoji }) {
  return (
    <div className="card" style={{ padding: "14px 18px", minWidth: 120 }}>
      <p style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 600, lineHeight: 1 }}>
        {emoji} {value}
      </p>
      <p className="text-faint" style={{ fontSize: 11.5, marginTop: 6 }}>{label}</p>
    </div>
  );
}

export default function PublishedList() {
  const queue = useSelector((s) => s.schedule.queue);
  const activityLog = useSelector((s) => s.analytics.activityLog);
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");

  const published = useMemo(
    () => queue.filter((p) => p.status === "published").sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)),
    [queue]
  );

  const streak = useMemo(() => computeStreak(activityLog), [activityLog]);
  const legendaryUnlocked = useSelector((s) => s.ui.legendaryUnlocked);
  const magicWordFound = useSelector((s) => s.ui.magicWordFound);
  const achievements = useMemo(
    () => computeAchievements(published, { legendaryUnlocked, magicWordFound }),
    [published, legendaryUnlocked, magicWordFound]
  );

  const totals = useMemo(() => {
    return published.reduce(
      (acc, p) => {
        const s = generatePostStats(p);
        acc.likes += s.likes;
        acc.comments += s.comments;
        acc.shares += s.shares;
        return acc;
      },
      { likes: 0, comments: 0, shares: 0 }
    );
  }, [published]);

  const thisWeekCount = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return published.filter((p) => new Date(p.publishedAt).getTime() >= weekAgo).length;
  }, [published]);

  const filtered = published.filter((p) => {
    if (platformFilter !== "all" && !p.platformIds.includes(platformFilter)) return false;
    if (search && !(`${p.title || ""} ${p.text}`.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  if (published.length === 0) {
    return (
      <div className="card" style={{ padding: 40, textAlign: "center" }}>
        <p style={{ fontSize: 32, marginBottom: 8 }}>📬</p>
        <h3 style={{ fontSize: 18, marginBottom: 6 }}>Nothing published yet</h3>
        <p className="text-faint" style={{ fontSize: 14 }}>
          Once something goes live — manually or via the schedule — it lands here, with a
          little scoreboard of how it did.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-col gap-20">
      <div className="flex gap-12" style={{ flexWrap: "wrap" }}>
        <StatBlock value={published.length} label="posts published" emoji="📬" />
        <StatBlock value={thisWeekCount} label="in the last 7 days" emoji="📅" />
        <StatBlock value={streak} label={streak === 1 ? "day streak" : "day streak"} emoji="🔥" />
        <StatBlock value={totals.likes.toLocaleString()} label="total mock likes" emoji="❤️" />
      </div>

      <div className="card" style={{ padding: 16 }}>
        <p className="eyebrow" style={{ marginBottom: 10 }}>Achievements</p>
        <div className="flex gap-8" style={{ flexWrap: "wrap" }}>
          {achievements.map((a) => (
            <span
              key={a.id}
              className="chip"
              title={a.unlocked || !a.hidden ? a.desc : "???"}
              style={{
                opacity: a.unlocked ? 1 : 0.4,
                background: a.unlocked ? "var(--marker)" : "var(--paper-dim)",
                color: a.unlocked ? "var(--marker-ink)" : "var(--ink-faint)",
                borderColor: "transparent",
                fontWeight: 700,
              }}
            >
              {a.hidden && !a.unlocked ? "❔ ???" : `${a.emoji} ${a.label}`}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-12" style={{ flexWrap: "wrap" }}>
        <input
          className="field-input"
          placeholder="Search published posts…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 240 }}
        />
        <select className="field-input" style={{ width: "auto" }} value={platformFilter} onChange={(e) => setPlatformFilter(e.target.value)}>
          <option value="all">All platforms</option>
          {PLATFORM_LIST.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-faint" style={{ fontSize: 14 }}>Nothing matches those filters.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {filtered.map((p) => (
            <PublishedPostCard key={p.id} post={p} />
          ))}
        </div>
      )}
    </div>
  );
}
