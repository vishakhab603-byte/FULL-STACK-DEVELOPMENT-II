const ACHIEVEMENTS = [
  {
    id: "first-post",
    label: "First Post",
    emoji: "🌱",
    desc: "Published your very first post.",
    test: (published) => published.length >= 1,
  },
  {
    id: "early-bird",
    label: "Early Bird",
    emoji: "🐦",
    desc: "Published something before 7am.",
    test: (published) => published.some((p) => new Date(p.publishedAt).getHours() < 7),
  },
  {
    id: "night-owl",
    label: "Night Owl",
    emoji: "🦉",
    desc: "Published something between midnight and 4am.",
    test: (published) => published.some((p) => new Date(p.publishedAt).getHours() < 4),
  },
  {
    id: "multi-platform",
    label: "Multi-Platform Maestro",
    emoji: "🎻",
    desc: "Sent one post to 3+ platforms at once.",
    test: (published) => published.some((p) => p.platformIds.length >= 3),
  },
  {
    id: "long-form",
    label: "Essayist",
    emoji: "📜",
    desc: "Published to Medium or Substack.",
    test: (published) => published.some((p) => p.platformIds.some((id) => id === "medium" || id === "substack")),
  },
  {
    id: "century",
    label: "Century Club",
    emoji: "💯",
    desc: "10 posts published.",
    test: (published) => published.length >= 10,
  },
  {
    id: "prolific",
    label: "Prolific",
    emoji: "🚀",
    desc: "25 posts published.",
    test: (published) => published.length >= 25,
  },
  {
    id: "stardust",
    label: "Stardust",
    emoji: "🌟",
    desc: "Something rare happened on a publish. You'll know it when it happens.",
    hidden: true,
    test: (_published, extra) => Boolean(extra?.legendaryUnlocked),
  },
  {
    id: "weekend-warrior",
    label: "Weekend Warrior",
    emoji: "🏖️",
    desc: "Published something on a Saturday or Sunday.",
    test: (published) => published.some((p) => [0, 6].includes(new Date(p.publishedAt).getDay())),
  },
  {
    id: "emoji-enthusiast",
    label: "Emoji Enthusiast",
    emoji: "🎨",
    desc: "Published a post with 5 or more emoji.",
    test: (published) =>
      published.some((p) => (p.text.match(/\p{Extended_Pictographic}/gu) || []).length >= 5),
  },
  {
    id: "wordsmith",
    label: "Wordsmith",
    emoji: "🪄",
    desc: "Found the magic word.",
    hidden: true,
    test: (_published, extra) => Boolean(extra?.magicWordFound),
  },
];

export function computeAchievements(publishedPosts, extra = {}) {
  return ACHIEVEMENTS.map((a) => ({ ...a, unlocked: a.test(publishedPosts, extra) }));
}

const MILESTONES = {
  1: "Your first post is live. Welcome to the feed. 🌱",
  5: "5 posts published — you've got a rhythm going.",
  10: "10 posts! The Muse is officially a fan.",
  25: "25 posts. That's not a hobby anymore, that's a habit.",
  50: "50 posts published. Genuinely impressive.",
  100: "100 posts. Frame this moment. 🏆",
};

export function getMilestoneMessage(newPublishedCount) {
  return MILESTONES[newPublishedCount] ?? null;
}
