import { createSlice } from '@reduxjs/toolkit';
import { loadState } from '../../utils/localStorage';

const THEMES = ['aurora', 'midnight', 'synapse', 'sakura', 'terminal', 'sunset'];
const persisted = loadState('ui');

const initialState = {
  theme: persisted?.theme || 'aurora',
  sidebarCollapsed: persisted?.sidebarCollapsed || false,
  commandPaletteOpen: false,
  activeModal: null, // 'post-editor' | 'shortcuts' | null
  editingPostId: null,
  toasts: [], // ephemeral UI toasts, separate from the persistent notification feed
  achievementsOpen: false,
  matrixRainActive: false,
  partyMode: false,
  confettiNonce: 0,
  matrixThemeUnlocked: persisted?.matrixThemeUnlocked || false
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    themeSet(state, action) {
      state.theme = action.payload;
    },
    themeCycled(state) {
      const idx = THEMES.indexOf(state.theme);
      state.theme = THEMES[(idx + 1) % THEMES.length];
    },
    sidebarToggled(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    commandPaletteOpened(state) {
      state.commandPaletteOpen = true;
    },
    commandPaletteClosed(state) {
      state.commandPaletteOpen = false;
    },
    modalOpened(state, action) {
      state.activeModal = action.payload.modal;
      state.editingPostId = action.payload.postId ?? null;
    },
    modalClosed(state) {
      state.activeModal = null;
      state.editingPostId = null;
    },
    toastPushed: {
      reducer(state, action) {
        state.toasts.push(action.payload);
      },
      prepare({ tone = 'info', message }) {
        return { payload: { id: `${Date.now()}-${Math.random()}`, tone, message } };
      }
    },
    toastDismissed(state, action) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    achievementsDrawerToggled(state) {
      state.achievementsOpen = !state.achievementsOpen;
    },
    achievementsDrawerClosed(state) {
      state.achievementsOpen = false;
    },
    matrixThemeUnlockedSet(state) {
      state.matrixThemeUnlocked = true;
    },
    matrixRainTriggered(state) {
      state.matrixRainActive = true;
    },
    matrixRainEnded(state) {
      state.matrixRainActive = false;
    },
    partyModeToggled(state) {
      state.partyMode = !state.partyMode;
    },
    confettiTriggered(state) {
      state.confettiNonce += 1;
    }
  }
});

export const {
  themeSet,
  themeCycled,
  sidebarToggled,
  commandPaletteOpened,
  commandPaletteClosed,
  modalOpened,
  modalClosed,
  toastPushed,
  toastDismissed,
  achievementsDrawerToggled,
  achievementsDrawerClosed,
  matrixThemeUnlockedSet,
  matrixRainTriggered,
  matrixRainEnded,
  partyModeToggled,
  confettiTriggered
} = uiSlice.actions;

export default uiSlice.reducer;
export { THEMES };
