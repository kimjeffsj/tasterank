"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface ProfileStats {
  tripCount: number;
  entryCount: number;
  ratingCount: number;
}

interface UseProfileReturn {
  profile: Profile | null;
  stats: ProfileStats | null;
  loading: boolean;
  error: any;
  refetch: () => void;
}

export function useProfile(userId: string | undefined): UseProfileReturn {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const supabase = createClient();

  useEffect(() => {
    const fetchProfile = async () => {
      // Short-circuit if no userId
      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (profileError) {
          setError(profileError);
          setProfile(null);
          setStats(null);
          setLoading(false);
          return;
        }

        setProfile(profileData);

        // Fetch stats in parallel
        const [tripCountResult, entryCountResult, ratingCountResult] =
          await Promise.all([
            supabase
              .from("trip_members")
              .select("*", { count: "exact", head: true })
              .eq("user_id", userId),
            supabase
              .from("food_entries")
              .select("*", { count: "exact", head: true })
              .eq("created_by", userId),
            supabase
              .from("ratings")
              .select("*", { count: "exact", head: true })
              .eq("user_id", userId),
          ]);

        // Check for any stats errors
        if (
          tripCountResult.error ||
          entryCountResult.error ||
          ratingCountResult.error
        ) {
          setError(
            tripCountResult.error ||
              entryCountResult.error ||
              ratingCountResult.error
          );
          setStats(null);
        } else {
          setStats({
            tripCount: tripCountResult.count ?? 0,
            entryCount: entryCountResult.count ?? 0,
            ratingCount: ratingCountResult.count ?? 0,
          });
        }
      } catch (err) {
        setError(err);
        setProfile(null);
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, refetchTrigger, supabase]);

  const refetch = useCallback(() => {
    setRefetchTrigger((prev) => prev + 1);
  }, []);

  return { profile, stats, loading, error, refetch };
}
