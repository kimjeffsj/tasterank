"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/types/database";

type Tag = Tables<"tags">;

export interface EntryTagWithTag {
  id: string;
  entry_id: string;
  tag_id: string;
  is_ai_suggested: boolean | null;
  tags: Tag;
}

export function useTags(entryId: string) {
  const [entryTags, setEntryTags] = useState<EntryTagWithTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchEntryTags = useCallback(async () => {
    if (!entryId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: err } = await supabase
        .from("food_entry_tags")
        .select("*, tags(*)")
        .eq("entry_id", entryId);

      if (err) throw err;
      setEntryTags((data as unknown as EntryTagWithTag[]) ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tags");
    } finally {
      setLoading(false);
    }
  }, [supabase, entryId]);

  useEffect(() => {
    fetchEntryTags();
  }, [fetchEntryTags]);

  const fetchAllTags = useCallback(async (): Promise<Tag[]> => {
    const { data, error: err } = await supabase
      .from("tags")
      .select("*")
      .order("name");

    if (err) throw err;
    return data ?? [];
  }, [supabase]);

  const addTagToEntry = useCallback(
    async (
      targetEntryId: string,
      tagName: string,
      category?: string,
      isAiSuggested?: boolean,
    ) => {
      // Upsert the tag (create if not exists)
      const { data: tag, error: tagErr } = await supabase
        .from("tags")
        .upsert({ name: tagName, category: category ?? null }, { onConflict: "name" })
        .select()
        .single();

      if (tagErr) throw tagErr;

      // Link tag to entry
      const { data: link, error: linkErr } = await supabase
        .from("food_entry_tags")
        .insert({
          entry_id: targetEntryId,
          tag_id: tag.id,
          is_ai_suggested: isAiSuggested ?? false,
        })
        .select()
        .single();

      if (linkErr) throw linkErr;
      await fetchEntryTags();
      return link;
    },
    [supabase, fetchEntryTags],
  );

  const removeTagFromEntry = useCallback(
    async (foodEntryTagId: string) => {
      const { error: err } = await supabase
        .from("food_entry_tags")
        .delete()
        .eq("id", foodEntryTagId);

      if (err) throw err;
      await fetchEntryTags();
    },
    [supabase, fetchEntryTags],
  );

  return {
    entryTags,
    loading,
    error,
    fetchAllTags,
    addTagToEntry,
    removeTagFromEntry,
    refetch: fetchEntryTags,
  };
}
