import {
  calculateBracketSize,
  seedEntries,
  generateRound1,
  generateNextRound,
  calculateRounds,
  type Match,
  type SeedableEntry,
} from "./bracket";

describe("calculateBracketSize", () => {
  it("returns 4 for 2-4 entries", () => {
    expect(calculateBracketSize(2)).toBe(4);
    expect(calculateBracketSize(3)).toBe(4);
    expect(calculateBracketSize(4)).toBe(4);
  });

  it("returns 8 for 5-8 entries", () => {
    expect(calculateBracketSize(5)).toBe(8);
    expect(calculateBracketSize(8)).toBe(8);
  });

  it("returns 16 for 9-16 entries", () => {
    expect(calculateBracketSize(9)).toBe(16);
    expect(calculateBracketSize(16)).toBe(16);
  });

  it("returns 32 for 17-32 entries", () => {
    expect(calculateBracketSize(17)).toBe(32);
    expect(calculateBracketSize(32)).toBe(32);
  });

  it("caps at 32", () => {
    expect(calculateBracketSize(33)).toBe(32);
    expect(calculateBracketSize(100)).toBe(32);
  });

  it("throws for less than 2 entries", () => {
    expect(() => calculateBracketSize(0)).toThrow();
    expect(() => calculateBracketSize(1)).toThrow();
  });
});

describe("seedEntries", () => {
  it("sorts by avg_score descending", () => {
    const entries: SeedableEntry[] = [
      { id: "a", avg_score: 3.0 },
      { id: "b", avg_score: 5.0 },
      { id: "c", avg_score: 4.0 },
    ];
    const result = seedEntries(entries);
    expect(result.map((e) => e.id)).toEqual(["b", "c", "a"]);
  });

  it("puts null scores at the end", () => {
    const entries: SeedableEntry[] = [
      { id: "a", avg_score: null },
      { id: "b", avg_score: 3.0 },
      { id: "c", avg_score: null },
    ];
    const result = seedEntries(entries);
    expect(result[0].id).toBe("b");
    expect(result.slice(1).map((e) => e.id)).toContain("a");
    expect(result.slice(1).map((e) => e.id)).toContain("c");
  });

  it("returns empty for empty input", () => {
    expect(seedEntries([])).toEqual([]);
  });
});

describe("generateRound1", () => {
  it("creates correct matches for exact bracket size (4 entries)", () => {
    const ids = ["a", "b", "c", "d"];
    const matches = generateRound1(ids, 4);
    expect(matches).toHaveLength(2);
    expect(matches[0]).toEqual({
      matchOrder: 0,
      entryA: "a",
      entryB: "d",
    });
    expect(matches[1]).toEqual({
      matchOrder: 1,
      entryA: "b",
      entryB: "c",
    });
  });

  it("assigns byes to top seeds for 5 entries bracket 8", () => {
    const ids = ["a", "b", "c", "d", "e"];
    const matches = generateRound1(ids, 8);
    expect(matches).toHaveLength(4);

    // Top 3 seeds get byes
    expect(matches[0]).toEqual({ matchOrder: 0, entryA: "a", entryB: null });
    expect(matches[1]).toEqual({ matchOrder: 1, entryA: "b", entryB: null });
    expect(matches[2]).toEqual({ matchOrder: 2, entryA: "c", entryB: null });
    // Only match 3 is a real matchup
    expect(matches[3]).toEqual({ matchOrder: 3, entryA: "d", entryB: "e" });
  });

  it("assigns byes correctly for 6 entries bracket 8", () => {
    const ids = ["a", "b", "c", "d", "e", "f"];
    const matches = generateRound1(ids, 8);
    expect(matches).toHaveLength(4);

    // 2 byes for top 2 seeds
    expect(matches[0].entryB).toBeNull();
    expect(matches[1].entryB).toBeNull();
    // Real matches
    expect(matches[2].entryB).not.toBeNull();
    expect(matches[3].entryB).not.toBeNull();
  });

  it("handles 8 entries bracket 8 with no byes", () => {
    const ids = ["a", "b", "c", "d", "e", "f", "g", "h"];
    const matches = generateRound1(ids, 8);
    expect(matches).toHaveLength(4);
    matches.forEach((m) => {
      expect(m.entryB).not.toBeNull();
    });
  });
});

describe("generateNextRound", () => {
  it("pairs winners sequentially", () => {
    const winners = ["a", "b", "c", "d"];
    const matches = generateNextRound(winners);
    expect(matches).toHaveLength(2);
    expect(matches[0]).toEqual({ matchOrder: 0, entryA: "a", entryB: "b" });
    expect(matches[1]).toEqual({ matchOrder: 1, entryA: "c", entryB: "d" });
  });

  it("creates final match from 2 winners", () => {
    const matches = generateNextRound(["x", "y"]);
    expect(matches).toHaveLength(1);
    expect(matches[0]).toEqual({ matchOrder: 0, entryA: "x", entryB: "y" });
  });
});

describe("calculateRounds", () => {
  it("returns log2 of bracket size", () => {
    expect(calculateRounds(4)).toBe(2);
    expect(calculateRounds(8)).toBe(3);
    expect(calculateRounds(16)).toBe(4);
    expect(calculateRounds(32)).toBe(5);
  });
});
