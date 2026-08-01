import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setScheduledFor } from "../../store/slices/composerSlice";

function toLocalInputValue(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

export default function SchedulePicker() {
  const dispatch = useDispatch();
  const scheduledFor = useSelector((s) => s.composer.scheduledFor);
  const active = Boolean(scheduledFor);

  const minValue = toLocalInputValue(new Date(Date.now() + 5 * 60 * 1000));

  return (
    <div className="flex items-center gap-12" style={{ flexWrap: "wrap" }}>
      <button
        type="button"
        className={`btn btn-sm ${active ? "btn-accent" : "btn-ghost"}`}
        onClick={() => {
          if (active) {
            dispatch(setScheduledFor(null));
          } else {
            const soon = new Date(Date.now() + 60 * 60 * 1000);
            dispatch(setScheduledFor(soon.toISOString()));
          }
        }}
      >
        🗓️ {active ? "Scheduled for later" : "Schedule for later"}
      </button>

      {active && (
        <input
          type="datetime-local"
          className="field-input"
          style={{ width: 220 }}
          min={minValue}
          value={toLocalInputValue(new Date(scheduledFor))}
          onChange={(e) => {
            if (!e.target.value) return;
            dispatch(setScheduledFor(new Date(e.target.value).toISOString()));
          }}
        />
      )}
    </div>
  );
}
