import { createSlice, nanoid } from "@reduxjs/toolkit";

const initialState = {
  queue: [], // [{ id, text, platformIds, scheduledFor, status: 'scheduled'|'published', publishedAt }]
};

const scheduleSlice = createSlice({
  name: "schedule",
  initialState,
  reducers: {
    schedulePost: {
      reducer(state, action) {
        state.queue.push(action.payload);
      },
      prepare({ text, title = "", platformIds, scheduledFor, media }) {
        return {
          payload: {
            id: nanoid(),
            text,
            title,
            platformIds,
            media,
            scheduledFor,
            status: "scheduled",
            createdAt: new Date().toISOString(),
            publishedAt: null,
          },
        };
      },
    },
    publishNow: {
      reducer(state, action) {
        state.queue.push(action.payload);
      },
      prepare({ text, title = "", platformIds, media }) {
        const now = new Date().toISOString();
        return {
          payload: {
            id: nanoid(),
            text,
            title,
            platformIds,
            media,
            scheduledFor: now,
            status: "published",
            createdAt: now,
            publishedAt: now,
          },
        };
      },
    },
    cancelScheduled(state, action) {
      state.queue = state.queue.filter((p) => p.id !== action.payload);
    },
    markPublished(state, action) {
      const item = state.queue.find((p) => p.id === action.payload);
      if (item) {
        item.status = "published";
        item.publishedAt = new Date().toISOString();
      }
    },
    reschedulePost(state, action) {
      const { id, scheduledFor } = action.payload;
      const item = state.queue.find((p) => p.id === id);
      if (item) item.scheduledFor = scheduledFor;
    },
  },
});

export const { schedulePost, publishNow, cancelScheduled, markPublished, reschedulePost } =
  scheduleSlice.actions;

export default scheduleSlice.reducer;
