const STOPWORDS = new Set(
  ("the a an and or but if then so to of in on for with without at by from up " +
    "down out about into over after under again further this that these those " +
    "is are was were be been being have has had do does did will would could " +
    "should can just don't i you he she it we they my your his her its our " +
    "their as not no yes very really got get going go went make made today " +
    "here there when where who what which how also more most other some such " +
    "than too")
    .split(" ")
);


export function suggestHashtags(text = "", limit = 6) {
  const existing = new Set((text.match(/#[a-zA-Z0-9_]+/g) || []).map((h) => h.slice(1).toLowerCase()));

  const words = text
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[^a-zA-Z0-9'\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  const freq = new Map();
  words.forEach((raw) => {
    const w = raw.replace(/'s$/, "");
    const lower = w.toLowerCase();
    if (lower.length < 4 || STOPWORDS.has(lower) || existing.has(lower)) return;
    const score = (freq.get(lower)?.score ?? 0) + 1 + (/^[A-Z]/.test(w) ? 1.5 : 0) + Math.min(w.length / 10, 1);
    freq.set(lower, { score, display: w });
  });

  // bigrams for phrases like "product launch"
  for (let i = 0; i < words.length - 1; i++) {
    const w1 = words[i], w2 = words[i + 1];
    const l1 = w1.toLowerCase(), l2 = w2.toLowerCase();
    if (STOPWORDS.has(l1) || STOPWORDS.has(l2) || l1.length < 3 || l2.length < 3) continue;
    const key = l1 + l2;
    const display = w1 + w2.charAt(0).toUpperCase() + w2.slice(1);
    const score = (freq.get(key)?.score ?? 0) + 1.5;
    freq.set(key, { score, display });
  }

  return [...freq.entries()]
    .sort((a, b) => b[1].score - a[1].score)
    .slice(0, limit)
    .map(([, v]) => "#" + v.display.replace(/[^a-zA-Z0-9]/g, ""));
}
