"use client";

import { useState, useMemo } from "react";

export interface RankedEntryTag {
  id: string;
  name: string;
  category: string | null;
}

export interface RankedEntry {
  entry_id: string;
  title: string;
  restaurant_name: string | null;
  rank: number;
  avg_score: number | null;
  rating_count: number;
  photo_url: string | null;
  tags: RankedEntryTag[];
}

interface RankingListProps {
  rankings: RankedEntry[];
  tripName: string;
}

export function RankingList({ rankings, tripName }: RankingListProps) {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Collect unique tags across all entries
  const allTags = useMemo(() => {
    const tagMap = new Map<string, RankedEntryTag>();
    for (const entry of rankings) {
      for (const tag of entry.tags) {
        tagMap.set(tag.id, tag);
      }
    }
    return Array.from(tagMap.values());
  }, [rankings]);

  // Filter and re-rank entries based on active tag
  const filtered = useMemo(() => {
    if (!activeTag) return rankings;
    return rankings
      .filter((e) => e.tags.some((t) => t.id === activeTag))
      .map((e, i) => ({ ...e, rank: i + 1 }));
  }, [rankings, activeTag]);

  const first = filtered.find((e) => e.rank === 1);
  const second = filtered.find((e) => e.rank === 2);
  const third = filtered.find((e) => e.rank === 3);
  const runnersUp = filtered.filter((e) => e.rank > 3);

  if (rankings.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <span className="material-icons-round text-6xl text-gray-300 mb-4">
          emoji_events
        </span>
        <p className="text-lg font-bold text-gray-500">No rankings yet</p>
        <p className="text-sm text-gray-400 mt-1">
          Add entries and rate them to see rankings
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tag filter pills */}
      {allTags.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setActiveTag(null)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${
              activeTag === null
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300"
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => setActiveTag(tag.id)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${
                activeTag === tag.id
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300"
              }`}
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}

      {/* 1st place hero */}
      {first && <FirstPlaceCard entry={first} />}

      {/* 2nd & 3rd place */}
      {(second || third) && (
        <div className="grid grid-cols-2 gap-4">
          {second && <PodiumCard entry={second} medal="silver" />}
          {third && <PodiumCard entry={third} medal="bronze" />}
        </div>
      )}

      {/* Runners-up */}
      {runnersUp.length > 0 && (
        <div>
          <h3 className="text-lg font-bold mb-3">Runners Up</h3>
          <div className="space-y-3">
            {runnersUp.map((entry) => (
              <RunnerUpItem key={entry.entry_id} entry={entry} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FirstPlaceCard({ entry }: { entry: RankedEntry }) {
  return (
    <div className="relative aspect-[4/5] rounded-lg overflow-hidden shadow-soft">
      {entry.photo_url ? (
        <img
          src={entry.photo_url}
          alt={entry.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
          <span className="material-icons-round text-6xl text-gray-400">
            restaurant
          </span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Gold badge */}
      <div className="absolute top-4 left-4 flex items-center justify-center w-8 h-8 rounded-full bg-yellow-400 text-yellow-900 font-extrabold text-sm">
        1
      </div>

      {/* Info overlay */}
      <div className="absolute bottom-0 w-full p-5">
        <h3 className="text-2xl font-extrabold text-white">{entry.title}</h3>
        {entry.restaurant_name && (
          <p className="text-sm text-white/70 mt-0.5">{entry.restaurant_name}</p>
        )}
        {entry.avg_score !== null && (
          <div className="flex items-center gap-1.5 mt-2">
            <span className="material-icons-round text-yellow-400 text-lg">
              star
            </span>
            <span className="text-xl font-extrabold text-white">
              {entry.avg_score}
            </span>
            <span className="text-xs text-white/50 ml-1">
              ({entry.rating_count} {entry.rating_count === 1 ? "rating" : "ratings"})
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function PodiumCard({ entry, medal }: { entry: RankedEntry; medal: "silver" | "bronze" }) {
  const badgeClasses =
    medal === "silver"
      ? "bg-gray-300 text-gray-700"
      : "bg-amber-700 text-amber-100";
  const rankNum = medal === "silver" ? 2 : 3;

  return (
    <div className="bg-background-light dark:bg-white/5 rounded-lg p-3">
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
        {entry.photo_url ? (
          <img
            src={entry.photo_url}
            alt={entry.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-icons-round text-4xl text-gray-300">
              restaurant
            </span>
          </div>
        )}
        {/* Badge */}
        <div className={`absolute top-2 left-2 flex items-center justify-center w-7 h-7 rounded-full font-bold text-xs ${badgeClasses}`}>
          {rankNum}
        </div>
      </div>
      <div className="mt-2">
        <p className="font-bold text-sm leading-tight">{entry.title}</p>
        {entry.restaurant_name && (
          <p className="text-xs text-gray-500 truncate mt-0.5">{entry.restaurant_name}</p>
        )}
        {entry.avg_score !== null && (
          <div className="flex items-center gap-1 mt-1">
            <span className="material-icons-round text-yellow-400 text-sm">
              star
            </span>
            <span className="text-sm font-bold">{entry.avg_score}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function RunnerUpItem({ entry }: { entry: RankedEntry }) {
  return (
    <div className="flex items-center gap-4 bg-white dark:bg-white/5 p-2 rounded-xl">
      {/* Rank number */}
      <span className="text-lg font-bold text-gray-400 w-6 text-center shrink-0">
        {entry.rank}
      </span>

      {/* Thumbnail */}
      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
        {entry.photo_url ? (
          <img
            src={entry.photo_url}
            alt={entry.title}
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

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm">{entry.title}</p>
        {entry.restaurant_name && (
          <p className="text-xs text-gray-500 truncate">{entry.restaurant_name}</p>
        )}
      </div>

      {/* Score */}
      {entry.avg_score !== null && (
        <div className="flex items-center gap-1 shrink-0">
          <span className="material-icons-round text-yellow-400 text-sm">
            star
          </span>
          <span className="text-sm font-bold">{entry.avg_score}</span>
        </div>
      )}
    </div>
  );
}
