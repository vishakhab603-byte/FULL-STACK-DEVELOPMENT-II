import { createSlice } from '@reduxjs/toolkit';
import { loadState } from '../../utils/localStorage';

const persisted = loadState('recentSearches');

const initialState = {
  query: '',
  recent: persisted || [] // most-recent-first, capped at 8
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    searchQueryChanged(state, action) {
      state.query = action.payload;
    },
    searchCommitted(state, action) {
      const term = action.payload.trim();
      if (!term) return;
      state.recent = [term, ...state.recent.filter((t) => t !== term)].slice(0, 8);
    },
    searchHistoryCleared(state) {
      state.recent = [];
    },
    searchCleared(state) {
      state.query = '';
    }
  }
});

export const { searchQueryChanged, searchCommitted, searchHistoryCleared, searchCleared } = searchSlice.actions;

export default searchSlice.reducer;
