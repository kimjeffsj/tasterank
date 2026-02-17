import {
  normalizeWinRate,
  normalizeAiResponseAvg,
  computeCompositeScore,
  DEFAULT_WEIGHTS,
  type ScoreBreakdown,
  type ScoreWeights,
} from "./ranking-engine";

describe("normalizeWinRate", () => {
  it("returns 0 when no wins", () => {
    expect(normalizeWinRate(0, 10)).toBe(0);
  });

  it("returns 10 when wins equals maxWins", () => {
    expect(normalizeWinRate(10, 10)).toBe(10);
  });

  it("normalizes proportionally to 0-10 scale", () => {
    expect(normalizeWinRate(5, 10)).toBe(5);
    expect(normalizeWinRate(3, 12)).toBeCloseTo(2.5);
  });

  it("returns 0 when maxWins is 0", () => {
    expect(normalizeWinRate(0, 0)).toBe(0);
  });
});

describe("normalizeAiResponseAvg", () => {
  it("maps 1 to 2", () => {
    expect(normalizeAiResponseAvg(1)).toBe(2);
  });

  it("maps 5 to 10", () => {
    expect(normalizeAiResponseAvg(5)).toBe(10);
  });

  it("maps 3 to 6", () => {
    expect(normalizeAiResponseAvg(3)).toBe(6);
  });

  it("returns 0 for 0 input", () => {
    expect(normalizeAiResponseAvg(0)).toBe(0);
  });
});

describe("computeCompositeScore", () => {
  it("computes weighted average using default weights", () => {
    const breakdown: ScoreBreakdown = {
      user_score: 10,
      tournament: 10,
      ai_questions: 10,
      sentiment: 10,
    };
    expect(computeCompositeScore(breakdown, DEFAULT_WEIGHTS)).toBe(10);
  });

  it("computes weighted average with mixed scores", () => {
    const breakdown: ScoreBreakdown = {
      user_score: 8,     // 8 * 0.4  = 3.2
      tournament: 6,     // 6 * 0.25 = 1.5
      ai_questions: 4,   // 4 * 0.2  = 0.8
      sentiment: 10,     // 10 * 0.15 = 1.5
    };
    // Total = 7.0
    expect(computeCompositeScore(breakdown, DEFAULT_WEIGHTS)).toBe(7);
  });

  it("returns 0 when all scores are 0", () => {
    const breakdown: ScoreBreakdown = {
      user_score: 0,
      tournament: 0,
      ai_questions: 0,
      sentiment: 0,
    };
    expect(computeCompositeScore(breakdown, DEFAULT_WEIGHTS)).toBe(0);
  });

  it("uses custom weights", () => {
    const breakdown: ScoreBreakdown = {
      user_score: 10,
      tournament: 0,
      ai_questions: 0,
      sentiment: 0,
    };
    const weights: ScoreWeights = {
      user_score: 1.0,
      tournament: 0,
      ai_questions: 0,
      sentiment: 0,
    };
    expect(computeCompositeScore(breakdown, weights)).toBe(10);
  });

  it("rounds to one decimal place", () => {
    const breakdown: ScoreBreakdown = {
      user_score: 7.3,
      tournament: 5.7,
      ai_questions: 8.1,
      sentiment: 6.4,
    };
    const result = computeCompositeScore(breakdown, DEFAULT_WEIGHTS);
    // 7.3*0.4 + 5.7*0.25 + 8.1*0.2 + 6.4*0.15 = 2.92 + 1.425 + 1.62 + 0.96 = 6.925
    expect(result).toBe(6.9);
  });
});

describe("DEFAULT_WEIGHTS", () => {
  it("sums to 1.0", () => {
    const sum =
      DEFAULT_WEIGHTS.user_score +
      DEFAULT_WEIGHTS.tournament +
      DEFAULT_WEIGHTS.ai_questions +
      DEFAULT_WEIGHTS.sentiment;
    expect(sum).toBe(1);
  });
});
