import { getPlatform } from "./platformRules";

const DAY_MODIFIER = {
  
  0: 0.85,
  1: 1.05,
  2: 1.1,
  3: 1.1,
  4: 1.05,
  5: 0.95,
  6: 0.8,
};

function formatHour(h) {
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}${period}`;
}


export function bestTimeToPost(platformId, now = new Date()) {
  const platform = getPlatform(platformId);
  if (!platform) return null;

  const hours = platform.bestHoursLocal;
  const currentHour = now.getHours();
  const dayMod = DAY_MODIFIER[now.getDay()];

  let nextHour = hours.find((h) => h > currentHour);
  let dayLabel = "today";
  if (nextHour === undefined) {
    nextHour = hours[0];
    dayLabel = "tomorrow";
  }

  const confidence = Math.round(Math.min(0.6 + dayMod * 0.3, 0.95) * 100);

  return {
    label: `${dayLabel} around ${formatHour(nextHour)}`,
    hour: nextHour,
    confidence,
    allWindows: hours.map(formatHour),
  };
}
