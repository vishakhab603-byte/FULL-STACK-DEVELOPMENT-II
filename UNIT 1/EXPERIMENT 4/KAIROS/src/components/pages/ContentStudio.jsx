import { useState, useMemo, useEffect, useRef } from "react";
import { TemporalParticles } from "../shared/TemporalParticles";
import { STAGES, STAGE_COLORS, STAGE_LABELS, roastContent, scoreContent } from "../../state/contentStore";
import { dateKeyFromDate, parseDateKey } from "../../lib/dateUtils";

function ContentEditor({ item, onUpdate, onClose }) {
    const [caption, setCaption] = useState(item.caption || "");
    const [tagsText, setTagsText] = useState((item.tags || []).join(", "));
    const [roastOn, setRoastOn] = useState(false);
    const draft = { ...item, caption, tags: tagsText.split(",").map(t => t.trim()).filter(Boolean) };
    const quality = scoreContent(draft);
    const roast = roastOn ? roastContent(draft) : null;
    function save() {
        onUpdate(item.id, { caption, tags: draft.tags });
        onClose();
    }
    return (<div className="modal-backdrop" onClick={onClose}>
      <div className="card modal" style={{ width: "min(560px,92vw)" }} onClick={e => e.stopPropagation()}>
        <div className="section-title">{item.title}</div>
        <textarea value={caption} onChange={e => setCaption(e.target.value)} placeholder="Write the caption..." style={{ width: "100%", minHeight: 110, background: "rgba(255,255,255,0.05)", border: "1px solid var(--panel-border)",
            color: "var(--text)", borderRadius: 10, padding: "10px 12px", fontSize: 13, fontFamily: "inherit", resize: "vertical" }}/>
        <div style={{ marginTop: 10 }}>
          <div className="section-title" style={{ marginBottom: 6 }}>Tags (comma separated)</div>
          <input type="text" value={tagsText} onChange={e => setTagsText(e.target.value)} placeholder="launch, product, tips"/>
        </div>

        <div style={{ marginTop: 16 }}>
          <div className="section-title" style={{ marginBottom: 8 }}>Content Score <span style={{ color: "var(--muted)", textTransform: "none", letterSpacing: 0 }}>· heuristic, not a virality prediction</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <div className="stat-big" style={{ fontSize: 26 }}>{quality.overall}</div>
            <div className="progress-bar" style={{ flex: 1 }}><div className="progress-fill" style={{ width: quality.overall + "%" }}/></div>
          </div>
          {[["Hook", quality.hookScore, "var(--accent)"], ["CTA", quality.ctaScore, "var(--accent2)"], ["Length", quality.lengthScore, "var(--gold)"], ["Tags", quality.tagScore, "#7dd3fc"], ["Structure", quality.structureScore, "#e2607a"]].map(([label, val, color]) => (<div key={label} className="quality-row">
              <span className="qlabel">{label}</span>
              <div className="qbar"><div className="qfill" style={{ width: val + "%", background: color }}/></div>
            </div>))}
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button className="btn" onClick={() => setRoastOn(r => !r)}>{roastOn ? "Hide Roast Mode" : "🔥 Roast Mode"}</button>
        </div>

        {roast && <div style={{ marginTop: 12 }}>
          {roast.roast.map((line, i) => <div key={i} className="roast-line">{line}</div>)}
          <div className="section-title" style={{ marginTop: 10, marginBottom: 6 }}>Actual improvements</div>
          {roast.improvements.map((line, i) => <div key={i} className="improve-line">✓ {line}</div>)}
        </div>}

        <div style={{ display: "flex", gap: 8, marginTop: 18, justifyContent: "flex-end" }}>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={save}>Save</button>
        </div>
      </div>
    </div>);
}

function ScheduledPostsPanel({ items }) {
    const scheduled = useMemo(() => (items || []).filter(i => i.stage === "scheduled" && (i.date || i.day)).sort((a, b) => String(a.date || "9999-99-99").localeCompare(String(b.date || "9999-99-99"))), [items]);
    const todayKey = dateKeyFromDate(new Date());
    if (scheduled.length === 0)
        return null;
    return (<div className="card" style={{ padding: "16px 20px", marginBottom: 18 }}>
      <div className="section-title" style={{ marginBottom: 12 }}>🚀 Launch queue</div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {scheduled.map(item => {
            const itemDate = item.date ? parseDateKey(item.date) : null;
            const todayDate = parseDateKey(todayKey);
            const diff = itemDate && todayDate ? Math.round((itemDate - todayDate) / 86400000) : 0;
            const label = diff === 0 ? "Launching today" : diff === 1 ? "Tomorrow" : diff > 1 ? `In ${diff} days` : itemDate ? itemDate.toLocaleDateString(undefined, { month: "short", day: "numeric" }) : `Day ${item.day}`;
            const soon = diff <= 0;
            return (<div key={item.id} className="launch-chip" style={{ borderColor: soon ? "var(--accent2)" : "var(--panel-border)" }}>
              <span className={"launch-rocket" + (soon ? " launch-rocket-go" : "")}>🚀</span>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 600 }}>{item.title}</div>
                <div style={{ fontSize: 10.5, color: soon ? "var(--accent2)" : "var(--muted)" }}>{label}</div>
              </div>
            </div>);
        })}
      </div>
    </div>);
}

