import { getPlatform } from "./platformRules";
import { effectiveLength } from "./validators";

/**
 * Splits long text into numbered thread parts that each fit the platform's
 * character limit, breaking on sentence boundaries where possible, falling
 * back to word boundaries. Reserves room for a " 3/7" style suffix.
 */
export function splitIntoThread(text, platformId) {
  const platform = getPlatform(platformId);
  if (!platform || !text.trim()) return [text];

  const limit = platform.charLimit;
  if (effectiveLength(text, platformId) <= limit) return [text];

  const suffixRoom = 6; // " 12/12"
  const budget = limit - suffixRoom;

  const sentences = text.match(/[^.!?]+[.!?]*\s*/g) || [text];
  const parts = [];
  let current = "";

  for (const sentence of sentences) {
    if ((current + sentence).trim().length <= budget) {
      current += sentence;
    } else {
      if (current.trim()) parts.push(current.trim());
      if (sentence.trim().length <= budget) {
        current = sentence;
      } else {
        // single sentence too long — hard-wrap on words
        const words = sentence.split(" ");
        current = "";
        for (const w of words) {
          if ((current + " " + w).trim().length <= budget) {
            current += (current ? " " : "") + w;
          } else {
            parts.push(current.trim());
            current = w;
          }
        }
      }
    }
  }
  if (current.trim()) parts.push(current.trim());

  const total = parts.length;
  return parts.map((p, i) => `${p} ${i + 1}/${total}`);
}

export function needsThread(text, platformId) {
  return effectiveLength(text, platformId) > (getPlatform(platformId)?.charLimit ?? Infinity);
}
