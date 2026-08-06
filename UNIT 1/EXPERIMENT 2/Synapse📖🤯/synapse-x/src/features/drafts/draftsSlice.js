import { createSlice, nanoid } from '@reduxjs/toolkit';
import { loadState } from '../../utils/localStorage';

const persisted = loadState('drafts');

const initialState = persisted || {
  current: { title: '', content: '', platformId: null },
  lastSavedAt: null,
  versions: [] // [{ id, title, content, platformId, savedAt }]
};

const draftsSlice = createSlice({
  name: 'drafts',
  initialState,
  reducers: {
    draftUpdated(state, action) {
      state.current = { ...state.current, ...action.payload };
    },
    draftAutosaved(state) {
      state.lastSavedAt = new Date().toISOString();
      state.versions.unshift({
        id: nanoid(),
        ...state.current,
        savedAt: state.lastSavedAt
      });
      // keep the last 20 snapshots only
      state.versions = state.versions.slice(0, 20);
    },
    draftRestored(state, action) {
      const version = state.versions.find((v) => v.id === action.payload);
      if (version) {
        state.current = { title: version.title, content: version.content, platformId: version.platformId };
      }
    },
    draftCleared(state) {
      state.current = { title: '', content: '', platformId: null };
    },
    draftVersionDeleted(state, action) {
      state.versions = state.versions.filter((v) => v.id !== action.payload);
    }
  }
});

export const { draftUpdated, draftAutosaved, draftRestored, draftCleared, draftVersionDeleted } =
  draftsSlice.actions;

export default draftsSlice.reducer;
