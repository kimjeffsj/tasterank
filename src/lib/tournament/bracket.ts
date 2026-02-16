export interface SeedableEntry {
  id: string;
  avg_score: number | null;
}

export interface Match {
  matchOrder: number;
  entryA: string;
  entryB: string | null; // null = bye
}

/**
 * Calculate the smallest power-of-2 bracket size that fits the entry count.
 * Min 4, max 32.
 */
export function calculateBracketSize(count: number): number {
  if (count < 2) throw new Error("Need at least 2 entries for a tournament");
  if (count <= 4) return 4;
  if (count <= 8) return 8;
  if (count <= 16) return 16;
  return 32;
}

/**
 * Sort entries by avg_score descending. Null scores go last.
 */
export function seedEntries(entries: SeedableEntry[]): SeedableEntry[] {
  return [...entries].sort((a, b) => {
    if (a.avg_score === null && b.avg_score === null) return 0;
    if (a.avg_score === null) return 1;
    if (b.avg_score === null) return -1;
    return b.avg_score - a.avg_score;
  });
}

/**
 * Generate round 1 matches with standard bracket seeding.
 * Top seeds get byes when entries < bracketSize.
 * Seeding pattern: 1v8, 2v7, 3v6, 4v5 (for bracket of 8)
 */
export function generateRound1(
  seededIds: string[],
  bracketSize: number,
): Match[] {
  const numMatches = bracketSize / 2;
  const numByes = bracketSize - seededIds.length;
  const matches: Match[] = [];

  // Create full bracket slots (pad with null for byes)
  const slots: (string | null)[] = new Array(bracketSize).fill(null);
  for (let i = 0; i < seededIds.length; i++) {
    slots[i] = seededIds[i];
  }

  // Standard bracket pairing: seed 0 vs seed (bracketSize-1), seed 1 vs seed (bracketSize-2), etc.
  for (let i = 0; i < numMatches; i++) {
    const topSeedIdx = i;
    const bottomSeedIdx = bracketSize - 1 - i;
    matches.push({
      matchOrder: i,
      entryA: slots[topSeedIdx]!,
      entryB: slots[bottomSeedIdx],
    });
  }

  return matches;
}

/**
 * Generate next round matches from previous round winners.
 */
export function generateNextRound(previousWinners: string[]): Match[] {
  const matches: Match[] = [];
  for (let i = 0; i < previousWinners.length; i += 2) {
    matches.push({
      matchOrder: i / 2,
      entryA: previousWinners[i],
      entryB: previousWinners[i + 1],
    });
  }
  return matches;
}

/**
 * Calculate total rounds from bracket size.
 */
export function calculateRounds(bracketSize: number): number {
  return Math.log2(bracketSize);
}
