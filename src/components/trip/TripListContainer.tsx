"use client";

import { useState, useMemo } from "react";
import type { Tables } from "@/types/database";
import { SearchBar } from "./SearchBar";
import { TripFilterTabs, type TripFilter } from "./TripFilterTabs";
import { TripSortSelect, type TripSort } from "./TripSortSelect";
import { ViewToggle, type ViewMode } from "./ViewToggle";
import { TripCardCompact } from "./TripCardCompact";
import { TripCardGrid } from "./TripCardGrid";
import { EmptyState } from "@/components/layout/EmptyState";
import { Skeleton } from "@/components/layout/Skeleton";

type Trip = Tables<"trips">;

interface TripListContainerProps {
  trips: Trip[];
  loading: boolean;
  /** Whether to show the filter tabs (default: true) */
  showFilters?: boolean;
  /** Empty state icon override */
  emptyIcon?: string;
  /** Empty state title override */
  emptyTitle?: string;
  /** Empty state description override */
  emptyDescription?: string;
  /** Custom action for empty state */
  emptyAction?: React.ReactNode;
}

function sortTrips(trips: Trip[], sort: TripSort): Trip[] {
  return [...trips].sort((a, b) => {
    switch (sort) {
      case "latest":
        return (
          new Date(b.created_at ?? 0).getTime() -
          new Date(a.created_at ?? 0).getTime()
        );
      case "name":
        return a.name.localeCompare(b.name);
      case "start_date":
        return (
          new Date(b.start_date ?? 0).getTime() -
          new Date(a.start_date ?? 0).getTime()
        );
      default:
        return 0;
    }
  });
}

function filterTrips(trips: Trip[], filter: TripFilter): Trip[] {
  switch (filter) {
    case "public":
      return trips.filter((t) => t.is_public);
    case "private":
      return trips.filter((t) => !t.is_public);
    default:
      return trips;
  }
}

function searchTrips(trips: Trip[], query: string): Trip[] {
  if (!query.trim()) return trips;
  const q = query.toLowerCase();
  return trips.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q),
  );
}

export function TripListContainer({
  trips,
  loading,
  showFilters = true,
  emptyIcon = "luggage",
  emptyTitle = "No trips yet",
  emptyDescription = "Create your first trip to get started",
  emptyAction,
}: TripListContainerProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<TripFilter>("all");
  const [sort, setSort] = useState<TripSort>("latest");
  const [view, setView] = useState<ViewMode>("list");

  const filtered = useMemo(() => {
    let result = trips;
    result = searchTrips(result, search);
    if (showFilters) result = filterTrips(result, filter);
    result = sortTrips(result, sort);
    return result;
  }, [trips, search, filter, sort, showFilters]);

  const hasActiveFilters = search.trim() !== "" || filter !== "all";

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {/* Search skeleton */}
        <Skeleton className="h-12 rounded-full" />
        {/* Filter skeleton */}
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
        {/* Card skeletons */}
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <SearchBar value={search} onChange={setSearch} />
        <EmptyState
          icon={emptyIcon}
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <SearchBar value={search} onChange={setSearch} />

      {/* Controls row */}
      <div className="flex items-center justify-between">
        {showFilters ? (
          <TripFilterTabs value={filter} onChange={setFilter} />
        ) : (
          <div />
        )}
        <div className="flex items-center gap-2">
          <TripSortSelect value={sort} onChange={setSort} />
          <ViewToggle value={view} onChange={setView} />
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
          {filtered.length} trip{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Trip list / grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="search_off"
          title="No trips found"
          description="Try adjusting your search or filters"
        />
      ) : view === "list" ? (
        <div className="flex flex-col gap-3">
          {filtered.map((trip) => (
            <TripCardCompact key={trip.id} trip={trip} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {filtered.map((trip) => (
            <TripCardGrid key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  );
}
