import { createSlice } from "@reduxjs/toolkit";

const MAX_ENTRIES = 50;

const auditSlice = createSlice({
  name: "audit",
  initialState: { entries: [] },
  reducers: {
    addEntry: {
      reducer(state, action) {
        state.entries.unshift(action.payload);
        if (state.entries.length > MAX_ENTRIES) state.entries.length = MAX_ENTRIES;
      },
      prepare({ type, message, color }) {
        return {
          payload: {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            type,
            message,
            color,
            time: new Date().toLocaleTimeString(),
          },
        };
      },
    },
    clearAudit(state) {
      state.entries = [];
    },
  },
});

export const { addEntry, clearAudit } = auditSlice.actions;
export default auditSlice.reducer;

export const selectAuditLog = (state) => state.audit.entries;
