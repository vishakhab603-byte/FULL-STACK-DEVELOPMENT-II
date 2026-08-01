import { configureStore } from "@reduxjs/toolkit";
import composerReducer from "./slices/composerSlice";
import draftsReducer from "./slices/draftsSlice";
import scheduleReducer from "./slices/scheduleSlice";
import analyticsReducer from "./slices/analyticsSlice";
import uiReducer from "./slices/uiSlice";
import { loadState, saveState } from "../utils/storage";

const persisted = loadState();

export const store = configureStore({
  reducer: {
    composer: composerReducer,
    drafts: draftsReducer,
    schedule: scheduleReducer,
    analytics: analyticsReducer,
    ui: uiReducer,
  },
  preloadedState: persisted
    ? {
        drafts: { ...draftsReducer(undefined, { type: "@@init" }), ...persisted.drafts },
        schedule: { ...scheduleReducer(undefined, { type: "@@init" }), ...persisted.schedule },
        analytics: { ...analyticsReducer(undefined, { type: "@@init" }), ...persisted.analytics },
        ui: { ...uiReducer(undefined, { type: "@@init" }), ...persisted.ui },
      }
    : undefined,
});

let saveTimer = null;
store.subscribe(() => {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => saveState(store.getState()), 300);
});
