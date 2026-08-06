import { getPlatform } from "./platformRules";

export function extractHashtags(text = "") {
  const matches = text.match(/#[a-zA-Z0-9_]+/g) || [];
  return [...new Set(matches.map((h) => h.toLowerCase()))];
}

export function effectiveLength(text = "", platformId) {
  const urlRegex = /https?:\/\/\S+/g;
  const urls = text.match(urlRegex) || [];
  if (platformId === "x" || platformId === "threads") {
    let stripped = text.replace(urlRegex, "");
    return stripped.length + urls.length * 23;
  }
  return text.length;
}


export function validateForPlatform(text = "", mediaCount = 0, platformId, title = "") {
  const platform = getPlatform(platformId);
  const errors = [];
  const warnings = [];

  if (!platform) {
    return { errors: ["Unknown platform"], warnings, length: 0, limit: 0, hashtags: [] };
  }

  const length = effectiveLength(text, platformId);
  const hashtags = extractHashtags(text);

  if (!text.trim() && mediaCount === 0) {
    errors.push("Post is empty — add text or media.");
  }

  if (platform.requiresTitle && !title.trim()) {
    errors.push(`${platform.name} posts need a title.`);
  }

  if (length > platform.charLimit && !platform.supportsThreads) {
    errors.push(
      `${length - platform.charLimit} characters over the ${platform.charLimit}-char limit.`
    );
  }

  if (hashtags.length > platform.maxHashtags) {
    warnings.push(
      `${hashtags.length} hashtags used — ${platform.name} tends to reward ${platform.maxHashtags} or fewer.`
    );
  }

  if (platform.mediaRequired && mediaCount === 0) {
    errors.push(`${platform.name} posts need at least one image or video.`);
  }

  if (platform.maxMedia && mediaCount > platform.maxMedia) {
    errors.push(`${mediaCount - platform.maxMedia} too many attachments (max ${platform.maxMedia}).`);
  }

  if (length > platform.charLimit * 0.9 && length <= platform.charLimit) {
    warnings.push("Cutting it close to the limit.");
  }

  const capsRun = text.match(/[A-Z]{6,}/);
  if (capsRun) {
    warnings.push("Long run of caps can read as shouting — consider sentence case.");
  }

  if (text.trim() && !/[.!?…]$/.test(text.trim()) && text.trim().length > 40) {
    warnings.push("No closing punctuation — might read as unfinished.");
  }

  return { errors, warnings, length, limit: platform.charLimit, hashtags };
}

/**
 * Validate a post across every selected platform. Returns a map keyed by platformId.
 */
export function validateAll(text, mediaCount, platformIds = [], title = "") {
  const result = {};
  platformIds.forEach((id) => {
    result[id] = validateForPlatform(text, mediaCount, id, title);
  });
  return result;
}

export function isPublishable(validationMap) {
  const ids = Object.keys(validationMap);
  if (ids.length === 0) return false;
  return ids.every((id) => validationMap[id].errors.length === 0);
}
