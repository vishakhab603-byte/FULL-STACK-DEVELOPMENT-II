function dateKey(d) {
  return d.toISOString().slice(0, 10);
}


export function computeStreak(activityLog = {}) {
  const today = new Date();
  let streak = 0;
  let cursor = new Date(today);

  if (!activityLog[dateKey(today)]) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (activityLog[dateKey(cursor)]) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}
