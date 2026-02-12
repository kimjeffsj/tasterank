"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/types/database";

type Entry = Tables<"food_entries">;

export function useEntries(tripId: string) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchEntries = useCallback(async () => {
    if (!tripId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: err } = await supabase
        .from("food_entries")
        .select("*")
        .eq("trip_id", tripId)
        .order("created_at", { ascending: false });

      if (err) throw err;
      setEntries(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch entries");
    } finally {
      setLoading(false);
    }
  }, [supabase, tripId]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const createEntry = useCallback(
    async (input: TablesInsert<"food_entries">) => {
      const { data, error: err } = await supabase
        .from("food_entries")
        .insert(input)
        .select()
        .single();

      if (err) throw err;
      await fetchEntries();
      return data;
    },
    [supabase, fetchEntries],
  );

  const updateEntry = useCallback(
    async (id: string, updates: TablesUpdate<"food_entries">) => {
      const { data, error: err } = await supabase
        .from("food_entries")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (err) throw err;
      await fetchEntries();
      return data;
    },
    [supabase, fetchEntries],
  );

  const deleteEntry = useCallback(
    async (id: string) => {
      const { error: err } = await supabase
        .from("food_entries")
        .delete()
        .eq("id", id);

      if (err) throw err;
      await fetchEntries();
    },
    [supabase, fetchEntries],
  );

  return {
    entries,
    loading,
    error,
    createEntry,
    updateEntry,
    deleteEntry,
    refetch: fetchEntries,
  };
}
