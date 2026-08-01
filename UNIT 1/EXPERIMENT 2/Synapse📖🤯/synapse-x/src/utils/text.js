const EMOJI_REGEX = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu;
const HASHTAG_REGEX = /#[\w]+/g;
const WORDS_PER_MINUTE = 200;

export function countCharacters(text = '') {
  return text.length;
}

export function countWords(text = '') {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function countEmoji(text = '') {
  return (text.match(EMOJI_REGEX) || []).length;
}

export function extractHashtags(text = '') {
  return [...new Set((text.match(HASHTAG_REGEX) || []).map((h) => h.toLowerCase()))];
}

export function readingTimeSeconds(text = '') {
  const words = countWords(text);
  return Math.max(5, Math.round((words / WORDS_PER_MINUTE) * 60));
}

export function truncate(text = '', max = 120) {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}…`;
}