function ContentStudio({ content }) {
    const [ideaTitle, setIdeaTitle] = useState("");
    const [editing, setEditing] = useState(null);
    const [dragOverStage, setDragOverStage] = useState(null);
    const [scheduleFor, setScheduleFor] = useState(null);
    const [dayInput, setDayInput] = useState(String(new Date().getDate()));
    const [showThread, setShowThread] = useState(false);
    function handleDrop(stage) {
        const id = Number(sessionStorage.getItem("kairos-content-drag-id"));
        if (stage === "scheduled") {
            setScheduleFor(id);
        }
        else {
            content.moveStage(id, stage);
        }
        setDragOverStage(null);
    }
    function confirmSchedule() {
        const day = Number(dayInput) || 1;
        const now = new Date();
        const max = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const safeDay = Math.max(1, Math.min(max, day));
        content.moveStage(scheduleFor, "scheduled", safeDay, `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(safeDay).padStart(2, "0")}`);
        setScheduleFor(null);
    }
    function captureIdea() {
        if (!ideaTitle.trim())
            return;
        content.createIdea(ideaTitle.trim());
        setIdeaTitle("");
        setShowThread(true);
        if (threadTimerRef.current) window.clearTimeout(threadTimerRef.current);
        threadTimerRef.current = window.setTimeout(() => setShowThread(false), 900);
    }
    return (<div className="page-canvas" style={{ position: "relative" }}>
      <TemporalParticles type="thread" active={showThread} count={10}/>
      <div className="topbar">
        <div>
          <div className="serif" style={{ fontSize: 24 }}>Content Studio</div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>Real content objects moving through a real pipeline — drag any card between stages.</div>
        </div>
      </div>

      <div className="card" style={{ padding: "14px 20px", marginBottom: 18, display: "flex", gap: 10, alignItems: "center" }}>
        <input type="text" placeholder="Capture a new idea, hook, or content angle…" value={ideaTitle} onChange={e => setIdeaTitle(e.target.value)} onKeyDown={e => { if (e.key === "Enter")
        captureIdea(); }}/>
        <button className="btn btn-primary" onClick={captureIdea}>Add to Idea Lab</button>
      </div>

      <ScheduledPostsPanel items={content.items}/>

      <div className="pipeline-board">
        {STAGES.map(stage => {
            const items = content.items.filter(i => i.stage === stage);
            return (<div key={stage} className={"pipeline-col" + (dragOverStage === stage ? " dragover" : "")} onDragOver={e => { e.preventDefault(); setDragOverStage(stage); }} onDragLeave={() => setDragOverStage(p => p === stage ? null : p)} onDrop={e => { e.preventDefault(); handleDrop(stage); }}>
              <div className="pipeline-col-head">
                <span className="pipeline-col-dot" style={{ background: STAGE_COLORS[stage], color: STAGE_COLORS[stage] }}/>
                {STAGE_LABELS[stage]} · {items.length}
              </div>
              {items.map(item => (<div key={item.id} className="pipeline-card" draggable onDragStart={() => sessionStorage.setItem("kairos-content-drag-id", item.id)} onClick={() => setEditing(item)}>
                  <b style={{ fontSize: 12.5 }}>{item.title}</b>
                  {(item.date || item.day) && <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 4 }}>{item.date || `day ${item.day}`}</div>}
                  {item.caption && <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>{item.caption.slice(0, 60)}{item.caption.length > 60 ? "…" : ""}</div>}
                  <div className="tags">
                    {(item.tags || []).map(t => <span key={t} className="pipeline-tag">#{t}</span>)}
                  </div>
                  <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                    <button className="btn btn-ghost" style={{ padding: "4px 8px", fontSize: 10.5 }} onClick={(e) => { e.stopPropagation(); content.deleteItem(item.id); }}>Delete</button>
                  </div>
                </div>))}
            </div>);
        })}
      </div>

      {editing && <ContentEditor item={editing} onUpdate={content.updateItem} onClose={() => setEditing(null)}/>}

      {scheduleFor !== null &&
            <div className="modal-backdrop" onClick={() => setScheduleFor(null)}>
          <div className="card modal" onClick={e => e.stopPropagation()}>
            <div className="section-title">Schedule for which day?</div>
            <input type="number" min="1" max="31" value={dayInput} onChange={e => setDayInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter")
                confirmSchedule(); }}/>
            <div style={{ display: "flex", gap: 8, marginTop: 14, justifyContent: "flex-end" }}>
              <button className="btn" onClick={() => setScheduleFor(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={confirmSchedule}>Confirm</button>
            </div>
          </div>
        </div>}
    </div>);
}

export { ContentEditor, ScheduledPostsPanel, ContentStudio };
