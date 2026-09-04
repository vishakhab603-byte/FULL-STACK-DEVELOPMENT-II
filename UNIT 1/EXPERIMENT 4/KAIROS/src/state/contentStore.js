import { useEffect, useState } from "react";
import { dateKey, parseDateKey } from "../lib/dateUtils";
import { clampDay } from "../lib/validation";

const STORAGE_KEY = "kairos-content-v3";

function safeRead(key, fallback) {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch (e) { return fallback; }
}

const STAGES = ["idea", "draft", "review", "approved", "scheduled", "published", "analyzed"];

const STAGE_LABELS = { idea: "Idea", draft: "Draft", review: "Review", approved: "Approved", scheduled: "Scheduled", published: "Published", analyzed: "Analyzed" };

const STAGE_COLORS = { idea: "#8a8ca3", draft: "#7dd3fc", review: "#f2994a", approved: "#4cd3c2", scheduled: "#8b7ff0", published: "#e8b34c", analyzed: "#e2607a" };

function currentMonthDay(day) {
    const now = new Date();
    return clampDay(now.getFullYear(), now.getMonth(), day);
}

function normalizeContent(item) {
    if (!item) return item;
    if (item.date && parseDateKey(item.date)) {
        const d = parseDateKey(item.date);
        return { ...item, date: item.date, day: d.getDate() };
    }
    if (item.day != null) return { ...item, date: currentMonthDay(item.day) };
    return { ...item, date: null };
}

function contentDateKey(item) {
    return normalizeContent(item)?.date || null;
}

const now = Date.now();
const SEED_CONTENT = [
    { id: 101, title: "Behind the scenes reel", caption: "", tags: ["bts"], stage: "draft", day: null, date: null, createdAt: now, updatedAt: now },
    { id: 102, title: "Product launch carousel", caption: "", tags: ["launch"], stage: "idea", day: null, date: null, createdAt: now, updatedAt: now },
    { id: 103, title: "Weekly tips post", caption: "Three quick wins for your week.", tags: ["tips", "weekly"], stage: "scheduled", day: 9, date: currentMonthDay(9), createdAt: now, updatedAt: now },
];

function scoreContent(item) {
    const caption = item.caption || "";
    const words = caption.trim().length ? caption.trim().split(/\s+/) : [];
    const hasHook = words.length > 0 && words[0].length > 0 && /[A-Z0-9]/.test(words[0][0] || "");
    const hasCTA = /\b(click|swipe|comment|share|dm|learn more|sign up|shop|link in bio|save this|tag someone)\b/i.test(caption);
    const lengthScore = words.length === 0 ? 0 : words.length < 8 ? 55 : words.length <= 45 ? 100 : words.length <= 70 ? 70 : 40;
    const hookScore = hasHook ? 80 : 35;
    const ctaScore = hasCTA ? 100 : 20;
    const tagScore = Math.min(100, (item.tags || []).length * 25);
    const structureScore = caption.includes("\n") || caption.split(".").length > 2 ? 85 : 55;
    const overall = Math.round((lengthScore + hookScore + ctaScore + tagScore + structureScore) / 5);
    return { overall, hookScore, lengthScore, ctaScore, tagScore, structureScore, hasCTA, hasHook, wordCount: words.length };
}

function roastContent(item) {
    const s = scoreContent(item);
    const lines = [];
    if (s.wordCount === 0) lines.push("There's nothing here yet. Even the cursor is bored.");
    if (s.wordCount > 70) lines.push("This caption has more runway than the content does. Trim it.");
    if (!s.hasCTA) lines.push("No call-to-action. The reader finishes and just... leaves.");
    if (!s.hasHook) lines.push("The opening line walked in, forgot why it came, and left again.");
    if ((item.tags || []).length === 0) lines.push("Zero tags. This post is currently undiscoverable by design.");
    if (lines.length === 0) lines.push("Honestly? This one's tight. Roast Mode has nothing to work with.");
    const improvements = [];
    if (!s.hasHook) improvements.push("Open with a concrete claim or question in the first 6 words.");
    if (!s.hasCTA) improvements.push('Add one direct action: "Save this", "Comment your take", or similar.');
    if (s.wordCount > 70) improvements.push("Cut to under 45 words — say the one thing that matters.");
    if ((item.tags || []).length === 0) improvements.push("Add 2–4 relevant tags so this can actually be found.");
    if (improvements.length === 0) improvements.push("Ship it.");
    return { roast: lines, improvements, score: s };
}

function useContentStore(bump) {
    const [items, setItems] = useState(() => safeRead(STORAGE_KEY, SEED_CONTENT).map(normalizeContent).filter(Boolean));
    useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch (e) { } }, [items]);
    function createIdea(title) {
        const item = { id: Date.now() + Math.random(), title, caption: "", tags: [], stage: "idea", day: null, date: null, createdAt: Date.now(), updatedAt: Date.now() };
        setItems(i => [item, ...i]);
        if (bump) bump(`Idea captured: "${title}"`, 2);
        return item;
    }
    function updateItem(id, patch) {
        setItems(items => items.map(i => i.id === id ? normalizeContent({ ...i, ...patch, updatedAt: Date.now() }) : i));
    }
    function moveStage(id, stage, day, date) {
        setItems(items => {
            const target = items.find(i => i.id === id);
            if (bump && target) bump(`"${target.title}" → ${STAGE_LABELS[stage]}`, stage === "published" ? 10 : 3);
            const nextDate = date || (day != null ? currentMonthDay(day) : null);
            return items.map(i => i.id === id ? normalizeContent({ ...i, stage, day: day != null ? day : i.day, date: nextDate || i.date, updatedAt: Date.now() }) : i);
        });
    }
    function deleteItem(id) {
        const target = items.find(i => i.id === id);
        setItems(items => items.filter(i => i.id !== id));
        if (bump) bump(target ? `Deleted "${target.title}"` : "Deleted content", 1);
    }
    return { items, createIdea, updateItem, moveStage, deleteItem };
}

export { STAGES, STAGE_LABELS, STAGE_COLORS, SEED_CONTENT, scoreContent, roastContent, contentDateKey, normalizeContent, useContentStore };
