"use client";

import type { TournamentEntryInfo } from "@/hooks/useTournament";

interface MatchCardProps {
  entryA: TournamentEntryInfo;
  entryB: TournamentEntryInfo;
  onVote: (winnerId: string) => void;
  disabled?: boolean;
}

export function MatchCard({ entryA, entryB, onVote, disabled }: MatchCardProps) {
  return (
    <div className="relative flex flex-col">
      {/* Entry A */}
      <EntryCard
        entry={entryA}
        onSelect={() => onVote(entryA.id)}
        disabled={disabled}
      />

      {/* VS Badge — centered between two cards */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="w-12 h-12 rounded-full bg-white border-4 border-primary flex items-center justify-center shadow-glow">
          <span className="text-primary font-extrabold text-sm">VS</span>
        </div>
      </div>

      {/* Entry B */}
      <EntryCard
        entry={entryB}
        onSelect={() => onVote(entryB.id)}
        disabled={disabled}
      />
    </div>
  );
}

function EntryCard({
  entry,
  onSelect,
  disabled,
}: {
  entry: TournamentEntryInfo;
  onSelect: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      className="group relative w-full overflow-hidden active:brightness-75 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none text-left"
    >
      {/* Photo */}
      <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden relative">
        {entry.photo_url ? (
          <img
            src={entry.photo_url}
            alt={entry.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="material-icons-round text-6xl text-gray-300 dark:text-gray-600">
            restaurant
          </span>
        )}

        {/* Gradient overlay — bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Tag badge + Restaurant + Food name — bottom left */}
        <div className="absolute bottom-4 left-4 right-4">
          {entry.tag_name && (
            <span className="inline-flex items-center gap-1.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-gray-600 dark:text-gray-300 font-medium mb-2">
              <span className="material-icons-round text-xs">sell</span>
              {entry.tag_name}
            </span>
          )}
          {entry.restaurant_name && (
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-gray-200 mb-0.5">{entry.restaurant_name}</p>
              {entry.avg_score != null && (
                <div className="flex items-center gap-1">
                  <span className="material-icons-round text-amber-300 text-xs">
                    star
                  </span>
                  <span className="text-xs font-bold text-white">
                    {entry.avg_score.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          )}
          <p className="text-2xl font-extrabold text-white leading-tight">
            {entry.title}
          </p>
          {!entry.restaurant_name && entry.avg_score != null && (
            <div className="flex items-center gap-1 mt-1">
              <span className="material-icons-round text-amber-300 text-xs">
                star
              </span>
              <span className="text-xs font-bold text-white">
                {entry.avg_score.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
