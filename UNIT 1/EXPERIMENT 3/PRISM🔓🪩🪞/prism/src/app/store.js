import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import postsReducer from "../features/posts/postsSlice";
import auditReducer from "../features/audit/auditSlice";
import themeReducer from "../features/theme/themeSlice";
import { auditListener } from "./middleware/auditListener";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postsReducer,
    audit: auditReducer,
    theme: themeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(auditListener.middleware),
});
