import React, { useState, useRef, useEffect } from "react";

const EMOJI_GROUPS = {
  Faces: ["😀", "😂", "🥹", "😍", "🤔", "😎", "🥳", "😭", "🙃", "🫡"],
  Gestures: ["👍", "🙌", "👏", "🤝", "✌️", "🤞", "💪", "🙏"],
  Objects: ["🚀", "✨", "🔥", "💡", "📈", "🎯", "🧵", "📌", "🎉", "🛠️"],
  Hearts: ["❤️", "💛", "💚", "💙", "🧡", "🩵", "🤍"],
};

export default function EmojiPicker({ onSelect }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div style={{ position: "relative" }} ref={ref}>
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen((o) => !o)} aria-label="Insert emoji">
        😊 Emoji
      </button>
      {open && (
        <div
          className="card scrollbar-thin"
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            left: 0,
            width: 260,
            maxHeight: 260,
            overflowY: "auto",
            padding: 12,
            zIndex: 40,
            boxShadow: "var(--shadow-lg)",
          }}
        >
          {Object.entries(EMOJI_GROUPS).map(([group, emojis]) => (
            <div key={group} style={{ marginBottom: 10 }}>
              <p className="eyebrow" style={{ marginBottom: 6 }}>{group}</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
                {emojis.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => {
                      onSelect(e);
                      setOpen(false);
                    }}
                    style={{
                      fontSize: 18,
                      padding: 4,
                      borderRadius: 6,
                      border: "none",
                      background: "transparent",
                    }}
                    onMouseEnter={(ev) => (ev.currentTarget.style.background = "var(--paper-dim)")}
                    onMouseLeave={(ev) => (ev.currentTarget.style.background = "transparent")}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
