const CTA_WORDS = [
  "check out", "read more", "learn more", "sign up", "join", "click", "link in bio",
  "swipe", "comment", "reply", "share", "let me know", "thoughts?", "rsvp", "grab your",
  "download", "subscribe", "book a", "try it",
];

export function readabilityHints(text = "") {
  const hints = [];
  const trimmed = text.trim();
  if (!trimmed) return hints;

  const words = trimmed.split(/\s+/);
  const sentences = trimmed.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const avgWordsPerSentence = sentences.length ? words.length / sentences.length : words.length;

  if (avgWordsPerSentence > 28) {
    hints.push({ type: "length", message: "Sentences are running long — consider a line break or two." });
  }

  const hasCTA = CTA_WORDS.some((c) => trimmed.toLowerCase().includes(c));
  if (!hasCTA && words.length > 15) {
    hints.push({ type: "cta", message: "No clear call to action — what should the reader do next?" });
  }

  const exclamations = (trimmed.match(/!/g) || []).length;
  if (exclamations >= 3) {
    hints.push({ type: "punctuation", message: "Several exclamation points — one strong one usually lands harder." });
  }

  if (/\b(very|really|actually|just|literally)\b/gi.test(trimmed)) {
    const count = (trimmed.match(/\b(very|really|actually|just|literally)\b/gi) || []).length;
    if (count >= 3) {
      hints.push({ type: "filler", message: "A few filler words (very/really/just) — trimming them tightens the voice." });
    }
  }

  if (words.length < 4) {
    hints.push({ type: "short", message: "Very short — good for X, thin for LinkedIn or a caption." });
  }

  return hints;
}
