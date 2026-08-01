import { createSlice, nanoid } from '@reduxjs/toolkit';

/* ==========================================================================
   ACTIVITY SLICE — a running timeline of everything that happened,
   appended to by the listener middleware. Capped to avoid unbounded growth.
   ========================================================================== */

const MAX_ENTRIES = 200;

const initialState = {
  entries: [] // [{ id, label, meta, timestamp }]
};

const activitySlice = createSlice({
  name: 'activity',
  initialState,
  reducers: {
    activityLogged: {
      reducer(state, action) {
        state.entries.unshift(action.payload);
        if (state.entries.length > MAX_ENTRIES) {
          state.entries.length = MAX_ENTRIES;
        }
      },
      prepare({ label, meta = null }) {
        return {
          payload: { id: nanoid(), label, meta, timestamp: new Date().toISOString() }
        };
      }
    },
    activityCleared(state) {
      state.entries = [];
    }
  }
});

export const { activityLogged, activityCleared } = activitySlice.actions;

export default activitySlice.reducer;
