import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  text: "",
  title: "",
  platformIds: ["x"],
  media: [], // [{ id, name, alt }]
  scheduledFor: null, // ISO string, null = publish now
  editingDraftId: null, // set when composer was opened "from" a draft
};

const composerSlice = createSlice({
  name: "composer",
  initialState,
  reducers: {
    setText(state, action) {
      state.text = action.payload;
    },
    setTitle(state, action) {
      state.title = action.payload;
    },
    togglePlatform(state, action) {
      const id = action.payload;
      if (state.platformIds.includes(id)) {
        state.platformIds = state.platformIds.filter((p) => p !== id);
      } else {
        state.platformIds.push(id);
      }
    },
    addMedia(state, action) {
      state.media.push(action.payload);
    },
    removeMedia(state, action) {
      state.media = state.media.filter((m) => m.id !== action.payload);
    },
    setMediaAlt(state, action) {
      const { id, alt } = action.payload;
      const m = state.media.find((m) => m.id === id);
      if (m) m.alt = alt;
    },
    setScheduledFor(state, action) {
      state.scheduledFor = action.payload;
    },
    setText_appendEmoji(state, action) {
      state.text += action.payload;
    },
    loadFromDraft(state, action) {
      const d = action.payload;
      state.text = d.text;
      state.title = d.title || "";
      state.platformIds = d.platformIds;
      state.media = d.media;
      state.editingDraftId = d.id;
      state.scheduledFor = null;
    },
    resetComposer(state) {
      Object.assign(state, initialState, { platformIds: state.platformIds.length ? [state.platformIds[0]] : ["x"] });
    },
  },
});

export const {
  setText,
  setTitle,
  togglePlatform,
  addMedia,
  removeMedia,
  setMediaAlt,
  setScheduledFor,
  loadFromDraft,
  resetComposer,
} = composerSlice.actions;

export default composerSlice.reducer;
