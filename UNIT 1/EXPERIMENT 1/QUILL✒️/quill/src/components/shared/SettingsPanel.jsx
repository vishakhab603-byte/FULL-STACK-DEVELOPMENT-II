import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleSound, toggleCelebrate, setThemeSkin, pushToast } from "../../store/slices/uiSlice";
import { exportAsJSON } from "../../utils/csvExport";
import { resetAllData } from "../../utils/storage";
import Modal from "./Modal";

const SKINS = [
  { id: "classic", label: "Classic (dynamic)", swatch: "linear-gradient(135deg,#fff8e6,#eef4ff)" },
  { id: "sepia", label: "Sepia", swatch: "linear-gradient(135deg,#e3cf9e,#ddb98e)" },
  { id: "neon", label: "Neon", swatch: "linear-gradient(135deg,#ff2fd0,#3dd6ff,#38ffc4)" },
  { id: "forest", label: "Forest", swatch: "linear-gradient(135deg,#cfe3b8,#bfe0d4)" },
  { id: "blush", label: "Blush", swatch: "linear-gradient(135deg,#ffd4e5,#ffe4c7)" },
  { id: "mono", label: "Mono", swatch: "linear-gradient(135deg,#0a0a0a,#4a4a4a)" },
];

function Toggle({ checked, onChange, label, desc }) {
  return (
    <div className="flex justify-between items-center card" style={{ padding: 16 }}>
      <div>
        <p style={{ fontWeight: 600, fontSize: 14.5 }}>{label}</p>
        <p className="text-faint" style={{ fontSize: 12.5, marginTop: 2 }}>{desc}</p>
      </div>
      <button
        onClick={onChange}
        role="switch"
        aria-checked={checked}
        style={{
          width: 44,
          height: 26,
          borderRadius: 999,
          border: "1px solid var(--line-strong)",
          background: checked ? "var(--mint)" : "var(--paper-dim)",
          position: "relative",
          transition: "background 0.15s ease",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 2,
            left: checked ? 20 : 2,
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "#fff",
            boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
            transition: "left 0.15s ease",
          }}
        />
      </button>
    </div>
  );
}

export default function SettingsPanel() {
  const dispatch = useDispatch();
  const { soundEnabled, celebrateEnabled, themeSkin } = useSelector((s) => s.ui);
  const drafts = useSelector((s) => s.drafts);
  const schedule = useSelector((s) => s.schedule);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="flex-col gap-16" style={{ maxWidth: 520 }}>
      <div className="card" style={{ padding: 16 }}>
        <p style={{ fontWeight: 600, fontSize: 14.5, marginBottom: 4 }}>Theme skin</p>
        <p className="text-faint" style={{ fontSize: 12.5, marginBottom: 12 }}>
          "Classic" shifts with real time of day (dawn/day/dusk/night). The rest are pinned looks.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
          {SKINS.map((skin) => (
            <button
              key={skin.id}
              onClick={() => dispatch(setThemeSkin(skin.id))}
              className="btn-ghost"
              style={{
                border: `2px solid ${themeSkin === skin.id ? "var(--ink)" : "var(--line)"}`,
                borderRadius: 12,
                padding: 10,
                textAlign: "left",
              }}
            >
              <div style={{ height: 36, borderRadius: 8, background: skin.swatch, marginBottom: 8 }} />
              <span style={{ fontSize: 12.5, fontWeight: 600 }}>{skin.label}</span>
              {themeSkin === skin.id && <span style={{ float: "right", fontSize: 12 }}>✓</span>}
            </button>
          ))}
        </div>
      </div>
      <Toggle
        checked={soundEnabled}
        onChange={() => dispatch(toggleSound())}
        label="Publish chime"
        desc="A quick three-note chime (via Tone.js) whenever a post goes out."
      />
      <Toggle
        checked={celebrateEnabled}
        onChange={() => dispatch(toggleCelebrate())}
        label="Confetti on publish"
        desc="A satisfying little burst every time you hit publish."
      />

      <div className="card" style={{ padding: 16 }}>
        <p style={{ fontWeight: 600, fontSize: 14.5, marginBottom: 4 }}>Export everything</p>
        <p className="text-faint" style={{ fontSize: 12.5, marginBottom: 12 }}>
          Download all drafts and your scheduling queue as one JSON file.
        </p>
        <button
          className="btn btn-sm"
          onClick={() => {
            exportAsJSON({ drafts: drafts.items, schedule: schedule.queue }, "quill-backup.json");
            dispatch(pushToast("Exported quill-backup.json", "success"));
          }}
        >
          ⬇ Export JSON
        </button>
      </div>

      <div className="card" style={{ padding: 16, borderColor: "#f2c8c4" }}>
        <p style={{ fontWeight: 600, fontSize: 14.5, marginBottom: 4 }}>Reset app</p>
        <p className="text-faint" style={{ fontSize: 12.5, marginBottom: 12 }}>
          Clears every draft, scheduled post, and preference from local storage. This can't be
          undone — export first if you want a copy.
        </p>
        <button className="btn btn-danger btn-sm" onClick={() => setConfirmOpen(true)}>
          🗑 Clear local storage
        </button>
      </div>

      {confirmOpen && (
        <Modal
          title="Wipe everything?"
          onClose={() => setConfirmOpen(false)}
          footer={
            <>
              <button className="btn btn-ghost btn-sm" onClick={() => setConfirmOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-danger btn-sm" onClick={resetAllData}>
                Yes, delete it all
              </button>
            </>
          }
        >
          <p className="text-soft" style={{ fontSize: 14 }}>
            This permanently deletes all {drafts.items.length} draft
            {drafts.items.length === 1 ? "" : "s"} and {schedule.queue.length} scheduled/published
            post{schedule.queue.length === 1 ? "" : "s"} from this browser. There's no undo.
          </p>
        </Modal>
      )}
    </div>
  );
}
