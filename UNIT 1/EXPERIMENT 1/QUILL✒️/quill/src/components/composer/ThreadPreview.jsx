import React from "react";
import { getPlatform } from "../../utils/platformRules";
import { splitIntoThread } from "../../utils/threadSplitter";

export default function ThreadPreview({ text, platformId }) {
  const platform = getPlatform(platformId);
  const parts = splitIntoThread(text, platformId);
  if (parts.length <= 1) return null;

  return (
    <div className="card" style={{ padding: 14, background: "var(--paper-dim)", borderStyle: "dashed" }}>
      <p className="eyebrow" style={{ marginBottom: 10 }}>
        {platform.name} thread preview · {parts.length} parts
      </p>
      <div className="flex-col gap-8">
        {parts.map((part, i) => (
          <div key={i} className="card" style={{ padding: "10px 12px", background: "var(--card)" }}>
            <p style={{ fontSize: 13, whiteSpace: "pre-wrap" }}>{part}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
