import { saveState } from '../utils/localStorage';
import { sidebarToggled } from '../features/ui/uiSlice';
import { searchCommitted, searchHistoryCleared } from '../features/search/searchSlice';


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
