import { Crown, Shield, PenTool, Scale, BarChart3, Eye, Compass, Code2 } from "lucide-react";

export const ROLES = [
  { key: "architect",  label: "Architect",  sub: "Super Admin", color: "#D4AF37", icon: Crown,     greeting: "I govern the platform.",  score: 98, dept: "Platform Governance", name: "Ava Sterling", id: "PR-1001", username: "ava.sterling", password: "Architect@123" },
  { key: "commander",  label: "Commander",  sub: "Admin",       color: "#E14B4B", icon: Shield,    greeting: "I manage operations.",     score: 91, dept: "Operations",          name: "Marcus Cole",  id: "PR-1002", username: "marcus.cole",  password: "Commander@123" },
  { key: "creator",    label: "Creator",    sub: "Editor",      color: "#9B6BF2", icon: PenTool,   greeting: "I build content.",         score: 76, dept: "Content",             name: "Nadia Reyes",  id: "PR-1003", username: "nadia.reyes",  password: "Creator@123" },
  { key: "guardian",   label: "Guardian",   sub: "Moderator",   color: "#22B57F", icon: Scale,     greeting: "I protect the community.", score: 88, dept: "Trust & Safety",      name: "Owen Blake",   id: "PR-1004", username: "owen.blake",   password: "Guardian@123" },
  { key: "strategist", label: "Strategist", sub: "Analyst",     color: "#4E8FF2", icon: BarChart3, greeting: "I understand data.",       score: 82, dept: "Analytics",           name: "Priya Nair",   id: "PR-1005", username: "priya.nair",   password: "Strategist@123" },
  { key: "observer",   label: "Observer",   sub: "Viewer",      color: "#9AA5B1", icon: Eye,       greeting: "I consume content.",       score: 65, dept: "General",             name: "Leo Tanaka",   id: "PR-1006", username: "leo.tanaka",   password: "Observer@123" },
  { key: "explorer",   label: "Explorer",   sub: "Guest",       color: "#E0A030", icon: Compass,   greeting: "I discover.",              score: 40, dept: "Public",              name: "Guest User",   id: "PR-1007", username: "guest",        password: "Explorer@123" },
  { key: "developer",  label: "Developer",  sub: "Engineer",    color: "#2CC7D6", icon: Code2,     greeting: "I understand the system.", score: 85, dept: "Engineering",         name: "Sam Iyer",     id: "PR-1008", username: "sam.iyer",     password: "Developer@123" },
];

export const roleByKey = (key) => ROLES.find((r) => r.key === key) || null;

export function verifyCredentials(username, password) {
  const normalized = username.trim().toLowerCase();
  const match = ROLES.find((r) => r.username.toLowerCase() === normalized);
  if (!match) return { ok: false, error: "No identity found for that username." };
  if (match.password !== password) return { ok: false, error: "Incorrect password." };
  return { ok: true, roleKey: match.key };
}

export const QUOTES = [
  "Authentication proves who you are. Authorization defines what you become.",
  "One identity. Infinite perspectives.",
  "Every permission carries responsibility.",
  "Power is measured by restraint, not access.",
  "Identity grants access. Wisdom determines how it is used.",
];
