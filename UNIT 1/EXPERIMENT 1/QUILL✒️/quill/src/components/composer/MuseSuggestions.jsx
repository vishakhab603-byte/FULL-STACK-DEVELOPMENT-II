import React, { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { setText } from "../../store/slices/composerSlice";
import { getPlatform } from "../../utils/platformRules";
import { validateForPlatform } from "../../utils/validators";
import { suggestHashtags } from "../../utils/hashtagSuggester";
import { bestTimeToPost } from "../../utils/bestTime";
import { readabilityHints } from "../../utils/readability";
import { ruleBasedRewrite, roast } from "../../utils/toneRewriter";

export default function MuseSuggestions({ platformId, text, mediaCount, title = "" }) {
  const dispatch = useDispatch();
  const platform = getPlatform(platformId);
  const [roastLine, setRoastLine] = useState(null);
  const [rewritePreview, setRewritePreview] = useState(null);

  const validation = useMemo(
    () => validateForPlatform(text, mediaCount, platformId, title),
    [text, mediaCount, platformId, title]
  );
  const hashtags = useMemo(() => suggestHashtags(text), [text]);
  const timing = useMemo(() => bestTimeToPost(platformId), [platformId]);
  const hints = useMemo(() => readabilityHints(text), [text]);

  return (
    <div className="card" style={{ padding: 16 }}>
      <div className="flex items-center gap-8" style={{ marginBottom: 12 }}>
        <span className="stamp" style={{ width: 24, height: 24, fontSize: 12, background: platform.color, color: "#fff", border: "none" }}>
          {platform.stamp}
        </span>
        <p style={{ fontWeight: 700, fontSize: 14 }}>{platform.name}</p>
      </div>

      {(validation.errors.length > 0 || validation.warnings.length > 0) && (
        <div className="flex-col gap-8" style={{ marginBottom: 12 }}>
          {validation.errors.map((e, i) => (
            <p key={i} style={{ fontSize: 12.5, color: "#b3261e" }}>⛔ {e}</p>
          ))}
          {validation.warnings.map((w, i) => (
            <p key={i} style={{ fontSize: 12.5, color: "var(--marker-ink)" }}>⚠️ {w}</p>
          ))}
        </div>
      )}

      {hints.length > 0 && (
        <div className="flex-col gap-6" style={{ marginBottom: 12 }}>
          {hints.map((h, i) => (
            <p key={i} className="text-soft" style={{ fontSize: 12.5 }}>✎ {h.message}</p>
          ))}
        </div>
      )}

      {timing && (
        <p className="text-soft" style={{ fontSize: 12.5, marginBottom: 12 }}>
          ⏰ Best window: <strong>{timing.label}</strong>
          <span className="text-faint"> ({timing.confidence}% confidence)</span>
        </p>
      )}

      {hashtags.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <p className="eyebrow" style={{ marginBottom: 6 }}>Suggested hashtags</p>
          <div className="flex gap-8" style={{ flexWrap: "wrap" }}>
            {hashtags.map((h) => (
              <button
                key={h}
                type="button"
                className="chip"
                onClick={() => dispatch(setText((text.trimEnd() + " " + h).trim()))}
                style={{ border: "1px dashed var(--line-strong)" }}
              >
                + {h}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-8" style={{ flexWrap: "wrap" }}>
        <button
          type="button"
          className="btn btn-sm"
          disabled={!text.trim()}
          onClick={() => setRewritePreview(ruleBasedRewrite(text, platformId))}
        >
          ✨ Rewrite tone for {platform.name}
        </button>
        <button
          type="button"
          className="btn btn-sm"
          disabled={!text.trim()}
          onClick={() => setRoastLine(roast(text, platformId))}
        >
          🔥 Roast my post
        </button>
      </div>

      {rewritePreview && (
        <div className="card" style={{ marginTop: 12, padding: 12, background: "var(--sky-soft)", borderColor: "transparent" }}>
          <p style={{ fontSize: 13, whiteSpace: "pre-wrap", marginBottom: 10 }}>{rewritePreview}</p>
          <div className="flex gap-8">
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={() => {
                dispatch(setText(rewritePreview));
                setRewritePreview(null);
              }}
            >
              Use this version
            </button>
            <button type="button" className="btn btn-sm btn-ghost" onClick={() => setRewritePreview(null)}>
              Dismiss
            </button>
          </div>
        </div>
      )}

      {roastLine && (
        <div className="card" style={{ marginTop: 12, padding: 12, background: "var(--pink-soft)", borderColor: "transparent" }}>
          <p style={{ fontSize: 13 }}>🔥 {roastLine}</p>
        </div>
      )}
    </div>
  );
}
