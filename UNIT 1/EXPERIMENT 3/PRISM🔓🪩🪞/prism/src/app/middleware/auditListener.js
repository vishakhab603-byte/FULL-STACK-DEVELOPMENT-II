import { createListenerMiddleware } from "@reduxjs/toolkit";
import { login, logout, switchRole, refreshJWT } from "../../features/auth/authSlice";
import {
  createPost, submitForApproval, approvePost, rejectPost,
  publishDirect, deletePost, moderatePost,
} from "../../features/posts/postsSlice";
import { addEntry } from "../../features/audit/auditSlice";
import { roleByKey } from "../../features/roles/roles";

export const auditListener = createListenerMiddleware();

auditListener.startListening({
  actionCreator: login,
  effect: (action, api) => {
    const role = roleByKey(action.payload.roleKey);
    api.dispatch(addEntry({ type: "login", message: `Authenticated as ${role.label} (${role.name})`, color: role.color }));
  },
});

auditListener.startListening({
  actionCreator: switchRole,
  effect: (action, api) => {
    const before = roleByKey(api.getOriginalState().auth.roleKey);
    const after = roleByKey(action.payload);
    api.dispatch(addEntry({ type: "switch", message: `Identity Prism rotated: ${before?.label ?? "—"} → ${after.label}`, color: after.color }));
  },
});

auditListener.startListening({
  actionCreator: refreshJWT,
  effect: (action, api) => {
    const role = roleByKey(api.getState().auth.roleKey);
    api.dispatch(addEntry({ type: "refresh", message: "JWT refreshed", color: role?.color ?? "#8A93A6" }));
  },
});

auditListener.startListening({
  actionCreator: logout,
  effect: (action, api) => {
    const role = roleByKey(api.getOriginalState().auth.roleKey);
    api.dispatch(addEntry({ type: "logout", message: `Identity released: ${role?.label ?? "—"}`, color: "#8A93A6" }));
  },
});

auditListener.startListening({
  actionCreator: createPost,
  effect: (action, api) => {
    const role = roleByKey(api.getState().auth.roleKey);
    api.dispatch(addEntry({ type: "content", message: `${role.label} saved a new draft: "${action.payload.title}"`, color: role.color }));
  },
});

function postTitle(api, id) {
  return api.getState().posts.find((p) => p.id === id)?.title ?? "post";
}

auditListener.startListening({
  actionCreator: submitForApproval,
  effect: (action, api) => {
    const role = roleByKey(api.getState().auth.roleKey);
    api.dispatch(addEntry({ type: "content", message: `Submitted for approval: "${postTitle(api, action.payload)}"`, color: role.color }));
  },
});

auditListener.startListening({
  actionCreator: approvePost,
  effect: (action, api) => {
    const role = roleByKey(api.getState().auth.roleKey);
    api.dispatch(addEntry({ type: "content", message: `${role.label} approved: "${postTitle(api, action.payload)}"`, color: "#22B57F" }));
  },
});

auditListener.startListening({
  actionCreator: rejectPost,
  effect: (action, api) => {
    const role = roleByKey(api.getState().auth.roleKey);
    api.dispatch(addEntry({ type: "content", message: `${role.label} rejected: "${postTitle(api, action.payload)}" (returned to draft)`, color: "#E14B4B" }));
  },
});

auditListener.startListening({
  actionCreator: publishDirect,
  effect: (action, api) => {
    const role = roleByKey(api.getState().auth.roleKey);
    api.dispatch(addEntry({ type: "content", message: `${role.label} published directly: "${postTitle(api, action.payload)}"`, color: "#22B57F" }));
  },
});

auditListener.startListening({
  actionCreator: deletePost,
  effect: (action, api) => {
    const title = api.getOriginalState().posts.find((p) => p.id === action.payload)?.title ?? "post";
    api.dispatch(addEntry({ type: "content", message: `Deleted draft: "${title}"`, color: "#E14B4B" }));
  },
});

auditListener.startListening({
  actionCreator: moderatePost,
  effect: (action, api) => {
    const role = roleByKey(api.getState().auth.roleKey);
    api.dispatch(addEntry({ type: "content", message: `${role.label} moderated comments on: "${postTitle(api, action.payload)}"`, color: role.color }));
  },
});
