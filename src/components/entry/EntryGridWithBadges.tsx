"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAiQuestions } from "@/hooks/useAiQuestions";
import { AiQuestionsBadge } from "./AiQuestionsBadge";

interface FoodPhoto {
  photo_url: string;
  display_order: number | null;
}

interface EntryProfile {
  display_name: string | null;
  avatar_url: string | null;
}

export interface EntryForGrid {
  id: string;
  title: string;
  restaurant_name: string | null;
  created_by: string;
  created_at: string;
  food_photos: FoodPhoto[] | null;
  profiles: EntryProfile | null;
}

interface EntryGridWithBadgesProps {
  entries: EntryForGrid[];
  scoreMap: Record<string, number>;
}

export function EntryGridWithBadges({
  entries,
  scoreMap,
}: EntryGridWithBadgesProps) {
  const { user } = useAuth();
  const { fetchUnansweredCount } = useAiQuestions();
  const [unansweredMap, setUnansweredMap] = useState<Record<string, boolean>>(
    {},
  );

  useEffect(() => {
    if (!user || entries.length === 0) return;

    const entryIds = entries.map((e) => e.id);
    fetchUnansweredCount(entryIds, user.id).then((countMap) => {
      const map: Record<string, boolean> = {};
      for (const [entryId, count] of countMap.entries()) {
        map[entryId] = count > 0;
      }
      setUnansweredMap(map);
    });
  }, [user, entries, fetchUnansweredCount]);

  const handleAnswered = (entryId: string) => {
    setUnansweredMap((prev) => ({ ...prev, [entryId]: false }));
  };

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <span className="material-icons-round text-5xl text-gray-300 dark:text-gray-600 mb-3">
          restaurant_menu
        </span>
        <p className="text-gray-500 dark:text-gray-400">No food entries yet</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
          Add your first meal to get started
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {entries.map((entry) => {
        const avgScore = scoreMap[entry.id];
        const hasUnanswered = unansweredMap[entry.id] ?? false;

        return (
          <div
            key={entry.id}
            className="group relative bg-white dark:bg-surface-dark rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden relative">
              {entry.food_photos && entry.food_photos.length > 0 ? (
                <img
                  src={
                    entry.food_photos.sort(
                      (a, b) =>
                        (a.display_order ?? 0) - (b.display_order ?? 0),
                    )[0].photo_url
                  }
                  alt={entry.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <span className="material-icons-round text-4xl text-gray-300">
                  restaurant
                </span>
              )}
              <AiQuestionsBadge
                entryId={entry.id}
                entryTitle={entry.title}
                createdBy={entry.created_by}
                creatorName={entry.profiles?.display_name ?? "Someone"}
                creatorAvatar={entry.profiles?.avatar_url ?? undefined}
                hasUnanswered={hasUnanswered}
                user={user}
                onAnswered={() => handleAnswered(entry.id)}
              />
            </div>
            <div className="p-3">
              <div className="flex items-start justify-between gap-1">
                <p className="font-bold text-sm leading-tight text-slate-900 dark:text-white">
                  {entry.title}
                </p>
                {avgScore != null && (
                  <div className="flex items-center gap-0.5 shrink-0">
                    <span className="material-icons-round text-amber-400 text-xs">
                      star
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {avgScore.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
              {entry.restaurant_name && (
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {entry.restaurant_name}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
