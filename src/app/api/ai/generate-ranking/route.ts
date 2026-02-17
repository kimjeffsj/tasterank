import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/route";
import { getModel } from "@/lib/ai/client";
import { buildRankingPrompt, parseRankingResponse } from "@/lib/ai/prompts";
import {
  normalizeWinRate,
  normalizeAiResponseAvg,
  computeCompositeScore,
  DEFAULT_WEIGHTS,
  type RankingEntry,
  type ScoreBreakdown,
} from "@/lib/ai/ranking-engine";
import type { RankingEntryInput } from "@/lib/ai/prompts";
import type { Json } from "@/types/database";

export async function POST(request: Request) {
  // Auth check
  const supabase = await createRouteClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse body
  const body = await request.json().catch(() => null);
  if (!body?.tripId) {
    return NextResponse.json(
      { error: "tripId is required" },
      { status: 400 },
    );
  }

  const tripId = body.tripId as string;

  // Check user is trip editor
  const { data: membership } = await supabase
    .from("trip_members")
    .select("user_id, role")
    .eq("trip_id", tripId)
    .eq("user_id", user.id)
    .in("role", ["owner", "editor"]);

  if (!membership || membership.length === 0) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Fetch entries with avg scores
  const { data: entries } = await supabase
    .from("v_entry_avg_scores")
    .select("entry_id, title, restaurant_name, avg_score, rating_count")
    .eq("trip_id", tripId);

  if (!entries || entries.length < 2) {
    return NextResponse.json(
      { error: "Need at least 2 entries to generate ranking" },
      { status: 400 },
    );
  }

  const entryIds = entries.map((e) => e.entry_id).filter((id): id is string => id != null);

  // Fetch tournament data
  const { data: tournaments } = await supabase
    .from("tournaments")
    .select("id")
    .eq("trip_id", tripId);

  const tournamentIds = (tournaments ?? []).map((t) => t.id);

  let winCounts = new Map<string, number>();
  if (tournamentIds.length > 0) {
    const { data: votes } = await supabase
      .from("tournament_votes")
      .select("winner_id")
      .in("tournament_id", tournamentIds);

    for (const v of votes ?? []) {
      winCounts.set(v.winner_id, (winCounts.get(v.winner_id) ?? 0) + 1);
    }
  }

  const maxWins = Math.max(0, ...Array.from(winCounts.values()));

  // Fetch AI responses
  const { data: aiResponses } = await supabase
    .from("ai_responses")
    .select("question_id, response_value, response_text, ai_questions(entry_id)")
    .in("question_id",
      // We need question IDs for entries in this trip — fetch via join
      entryIds,
    );

  // Build entry_id → avg AI response value map
  const aiResponseMap = new Map<string, { sum: number; count: number; texts: string[] }>();
  for (const r of aiResponses ?? []) {
    const entryId = (r.ai_questions as unknown as { entry_id: string })?.entry_id;
    if (!entryId) continue;
    const existing = aiResponseMap.get(entryId) ?? { sum: 0, count: 0, texts: [] };
    if (r.response_value !== null) {
      existing.sum += r.response_value;
      existing.count += 1;
    }
    if (r.response_text) {
      existing.texts.push(r.response_text);
    }
    aiResponseMap.set(entryId, existing);
  }

  // Fetch review texts
  const { data: ratings } = await supabase
    .from("ratings")
    .select("entry_id, review_text")
    .in("entry_id", entryIds);

  const reviewMap = new Map<string, string[]>();
  for (const r of ratings ?? []) {
    if (!r.review_text) continue;
    const existing = reviewMap.get(r.entry_id) ?? [];
    existing.push(r.review_text);
    reviewMap.set(r.entry_id, existing);
  }

  // Build prompt input
  const promptEntries: RankingEntryInput[] = entries
    .filter((e) => e.entry_id != null)
    .map((e) => ({
      entry_id: e.entry_id!,
      title: e.title ?? "Untitled",
      restaurant_name: e.restaurant_name ?? undefined,
      review_texts: reviewMap.get(e.entry_id!) ?? [],
      ai_response_texts: aiResponseMap.get(e.entry_id!)?.texts ?? [],
    }));

  // Call Gemini for sentiment analysis
  let sentimentMap = new Map<string, { score: number; comment: string }>();
  try {
    const model = getModel();
    const prompt = buildRankingPrompt(promptEntries);
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = parseRankingResponse(text);

    for (const r of parsed) {
      sentimentMap.set(r.entry_id, {
        score: r.sentiment_score,
        comment: r.ai_comment,
      });
    }
  } catch {
    // Graceful degradation — use defaults
  }

  // Compute composite scores
  const rankingEntries: RankingEntry[] = entries
    .filter((e) => e.entry_id != null)
    .map((e) => {
      const eid = e.entry_id!;
      const userScore = e.avg_score ?? 0;
      const tournamentScore = normalizeWinRate(winCounts.get(eid) ?? 0, maxWins);
      const aiData = aiResponseMap.get(eid);
      const aiQuestionScore = aiData && aiData.count > 0
        ? normalizeAiResponseAvg(aiData.sum / aiData.count)
        : 5; // default when no AI responses
      const sentiment = sentimentMap.get(eid)?.score ?? 5;
      const aiComment = sentimentMap.get(eid)?.comment
        ?? `${e.title ?? "This entry"} — composite ranking based on available scores.`;

      const breakdown: ScoreBreakdown = {
        user_score: userScore,
        tournament: tournamentScore,
        ai_questions: aiQuestionScore,
        sentiment,
      };

      return {
        entry_id: eid,
        composite_score: computeCompositeScore(breakdown, DEFAULT_WEIGHTS),
        breakdown,
        ai_comment: aiComment,
      };
    });

  // Sort by composite score descending
  rankingEntries.sort((a, b) => b.composite_score - a.composite_score);

  // Save to DB: delete existing, insert new
  await supabase
    .from("ai_rankings")
    .delete()
    .eq("trip_id", tripId);

  const { error: insertError } = await supabase
    .from("ai_rankings")
    .insert({
      trip_id: tripId,
      ranking_data: rankingEntries as unknown as Json,
      weights_used: DEFAULT_WEIGHTS as unknown as Json,
    })
    .select();

  return NextResponse.json({
    ranking: rankingEntries,
    saved: !insertError,
  });
}
