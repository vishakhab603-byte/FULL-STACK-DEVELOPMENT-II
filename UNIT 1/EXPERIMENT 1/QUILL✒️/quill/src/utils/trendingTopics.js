// Not a live trends feed — there's no API for that here. This is a curated
// pool of evergreen conversation starters, rotated by date so the panel
// feels fresh without ever pretending to be real-time trending data.

const TOPIC_POOL = [
  "the tools you'd never give up",
  "a lesson that took you too long to learn",
  "what you'd tell yourself a year ago",
  "the most underrated skill in your field",
  "a small win worth celebrating this week",
  "something you changed your mind about recently",
  "the best piece of advice you ignored at first",
  "what's actually working right now, no hype",
  "a question you're still sitting with",
  "the unglamorous part of the process nobody shows",
  "a habit that quietly changed everything",
  "what you'd build if constraints disappeared",
  "the best thing you read this month",
  "a mistake that taught you more than a win did",
  "what you're curious about but haven't started yet",
];

function seeded(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function trendingPrompts(date = new Date(), count = 4) {
  const seed = date.getFullYear() * 400 + date.getMonth() * 31 + date.getDate();
  const pool = [...TOPIC_POOL];
  const picks = [];
  for (let i = 0; i < count && pool.length; i++) {
    const idx = Math.floor(seeded(seed + i * 7) * pool.length);
    picks.push(pool.splice(idx, 1)[0]);
  }
  return picks;
}
