import { achievementUnlocked } from '../features/achievements/achievementsSlice';
import { toastPushed, confettiTriggered } from '../features/ui/uiSlice';
import { ACHIEVEMENT_MAP } from '../data/achievements';
import { saveState } from '../utils/localStorage';


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
