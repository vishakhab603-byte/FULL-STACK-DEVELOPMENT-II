
export const PERIODS = {
  dawn: { label: "Dawn", emoji: "🌅", range: [5, 8] },
  day: { label: "Day", emoji: "☀️", range: [8, 17] },
  dusk: { label: "Dusk", emoji: "🌇", range: [17, 20] },
  night: { label: "Night", emoji: "🌙", range: [20, 5] },
};

export function getPeriod(date = new Date()) {
  const h = date.getHours();
  if (h >= 5 && h < 8) return "dawn";
  if (h >= 8 && h < 17) return "day";
  if (h >= 17 && h < 20) return "dusk";
  return "night";
}

const DAY_PERSONALITY = {
  0: { name: "Sunday", vibe: "reflective, slower-paced — good for a wrap-up or a personal note" },
  1: { name: "Monday", vibe: "fresh-start energy — announcements and kickoffs land well" },
  2: { name: "Tuesday", vibe: "highest engagement day on most platforms — good day to publish your best draft" },
  3: { name: "Wednesday", vibe: "steady midweek attention — solid for how-tos and threads" },
  4: { name: "Thursday", vibe: "people start looking ahead — good for previews and teasers" },
  5: { name: "Friday", vibe: "wrap-up and celebration energy — recaps and lighter posts do well" },
  6: { name: "Saturday", vibe: "casual browsing mode — visual and low-effort content wins" },
};

const NOTABLE_DAYS = {
  "01-01": "New Year's Day — reflection and fresh-start posts resonate",
  "02-14": "Valentine's Day — warmth and connection themes land well",
  "03-08": "International Women's Day",
  "03-14": "Pi Day 🥧 — a fun excuse for anything numbers or nerdy",
  "03-20": "World Storytelling Day",
  "04-22": "Earth Day — sustainability angles get extra attention",
  "05-01": "International Workers' Day",
  "06-05": "World Environment Day",
  "06-21": "World Music Day",
  "08-19": "World Photography Day",
  "09-08": "International Literacy Day",
  "09-27": "World Tourism Day",
  "10-05": "World Teachers' Day",
  "10-31": "Halloween 🎃 — playful, slightly spooky posts get a boost",
  "11-13": "World Kindness Day",
  "12-25": "Christmas Day",
  "12-31": "New Year's Eve — recap and gratitude posts land well",
};

export function getDayContext(date = new Date()) {
  const key = `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const weekday = DAY_PERSONALITY[date.getDay()];
  return {
    weekdayName: weekday.name,
    weekdayVibe: weekday.vibe,
    notable: NOTABLE_DAYS[key] || null,
  };
}

export function greeting(date = new Date()) {
  const period = getPeriod(date);
  switch (period) {
    case "dawn":
      return "Up early — the feed is quiet, first-mover advantage is real.";
    case "day":
      return "Prime posting hours — the desk is bright and so is the audience.";
    case "dusk":
      return "Golden hour for scrolling — a good window for something warm.";
    default:
      return "Late-night thoughts hit different — night owls are your most engaged crowd.";
  }
}

const MOON_PHASES = [
  { name: "New Moon", emoji: "🌑" },
  { name: "Waxing Crescent", emoji: "🌒" },
  { name: "First Quarter", emoji: "🌓" },
  { name: "Waxing Gibbous", emoji: "🌔" },
  { name: "Full Moon", emoji: "🌕" },
  { name: "Waning Gibbous", emoji: "🌖" },
  { name: "Last Quarter", emoji: "🌗" },
  { name: "Waning Crescent", emoji: "🌘" },
];

/** A rough, flavor-only moon phase — not astronomically precise, just fun for the night theme. */
export function moonPhase(date = new Date()) {
  const synodic = 29.53058867;
  const known = new Date(Date.UTC(2000, 0, 6, 18, 14)); // a known new moon
  const days = (date.getTime() - known.getTime()) / 86400000;
  const phase = ((days % synodic) + synodic) % synodic;
  const index = Math.floor((phase / synodic) * 8) % 8;
  return MOON_PHASES[index];
}
