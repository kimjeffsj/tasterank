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
    <div className="relative grid grid-cols-2 gap-4">
      <EntryOption entry={entryA} onSelect={() => onVote(entryA.id)} disabled={disabled} />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white font-extrabold text-sm shadow-glow">
        VS
      </div>
      <EntryOption entry={entryB} onSelect={() => onVote(entryB.id)} disabled={disabled} />
    </div>
  );
}

function EntryOption({
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
      className="group relative bg-white dark:bg-surface-dark rounded-3xl overflow-hidden shadow-sm hover:shadow-md active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none text-left w-full"
    >
      <div className="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden relative">
        {entry.photo_url ? (
          <img
            src={entry.photo_url}
            alt={entry.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <span className="material-icons-round text-4xl text-gray-300">
            restaurant
          </span>
        )}
        {entry.avg_score != null && (
          <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/80 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <span className="material-icons-round text-amber-300 text-xs">
              star
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              {entry.avg_score.toFixed(1)}
            </span>
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="font-bold text-sm leading-tight text-slate-900 dark:text-white">
          {entry.title}
        </p>
        {entry.restaurant_name && (
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
            {entry.restaurant_name}
          </p>
        )}
      </div>
    </button>
  );
}
