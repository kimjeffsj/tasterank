"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Tables, TablesUpdate } from "@/types/database";

type Trip = Tables<"trips">;

interface UseTripsOptions {
  /** Only fetch trips the current user is a member of */
  myTripsOnly?: boolean;
}

export function useTrips(options: UseTripsOptions = {}) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (options.myTripsOnly) {
        // Get trips where user is a member
        const { data: memberTrips, error: err } = await supabase
          .from("trip_members")
          .select("trip_id, trips(*)")
          .order("joined_at", { ascending: false });

        if (err) throw err;

        const extracted = (memberTrips ?? [])
          .map((m) => m.trips)
          .filter((t): t is Trip => t !== null)
          // Deduplicate: a trip can appear multiple times in trip_members
          // (e.g. owner row + member row for the same trip)
          .filter((t, i, arr) => arr.findIndex((x) => x.id === t.id) === i);
        setTrips(extracted);
      } else {
        const { data, error: err } = await supabase
          .from("trips")
          .select("*")
          .eq("is_public", true)
          .order("created_at", { ascending: false });

        if (err) throw err;
        setTrips(data ?? []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch trips");
    } finally {
      setLoading(false);
    }
  }, [supabase, options.myTripsOnly]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const createTrip = useCallback(
    async (input: {
      name: string;
      description?: string;
      is_public?: boolean;
      start_date?: string;
      end_date?: string;
    }) => {
      const { data, error: err } = await supabase.rpc("create_trip", {
        p_name: input.name,
        p_description: input.description,
        p_is_public: input.is_public ?? true,
        p_start_date: input.start_date,
        p_end_date: input.end_date,
      });

      if (err) throw err;
      await fetchTrips();
      return data as unknown as Trip;
    },
    [supabase, fetchTrips],
  );

  const updateTrip = useCallback(
    async (id: string, updates: TablesUpdate<"trips">) => {
      const { data, error: err } = await supabase
        .from("trips")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (err) throw err;
      await fetchTrips();
      return data;
    },
    [supabase, fetchTrips],
  );

  const deleteTrip = useCallback(
    async (id: string) => {
      const { error: err } = await supabase.from("trips").delete().eq("id", id);

      if (err) throw err;
      await fetchTrips();
    },
    [supabase, fetchTrips],
  );

  return {
    trips,
    loading,
    error,
    createTrip,
    updateTrip,
    deleteTrip,
    refetch: fetchTrips,
  };
}
