import { achievementUnlocked } from '../features/achievements/achievementsSlice';
import { toastPushed, confettiTriggered } from '../features/ui/uiSlice';
import { ACHIEVEMENT_MAP } from '../data/achievements';
import { saveState } from '../utils/localStorage';

/**
 * Thunk: unlocks an achievement exactly once, celebrates it with a toast +
 * confetti, and persists progress. Safe to dispatch repeatedly — no-ops if
 * already unlocked. Works from components (useAppDispatch) and from the
 * listener middleware (api.dispatch) since both are just Redux dispatch.
 */
export function unlockAchievementThunk(id) {
  return (dispatch, getState) => {
    const already = getState().achievements.unlockedIds.includes(id);
    if (already) return;

    const def = ACHIEVEMENT_MAP[id];
    dispatch(achievementUnlocked(id));
    dispatch(toastPushed({ tone: 'celebration', message: `${def?.icon || '🏆'} Achievement unlocked: ${def?.title || id}` }));
    dispatch(confettiTriggered());

    saveState('achievements', getState().achievements);
  };
}
