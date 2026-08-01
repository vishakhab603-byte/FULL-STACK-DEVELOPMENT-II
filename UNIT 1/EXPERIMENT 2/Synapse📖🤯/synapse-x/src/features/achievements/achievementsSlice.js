import { createSlice } from '@reduxjs/toolkit';
import { loadState } from '../../utils/localStorage';

const persisted = loadState('achievements');

const initialState = {
  unlockedIds: persisted?.unlockedIds || [],
  unlockedAt: persisted?.unlockedAt || {} // { [id]: isoString }
};

const achievementsSlice = createSlice({
  name: 'achievements',
  initialState,
  reducers: {
    achievementUnlocked(state, action) {
      const id = action.payload;
      if (!state.unlockedIds.includes(id)) {
        state.unlockedIds.push(id);
        state.unlockedAt[id] = new Date().toISOString();
      }
    },
    achievementsReset(state) {
      state.unlockedIds = [];
      state.unlockedAt = {};
    }
  }
});

export const { achievementUnlocked, achievementsReset } = achievementsSlice.actions;
export default achievementsSlice.reducer;
