import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { regenerateSeries } from "../../store/slices/analyticsSlice";
import { exportAsCSV, exportAsJSON } from "../../utils/csvExport";
import { PLATFORM_LIST } from "../../utils/platformRules";
import ContentHeatmap from "./ContentHeatmap";

export default function AnalyticsDashboard() {
  const dispatch = useDispatch();
  const { engagementSeries, activityLog } = useSelector((s) => s.analytics);
  const drafts = useSelector((s) => s.drafts.items);
  const queue = useSelector((s) => s.schedule.queue);

  const totals = PLATFORM_LIST.map((p) => ({
    id: p.id,
    name: p.name,
    color: p.color,
    total: engagementSeries.reduce((sum, row) => sum + (row[p.id] || 0), 0),
  }));

  return (
    <div className="flex-col gap-24">
      <div className="flex justify-between items-center" style={{ flexWrap: "wrap", gap: 10 }}>
        <p className="text-faint" style={{ fontSize: 13 }}>
          Simulated engagement — a realistic-looking stand-in until your accounts are connected.
        </p>
        <div className="flex gap-8">
          <button className="btn btn-sm" onClick={() => dispatch(regenerateSeries())}>🎲 Reshuffle data</button>
          <button
            className="btn btn-sm"
            onClick={() => exportAsCSV(engagementSeries, "quill-engagement.csv")}
          >
            ⬇ Export CSV
          </button>
          <button
            className="btn btn-sm"
            onClick={() => exportAsJSON({ engagementSeries, drafts, queue }, "quill-analytics.json")}
          >
            ⬇ Export JSON
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <p className="eyebrow" style={{ marginBottom: 14 }}>Engagement, last 14 days</p>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={engagementSeries}>
            <CartesianGrid stroke="var(--line)" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--ink-faint)" }} axisLine={{ stroke: "var(--line)" }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "var(--ink-faint)" }} axisLine={false} tickLine={false} width={34} />
            <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid var(--line)", fontSize: 12.5 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {PLATFORM_LIST.map((p) => (
              <Line key={p.id} type="monotone" dataKey={p.id} name={p.name} stroke={p.color} strokeWidth={2} dot={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <p className="eyebrow" style={{ marginBottom: 14 }}>Total engagement by platform</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={totals}>
            <CartesianGrid stroke="var(--line)" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11.5, fill: "var(--ink-faint)" }} axisLine={{ stroke: "var(--line)" }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "var(--ink-faint)" }} axisLine={false} tickLine={false} width={40} />
            <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid var(--line)", fontSize: 12.5 }} />
            <Bar dataKey="total" radius={[6, 6, 0, 0]}>
              {totals.map((t) => (
                <Cell key={t.id} fill={t.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <p className="eyebrow" style={{ marginBottom: 14 }}>Drafting activity</p>
        <ContentHeatmap activityLog={activityLog} />
      </div>
    </div>
  );
}
