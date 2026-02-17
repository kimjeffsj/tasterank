"use client";

import { useState } from "react";
import { RankingList } from "@/components/ranking/RankingList";
import type { RankedEntry } from "@/components/ranking/RankingList";

interface RankingPageClientProps {
  tripId: string;
  tripName: string;
  entries: RankedEntry[];
  hasAiRanking: boolean;
  aiGeneratedAt?: string | null;
}

type ViewMode = "user" | "ai";

export function RankingPageClient({
  tripId,
  tripName,
  entries,
  hasAiRanking,
  aiGeneratedAt,
}: RankingPageClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("user");

  // Sort entries based on view mode
  const sortedEntries = [...entries].sort((a, b) => {
    if (viewMode === "ai" && hasAiRanking) {
      return (b.composite_score ?? 0) - (a.composite_score ?? 0);
    }
    // Default: user ranking (by avg_score, already ranked)
    return (a.rank ?? 0) - (b.rank ?? 0);
  });

  // Re-assign ranks after sorting
  const rankedEntries = sortedEntries.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));

  return (
    <>
      {/* View Mode Toggle */}
      <div className="px-6 pt-4 pb-2">
        <div className="flex gap-2 p-1 bg-gray-100 dark:bg-white/5 rounded-xl">
          <button
            onClick={() => setViewMode("user")}
            className={`
              flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg 
              font-semibold text-sm transition-all
              ${
                viewMode === "user"
                  ? "bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }
            `}
          >
            <span className="material-icons-round text-lg">star</span>
            User Ratings
          </button>
          <button
            onClick={() => setViewMode("ai")}
            disabled={!hasAiRanking}
            className={`
              flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg 
              font-semibold text-sm transition-all
              ${
                viewMode === "ai"
                  ? "bg-linear-to-r from-purple-500 to-primary text-white shadow-sm"
                  : hasAiRanking
                    ? "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    : "text-gray-300 dark:text-gray-600 cursor-not-allowed"
              }
              ${!hasAiRanking ? "opacity-50" : ""}
            `}
          >
            <span className="material-icons-round text-lg">auto_awesome</span>
            AI Composite
            {!hasAiRanking && (
              <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full ml-1">
                Soon
              </span>
            )}
          </button>
        </div>

        {/* View Mode Description */}
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3 px-2">
          {viewMode === "user" ? (
            <>Ranked by average user scores</>
          ) : (
            <>
              AI-weighted composite score (User 40% • Tournament 25% • AI Q&A
              20% • Sentiment 15%)
            </>
          )}
        </p>
      </div>

      {/* AI Ranking Timestamp */}
      {hasAiRanking && viewMode === "ai" && aiGeneratedAt && (
        <div className="px-6 pt-1 pb-0">
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
            Updated{" "}
            {new Date(aiGeneratedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
            {" · "}Refreshes daily
          </p>
        </div>
      )}

      {/* Ranking List */}
      <section className="px-6 py-4">
        <RankingList
          rankings={rankedEntries}
          tripName={tripName}
          showAiScore={viewMode === "ai" && hasAiRanking}
        />
      </section>
    </>
  );
}
