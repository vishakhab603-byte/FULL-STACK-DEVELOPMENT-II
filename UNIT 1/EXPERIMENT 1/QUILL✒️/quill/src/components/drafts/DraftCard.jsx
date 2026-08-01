import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { toggleSelected, deleteDraft, duplicateMany } from "../../store/slices/draftsSlice";
import { loadFromDraft } from "../../store/slices/composerSlice";
import { setView, pushToast } from "../../store/slices/uiSlice";
import { getPlatform } from "../../utils/platformRules";
import DraftVersionHistory from "./DraftVersionHistory";

export default function DraftCard({ draft, selected }) {
  const dispatch = useDispatch();
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className="card" style={{ padding: 16, borderColor: selected ? "var(--ink)" : "var(--line)" }}>
      <div className="flex justify-between items-start" style={{ marginBottom: 10 }}>
        <label className="flex items-center gap-8" style={{ cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={selected}
            onChange={() => dispatch(toggleSelected(draft.id))}
          />
          <span className="flex gap-8">
            {draft.platformIds.map((id) => {
              const p = getPlatform(id);
              return (
                <span
                  key={id}
                  className="stamp"
                  title={p.name}
                  style={{ width: 22, height: 22, fontSize: 11, background: p.color, color: "#fff", border: "none" }}
                >
                  {p.stamp}
                </span>
              );
            })}
          </span>
        </label>
        <span className="text-faint mono" style={{ fontSize: 11 }}>
          {new Date(draft.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
        </span>
      </div>

      {draft.title && (
        <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, marginBottom: 4 }}>
          {draft.title}
        </p>
      )}
      <p style={{ fontSize: 13.5, whiteSpace: "pre-wrap", marginBottom: 10, minHeight: 40 }}>
        {draft.text.slice(0, 180) || <span className="text-faint">(empty draft)</span>}
        {draft.text.length > 180 && "…"}
      </p>

      {draft.tags.length > 0 && (
        <div className="flex gap-8" style={{ flexWrap: "wrap", marginBottom: 10 }}>
          {draft.tags.map((t) => (
            <span key={t} className="chip">{t}</span>
          ))}
        </div>
      )}

      <div className="flex gap-8" style={{ flexWrap: "wrap" }}>
        <button
          className="btn btn-sm"
          onClick={() => {
            dispatch(loadFromDraft(draft));
            dispatch(setView("compose"));
          }}
        >
          ✎ Continue editing
        </button>
        <button className="btn btn-sm btn-ghost" onClick={() => setShowHistory(true)}>
          🕓 History{draft.history.length > 0 ? ` (${draft.history.length})` : ""}
        </button>
        <button className="btn btn-sm btn-ghost" onClick={() => dispatch(duplicateMany([draft.id]))}>
          ⎘ Duplicate
        </button>
        <button
          className="btn btn-sm btn-danger"
          onClick={() => {
            dispatch(deleteDraft(draft.id));
            dispatch(pushToast("Draft deleted.", "default"));
          }}
        >
          Delete
        </button>
      </div>

      {showHistory && <DraftVersionHistory draft={draft} onClose={() => setShowHistory(false)} />}
    </div>
  );
}
