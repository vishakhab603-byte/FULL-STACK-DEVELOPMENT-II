import { createSlice, nanoid } from "@reduxjs/toolkit";

const initialState = {
  view: "compose", // 'compose' | 'drafts' | 'schedule' | 'analytics' | 'settings'
  toasts: [], // [{ id, message, type }]
  modal: null, // { type: 'version-history' | 'confirm-reset', props }
  theme: "paper",
  themeMode: "auto", // 'auto' | 'light' | 'dark'
  themeSkin: "classic", // 'classic' | 'sepia' | 'neon' | 'forest' | 'blush' | 'mono'
  soundEnabled: true,
  celebrateEnabled: true,
  legendaryUnlocked: false,
  magicWordFound: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setView(state, action) {
      state.view = action.payload;
    },
    pushToast: {
      reducer(state, action) {
        state.toasts.push(action.payload);
      },
      prepare(message, type = "default") {
        return { payload: { id: nanoid(), message, type } };
      },
    },
    dismissToast(state, action) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    openModal(state, action) {
      state.modal = action.payload;
    },
    closeModal(state) {
      state.modal = null;
    },
    cycleThemeMode(state) {
      const order = ["auto", "light", "dark"];
      state.themeMode = order[(order.indexOf(state.themeMode) + 1) % order.length];
    },
    setThemeSkin(state, action) {
      state.themeSkin = action.payload;
    },
    unlockMagicWord(state) {
      state.magicWordFound = true;
    },
    toggleSound(state) {
      state.soundEnabled = !state.soundEnabled;
    },
    toggleCelebrate(state) {
      state.celebrateEnabled = !state.celebrateEnabled;
    },
    unlockLegendary(state) {
      state.legendaryUnlocked = true;
    },
  },
});

export const {
  setView,
  pushToast,
  dismissToast,
  openModal,
  closeModal,
  cycleThemeMode,
  setThemeSkin,
  unlockMagicWord,
  toggleSound,
  toggleCelebrate,
  unlockLegendary,
} = uiSlice.actions;

export default uiSlice.reducer;
