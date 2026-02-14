"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/types/database";

type Rating = Tables<"ratings">;

export function useRatings(entryId: string) {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchRatings = useCallback(async () => {
    if (!entryId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: err } = await supabase
        .from("ratings")
        .select("*")
        .eq("entry_id", entryId);

      if (err) throw err;
      setRatings(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch ratings");
    } finally {
      setLoading(false);
    }
  }, [supabase, entryId]);

  useEffect(() => {
    fetchRatings();
  }, [fetchRatings]);

  const upsertRating = useCallback(
    async (input: TablesInsert<"ratings">) => {
      const { data, error: err } = await supabase
        .from("ratings")
        .insert(input)
        .select()
        .single();

      if (err) throw err;
      await fetchRatings();
      return data;
    },
    [supabase, fetchRatings],
  );

  const updateRating = useCallback(
    async (id: string, updates: TablesUpdate<"ratings">) => {
      const { data, error: err } = await supabase
        .from("ratings")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (err) throw err;
      await fetchRatings();
      return data;
    },
    [supabase, fetchRatings],
  );

  const deleteRating = useCallback(
    async (id: string) => {
      const { error: err } = await supabase
        .from("ratings")
        .delete()
        .eq("id", id);

      if (err) throw err;
      await fetchRatings();
    },
    [supabase, fetchRatings],
  );

  return {
    ratings,
    loading,
    error,
    upsertRating,
    updateRating,
    deleteRating,
    refetch: fetchRatings,
  };
}
