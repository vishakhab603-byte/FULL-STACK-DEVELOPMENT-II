import React, { useMemo } from "react";

function levelColor(count) {
  if (!count) return "var(--paper-dim)";
  if (count === 1) return "#c7ead9";
  if (count === 2) return "#7fd6ac";
  if (count <= 4) return "#2fb17e";
  return "#0d7a55";
}

export default function ContentHeatmap({ activityLog }) {
  const weeks = useMemo(() => {
    const today = new Date();
    const days = [];
    for (let i = 111; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({ key, date: d, count: activityLog[key] || 0 });
    }
    // pad to start on Sunday
    const lead = days[0].date.getDay();
    const padded = [...Array(lead).fill(null), ...days];
    const cols = [];
    for (let i = 0; i < padded.length; i += 7) {
      cols.push(padded.slice(i, i + 7));
    }
    return cols;
  }, [activityLog]);

  const total = Object.values(activityLog).reduce((a, b) => a + b, 0);

  return (
    <div>
      <p className="text-faint" style={{ fontSize: 12.5, marginBottom: 10 }}>
        {total} action{total === 1 ? "" : "s"} logged over the last 16 weeks (drafts saved + posts sent).
      </p>
      <div className="flex gap-8" style={{ overflowX: "auto", paddingBottom: 6 }}>
        {weeks.map((week, wi) => (
          <div key={wi} className="flex-col gap-8" style={{ gap: 3, display: "flex", flexDirection: "column" }}>
            {week.map((day, di) =>
              day ? (
                <div
                  key={di}
                  title={`${day.date.toDateString()}: ${day.count} action${day.count === 1 ? "" : "s"}`}
                  style={{
                    width: 11,
                    height: 11,
                    borderRadius: 3,
                    background: levelColor(day.count),
                  }}
                />
              ) : (
                <div key={di} style={{ width: 11, height: 11 }} />
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
