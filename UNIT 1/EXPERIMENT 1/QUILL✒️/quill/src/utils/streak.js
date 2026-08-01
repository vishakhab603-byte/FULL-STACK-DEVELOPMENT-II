function dateKey(d) {
  return d.toISOString().slice(0, 10);
}

/**
 * Counts consecutive days (ending today or yesterday — a day's grace so the
 * streak doesn't die at midnight) with at least one logged action.
 */
export function computeStreak(activityLog = {}) {
  const today = new Date();
  let streak = 0;
  let cursor = new Date(today);

  // grace: if today has nothing yet, start counting from yesterday instead
  if (!activityLog[dateKey(today)]) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (activityLog[dateKey(cursor)]) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}
