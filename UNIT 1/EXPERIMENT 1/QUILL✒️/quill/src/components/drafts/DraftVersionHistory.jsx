import React from "react";
import { useDispatch } from "react-redux";
import { restoreVersion } from "../../store/slices/draftsSlice";
import { pushToast } from "../../store/slices/uiSlice";
import Modal from "../shared/Modal";

export default function DraftVersionHistory({ draft, onClose }) {
  const dispatch = useDispatch();

  return (
    <Modal title={`Version history`} onClose={onClose}>
      <div className="flex-col gap-10">
        <div className="card" style={{ padding: 12, background: "var(--mint-soft)", borderColor: "transparent" }}>
          <p className="eyebrow" style={{ marginBottom: 4 }}>Current</p>
          <p style={{ fontSize: 13, whiteSpace: "pre-wrap" }}>{draft.text || "(empty)"}</p>
        </div>

        {draft.history.length === 0 && (
          <p className="text-faint" style={{ fontSize: 13 }}>
            No earlier versions yet — edits get snapshotted here automatically each time you save.
          </p>
        )}

        {draft.history.map((v, i) => (
          <div key={i} className="card" style={{ padding: 12 }}>
            <div className="flex justify-between items-center" style={{ marginBottom: 6 }}>
              <p className="text-faint mono" style={{ fontSize: 11 }}>
                {new Date(v.savedAt).toLocaleString()}
              </p>
              <button
                className="btn btn-sm"
                onClick={() => {
                  dispatch(restoreVersion({ id: draft.id, historyIndex: i }));
                  dispatch(pushToast("Version restored.", "success"));
                  onClose();
                }}
              >
                Restore
              </button>
            </div>
            <p style={{ fontSize: 13, whiteSpace: "pre-wrap" }}>{v.text || "(empty)"}</p>
          </div>
        ))}
      </div>
    </Modal>
  );
}
