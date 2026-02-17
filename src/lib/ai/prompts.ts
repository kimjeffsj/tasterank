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

// ─── Follow-up Questions ──────────────────────────────────

export interface FollowUpInput {
  title: string;
  restaurantName?: string;
  tags?: string[];
  score?: number;
  description?: string;
}

export interface FollowUpQuestion {
  question_text: string;
  question_type: "scale" | "text" | "choice";
  options?: string[];
  question_order: number;
}

export function buildFollowUpPrompt(input: FollowUpInput): string {
  const parts = [`Food: ${input.title}`];
  if (input.restaurantName) parts.push(`Restaurant: ${input.restaurantName}`);
  if (input.tags && input.tags.length > 0) parts.push(`Tags: ${input.tags.join(", ")}`);
  if (input.score) parts.push(`Score: ${input.score}/10`);
  if (input.description) parts.push(`Review: ${input.description}`);

  return `You are a food review assistant. Given the following food entry, generate 2-3 follow-up questions to capture more detailed opinions.

${parts.join("\n")}

Question types:
- "scale": Rate on a 1-5 scale (e.g., spiciness, value for money, presentation)
- "text": Short free-text answer (e.g., tips for first-time visitors, what to order next time)
- "choice": Pick one from 2-4 options (e.g., "Would you revisit?" → ["Definitely", "Maybe", "Unlikely"])

Respond ONLY with a JSON array, no markdown, no explanation:
[{"question_text": "...", "question_type": "scale|text|choice", "options": ["..."] (only for choice), "question_order": 1}]

Rules:
- Generate exactly 2-3 questions
- Mix different question types when possible
- Questions should be conversational and specific to this food
- Keep questions short (under 60 characters)
- For choice type, provide 2-4 options`;
}

export function parseFollowUpQuestions(text: string): FollowUpQuestion[] {
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed)) return [];

    const validTypes = new Set(["scale", "text", "choice"]);

    return parsed
      .filter(
        (q: unknown): q is FollowUpQuestion =>
          typeof q === "object" &&
          q !== null &&
          typeof (q as FollowUpQuestion).question_text === "string" &&
          typeof (q as FollowUpQuestion).question_type === "string" &&
          validTypes.has((q as FollowUpQuestion).question_type) &&
          typeof (q as FollowUpQuestion).question_order === "number",
      )
      .slice(0, 3);
  } catch {
    return [];
  }
}

// ─── Ranking Sentiment Analysis ──────────────────────────

export interface RankingEntryInput {
  entry_id: string;
  title: string;
  restaurant_name?: string;
  review_texts: string[];
  ai_response_texts: string[];
}

export interface RankingSentimentResult {
  entry_id: string;
  sentiment_score: number;
  ai_comment: string;
}

export function buildRankingPrompt(entries: RankingEntryInput[]): string {
  const entryDescriptions = entries.map((e, i) => {
    const parts = [`Entry ${i + 1} (id: ${e.entry_id}): ${e.title}`];
    if (e.restaurant_name) parts.push(`  Restaurant: ${e.restaurant_name}`);
    if (e.review_texts.length > 0) {
      const truncated = e.review_texts
        .slice(0, 5)
        .map((r) => r.slice(0, 200));
      parts.push(`  Reviews: ${truncated.join(" | ")}`);
    }
    if (e.ai_response_texts.length > 0) {
      const truncated = e.ai_response_texts
        .slice(0, 5)
        .map((r) => r.slice(0, 200));
      parts.push(`  AI Q&A responses: ${truncated.join(" | ")}`);
    }
    return parts.join("\n");
  });

  return `You are a food ranking analyst. Analyze the sentiment of user reviews and AI question responses for each food entry below.

${entryDescriptions.join("\n\n")}

For each entry, provide:
- sentiment_score: A score from 0 to 10 reflecting overall sentiment (0 = very negative, 10 = very positive). If no reviews/responses exist, default to 5.0.
- ai_comment: A 1-2 sentence summary highlighting what makes this dish stand out or notable.

Respond ONLY with a JSON array, no markdown, no explanation:
[{"entry_id": "...", "sentiment_score": 8.5, "ai_comment": "..."}]

Rules:
- Return one object per entry, in the same order
- sentiment_score must be a number between 0 and 10
- ai_comment should be specific and reference actual review content when available
- Keep ai_comment under 120 characters`;
}

export function parseRankingResponse(text: string): RankingSentimentResult[] {
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (r: unknown): r is RankingSentimentResult =>
        typeof r === "object" &&
        r !== null &&
        typeof (r as RankingSentimentResult).entry_id === "string" &&
        typeof (r as RankingSentimentResult).sentiment_score === "number" &&
        typeof (r as RankingSentimentResult).ai_comment === "string",
    );
  } catch {
    return [];
  }
}

// ─── Tag Suggestions ──────────────────────────────────────

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
