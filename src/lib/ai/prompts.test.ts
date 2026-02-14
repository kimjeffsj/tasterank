import {
  buildTagSuggestionPrompt,
  parseTagSuggestions,
} from "./prompts";

describe("buildTagSuggestionPrompt", () => {
  it("includes food title", () => {
    const prompt = buildTagSuggestionPrompt({ title: "Spicy Miso Ramen" });
    expect(prompt).toContain("Food: Spicy Miso Ramen");
  });

  it("includes restaurant name when provided", () => {
    const prompt = buildTagSuggestionPrompt({
      title: "Ramen",
      restaurantName: "Ichiran",
    });
    expect(prompt).toContain("Restaurant: Ichiran");
  });

  it("includes description when provided", () => {
    const prompt = buildTagSuggestionPrompt({
      title: "Ramen",
      description: "Rich and creamy pork broth",
    });
    expect(prompt).toContain("Description: Rich and creamy pork broth");
  });
});

describe("parseTagSuggestions", () => {
  it("parses valid JSON array", () => {
    const text = `[{"name": "japanese", "category": "cuisine", "confidence": 0.95}]`;
    const tags = parseTagSuggestions(text);
    expect(tags).toEqual([
      { name: "japanese", category: "cuisine", confidence: 0.95 },
    ]);
  });

  it("handles markdown-wrapped JSON", () => {
    const text = "```json\n[{\"name\": \"spicy\", \"category\": \"flavor\", \"confidence\": 0.8}]\n```";
    const tags = parseTagSuggestions(text);
    expect(tags).toHaveLength(1);
    expect(tags[0].name).toBe("spicy");
  });

  it("returns empty array for invalid JSON", () => {
    expect(parseTagSuggestions("not json")).toEqual([]);
  });

  it("limits to 5 tags", () => {
    const items = Array.from({ length: 8 }, (_, i) => ({
      name: `tag${i}`,
      category: "general",
      confidence: 0.5,
    }));
    const tags = parseTagSuggestions(JSON.stringify(items));
    expect(tags).toHaveLength(5);
  });

  it("filters out invalid tag objects", () => {
    const text = `[{"name": "valid", "category": "cuisine", "confidence": 0.9}, {"invalid": true}]`;
    const tags = parseTagSuggestions(text);
    expect(tags).toHaveLength(1);
  });
});
