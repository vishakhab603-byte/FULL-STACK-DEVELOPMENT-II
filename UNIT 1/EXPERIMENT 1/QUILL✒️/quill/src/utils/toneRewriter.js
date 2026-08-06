import { getPlatform } from "./platformRules";


export function ruleBasedRewrite(text, platformId) {
  const platform = getPlatform(platformId);
  if (!platform || !text.trim()) return text;

  let out = text.trim();

  switch (platformId) {
    case "x": {
      // clipped: shorter sentences, drop filler, prefer line breaks over commas
      out = out
        .replace(/\b(very|really|actually|just|basically|in order to)\b/gi, "")
        .replace(/,\s+(and|but)\s+/gi, ". $1 ")
        .replace(/\s{2,}/g, " ")
        .trim();
      if (out.length > 0 && !/[.!?]$/.test(out)) out += ".";
      break;
    }
    case "linkedin": {
      // narrative: add a hook line + closing reflection/CTA if short
      const hasHook = /^(i |we |here's|today|last week|one lesson|three years ago)/i.test(out);
      if (!hasHook) {
        out = `Here's something I've been thinking about:\n\n${out}`;
      }
      if (!/\?\s*$/.test(out) && !/what.{0,20}think/i.test(out)) {
        out += `\n\nCurious how others have approached this — what's worked for you?`;
      }
      break;
    }
    case "instagram": {
      // warm, visual, hashtags clustered at end
      const tags = (out.match(/#[a-zA-Z0-9_]+/g) || []);
      const bare = out.replace(/#[a-zA-Z0-9_]+/g, "").trim();
      out = `${bare}${bare.endsWith(".") || bare.endsWith("!") ? "" : "."} ✨`;
      if (tags.length) out += `\n\n${tags.join(" ")}`;
      break;
    }
    case "threads": {
      out = out.replace(/\bIn conclusion,?\s*/gi, "").trim();
      if (!/[.!?]$/.test(out)) out += " — anyway, thoughts?";
      break;
    }
    case "facebook": {
      if (out.split(/\s+/).length < 12) {
        out = `${out} Sharing this with the community — would love to hear your take.`;
      }
      break;
    }
    default:
      break;
  }

  return out;
}

/**
 * Snarky feedback mode. Rule-based version below stays gentle-but-honest;
 * swap for callClaude() for genuinely funny, context-aware roasts.
 */
export function roast(text = "", platformId) {
  const platform = getPlatform(platformId);
  const lines = [];
  const trimmed = text.trim();

  if (!trimmed) return "Nothing to roast — this is the softest possible target, an empty box.";

  if (trimmed.length < 20) {
    lines.push("This post has the depth of a fortune cookie that got interrupted.");
  }
  if ((trimmed.match(/!/g) || []).length >= 3) {
    lines.push("The exclamation points are doing unpaid overtime.");
  }
  if (/\b(synergy|leverage|circle back|touch base|disrupt)\b/i.test(trimmed)) {
    lines.push("Somewhere, a corporate buzzword bingo card just filled up.");
  }
  if (!/[.!?]$/.test(trimmed)) {
    lines.push("It just... stops. Like you got a Slack ping mid-sentence.");
  }
  if (platform && trimmed.length > platform.charLimit * 0.95) {
    lines.push(`You're basically renting out the entire ${platform.name} character limit — bold.`);
  }
  if (lines.length === 0) {
    lines.push("Annoyingly solid. No notes. The Muse is mildly impressed and a little suspicious.");
  }
  return lines.join(" ");
}

/**
 * ---------------------------------------------------------------
 * Real Claude API version (disabled by default — no key baked in).
 * This is the natural upgrade path for both ruleBasedRewrite() and
 * roast(): the task genuinely needs judgment about voice, which a
 * model does far better than regex.
 * ---------------------------------------------------------------
 *
 * export async function callClaude(text, platform, mode = "rewrite") {
 *   const systemPrompt = mode === "rewrite"
 *     ? `Rewrite the user's post for ${platform.name}. Target voice: ${platform.voice}.
 *        Keep the core message and any hashtags/links. Return ONLY the rewritten text.`
 *     : `You are a witty, never-mean social media editor. Roast this post for
 *        ${platform.name} in 1-2 sharp, funny sentences. Return ONLY the roast.`;
 *
 *   const response = await fetch("https://api.anthropic.com/v1/messages", {
 *     method: "POST",
 *     headers: { "Content-Type": "application/json", "x-api-key": YOUR_KEY, "anthropic-version": "2023-06-01" },
 *     body: JSON.stringify({
 *       model: "claude-sonnet-4-6",
 *       max_tokens: 300,
 *       system: systemPrompt,
 *       messages: [{ role: "user", content: text }],
 *     }),
 *   });
 *   const data = await response.json();
 *   return data.content.find((b) => b.type === "text")?.text ?? text;
 * }
 */
