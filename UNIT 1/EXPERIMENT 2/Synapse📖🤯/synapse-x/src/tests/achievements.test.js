import { describe, it, expect, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import achievementsReducer from '../features/achievements/achievementsSlice';
import uiReducer from '../features/ui/uiSlice';
import { unlockAchievementThunk } from '../app/achievementHelpers';

vi.mock('../utils/localStorage', () => ({
  loadState: () => undefined,
  saveState: vi.fn(),
  removeState: vi.fn()
}));

function buildStore() {
  return configureStore({ reducer: { achievements: achievementsReducer, ui: uiReducer } });
}

describe('unlockAchievementThunk', () => {
  it('unlocks an achievement and fires a celebration toast + confetti', () => {
    const store = buildStore();
    store.dispatch(unlockAchievementThunk('first-synapse'));

    const state = store.getState();
    expect(state.achievements.unlockedIds).toContain('first-synapse');
    expect(state.ui.toasts.some((t) => t.tone === 'celebration')).toBe(true);
    expect(state.ui.confettiNonce).toBe(1);
  });

  it('is idempotent — unlocking twice only records it once', () => {
    const store = buildStore();
    store.dispatch(unlockAchievementThunk('going-live'));
    store.dispatch(unlockAchievementThunk('going-live'));

    const state = store.getState();
    const occurrences = state.achievements.unlockedIds.filter((id) => id === 'going-live').length;
    expect(occurrences).toBe(1);
    expect(state.ui.confettiNonce).toBe(1); // second dispatch was a no-op
  });
});
