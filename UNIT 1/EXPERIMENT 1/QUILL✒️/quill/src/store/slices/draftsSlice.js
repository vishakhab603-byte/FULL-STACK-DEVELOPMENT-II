import { createSlice, nanoid } from "@reduxjs/toolkit";

const initialState = {
  items: [], // [{ id, text, platformIds, media, tags, createdAt, updatedAt, history: [{ text, savedAt }] }]
  selectedIds: [],
  search: "",
  filterPlatform: "all",
  filterTag: "all",
};

const draftsSlice = createSlice({
  name: "drafts",
  initialState,
  reducers: {
    saveDraft: {
      reducer(state, action) {
        state.items.unshift(action.payload);
      },
      prepare({ text, title = "", platformIds, media, tags = [] }) {
        const now = new Date().toISOString();
        return {
          payload: {
            id: nanoid(),
            text,
            title,
            platformIds,
            media,
            tags,
            createdAt: now,
            updatedAt: now,
            history: [],
          },
        };
      },
    },
    updateDraft(state, action) {
      const { id, text, title, platformIds, media } = action.payload;
      const draft = state.items.find((d) => d.id === id);
      if (!draft) return;
      // push current version into history before overwriting
      draft.history.unshift({ text: draft.text, savedAt: draft.updatedAt });
      draft.history = draft.history.slice(0, 10);
      draft.text = text ?? draft.text;
      draft.title = title ?? draft.title;
      draft.platformIds = platformIds ?? draft.platformIds;
      draft.media = media ?? draft.media;
      draft.updatedAt = new Date().toISOString();
    },
    restoreVersion(state, action) {
      const { id, historyIndex } = action.payload;
      const draft = state.items.find((d) => d.id === id);
      if (!draft || !draft.history[historyIndex]) return;
      const restored = draft.history[historyIndex];
      draft.history.unshift({ text: draft.text, savedAt: draft.updatedAt });
      draft.text = restored.text;
      draft.updatedAt = new Date().toISOString();
    },
    deleteDraft(state, action) {
      state.items = state.items.filter((d) => d.id !== action.payload);
      state.selectedIds = state.selectedIds.filter((id) => id !== action.payload);
    },
    deleteMany(state, action) {
      const ids = new Set(action.payload);
      state.items = state.items.filter((d) => !ids.has(d.id));
      state.selectedIds = [];
    },
    duplicateMany(state, action) {
      const ids = new Set(action.payload);
      const copies = state.items
        .filter((d) => ids.has(d.id))
        .map((d) => ({
          ...d,
          id: nanoid(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          history: [],
        }));
      state.items = [...copies, ...state.items];
      state.selectedIds = [];
    },
    tagMany(state, action) {
      const { ids, tag } = action.payload;
      const idSet = new Set(ids);
      state.items.forEach((d) => {
        if (idSet.has(d.id) && !d.tags.includes(tag)) d.tags.push(tag);
      });
    },
    toggleSelected(state, action) {
      const id = action.payload;
      state.selectedIds = state.selectedIds.includes(id)
        ? state.selectedIds.filter((i) => i !== id)
        : [...state.selectedIds, id];
    },
    selectAll(state, action) {
      state.selectedIds = action.payload;
    },
    clearSelection(state) {
      state.selectedIds = [];
    },
    setSearch(state, action) {
      state.search = action.payload;
    },
    setFilterPlatform(state, action) {
      state.filterPlatform = action.payload;
    },
    setFilterTag(state, action) {
      state.filterTag = action.payload;
    },
  },
});

export const {
  saveDraft,
  updateDraft,
  restoreVersion,
  deleteDraft,
  deleteMany,
  duplicateMany,
  tagMany,
  toggleSelected,
  selectAll,
  clearSelection,
  setSearch,
  setFilterPlatform,
  setFilterTag,
} = draftsSlice.actions;

export default draftsSlice.reducer;
