const STORAGE_KEY = "quill:state:v1";

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

export function saveState(state) {
  try {
    // Persist only the slices worth keeping between sessions.
    const toPersist = {
      drafts: state.drafts,
      schedule: state.schedule,
      analytics: state.analytics,
      ui: {
        theme: state.ui.theme,
        themeMode: state.ui.themeMode,
        themeSkin: state.ui.themeSkin,
        soundEnabled: state.ui.soundEnabled,
        celebrateEnabled: state.ui.celebrateEnabled,
        legendaryUnlocked: state.ui.legendaryUnlocked,
        magicWordFound: state.ui.magicWordFound,
      },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toPersist));
  } catch {
    // storage can fail (private browsing, quota) — never crash the app over it
  }
}

export function resetAllData() {
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
}
