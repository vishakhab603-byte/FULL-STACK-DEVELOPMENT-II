import { createSlice, createSelector } from "@reduxjs/toolkit";

export const THEMES = [
  { key: "crystal", label: "Crystal", bg: "radial-gradient(circle at 20% -10%, #1c2b4a 0%, #0b0e17 55%, #060811 100%)", accent: "#5B8DEF" },
  { key: "aurora",  label: "Aurora",  bg: "radial-gradient(circle at 80% -10%, #1c3b3a 0%, #0c1420 55%, #060811 100%)", accent: "#2CC7D6" },
  { key: "cyber",   label: "Cyber",  bg: "radial-gradient(circle at 50% -20%, #2a1030 0%, #0d0710 55%, #060408 100%)", accent: "#E14BB0" },
];

const themeSlice = createSlice({
  name: "theme",
  initialState: { index: 0 },
  reducers: {
    cycleTheme(state) {
      state.index = (state.index + 1) % THEMES.length;
    },
  },
});

export const { cycleTheme } = themeSlice.actions;
export default themeSlice.reducer;

export const selectThemeIndex = (state) => state.theme.index;
export const selectTheme = createSelector(selectThemeIndex, (i) => THEMES[i]);
