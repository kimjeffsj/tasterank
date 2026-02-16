"use client";

import type { TournamentEntryInfo } from "@/hooks/useTournament";

export interface TournamentResultEntry {
  entryId: string;
  totalWins: number;
  entry?: TournamentEntryInfo;
}

interface TournamentResultsProps {
  results: TournamentResultEntry[];
  onBack: () => void;
}

export function TournamentResults({ results, onBack }: TournamentResultsProps) {
  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <span className="material-icons-round text-6xl text-gray-300 dark:text-gray-600 mb-4">
          leaderboard
        </span>
        <p className="text-gray-500 dark:text-gray-400">No results yet</p>
      </div>
    );
  }

  const champion = results[0];
  const runnerUp = results[1];
  const semiFinals = results.slice(2, 4);
  const rest = results.slice(4);

  return (
    <div className="space-y-6">
      {/* Champion */}
      {champion?.entry && (
        <div className="relative aspect-[4/5] rounded-lg overflow-hidden shadow-soft">
          {champion.entry.photo_url ? (
            <img
              src={champion.entry.photo_url}
              alt={champion.entry.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-200 to-yellow-400 dark:from-yellow-700 dark:to-yellow-900 flex items-center justify-center">
              <span className="material-icons-round text-6xl text-yellow-600 dark:text-yellow-300">
                restaurant
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="material-icons-round text-yellow-400 text-3xl">
              emoji_events
            </span>
            <span className="text-white font-extrabold text-sm bg-yellow-400/20 backdrop-blur-sm px-3 py-1 rounded-full">
              Champion
            </span>
          </div>

          <div className="absolute bottom-0 w-full p-5">
            <h3 className="text-2xl font-extrabold text-white">
              {champion.entry.title}
            </h3>
            {champion.entry.restaurant_name && (
              <p className="text-sm text-white/70 mt-0.5">
                {champion.entry.restaurant_name}
              </p>
            )}
            <p className="text-sm text-white/50 mt-1">
              {champion.totalWins} win{champion.totalWins !== 1 && "s"}
            </p>
          </div>
        </div>
      )}

      {/* Runner-up */}
      {runnerUp?.entry && (
        <div className="bg-background-light dark:bg-white/5 rounded-lg p-3">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
            {runnerUp.entry.photo_url ? (
              <img
                src={runnerUp.entry.photo_url}
                alt={runnerUp.entry.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="material-icons-round text-4xl text-gray-300">
                  restaurant
                </span>
              </div>
            )}
            <div className="absolute top-2 left-2 flex items-center justify-center w-7 h-7 rounded-full bg-gray-300 text-gray-700 font-bold text-xs">
              2
            </div>
          </div>
          <div className="mt-2">
            <p className="font-bold text-sm leading-tight dark:text-white">
              {runnerUp.entry.title}
            </p>
            {runnerUp.entry.restaurant_name && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                {runnerUp.entry.restaurant_name}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-0.5">
              {runnerUp.totalWins} win{runnerUp.totalWins !== 1 && "s"}
            </p>
          </div>
        </div>
      )}

      {/* Semi-finalists */}
      {semiFinals.length > 0 && (
        <div>
          <h3 className="text-lg font-bold dark:text-white mb-3">
            Semi-finalists
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {semiFinals.map((r, idx) =>
              r.entry ? (
                <div
                  key={r.entryId}
                  className="bg-background-light dark:bg-white/5 rounded-lg p-3"
                >
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                    {r.entry.photo_url ? (
                      <img
                        src={r.entry.photo_url}
                        alt={r.entry.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-icons-round text-4xl text-gray-300">
                          restaurant
                        </span>
                      </div>
                    )}
                    <div className="absolute top-2 left-2 flex items-center justify-center w-7 h-7 rounded-full bg-amber-700 text-amber-100 font-bold text-xs">
                      {idx + 3}
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="font-bold text-sm leading-tight dark:text-white">
                      {r.entry.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {r.totalWins} win{r.totalWins !== 1 && "s"}
                    </p>
                  </div>
                </div>
              ) : null,
            )}
          </div>
        </div>
      )}

      {/* Rest */}
      {rest.length > 0 && (
        <div>
          <h3 className="text-lg font-bold dark:text-white mb-3">Others</h3>
          <div className="space-y-3">
            {rest.map((r, idx) =>
              r.entry ? (
                <div
                  key={r.entryId}
                  className="flex items-center gap-4 bg-white dark:bg-white/5 p-2 rounded-xl"
                >
                  <span className="text-lg font-bold text-gray-400 w-6 text-center shrink-0">
                    {idx + 5}
                  </span>
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
                    {r.entry.photo_url ? (
                      <img
                        src={r.entry.photo_url}
                        alt={r.entry.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-icons-round text-2xl text-gray-300">
                          restaurant
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm dark:text-white">
                      {r.entry.title}
                    </p>
                    <p className="text-xs text-gray-400">
                      {r.totalWins} win{r.totalWins !== 1 && "s"}
                    </p>
                  </div>
                </div>
              ) : null,
            )}
          </div>
        </div>
      )}

      {/* Back button */}
      <div className="text-center pt-4">
        <button
          onClick={onBack}
          className="text-sm text-primary font-bold hover:underline"
        >
          Back to Tournament
        </button>
      </div>
    </div>
  );
}
