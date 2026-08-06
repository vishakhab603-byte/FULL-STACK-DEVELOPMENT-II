import { createSlice, createSelector } from "@reduxjs/toolkit";
import { roleByKey } from "../roles/roles";

const JWT_LIFETIME_MS = 12 * 60 * 1000;

const initialState = {
  roleKey: null,
  jwtExp: null,
  loginAt: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(state, action) {
      const now = Date.now();
      state.roleKey = action.payload.roleKey;
      state.jwtExp = now + JWT_LIFETIME_MS;
      state.loginAt = now;
    },
    logout(state) {
      state.roleKey = null;
      state.jwtExp = null;
      state.loginAt = null;
    },
    switchRole(state, action) {
      state.roleKey = action.payload;
    },
    refreshJWT(state) {
      state.jwtExp = Date.now() + JWT_LIFETIME_MS;
    },
  },
});

export const { login, logout, switchRole, refreshJWT } = authSlice.actions;
export default authSlice.reducer;

export const selectRoleKey = (state) => state.auth.roleKey;
export const selectJwtExp = (state) => state.auth.jwtExp;
export const selectLoginAt = (state) => state.auth.loginAt;
export const selectIsAuthenticated = (state) => !!state.auth.roleKey;

export const selectRole = createSelector(selectRoleKey, (roleKey) => roleByKey(roleKey));
