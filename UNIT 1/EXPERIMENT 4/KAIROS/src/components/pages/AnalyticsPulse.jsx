import { useState } from "react";
import { Calendar } from "./Calendar";
import { BarChart } from "../shared/BarChart";
import { DNAHelix } from "../shared/DNAHelix";
import { STAGES, STAGE_COLORS, STAGE_LABELS } from "../../state/contentStore";
import { eventDateKey } from "../../lib/dateUtils";
import { ObservatoryHeader, TelemetryStrip } from "../shared/ObservatoryHeader";

function AnalyticsPulse({ events, content, activity }) {
    const [, forceTick] = useState(0);
    const byStage = STAGES.map(s => ({ label: STAGE_LABELS[s].slice(0, 4), value: content.items.filter(i => i.stage === s).length, color: STAGE_COLORS[s] }));
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const monthPrefix = `${year}-${String(month + 1).padStart(2, "0")}-`;
    const monthEvents = events.filter(e => eventDateKey(e, year, month) && eventDateKey(e, year, month).startsWith(monthPrefix));
    const buckets = [[1, 7], [8, 14], [15, 21], [22, 28], [29, 31]];
    const byWeek = buckets.map(([a, b]) => ({
        label: `${a}–${b}`,
        value: monthEvents.filter(e => { const d = Number((eventDateKey(e, year, month) || "").slice(-2)); return d >= a && d <= b; }).length,
        color: "var(--accent2)"
    }));
    const now = Date.now();
    const recentCount = activity.log.filter(l => now - l.ts < 5 * 60 * 1000).length;
    const pulseIntensity = Math.min(1, recentCount / 8);
    const orbSize = 90 + pulseIntensity * 40;
    const days = new Set(activity.log.map(l => new Date(l.ts).toDateString()));
    const streak = days.size;
    const published = content.items.filter(i => i.stage === "published").length;
    const labsTouched = new Set(activity.log.map(l => {
        const t = l.text.toLowerCase();
        if (t.includes("scheduler duel")) return "scheduler";
        if (t.includes("chaos lab")) return "chaos";
        if (t.includes("test command")) return "tests";
        if (t.includes("optimization")) return "optimization";
        return "studio";
    }));
    const coherence = Math.min(100, 35 + Math.min(30, activity.count * 2) + Math.min(20, content.items.length * 4) + Math.min(15, labsTouched.size * 3));
    const last24h = activity.log.filter(l => now - l.ts < 24 * 60 * 60 * 1000).length;
    return (<div className="fade-in">
      <ObservatoryHeader title="Analytics & Creator Pulse" status="LIVE STATE" subtitle="The Observatory now reads the same persistent workspace as the studio: calendar, content, XP, and the shared action chronicle.">
        <button className="btn" onClick={() => forceTick(t => t + 1)}>Refresh</button>
      </ObservatoryHeader>

      <TelemetryStrip items={[
        { label: "COHERENCE", value: `${coherence}%`, note: "workspace signal" },
        { label: "ACTIONS", value: activity.count, note: "persistent chronicle" },
        { label: "24H PULSE", value: last24h, note: "actions in last day" },
        { label: "LABS TOUCHED", value: labsTouched.size, note: "observatory instruments" }
      ]} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14, marginBottom: 18 }}>
        <div className="card" style={{ padding: 18 }}>
          <div className="stat-label">Content items</div>
          <div className="stat-big">{content.items.length}</div>
        </div>
        <div className="card" style={{ padding: 18 }}>
          <div className="stat-label">Published</div>
          <div className="stat-big" style={{ color: "var(--accent2)" }}>{published}</div>
        </div>
        <div className="card" style={{ padding: 18 }}>
          <div className="stat-label">Calendar events</div>
          <div className="stat-big">{events.length}</div>
        </div>
        <div className="card" style={{ padding: 18 }}>
          <div className="stat-label">Active days this session</div>
          <div className="stat-big" style={{ color: "var(--gold)" }}>{streak}</div>
        </div>
        <div className="card" style={{ padding: 18 }}>
          <div className="stat-label">Total XP</div>
          <div className="stat-big">{activity.xp}</div>
        </div>
      </div>


      <div className="observatory-map-card">
        <div>
          <div className="section-title">Observatory Signal Map</div>
          <div className="observatory-map-copy">Your work now leaves a persistent trail across KAIROS. The map is an interpretation of real workspace state — not a fabricated performance score.</div>
        </div>
        <div className="signal-map">
          {[
            ["STUDIO", content.items.length, "content"],
            ["CALENDAR", events.length, "calendar"],
            ["ENGINEERING", labsTouched.has("scheduler") || labsTouched.has("optimization") ? 1 : 0, "engineering"],
            ["VERIFICATION", labsTouched.has("tests") || labsTouched.has("chaos") ? 1 : 0, "verification"],
            ["HISTORY", Math.min(40, activity.log.length), "history"]
          ].map(([label, value, key]) => (
            <div className={`signal-node ${value ? "active" : ""}`} key={key}>
              <div className="signal-node-orbit"><i/><i/><i/></div>
              <div className="signal-node-core">{value}</div>
              <div className="signal-node-label">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div className="card" style={{ padding: 20 }}>
          <div className="section-title">Content by pipeline stage</div>
          <BarChart data={byStage}/>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div className="section-title">Calendar events by week of month</div>
          <BarChart data={byWeek}/>
        </div>
      </div>

      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <div className="section-title">Creator Pulse</div>
        <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>Pulses faster the more you've actually done in the last 5 minutes — {recentCount} real action(s) recently.</div>
        <div className="pulse-orb-wrap">
          <div className="pulse-ring" style={{ width: orbSize, height: orbSize, animationDuration: (2.6 - pulseIntensity * 1.4) + "s" }}/>
          <div className="pulse-ring" style={{ width: orbSize, height: orbSize, animationDuration: (2.6 - pulseIntensity * 1.4) + "s", animationDelay: "0.6s" }}/>
          <div className="pulse-orb" style={{ width: orbSize, height: orbSize }}/>
        </div>
      </div>

      <div className="card" style={{ padding: 20, marginBottom: 16, display: "flex", justifyContent: "center" }}>
        <div>
          <div className="section-title" style={{ textAlign: "center" }}>Temporal DNA</div>
          <DNAHelix log={activity.log}/>
        </div>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <div className="section-title">Audit Chronicle</div>
        <div className="drag-log" style={{ maxHeight: 220 }}>
          {activity.log.slice(0, 20).map(l => (<div key={l.id} className="drag-log-line">{new Date(l.ts).toLocaleTimeString()} — {l.text} <span style={{ color: "var(--gold)" }}>+{l.xp}xp</span></div>))}
          {activity.log.length === 0 && <div style={{ fontSize: 12, color: "var(--muted)" }}>Nothing logged yet — go schedule or create something.</div>}
        </div>
      </div>
    </div>);
}

export { AnalyticsPulse };
