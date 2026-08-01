import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  platform: 'all', // 'all' | platformId
  status: 'all', // 'all' | 'draft' | 'published' | 'scheduled' | 'archived'
  favoriteOnly: false,
  archivedOnly: false
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    platformFilterChanged(state, action) {
      state.platform = action.payload;
    },
    statusFilterChanged(state, action) {
      state.status = action.payload;
    },
    favoriteOnlyToggled(state) {
      state.favoriteOnly = !state.favoriteOnly;
    },
    archivedOnlyToggled(state) {
      state.archivedOnly = !state.archivedOnly;
    },
    filtersReset() {
      return initialState;
    }
  }
});

export const {
  platformFilterChanged,
  statusFilterChanged,
  favoriteOnlyToggled,
  archivedOnlyToggled,
  filtersReset
} = filtersSlice.actions;

export default filtersSlice.reducer;
