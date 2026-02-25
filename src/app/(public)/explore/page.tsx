"use client";

import { useTrips } from "@/hooks/useTrips";
import { TripListContainer } from "@/components/trip/TripListContainer";

export default function ExplorePage() {
  const { trips, loading, error } = useTrips();

  return (
    <div className="mx-auto w-full max-w-md min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-md px-6 pt-12 pb-4">
        <div className="flex flex-col justify-end gap-1">
          <h1 className="text-xl font-bold dark:text-white">Explore</h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Discover where foodies are heading
          </p>
        </div>
      </header>

      {/* Content */}
      <section className="px-6 mt-2">
        {error && (
          <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-xl text-sm text-error font-medium">
            {error}
          </div>
        )}

        <TripListContainer
          trips={trips}
          loading={loading}
          showFilters={false}
          defaultView="grid"
          emptyIcon="explore"
          emptyTitle="No public trips yet"
          emptyDescription="Be the first to share a food adventure"
        />
      </section>
    </div>
  );
}
