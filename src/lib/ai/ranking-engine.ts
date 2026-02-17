export interface ScoreWeights {
  user_score: number;
  tournament: number;
  ai_questions: number;
  sentiment: number;
}

export interface ScoreBreakdown {
  user_score: number;
  tournament: number;
  ai_questions: number;
  sentiment: number;
}

export interface RankingEntry {
  entry_id: string;
  composite_score: number;
  breakdown: ScoreBreakdown;
  ai_comment: string;
}

export const DEFAULT_WEIGHTS: ScoreWeights = {
  user_score: 0.4,
  tournament: 0.25,
  ai_questions: 0.2,
  sentiment: 0.15,
};

/** Normalize tournament win count to 0-10 scale */
export function normalizeWinRate(wins: number, maxWins: number): number {
  if (maxWins === 0) return 0;
  return (wins / maxWins) * 10;
}

/** Normalize AI response average (1-5 scale) to 0-10 scale */
export function normalizeAiResponseAvg(avgValue: number): number {
  if (avgValue === 0) return 0;
  return avgValue * 2;
}

/** Compute weighted composite score, rounded to 1 decimal */
export function computeCompositeScore(
  breakdown: ScoreBreakdown,
  weights: ScoreWeights,
): number {
  const raw =
    breakdown.user_score * weights.user_score +
    breakdown.tournament * weights.tournament +
    breakdown.ai_questions * weights.ai_questions +
    breakdown.sentiment * weights.sentiment;
  return Math.round(raw * 10) / 10;
}
