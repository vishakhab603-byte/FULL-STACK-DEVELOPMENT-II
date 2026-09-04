const THEMES = {
    cosmic: { label: "Cosmic", bg: "#070818", accent: "#8b7ff0", accent2: "#4cd3c2", kind: "cosmic", font: "Georgia, serif", mood: "none" },
    rain: { label: "Rain", bg: "#0d1420", accent: "#4cd3c2", accent2: "#6ea8ff", kind: "rain", font: "Georgia, serif", mood: "saturate(0.9) brightness(0.98)" },
    aurora: { label: "Aurora", bg: "#071a16", accent: "#5eead4", accent2: "#a78bfa", kind: "aurora", font: "Georgia, serif", mood: "saturate(1.15)" },
    zen: { label: "Zen", bg: "#141210", accent: "#d9b98c", accent2: "#b7a086", kind: "zen", font: "'Iowan Old Style', Georgia, serif", mood: "saturate(0.72) contrast(0.94)" },
    cyber: { label: "Cyber", bg: "#08090c", accent: "#33e6ff", accent2: "#ff3cac", kind: "grid", font: "'SFMono-Regular', Consolas, Menlo, monospace", mood: "contrast(1.18) saturate(1.25)" },
    sunset: { label: "Sunset", bg: "#1a0e1f", accent: "#f2994a", accent2: "#eb5b72", kind: "sunset", font: "Georgia, serif", mood: "saturate(1.12) contrast(1.04)" },
    storm: { label: "Storm", bg: "#10131c", accent: "#7dd3fc", accent2: "#94a3b8", kind: "storm", font: "Georgia, serif", mood: "contrast(1.1) saturate(0.92)" },
    sakura: { label: "Sakura", bg: "#170f16", accent: "#ff9ecb", accent2: "#ffd2e8", kind: "petals", font: "Georgia, serif", mood: "saturate(1.08)" },
    matrix: { label: "Matrix", bg: "#050805", accent: "#39ff6a", accent2: "#8dff9e", kind: "grid", font: "'SFMono-Regular', Consolas, Menlo, monospace", mood: "contrast(1.25) saturate(1.3) hue-rotate(70deg)" },
    twilight: { label: "Twilight", bg: "#0a0416", accent: "#a06bff", accent2: "#5e3ec9", kind: "cosmic", font: "Georgia, serif", mood: "saturate(1.2) hue-rotate(-15deg)" },
    candyfloss: { label: "Candyfloss", bg: "#170c1e", accent: "#ff8fd6", accent2: "#b39bff", kind: "aurora", font: "Georgia, serif", mood: "saturate(1.3) brightness(1.05)" },
    volcano: { label: "Volcano", bg: "#1a0805", accent: "#ff5a3c", accent2: "#ffb03c", kind: "sunset", font: "Georgia, serif", mood: "saturate(1.3) contrast(1.15)" },
    arctic: { label: "Arctic", bg: "#0a1420", accent: "#bfe8ff", accent2: "#7db8e8", kind: "storm", font: "Georgia, serif", mood: "saturate(0.85) brightness(1.08) hue-rotate(10deg)" },
    nebula: { label: "Nebula", bg: "#0c0620", accent: "#c96bff", accent2: "#ff6bd6", kind: "nebula", secret: true, font: "Georgia, serif", mood: "saturate(1.25) contrast(1.06)" },
};

const ROLES = {
    creator: { label: "Creator", color: "#8b7ff0", color2: "#c9a6ff", greet: "Your canvas is waiting.", quote: "Create before you consume." },
    editor: { label: "Editor", color: "#4cd3c2", color2: "#7be8d0", greet: "Let's sharpen the story.", quote: "Clarity is creativity with discipline." },
    analyst: { label: "Analyst", color: "#f2994a", color2: "#ffc98a", greet: "The numbers have something to say.", quote: "What gets measured can be understood." },
    viewer: { label: "Viewer", color: "#7dd3fc", color2: "#a9e8ff", greet: "Explore the timeline.", quote: "Curiosity is a form of movement." },
    admin: { label: "Admin", color: "#e2607a", color2: "#ff96ac", greet: "KAIROS systems are under your command.", quote: "Systems become powerful when their parts remain understandable." },
};

function hexToRgb(hex) {
    const clean = hex.replace("#", "");
    const value = clean.length === 3 ? clean.split("").map(x => x + x).join("") : clean;
    const num = Number.parseInt(value, 16);
    return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
}

function applyTheme(themeKey) {
    const t = THEMES[themeKey];
    const root = document.documentElement;
    root.style.setProperty("--bg", t.bg);
    root.style.setProperty("--accent", t.accent);
    root.style.setProperty("--accent2", t.accent2);
    root.style.setProperty("--accent-rgb", hexToRgb(t.accent));
    root.style.setProperty("--accent2-rgb", hexToRgb(t.accent2));
    root.style.setProperty("--theme-display-font", t.font);
    root.style.setProperty("--theme-mood", t.mood);
    root.dataset.theme = themeKey;
    document.body.style.background = t.bg;
}

export { THEMES, ROLES, applyTheme };
