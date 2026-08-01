import { saveState } from '../utils/localStorage';
import { sidebarToggled } from '../features/ui/uiSlice';
import { searchCommitted, searchHistoryCleared } from '../features/search/searchSlice';

/* ==========================================================================
   PERSISTENCE MIDDLEWARE — mirrors selected slices of state to
   localStorage after actions that should survive a refresh.
   Theme + drafts are handled by the listener middleware; this covers the rest.
   ========================================================================== */

const WATCHED = new Set([sidebarToggled.type, searchCommitted.type, searchHistoryCleared.type]);

export const persistenceMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  if (WATCHED.has(action.type)) {
    const state = store.getState();
    if (action.type === sidebarToggled.type) {
      saveState('ui', {
        theme: state.ui.theme,
        sidebarCollapsed: state.ui.sidebarCollapsed,
        matrixThemeUnlocked: state.ui.matrixThemeUnlocked
      });
    } else {
      saveState('recentSearches', state.search.recent);
    }
  }
  return result;
};
