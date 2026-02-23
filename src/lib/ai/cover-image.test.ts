import {
  buildCoverImagePrompt,
  parseCoverImageKeywords,
} from "./prompts";

describe("buildCoverImagePrompt", () => {
  it("includes trip name when only name is provided", () => {
    const prompt = buildCoverImagePrompt({ name: "Jeju Island Trip" });
    expect(prompt).toContain("Jeju Island Trip");
  });

  it("requests JSON output with keywords field", () => {
    const prompt = buildCoverImagePrompt({ name: "Tokyo Food Tour" });
    expect(prompt).toContain("keywords");
    expect(prompt).toContain("JSON");
  });

  it("includes description when provided", () => {
    const prompt = buildCoverImagePrompt({
      name: "Osaka Street Food",
      description: "Exploring takoyaki and okonomiyaki in Dotonbori",
    });
    expect(prompt).toContain("Osaka Street Food");
    expect(prompt).toContain("Exploring takoyaki and okonomiyaki in Dotonbori");
  });

  it("does not include description section when description is omitted", () => {
    const prompt = buildCoverImagePrompt({ name: "Paris Bistro" });
    expect(prompt).not.toContain("undefined");
  });
});

describe("parseCoverImageKeywords", () => {
  it("parses valid JSON with keywords field", () => {
    const text = `{"keywords": "jeju island food"}`;
    const result = parseCoverImageKeywords(text);
    expect(result).toBe("jeju island food");
  });

  it("parses JSON embedded in surrounding text", () => {
    const text = `Here are keywords: {"keywords": "tokyo ramen japanese food"}`;
    const result = parseCoverImageKeywords(text);
    expect(result).toBe("tokyo ramen japanese food");
  });

  it("returns empty string for invalid JSON", () => {
    const result = parseCoverImageKeywords("not json at all");
    expect(result).toBe("");
  });

  it("returns empty string for empty response", () => {
    const result = parseCoverImageKeywords("");
    expect(result).toBe("");
  });

  it("returns empty string when keywords field is missing", () => {
    const result = parseCoverImageKeywords(`{"other": "value"}`);
    expect(result).toBe("");
  });

  it("returns empty string for malformed JSON object", () => {
    const result = parseCoverImageKeywords(`{"keywords": `);
    expect(result).toBe("");
  });
});
