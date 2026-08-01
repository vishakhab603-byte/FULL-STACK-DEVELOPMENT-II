import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import {
  createPost,
  updatePost,
  deletePost,
  publishPost,
  postToggleFavorite,
  postTogglePin,
  postToggleArchive,
  postDuplicated
} from '../features/posts/postsSlice';
import { notificationAdded } from '../features/notifications/notificationsSlice';
import { activityLogged } from '../features/activity/activitySlice';
import { themeSet, themeCycled, matrixThemeUnlockedSet, commandPaletteOpened, confettiTriggered, THEMES } from '../features/ui/uiSlice';
import { draftAutosaved } from '../features/drafts/draftsSlice';
import { saveState } from '../utils/localStorage';
import { unlockAchievementThunk } from './achievementHelpers';

/* ==========================================================================
   LISTENER MIDDLEWARE — "the nervous system"
   Chains reactions to domain events without slices needing to know about
   each other: Post Created -> Notification -> Activity Log -> Persist.
   Also doubles as the achievement-tracking system's nerve endings.
   ========================================================================== */

export const listenerMiddleware = createListenerMiddleware();

// Session-only counters (deliberately not persisted — "in a single session")
let postsCreatedThisSession = 0;
const themesVisitedThisSession = new Set();

// ---- Post created ---------------------------------------------------------
listenerMiddleware.startListening({
  actionCreator: createPost.fulfilled,
  effect: async (action, api) => {
    const post = action.payload;
    api.dispatch(
      notificationAdded({ type: 'success', title: 'Post created', message: `"${post.title}" was added to drafts.` })
    );
    api.dispatch(activityLogged({ label: `Created post "${post.title}"`, meta: { postId: post.id } }));

    postsCreatedThisSession += 1;
    api.dispatch(unlockAchievementThunk('first-synapse'));
    if (postsCreatedThisSession >= 5) api.dispatch(unlockAchievementThunk('prolific-mind'));
  }
});

// ---- Post published --------------------------------------------------------
listenerMiddleware.startListening({
  actionCreator: publishPost.fulfilled,
  effect: async (action, api) => {
    const post = action.payload;
    api.dispatch(
      notificationAdded({ type: 'success', title: 'Post published', message: `"${post.title}" is now live.` })
    );
    api.dispatch(activityLogged({ label: `Published post "${post.title}"`, meta: { postId: post.id } }));
    api.dispatch(confettiTriggered());
    api.dispatch(unlockAchievementThunk('going-live'));
  }
});

listenerMiddleware.startListening({
  actionCreator: publishPost.rejected,
  effect: async (action, api) => {
    api.dispatch(
      notificationAdded({ type: 'error', title: 'Publish failed', message: action.payload?.message || 'Please try again.' })
    );
  }
});

// ---- Post updated -----------------------------------------------------------
listenerMiddleware.startListening({
  actionCreator: updatePost.fulfilled,
  effect: async (action, api) => {
    api.dispatch(activityLogged({ label: `Updated post "${action.payload.title}"`, meta: { postId: action.payload.id } }));
  }
});

// ---- Post deleted -------------------------------------------------------------
listenerMiddleware.startListening({
  actionCreator: deletePost.fulfilled,
  effect: async (action, api) => {
    api.dispatch(notificationAdded({ type: 'info', title: 'Post deleted', message: 'The post was removed.' }));
    api.dispatch(activityLogged({ label: 'Deleted a post', meta: { postId: action.payload } }));
  }
});

// ---- Favorite toggle -----------------------------------------------------------
listenerMiddleware.startListening({
  actionCreator: postToggleFavorite,
  effect: async (action, api) => {
    api.dispatch(activityLogged({ label: 'Toggled favorite', meta: { postId: action.payload } }));
    const state = api.getState();
    const favoriteCount = state.posts.ids.filter((id) => state.posts.entities[id].isFavorite).length;
    if (favoriteCount >= 5) api.dispatch(unlockAchievementThunk('star-collector'));
  }
});

// ---- Pin toggle ------------------------------------------------------------------
listenerMiddleware.startListening({
  actionCreator: postTogglePin,
  effect: async (action, api) => {
    api.dispatch(activityLogged({ label: 'Toggled pin', meta: { postId: action.payload } }));
    const post = api.getState().posts.entities[action.payload];
    if (post?.isPinned) api.dispatch(unlockAchievementThunk('pin-perfect'));
  }
});

// ---- Archive toggle ---------------------------------------------------------------
listenerMiddleware.startListening({
  actionCreator: postToggleArchive,
  effect: async (action, api) => {
    const post = api.getState().posts.entities[action.payload];
    api.dispatch(activityLogged({ label: post?.isArchived ? 'Archived a post' : 'Restored a post from the archive', meta: { postId: action.payload } }));
    if (post?.isArchived) api.dispatch(unlockAchievementThunk('archivist'));
  }
});

// ---- Duplicate --------------------------------------------------------------------
listenerMiddleware.startListening({
  actionCreator: postDuplicated,
  effect: async (_, api) => {
    api.dispatch(unlockAchievementThunk('copy-cat'));
  }
});

// ---- Draft autosave -----------------------------------------------------------
listenerMiddleware.startListening({
  actionCreator: draftAutosaved,
  effect: async (_, api) => {
    const state = api.getState();
    saveState('drafts', state.drafts);
    if (state.drafts.versions.length >= 10) api.dispatch(unlockAchievementThunk('draft-hoarder'));
  }
});

// ---- Theme changes --------------------------------------------------------------
listenerMiddleware.startListening({
  matcher: isAnyOf(themeSet, themeCycled),
  effect: async (_, api) => {
    const state = api.getState();
    api.dispatch(activityLogged({ label: `Switched to ${state.ui.theme} theme` }));
    saveState('ui', {
      theme: state.ui.theme,
      sidebarCollapsed: state.ui.sidebarCollapsed,
      matrixThemeUnlocked: state.ui.matrixThemeUnlocked
    });

    themesVisitedThisSession.add(state.ui.theme);
    const allVisited = THEMES.every((t) => themesVisitedThisSession.has(t));
    if (allVisited) api.dispatch(unlockAchievementThunk('shape-shifter'));

    const hour = new Date().getHours();
    if (hour >= 0 && hour < 5) api.dispatch(unlockAchievementThunk('night-owl'));
  }
});

// ---- Matrix theme unlocked (Konami code) -----------------------------------------
listenerMiddleware.startListening({
  actionCreator: matrixThemeUnlockedSet,
  effect: async (_, api) => {
    const state = api.getState();
    saveState('ui', {
      theme: state.ui.theme,
      sidebarCollapsed: state.ui.sidebarCollapsed,
      matrixThemeUnlocked: true
    });
    api.dispatch(activityLogged({ label: 'Discovered the Matrix theme 💊' }));
    api.dispatch(unlockAchievementThunk('red-pill'));
  }
});

// ---- Command palette opened --------------------------------------------------------
listenerMiddleware.startListening({
  actionCreator: commandPaletteOpened,
  effect: async (_, api) => {
    api.dispatch(unlockAchievementThunk('speed-typer'));
  }
});
