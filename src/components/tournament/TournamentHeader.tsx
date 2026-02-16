"use client";

interface TournamentHeaderProps {
  currentRound: number;
  totalRounds: number;
  matchesCompleted: number;
  totalMatches: number;
  onClose: () => void;
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
  onClose,
}: TournamentHeaderProps) {
  const roundsFromEnd = totalRounds - currentRound + 1;
  const roundName = getRoundName(roundsFromEnd);

  return (
    <div className="space-y-3 px-5 pt-4 pb-2">
      {/* Top row: X close — title — match count badge */}
      <div className="flex items-center justify-between">
        <button
          onClick={onClose}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-800/60 hover:bg-gray-700/80 transition-colors"
          aria-label="Close tournament"
        >
          <span className="material-icons-round text-xl text-gray-300">
            close
          </span>
        </button>

        <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">
          TasteRank World Cup
        </span>

        <span className="bg-gray-800 text-gray-300 text-xs font-bold px-3 py-1 rounded-full">
          {matchesCompleted}/{totalMatches}
        </span>
      </div>

      {/* Round name */}
      <p className="text-center text-primary font-extrabold text-lg">
        {roundName}
      </p>

      {/* Segment progress bar */}
      <div className="flex gap-1.5">
        {Array.from({ length: totalMatches }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
              i < matchesCompleted ? "bg-primary" : "bg-gray-700"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
