"use client";

interface TournamentHeaderProps {
  currentRound: number;
  totalRounds: number;
  matchesCompleted: number;
  totalMatches: number;
}

const ROUND_NAMES: Record<number, string> = {
  1: "Final",
  2: "Semi-finals",
  3: "Quarter-finals",
  4: "Round of 16",
  5: "Round of 32",
};

function getRoundName(roundsFromEnd: number): string {
  return ROUND_NAMES[roundsFromEnd] ?? `Round ${roundsFromEnd}`;
}

export function TournamentHeader({
  currentRound,
  totalRounds,
  matchesCompleted,
  totalMatches,
}: TournamentHeaderProps) {
  const roundsFromEnd = totalRounds - currentRound + 1;
  const roundName = getRoundName(roundsFromEnd);
  const progress = totalMatches > 0 ? (matchesCompleted / totalMatches) * 100 : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold dark:text-white">{roundName}</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {matchesCompleted}/{totalMatches}
        </span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
