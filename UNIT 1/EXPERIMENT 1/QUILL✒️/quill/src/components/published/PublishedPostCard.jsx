import React from "react";
import { useDispatch } from "react-redux";
import { getPlatform } from "../../utils/platformRules";
import { generatePostStats } from "../../utils/postStats";
import { saveDraft } from "../../store/slices/draftsSlice";
import { pushToast } from "../../store/slices/uiSlice";

export default function PublishedPostCard({ post }) {
  const dispatch = useDispatch();
  const stats = generatePostStats(post);
  const publishedAt = new Date(post.publishedAt);
  const isThread = post.text.length > 0 && /\d+\/\d+$/.test(post.text.trim());

  return (
    <div className="card" style={{ padding: 16 }}>
      <div className="flex justify-between items-start" style={{ marginBottom: 10 }}>
        <span className="flex gap-8">
          {post.platformIds.map((id) => {
            const p = getPlatform(id);
            return (
              <span
                key={id}
                className="stamp"
                title={p.name}
                style={{ width: 24, height: 24, fontSize: 11, background: p.color, color: "#fff", border: "none" }}
              >
                {p.stamp}
              </span>
            );
          })}
        </span>
        <span className="text-faint mono" style={{ fontSize: 11 }}>
          {publishedAt.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
        </span>
      </div>

      {post.title && (
        <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, marginBottom: 4 }}>
          {post.title}
        </p>
      )}
      <p style={{ fontSize: 13.5, whiteSpace: "pre-wrap", marginBottom: 12 }}>
        {post.text.slice(0, 220) || "(media only)"}
        {post.text.length > 220 && "…"}
      </p>

      <div className="flex items-center gap-16" style={{ marginBottom: 12 }}>
        <span className="text-soft mono" style={{ fontSize: 12 }}>❤️ {stats.likes.toLocaleString()}</span>
        <span className="text-soft mono" style={{ fontSize: 12 }}>💬 {stats.comments.toLocaleString()}</span>
        <span className="text-soft mono" style={{ fontSize: 12 }}>🔁 {stats.shares.toLocaleString()}</span>
        {isThread && <span className="chip">🧵 thread</span>}
      </div>

      <button
        className="btn btn-sm btn-ghost"
        onClick={() => {
          dispatch(saveDraft({ text: post.text, title: post.title, platformIds: post.platformIds, media: post.media || [] }));
          dispatch(pushToast("Copied into a new draft.", "success"));
        }}
      >
        ⎘ Reuse as draft
      </button>
    </div>
  );
}
