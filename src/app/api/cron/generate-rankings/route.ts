import { after } from "next/server";
import { NextResponse } from "next/server";
import { anonClient } from "@/lib/supabase/anon";
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

/**
 * Daily cron job to generate AI rankings for all public trips.
 * Triggered externally (e.g., cron-job.org).
 *
 * Uses anon client (no service-role key) + SECURITY DEFINER RPC
 * for the ai_rankings write. Protected by CRON_SECRET bearer token.
 *
 * Returns 202 immediately to avoid cron-job.org timeout,
 * then processes trips in the background via after().
 */
export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = anonClient;

  // Quick count check before handing off to background
  const { data: trips } = await supabase
    .from("trips")
    .select("id")
    .eq("is_public", true);

  if (!trips || trips.length === 0) {
    return NextResponse.json({ message: "No trips to process", processed: 0 });
  }

  // Kick off background processing — responds before work completes
  // so cron-job.org doesn't timeout waiting for all Gemini calls
  after(async () => {
    await processAllTrips(
      supabase,
      trips.map((t) => t.id),
    );
  });

  return NextResponse.json(
    { message: `Ranking generation started for ${trips.length} trips` },
    { status: 202 },
  );
}

/**
 * Process trips in parallel batches of 3 to respect Gemini free-tier
 * rate limits (15 RPM). Promise.allSettled ensures one failure doesn't
 * cancel the rest of the batch.
 */
const CONCURRENCY = 3;

async function processAllTrips(supabase: typeof anonClient, tripIds: string[]) {
  for (let i = 0; i < tripIds.length; i += CONCURRENCY) {
    const batch = tripIds.slice(i, i + CONCURRENCY);
    await Promise.allSettled(
      batch.map((tripId) => generateRankingForTrip(supabase, tripId)),
    );
  }
}

async function generateRankingForTrip(
  supabase: typeof anonClient,
  tripId: string,
) {
  // Fetch entries
  const { data: entries } = await supabase
    .from("v_entry_avg_scores")
    .select("entry_id, title, restaurant_name, avg_score, rating_count")
    .eq("trip_id", tripId);

  if (!entries || entries.length < 2) {
    return {
      trip_id: tripId,
      status: "skipped" as const,
      entries: entries?.length ?? 0,
    };
  }

  const entryIds = entries
    .map((e) => e.entry_id)
    .filter((id): id is string => id != null);

  // Fetch tournament wins
  const { data: tournaments } = await supabase
    .from("tournaments")
    .select("id")
    .eq("trip_id", tripId);

  const tournamentIds = (tournaments ?? []).map((t) => t.id);
  const winCounts = new Map<string, number>();

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
    .select(
      "question_id, response_value, response_text, ai_questions(entry_id)",
    )
    .in("question_id", entryIds);

  const aiResponseMap = new Map<
    string,
    { sum: number; count: number; texts: string[] }
  >();
  for (const r of aiResponses ?? []) {
    const entryId = (r.ai_questions as unknown as { entry_id: string })
      ?.entry_id;
    if (!entryId) continue;
    const existing = aiResponseMap.get(entryId) ?? {
      sum: 0,
      count: 0,
      texts: [],
    };
    if (r.response_value !== null) {
      existing.sum += r.response_value;
      existing.count += 1;
    }
    if (r.response_text) {
      existing.texts.push(r.response_text);
    }
    aiResponseMap.set(entryId, existing);
  }

  // Fetch reviews
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
  const sentimentMap = new Map<string, { score: number; comment: string }>();
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
    // Graceful degradation — use default sentiment score
  }

  // Compute composite scores
  const rankingEntries: RankingEntry[] = entries
    .filter((e) => e.entry_id != null)
    .map((e) => {
      const eid = e.entry_id!;
      const userScore = e.avg_score ?? 0;
      const tournamentScore = normalizeWinRate(
        winCounts.get(eid) ?? 0,
        maxWins,
      );
      const aiData = aiResponseMap.get(eid);
      const aiQuestionScore =
        aiData && aiData.count > 0
          ? normalizeAiResponseAvg(aiData.sum / aiData.count)
          : 5;
      const sentiment = sentimentMap.get(eid)?.score ?? 5;
      const aiComment =
        sentimentMap.get(eid)?.comment ??
        `${e.title ?? "This entry"} — composite ranking based on available scores.`;

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

  rankingEntries.sort((a, b) => b.composite_score - a.composite_score);

  // Upsert via SECURITY DEFINER RPC (no service-role key needed)
  const { error: rpcError } = await supabase.rpc("upsert_ai_ranking", {
    p_trip_id: tripId,
    p_ranking_data: rankingEntries as unknown as Json,
    p_weights_used: DEFAULT_WEIGHTS as unknown as Json,
  });

  if (rpcError) {
    return {
      trip_id: tripId,
      status: "error" as const,
      error: rpcError.message,
    };
  }

  return {
    trip_id: tripId,
    status: "success" as const,
    entries: rankingEntries.length,
  };
}
