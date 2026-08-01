import React, { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setText } from "../../store/slices/composerSlice";
import { getDayContext, greeting, getPeriod, moonPhase } from "../../utils/timeOfDay";
import { quoteOfTheDay } from "../../utils/quotesSuggester";
import { trendingPrompts } from "../../utils/trendingTopics";

export default function DaySpark() {
  const dispatch = useDispatch();
  const text = useSelector((s) => s.composer.text);
  const day = useMemo(() => getDayContext(), []);
  const quote = useMemo(() => quoteOfTheDay(), []);
  const prompts = useMemo(() => trendingPrompts(), []);
  const line = useMemo(() => greeting(), []);
  const isNight = useMemo(() => getPeriod() === "night", []);
  const moon = useMemo(() => (isNight ? moonPhase() : null), [isNight]);

  return (
    <div className="spark-card">
      <p className="eyebrow" style={{ marginBottom: 8, opacity: 0.75 }}>
        Today's spark · {day.weekdayName}
      </p>
      <p style={{ fontSize: 13.5, marginBottom: 10 }}>{line}</p>
      {moon && (
        <p className="text-faint" style={{ fontSize: 12, marginBottom: 10 }}>
          {moon.emoji} {moon.name} tonight
        </p>
      )}
      <p className="text-soft" style={{ fontSize: 12.5, marginBottom: 12 }}>
        {day.weekdayVibe}
        {day.notable && (
          <>
            {" "}· <strong>{day.notable}</strong>
          </>
        )}
      </p>

      <div
        className="card"
        style={{ padding: "10px 12px", marginBottom: 12, background: "rgba(255,255,255,0.55)", borderColor: "transparent" }}
      >
        <p style={{ fontSize: 13, fontStyle: "italic" }}>"{quote.text}"</p>
        <p className="text-faint" style={{ fontSize: 11, marginTop: 4 }}>
          — {quote.author}{quote.original ? " (original)" : ""}
        </p>
      </div>

      <p className="eyebrow" style={{ marginBottom: 6, opacity: 0.75 }}>Worth writing about</p>
      <div className="flex-col gap-6">
        {prompts.map((p) => (
          <button
            key={p}
            type="button"
            className="chip"
            style={{ justifyContent: "flex-start", textAlign: "left", background: "rgba(255,255,255,0.6)", border: "1px dashed var(--line-strong)" }}
            onClick={() => {
              const starter = `Thinking about ${p} — `;
              dispatch(setText(text ? `${text}\n\n${starter}` : starter));
            }}
          >
            🔥 {p}
          </button>
        ))}
      </div>
    </div>
  );
}
