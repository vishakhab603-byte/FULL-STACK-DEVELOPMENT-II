import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { deleteMany, duplicateMany, tagMany, clearSelection } from "../../store/slices/draftsSlice";
import { pushToast } from "../../store/slices/uiSlice";

export default function BulkActionsBar({ selectedIds }) {
  const dispatch = useDispatch();
  const [tagValue, setTagValue] = useState("");

  if (selectedIds.length === 0) return null;

  return (
    <div
      className="card flex items-center gap-12"
      style={{
        padding: "10px 16px",
        position: "sticky",
        top: 0,
        zIndex: 10,
        background: "var(--ink)",
        color: "var(--paper)",
        borderColor: "var(--ink)",
        flexWrap: "wrap",
      }}
    >
      <span style={{ fontWeight: 700, fontSize: 13.5 }}>{selectedIds.length} selected</span>

      <input
        className="field-input"
        placeholder="tag name…"
        value={tagValue}
        onChange={(e) => setTagValue(e.target.value)}
        style={{ width: 130, fontSize: 12.5, padding: "6px 10px" }}
      />
      <button
        className="btn btn-sm"
        disabled={!tagValue.trim()}
        onClick={() => {
          dispatch(tagMany({ ids: selectedIds, tag: tagValue.trim() }));
          dispatch(pushToast(`Tagged ${selectedIds.length} draft(s) "${tagValue.trim()}".`, "success"));
          setTagValue("");
        }}
      >
        🏷 Apply tag
      </button>

      <button
        className="btn btn-sm"
        onClick={() => {
          dispatch(duplicateMany(selectedIds));
          dispatch(pushToast("Duplicated.", "success"));
        }}
      >
        ⎘ Duplicate
      </button>

      <button
        className="btn btn-sm btn-danger"
        style={{ background: "var(--coral-soft)" }}
        onClick={() => {
          dispatch(deleteMany(selectedIds));
          dispatch(pushToast(`Deleted ${selectedIds.length} draft(s).`, "default"));
        }}
      >
        🗑 Delete
      </button>

      <button className="btn btn-sm btn-ghost" style={{ color: "var(--paper)", marginLeft: "auto" }} onClick={() => dispatch(clearSelection())}>
        Clear selection
      </button>
    </div>
  );
}
