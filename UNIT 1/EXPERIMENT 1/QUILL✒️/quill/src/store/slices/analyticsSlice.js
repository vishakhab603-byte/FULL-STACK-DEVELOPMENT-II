import { createSlice } from "@reduxjs/toolkit";
import { PLATFORM_LIST } from "../../utils/platformRules";

// deterministic-ish pseudo-random generator seeded per day so numbers don't
// jump around on every reload, but still look "alive".
function seededRandom(seed) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateSeries(days = 14) {
  const out = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const seed = d.getDate() * 31 + d.getMonth() * 97;
    const row = { date: key, label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) };
    PLATFORM_LIST.forEach((p, idx) => {
      const base = 40 + idx * 25;
      row[p.id] = Math.round(base + seededRandom(seed + idx * 13) * base * 1.8);
    });
    out.push(row);
  }
  return out;
}

const initialState = {
  engagementSeries: generateSeries(14),
  activityLog: {}, // { 'YYYY-MM-DD': count } — drafts saved + posts published, for the heatmap
};

const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {
    logActivity(state, action) {
      const dateKey = (action.payload || new Date().toISOString()).slice(0, 10);
      state.activityLog[dateKey] = (state.activityLog[dateKey] || 0) + 1;
    },
    regenerateSeries(state) {
      state.engagementSeries = generateSeries(14);
    },
  },
});

export const { logActivity, regenerateSeries } = analyticsSlice.actions;
export default analyticsSlice.reducer;
