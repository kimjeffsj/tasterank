export interface TagSuggestionInput {
  title: string;
  restaurantName?: string;
  description?: string;
}

export interface SuggestedTag {
  name: string;
  category: "cuisine" | "flavor" | "style" | "general";
  confidence: number;
}

export function buildTagSuggestionPrompt(input: TagSuggestionInput): string {
  const parts = [`Food: ${input.title}`];
  if (input.restaurantName) parts.push(`Restaurant: ${input.restaurantName}`);
  if (input.description) parts.push(`Description: ${input.description}`);

  return `You are a food tagging assistant. Given the following food entry, suggest 3-5 descriptive tags.

${parts.join("\n")}

Each tag should be categorized as one of: cuisine, flavor, style, general.
Return a confidence score (0.0-1.0) for each tag.

Respond ONLY with a JSON array, no markdown, no explanation:
[{"name": "tag name", "category": "cuisine|flavor|style|general", "confidence": 0.9}]

Rules:
- Tag names should be 1-2 words, lowercase
- Be specific and descriptive
- Include at least one cuisine tag if identifiable
- Include at least one flavor tag`;
}

export function parseTagSuggestions(text: string): SuggestedTag[] {
  // Extract JSON array from response (handle potential markdown wrapping)
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(
        (t: unknown): t is SuggestedTag =>
          typeof t === "object" &&
          t !== null &&
          typeof (t as SuggestedTag).name === "string" &&
          typeof (t as SuggestedTag).category === "string" &&
          typeof (t as SuggestedTag).confidence === "number",
      )
      .slice(0, 5);
  } catch {
    return [];
  }
}
