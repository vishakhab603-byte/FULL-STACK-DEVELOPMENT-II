

const PUBLIC_DOMAIN_QUOTES = [
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
  { text: "Well begun is half done.", author: "Aristotle" },
  { text: "The unexamined life is not worth living.", author: "Socrates" },
  { text: "What we think, we become.", author: "Marcus Aurelius" },
  { text: "Adopt the pace of nature: her secret is patience.", author: "Ralph Waldo Emerson" },
  { text: "Not all those who wander are lost.", author: "old proverb" },
  { text: "The only way out is through.", author: "Robert Frost" },
  { text: "Yesterday is history, tomorrow is a mystery.", author: "attributed, folk wisdom" },
  { text: "A journey of a thousand miles begins with a single step.", author: "Lao Tzu" },
  { text: "Out of clutter, find simplicity.", author: "Albert Einstein" },
];

const MUSE_ORIGINALS = [
  "Small posts, sent honestly, outlast big posts sent late.",
  "Write it messy first — the platform will teach you the edit.",
  "A draft saved is a thought kept, not a thought wasted.",
  "The feed forgets fast. Say the true thing anyway.",
  "Today's caption is tomorrow's memory — write it like it matters, lightly.",
  "Ship the version you have, not the version you're still imagining.",
];

function seeded(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/** Deterministic-per-day pick so the suggestion feels stable within a day but rotates daily. */
export function quoteOfTheDay(date = new Date()) {
  const seed = date.getFullYear() * 400 + date.getMonth() * 31 + date.getDate();
  const useOriginal = seeded(seed) > 0.55;
  if (useOriginal) {
    const line = MUSE_ORIGINALS[Math.floor(seeded(seed + 1) * MUSE_ORIGINALS.length)];
    return { text: line, author: "the Muse", original: true };
  }
  const q = PUBLIC_DOMAIN_QUOTES[Math.floor(seeded(seed + 2) * PUBLIC_DOMAIN_QUOTES.length)];
  return { ...q, original: false };
}
