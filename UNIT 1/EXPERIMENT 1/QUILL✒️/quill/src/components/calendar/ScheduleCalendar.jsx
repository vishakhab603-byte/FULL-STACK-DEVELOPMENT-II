import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { cancelScheduled, reschedulePost } from "../../store/slices/scheduleSlice";
import { pushToast } from "../../store/slices/uiSlice";
import { getPlatform } from "../../utils/platformRules";

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function CalendarGrid({ queue }) {
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const byDay = useMemo(() => {
    const map = {};
    queue.forEach((p) => {
      const key = new Date(p.scheduledFor).toDateString();
      map[key] = map[key] || [];
      map[key].push(p);
    });
    return map;
  }, [queue]);

  const first = new Date(cursor.year, cursor.month, 1);
  const startOffset = first.getDay();
  const total = daysInMonth(cursor.year, cursor.month);
  const cells = [...Array(startOffset).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];
  const monthLabel = first.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const today = new Date();

  return (
    <div className="card" style={{ padding: 18 }}>
      <div className="flex justify-between items-center" style={{ marginBottom: 14 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => setCursor((c) => (c.month === 0 ? { year: c.year - 1, month: 11 } : { ...c, month: c.month - 1 }))}>←</button>
        <h3 style={{ fontSize: 16 }}>{monthLabel}</h3>
        <button className="btn btn-ghost btn-sm" onClick={() => setCursor((c) => (c.month === 11 ? { year: c.year + 1, month: 0 } : { ...c, month: c.month + 1 }))}>→</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="text-faint mono" style={{ fontSize: 10.5, textAlign: "center" }}>{d}</div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const date = new Date(cursor.year, cursor.month, day);
          const items = byDay[date.toDateString()] || [];
          const isToday = date.toDateString() === today.toDateString();
          return (
            <div
              key={i}
              style={{
                minHeight: 62,
                borderRadius: 8,
                border: `1px solid ${isToday ? "var(--ink)" : "var(--line)"}`,
                padding: 6,
                background: items.length ? "var(--paper-dim)" : "transparent",
              }}
            >
              <span className="mono" style={{ fontSize: 10.5, color: isToday ? "var(--ink)" : "var(--ink-faint)", fontWeight: isToday ? 700 : 400 }}>
                {day}
              </span>
              <div className="flex gap-8" style={{ flexWrap: "wrap", marginTop: 4 }}>
                {items.slice(0, 4).map((p) => (
                  <span
                    key={p.id}
                    title={p.text.slice(0, 60)}
                    style={{ width: 7, height: 7, borderRadius: "50%", background: p.status === "published" ? "var(--mint)" : "var(--marker)" }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function QueueRow({ post }) {
  const dispatch = useDispatch();
  const isPast = new Date(post.scheduledFor) < new Date();

  return (
    <div className="card flex items-center gap-12" style={{ padding: 12 }}>
      <span className="flex gap-8">
        {post.platformIds.map((id) => {
          const p = getPlatform(id);
          return (
            <span key={id} className="stamp" style={{ width: 22, height: 22, fontSize: 11, background: p.color, color: "#fff", border: "none" }}>
              {p.stamp}
            </span>
          );
        })}
      </span>
      <p style={{ fontSize: 13, flex: 1 }}>
        {post.title && <strong>{post.title}: </strong>}
        {post.text.slice(0, 90) || "(media only)"}{post.text.length > 90 && "…"}
      </p>
      <span className="chip" style={{ background: post.status === "published" ? "var(--mint-soft)" : "var(--sky-soft)", borderColor: "transparent" }}>
        {post.status === "published" ? "✓ Published" : isPast ? "Overdue" : "Scheduled"}
      </span>
      <span className="text-faint mono" style={{ fontSize: 11.5, whiteSpace: "nowrap" }}>
        {new Date(post.scheduledFor).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
      </span>
      {post.status === "scheduled" && (
        <button
          className="btn btn-sm btn-ghost"
          onClick={() => {
            dispatch(cancelScheduled(post.id));
            dispatch(pushToast("Removed from queue.", "default"));
          }}
        >
          Cancel
        </button>
      )}
    </div>
  );
}

export default function ScheduleCalendar() {
  const queue = useSelector((s) => s.schedule.queue);
  const upcoming = [...queue]
    .filter((p) => p.status === "scheduled")
    .sort((a, b) => new Date(a.scheduledFor) - new Date(b.scheduledFor));
  const published = [...queue]
    .filter((p) => p.status === "published")
    .sort((a, b) => new Date(b.scheduledFor) - new Date(a.scheduledFor));

  if (queue.length === 0) {
    return (
      <div className="card" style={{ padding: 40, textAlign: "center" }}>
        <p style={{ fontSize: 32, marginBottom: 8 }}>🗓️</p>
        <h3 style={{ fontSize: 18, marginBottom: 6 }}>The queue is empty</h3>
        <p className="text-faint" style={{ fontSize: 14 }}>
          Publish now or schedule a post from the composer — it'll land here.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, alignItems: "start" }}>
      <div className="flex-col gap-16">
        {upcoming.length > 0 && (
          <div className="flex-col gap-10">
            <p className="eyebrow">Upcoming ({upcoming.length})</p>
            {upcoming.map((p) => <QueueRow key={p.id} post={p} />)}
          </div>
        )}
        {published.length > 0 && (
          <div className="flex-col gap-10">
            <p className="eyebrow">Recently published ({published.length})</p>
            {published.slice(0, 10).map((p) => <QueueRow key={p.id} post={p} />)}
          </div>
        )}
      </div>
      <CalendarGrid queue={queue} />
    </div>
  );
}
