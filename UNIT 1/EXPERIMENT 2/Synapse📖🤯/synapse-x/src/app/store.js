import { configureStore } from '@reduxjs/toolkit';

import postsReducer from '../features/posts/postsSlice';
import platformsReducer from '../features/platforms/platformsSlice';
import draftsReducer from '../features/drafts/draftsSlice';
import notificationsReducer from '../features/notifications/notificationsSlice';
import activityReducer from '../features/activity/activitySlice';
import filtersReducer from '../features/filters/filtersSlice';
import searchReducer from '../features/search/searchSlice';
import uiReducer from '../features/ui/uiSlice';
import achievementsReducer from '../features/achievements/achievementsSlice';

import { listenerMiddleware } from './listenerMiddleware';
import { persistenceMiddleware } from './persistenceMiddleware';
import { loggerMiddleware, performanceMiddleware, analyticsMiddleware } from './middleware';

/* ==========================================================================
   STORE — "the brain". Every slice below is a decision center; the
   listener middleware is the nervous system connecting them.
   ========================================================================== */

export const store = configureStore({
  reducer: {
    posts: postsReducer,
    platforms: platformsReducer,
    drafts: draftsReducer,
    notifications: notificationsReducer,
    activity: activityReducer,
    filters: filtersReducer,
    search: searchReducer,
    ui: uiReducer,
    achievements: achievementsReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .prepend(listenerMiddleware.middleware)
      .concat(performanceMiddleware, analyticsMiddleware, persistenceMiddleware, loggerMiddleware),
  devTools: import.meta.env.DEV
});

export default store;
