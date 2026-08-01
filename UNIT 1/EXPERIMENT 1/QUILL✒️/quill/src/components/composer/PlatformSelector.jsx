import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { togglePlatform } from "../../store/slices/composerSlice";
import { PLATFORM_LIST } from "../../utils/platformRules";

export default function PlatformSelector() {
  const dispatch = useDispatch();
  const selected = useSelector((s) => s.composer.platformIds);

  return (
    <div className="flex gap-8" style={{ flexWrap: "wrap" }}>
      {PLATFORM_LIST.map((p) => {
        const active = selected.includes(p.id);
        return (
          <button
            key={p.id}
            onClick={() => dispatch(togglePlatform(p.id))}
            aria-pressed={active}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "7px 14px 7px 8px",
              borderRadius: 999,
              border: `1.5px solid ${active ? p.color : "var(--line-strong)"}`,
              background: active ? p.color : "var(--card)",
              color: active ? "#fff" : "var(--ink-soft)",
              fontWeight: 600,
              fontSize: 13.5,
              transition: "all 0.12s ease",
            }}
          >
            <span
              className="stamp"
              style={{
                width: 22,
                height: 22,
                fontSize: 12,
                border: `1.5px dashed ${active ? "rgba(255,255,255,0.6)" : "var(--line-strong)"}`,
                background: active ? "rgba(255,255,255,0.15)" : "var(--paper-dim)",
              }}
            >
              {p.stamp}
            </span>
            {p.name}
          </button>
        );
      })}
    </div>
  );
}
