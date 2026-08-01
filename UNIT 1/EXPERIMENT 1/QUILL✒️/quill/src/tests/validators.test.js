import { describe, it, expect } from "vitest";
import {
  extractHashtags,
  effectiveLength,
  validateForPlatform,
  validateAll,
  isPublishable,
} from "../utils/validators";

describe("extractHashtags", () => {
  it("finds hashtags and lowercases + dedupes them", () => {
    expect(extractHashtags("Loving #React and #REACT today #wow")).toEqual([
      "#react",
      "#wow",
    ]);
  });
  it("returns empty array when there are none", () => {
    expect(extractHashtags("no tags here")).toEqual([]);
  });
});

describe("effectiveLength", () => {
  it("counts raw length on platforms without link shortening", () => {
    expect(effectiveLength("hello world", "linkedin")).toBe(11);
  });
  it("counts URLs as 23 chars on X", () => {
    const text = "check this out https://example.com/some/very/long/path";
    const withoutUrl = "check this out ".length;
    expect(effectiveLength(text, "x")).toBe(withoutUrl + 23);
  });
});

describe("validateForPlatform", () => {
  it("flags empty posts with no media", () => {
    const { errors } = validateForPlatform("", 0, "x");
    expect(errors).toContain("Post is empty — add text or media.");
  });

  it("does not flag empty text if media is attached", () => {
    const { errors } = validateForPlatform("", 1, "x");
    expect(errors).not.toContain("Post is empty — add text or media.");
  });

  it("flags over-limit text on a non-threading platform", () => {
    const { errors } = validateForPlatform("a".repeat(4000), 0, "linkedin");
    expect(errors.some((e) => e.includes("over the"))).toBe(true);
  });

  it("does NOT hard-error over-limit text on a threading platform (it gets split instead)", () => {
    const { errors } = validateForPlatform("a".repeat(1000), 0, "x");
    expect(errors.some((e) => e.includes("over the"))).toBe(false);
  });

  it("requires media on Instagram", () => {
    const { errors } = validateForPlatform("nice caption", 0, "instagram");
    expect(errors.some((e) => e.includes("image or video"))).toBe(true);
  });

  it("warns on excessive hashtags relative to platform norms", () => {
    const text = "post " + Array.from({ length: 6 }, (_, i) => `#tag${i}`).join(" ");
    const { warnings } = validateForPlatform(text, 0, "x");
    expect(warnings.some((w) => w.includes("hashtags"))).toBe(true);
  });

  it("warns on long unbroken caps runs", () => {
    const { warnings } = validateForPlatform("THIS IS SHOUTING at people", 0, "x");
    expect(warnings.some((w) => w.includes("shouting"))).toBe(true);
  });

  it("rejects unknown platforms gracefully", () => {
    const { errors } = validateForPlatform("hi", 0, "myspace");
    expect(errors).toContain("Unknown platform");
  });

  it("requires a title on long-form platforms like Medium", () => {
    const withoutTitle = validateForPlatform("a full essay body", 0, "medium", "");
    expect(withoutTitle.errors.some((e) => e.includes("title"))).toBe(true);
    const withTitle = validateForPlatform("a full essay body", 0, "medium", "My Essay");
    expect(withTitle.errors.some((e) => e.includes("title"))).toBe(false);
  });
});

describe("validateAll / isPublishable", () => {
  it("is publishable only when every selected platform has zero errors", () => {
    const map = validateAll("a good short post", 0, ["x", "threads"]);
    expect(isPublishable(map)).toBe(true);
  });

  it("is not publishable if any platform has an error", () => {
    const map = validateAll("caption with no media", 0, ["x", "instagram"]);
    expect(isPublishable(map)).toBe(false);
  });

  it("returns false for an empty platform list", () => {
    expect(isPublishable({})).toBe(false);
  });
});
