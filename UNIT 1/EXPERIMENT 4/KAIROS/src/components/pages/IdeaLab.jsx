import { useState, useMemo } from "react";

function IdeaLab({ content }) {
    const [text, setText] = useState("");
    const [category, setCategory] = useState("general");
    const ideas = useMemo(() => content.items.filter(i => i.stage === "idea").sort((a, b) => b.createdAt - a.createdAt), [content.items]);
    function handleCapture() {
        if (!text.trim())
            return;
        const item = content.createIdea(text.trim());
        content.updateItem(item.id, { tags: [category.trim() || "general"] });
        setText("");
    }
    return (<div className="page-canvas">
      <div className="topbar">
        <div>
          <div className="serif" style={{ fontSize: 24 }}>Idea Lab</div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>Fleeting thoughts, hooks, and half-formed sparks — captured before they vanish.</div>
        </div>
      </div>

      <div className="card" style={{ padding: 20, marginBottom: 18 }}>
        <textarea rows={2} placeholder="capture a hook, caption, question, unfinished thought…" value={text}
          onChange={e => setText(e.target.value)}
          style={{ width: "100%", resize: "vertical", background: "rgba(255,255,255,0.03)", border: "1px solid var(--panel-border)", borderRadius: 10, padding: "10px 12px", color: "var(--text)", fontFamily: "inherit", fontSize: 13.5 }}/>
        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <input type="text" value={category} onChange={e => setCategory(e.target.value)} style={{ width: 140 }}/>
          <button className="btn btn-primary" onClick={handleCapture}>+ Capture idea</button>
        </div>
      </div>

      <div className="card" style={{ padding: 20, minHeight: 160 }}>
        {ideas.length === 0
        ? (<div style={{ textAlign: "center", color: "var(--muted)", padding: "30px 0" }}>
            <div style={{ fontSize: 30, marginBottom: 8 }}>💭</div>
            <div>Your next idea hasn't arrived yet.</div>
          </div>)
        : (<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {ideas.map(idea => (<div key={idea.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", border: "1px solid var(--panel-border)", borderRadius: 10, background: "rgba(255,255,255,0.02)" }}>
              <div>
                <div style={{ fontSize: 13 }}>{idea.title}</div>
                <div style={{ fontSize: 10.5, color: "var(--accent2)", marginTop: 2 }}>{idea.tags[0] || "general"}</div>
              </div>
              <button className="btn-ghost" onClick={() => content.deleteItem(idea.id)} style={{ fontSize: 12, color: "var(--muted)" }}>✕</button>
            </div>))}
          </div>)}
      </div>
    </div>);
}

export { IdeaLab };
