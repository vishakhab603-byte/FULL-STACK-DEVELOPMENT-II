import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Send, ArrowRight, Trash2, Check, XCircle, MessageSquare, Lock } from "lucide-react";
import { selectRole } from "../features/auth/authSlice";
import {
  selectPosts, createPost, submitForApproval, approvePost,
  rejectPost, publishDirect, deletePost, moderatePost, PLATFORMS,
} from "../features/posts/postsSlice";
import { useCapability } from "../hooks/useCapability";
import { GRANTS } from "../utils/permission.utils";
import { Card, CardLabel } from "../components/Card";

function PostCard({ post, role, dispatch }) {
  const platform = PLATFORMS.find((p) => p.key === post.platform);
  const statusColor = { draft: "#8A93A6", pending: "#E0A030", published: "#22B57F" }[post.status];
  const can = (cap) => !!GRANTS[role.key][cap];
  const isAuthor = post.authorKey === role.key;

  const actionBtn = (label, Icon, onClick, allowed, tone = role.color) => (
    <button
      key={label}
      onClick={allowed ? onClick : undefined}
      disabled={!allowed}
      title={allowed ? label : "Not permitted for your current role"}
      style={{
        display: "flex", alignItems: "center", gap: 5, fontSize: 11, padding: "5px 9px", borderRadius: 7,
        background: allowed ? `${tone}18` : "rgba(255,255,255,0.03)",
        border: `1px solid ${allowed ? tone + "55" : "rgba(255,255,255,0.06)"}`,
        color: allowed ? "#F1F3F8" : "#586176", cursor: allowed ? "pointer" : "not-allowed",
      }}
    >
      {allowed ? <Icon size={11} /> : <Lock size={10} />} {label}
    </button>
  );

  return (
    <Card style={{ padding: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 600 }}>{post.title}</div>
          <div style={{ color: "#586176", fontSize: 10.5, marginTop: 2 }}>{post.authorName} · {platform.label}</div>
        </div>
        <span style={{ fontSize: 10, color: statusColor, border: `1px solid ${statusColor}55`, borderRadius: 6, padding: "2px 7px", textTransform: "uppercase", letterSpacing: 0.5 }}>{post.status}</span>
      </div>
      <div style={{ color: "#8A93A6", fontSize: 12, marginTop: 8, lineHeight: 1.5 }}>{post.body}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
        {post.status === "draft" && actionBtn("Submit for approval", Send, () => dispatch(submitForApproval(post.id)), can("createPost"))}
        {post.status === "draft" && actionBtn("Publish directly", ArrowRight, () => dispatch(publishDirect(post.id)), can("publishPost"))}
        {post.status === "draft" && actionBtn("Delete", Trash2, () => dispatch(deletePost(post.id)), can("manageUsers") || (isAuthor && can("editPost")), "#E14B4B")}
        {post.status === "pending" && actionBtn("Approve", Check, () => dispatch(approvePost(post.id)), can("approvePost"), "#22B57F")}
        {post.status === "pending" && actionBtn("Reject", XCircle, () => dispatch(rejectPost(post.id)), can("approvePost"), "#E14B4B")}
        {post.status === "published" && actionBtn(`Moderate (${post.comments})`, MessageSquare, () => dispatch(moderatePost(post.id)), can("moderateComments"))}
      </div>
    </Card>
  );
}

export default function CreatorStudio() {
  const role = useSelector(selectRole);
  const posts = useSelector(selectPosts);
  const dispatch = useDispatch();
  const canCreate = useCapability("createPost");

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [platform, setPlatform] = useState("linkedin");
  const limit = PLATFORMS.find((p) => p.key === platform).limit;

  const submit = () => {
    if (!title.trim() || !body.trim()) return;
    dispatch(createPost({ title: title.trim(), body: body.trim(), platform, authorKey: role.key, authorName: role.name }));
    setTitle("");
    setBody("");
  };

  const columns = [
    { key: "draft", label: "Drafts" },
    { key: "pending", label: "Pending Approval" },
    { key: "published", label: "Published" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 16 }}>
      <Card>
        <CardLabel>{canCreate ? "New Post" : "Composer"}</CardLabel>
        {!canCreate && (
          <div style={{ color: "#8A93A6", fontSize: 12, display: "flex", gap: 8, alignItems: "flex-start", background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 10 }}>
            <Lock size={13} style={{ marginTop: 1, flexShrink: 0 }} />
            <span>{role.label} does not hold the <b>Create Post</b> capability. Rotate the Identity Prism to Creator, Guardian, Commander, or Architect to compose.</span>
          </div>
        )}
        {canCreate && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <select value={platform} onChange={(e) => setPlatform(e.target.value)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#F1F3F8", padding: "7px 8px", fontSize: 12 }}>
              {PLATFORMS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
            </select>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Post title" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#F1F3F8", padding: "8px 10px", fontSize: 12.5 }} />
            <textarea value={body} onChange={(e) => setBody(e.target.value.slice(0, limit))} placeholder="What's happening?" rows={5} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#F1F3F8", padding: "8px 10px", fontSize: 12.5, resize: "none", fontFamily: "inherit" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#586176", fontSize: 10.5 }}>{body.length} / {limit}</span>
              <button onClick={submit} style={{ background: `${role.color}22`, border: `1px solid ${role.color}66`, color: role.color, borderRadius: 8, padding: "7px 14px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>Save as draft</button>
            </div>
          </div>
        )}
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {columns.map((col) => (
          <div key={col.key}>
            <CardLabel>{col.label} ({posts.filter((p) => p.status === col.key).length})</CardLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {posts.filter((p) => p.status === col.key).map((post) => (
                <PostCard key={post.id} post={post} role={role} dispatch={dispatch} />
              ))}
              {posts.filter((p) => p.status === col.key).length === 0 && <div style={{ color: "#3a4152", fontSize: 11.5 }}>Nothing here.</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
