import {
  buildTagSuggestionPrompt,
  parseTagSuggestions,
  buildFollowUpPrompt,
  parseFollowUpQuestions,
  buildRankingPrompt,
  parseRankingResponse,
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

describe("buildFollowUpPrompt", () => {
  it("includes food title", () => {
    const prompt = buildFollowUpPrompt({ title: "Tonkotsu Ramen" });
    expect(prompt).toContain("Tonkotsu Ramen");
  });

  it("includes optional fields when provided", () => {
    const prompt = buildFollowUpPrompt({
      title: "Ramen",
      restaurantName: "Ichiran",
      tags: ["japanese", "spicy"],
      score: 8,
      description: "Rich broth",
    });
    expect(prompt).toContain("Ichiran");
    expect(prompt).toContain("japanese, spicy");
    expect(prompt).toContain("8/10");
    expect(prompt).toContain("Rich broth");
  });

  it("omits empty optional fields", () => {
    const prompt = buildFollowUpPrompt({ title: "Ramen" });
    expect(prompt).not.toContain("Restaurant:");
    expect(prompt).not.toContain("Tags:");
    expect(prompt).not.toContain("Score:");
  });

  it("requests JSON array output", () => {
    const prompt = buildFollowUpPrompt({ title: "Ramen" });
    expect(prompt).toContain("JSON");
    expect(prompt).toContain("question_text");
    expect(prompt).toContain("question_type");
  });
});

describe("parseFollowUpQuestions", () => {
  it("parses valid scale question", () => {
    const text = `[{"question_text": "How spicy was it?", "question_type": "scale", "question_order": 1}]`;
    const questions = parseFollowUpQuestions(text);
    expect(questions).toEqual([
      { question_text: "How spicy was it?", question_type: "scale", question_order: 1 },
    ]);
  });

  it("parses choice question with options", () => {
    const text = `[{"question_text": "Best part?", "question_type": "choice", "options": ["Broth", "Noodles", "Toppings"], "question_order": 1}]`;
    const questions = parseFollowUpQuestions(text);
    expect(questions).toHaveLength(1);
    expect(questions[0].options).toEqual(["Broth", "Noodles", "Toppings"]);
  });

  it("parses text question", () => {
    const text = `[{"question_text": "Any tips?", "question_type": "text", "question_order": 1}]`;
    const questions = parseFollowUpQuestions(text);
    expect(questions[0].question_type).toBe("text");
  });

  it("handles markdown-wrapped JSON", () => {
    const text = '```json\n[{"question_text": "Rate?", "question_type": "scale", "question_order": 1}]\n```';
    const questions = parseFollowUpQuestions(text);
    expect(questions).toHaveLength(1);
  });

  it("returns empty array for invalid JSON", () => {
    expect(parseFollowUpQuestions("not json")).toEqual([]);
  });

  it("limits to 3 questions", () => {
    const items = Array.from({ length: 5 }, (_, i) => ({
      question_text: `Question ${i}`,
      question_type: "scale",
      question_order: i,
    }));
    const questions = parseFollowUpQuestions(JSON.stringify(items));
    expect(questions).toHaveLength(3);
  });

  it("filters out invalid question objects", () => {
    const text = `[{"question_text": "Valid?", "question_type": "scale", "question_order": 1}, {"invalid": true}]`;
    const questions = parseFollowUpQuestions(text);
    expect(questions).toHaveLength(1);
  });

  it("filters out invalid question_type", () => {
    const text = `[{"question_text": "Bad type?", "question_type": "multiple", "question_order": 1}]`;
    const questions = parseFollowUpQuestions(text);
    expect(questions).toHaveLength(0);
  });
});

describe("buildRankingPrompt", () => {
  it("includes all entry titles", () => {
    const prompt = buildRankingPrompt([
      { entry_id: "e1", title: "Tonkotsu Ramen", review_texts: [], ai_response_texts: [] },
      { entry_id: "e2", title: "Sushi Platter", review_texts: [], ai_response_texts: [] },
    ]);
    expect(prompt).toContain("Tonkotsu Ramen");
    expect(prompt).toContain("Sushi Platter");
  });

  it("includes restaurant name when provided", () => {
    const prompt = buildRankingPrompt([
      { entry_id: "e1", title: "Ramen", restaurant_name: "Ichiran", review_texts: [], ai_response_texts: [] },
    ]);
    expect(prompt).toContain("Ichiran");
  });

  it("includes review texts truncated", () => {
    const longReview = "A".repeat(300);
    const prompt = buildRankingPrompt([
      { entry_id: "e1", title: "Ramen", review_texts: [longReview], ai_response_texts: [] },
    ]);
    expect(prompt).toContain("A".repeat(200));
    expect(prompt).not.toContain("A".repeat(201));
  });

  it("requests JSON array output with sentiment_score and ai_comment", () => {
    const prompt = buildRankingPrompt([
      { entry_id: "e1", title: "Ramen", review_texts: [], ai_response_texts: [] },
    ]);
    expect(prompt).toContain("JSON");
    expect(prompt).toContain("sentiment_score");
    expect(prompt).toContain("ai_comment");
  });
});

describe("parseRankingResponse", () => {
  it("parses valid response", () => {
    const text = `[{"entry_id": "e1", "sentiment_score": 8.5, "ai_comment": "Great dish"}]`;
    const result = parseRankingResponse(text);
    expect(result).toEqual([
      { entry_id: "e1", sentiment_score: 8.5, ai_comment: "Great dish" },
    ]);
  });

  it("handles markdown-wrapped JSON", () => {
    const text = '```json\n[{"entry_id": "e1", "sentiment_score": 7, "ai_comment": "Good"}]\n```';
    const result = parseRankingResponse(text);
    expect(result).toHaveLength(1);
  });

  it("returns empty array for invalid JSON", () => {
    expect(parseRankingResponse("not json")).toEqual([]);
  });

  it("filters out invalid objects", () => {
    const text = `[{"entry_id": "e1", "sentiment_score": 8, "ai_comment": "Good"}, {"invalid": true}]`;
    const result = parseRankingResponse(text);
    expect(result).toHaveLength(1);
  });
});
