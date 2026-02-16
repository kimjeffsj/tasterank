"use client";

interface NoTournamentStateProps {
  canCreate: boolean;
  entryCount: number;
  onStart: () => void;
  starting?: boolean;
}

export function NoTournamentState({ canCreate, entryCount, onStart, starting }: NoTournamentStateProps) {
  const hasEnoughEntries = entryCount >= 4;

  return (
    <div className="flex flex-col items-center py-16 text-center px-6">
      <span className="material-icons-round text-6xl text-gray-300 dark:text-gray-600 mb-4">
        emoji_events
      </span>
      <h2 className="text-xl font-extrabold dark:text-white mb-2">
        Food Tournament
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xs">
        {hasEnoughEntries
          ? "Compare dishes head-to-head to find the ultimate champion!"
          : `Need at least 4 food entries to start a tournament. Currently ${entryCount}.`}
      </p>
      {canCreate && hasEnoughEntries && (
        <button
          onClick={onStart}
          disabled={starting}
          className="px-6 py-3 bg-primary text-white font-bold rounded-full shadow-glow hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
        >
          {starting ? "Creating..." : "Start Tournament"}
        </button>
      )}
    </div>
  );
}
