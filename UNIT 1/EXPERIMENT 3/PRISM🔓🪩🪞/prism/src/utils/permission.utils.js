
export const CAPABILITIES = [
  { id: "viewDashboard",       label: "View Dashboard",    risk: "low" },
  { id: "createPost",          label: "Create Post",       risk: "low" },
  { id: "editPost",            label: "Edit Post",         risk: "low" },
  { id: "publishPost",         label: "Publish Post",      risk: "med" },
  { id: "approvePost",         label: "Approve Post",      risk: "med" },
  { id: "moderateComments",    label: "Moderate Comments", risk: "med" },
  { id: "manageUsers",         label: "Manage Users",      risk: "high" },
  { id: "assignRoles",         label: "Assign Roles",      risk: "high" },
  { id: "viewAnalytics",       label: "View Analytics",    risk: "low" },
  { id: "viewAudit",           label: "View Audit Log",    risk: "med" },
  { id: "manageSecurity",      label: "Manage Security",   risk: "high" },
  { id: "accessDeveloperTools", label: "Developer Tools",  risk: "high" },
];

const ALL_ON = CAPABILITIES.reduce((acc, c) => ({ ...acc, [c.id]: 1 }), {});

export const GRANTS = {
  architect:  ALL_ON,
  commander:  { viewDashboard: 1, createPost: 1, editPost: 1, publishPost: 1, approvePost: 1, moderateComments: 1, manageUsers: 1, assignRoles: 0, viewAnalytics: 1, viewAudit: 1, manageSecurity: 1, accessDeveloperTools: 0 },
  guardian:   { viewDashboard: 1, createPost: 1, editPost: 1, publishPost: 0, approvePost: 1, moderateComments: 1, manageUsers: 0, assignRoles: 0, viewAnalytics: 1, viewAudit: 1, manageSecurity: 0, accessDeveloperTools: 0 },
  creator:    { viewDashboard: 1, createPost: 1, editPost: 1, publishPost: 0, approvePost: 0, moderateComments: 0, manageUsers: 0, assignRoles: 0, viewAnalytics: 1, viewAudit: 0, manageSecurity: 0, accessDeveloperTools: 0 },
  strategist: { viewDashboard: 1, createPost: 0, editPost: 0, publishPost: 0, approvePost: 0, moderateComments: 0, manageUsers: 0, assignRoles: 0, viewAnalytics: 1, viewAudit: 1, manageSecurity: 0, accessDeveloperTools: 0 },
  observer:   { viewDashboard: 1, createPost: 0, editPost: 0, publishPost: 0, approvePost: 0, moderateComments: 0, manageUsers: 0, assignRoles: 0, viewAnalytics: 1, viewAudit: 0, manageSecurity: 0, accessDeveloperTools: 0 },
  explorer:   { viewDashboard: 1, createPost: 0, editPost: 0, publishPost: 0, approvePost: 0, moderateComments: 0, manageUsers: 0, assignRoles: 0, viewAnalytics: 0, viewAudit: 0, manageSecurity: 0, accessDeveloperTools: 0 },
  developer:  { viewDashboard: 1, createPost: 0, editPost: 0, publishPost: 0, approvePost: 0, moderateComments: 0, manageUsers: 0, assignRoles: 0, viewAnalytics: 1, viewAudit: 1, manageSecurity: 0, accessDeveloperTools: 1 },
};

export function hasCapability(roleKey, capabilityId) {
  if (!roleKey || !GRANTS[roleKey]) return false;
  return !!GRANTS[roleKey][capabilityId];
}

export function grantedCapabilities(roleKey) {
  if (!roleKey || !GRANTS[roleKey]) return [];
  return CAPABILITIES.filter((c) => GRANTS[roleKey][c.id]);
}

export function grantedCount(roleKey) {
  return grantedCapabilities(roleKey).length;
}
