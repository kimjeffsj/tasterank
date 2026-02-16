"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  calculateBracketSize,
  seedEntries,
  generateRound1,
  generateNextRound,
  calculateRounds,
  type Match,
} from "@/lib/tournament/bracket";

interface Tournament {
  id: string;
  trip_id: string;
  created_by: string;
  status: string | null;
  total_rounds: number;
  total_entries: number;
  bracket_size: number;
  seed_order: string[];
  created_at?: string | null;
  completed_at?: string | null;
}

interface TournamentVote {
  id: string;
  tournament_id: string;
  user_id: string;
  round_number: number;
  match_order: number;
  entry_a_id: string;
  entry_b_id: string;
  winner_id: string;
}

export interface TournamentEntryInfo {
  id: string;
  title: string;
  restaurant_name: string | null;
  photo_url: string | null;
  avg_score: number | null;
}

export function useTournament(tripId: string) {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [userVotes, setUserVotes] = useState<TournamentVote[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [isUserComplete, setIsUserComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [entryMap, setEntryMap] = useState<Map<string, TournamentEntryInfo>>(
    new Map(),
  );
  const supabase = createClient();

  // Compute current match from tournament state + votes
  const computeCurrentState = useCallback(
    (t: Tournament, votes: TournamentVote[]) => {
      const seedOrder = t.seed_order;
      const bracketSize = t.bracket_size;
      const totalRounds = t.total_rounds;

      // Build round 1 matches
      let roundMatches = generateRound1(seedOrder, bracketSize);

      for (let round = 1; round <= totalRounds; round++) {
        const roundVotes = votes.filter((v) => v.round_number === round);

        // Check each match in this round
        for (let i = 0; i < roundMatches.length; i++) {
          const match = roundMatches[i];

          // Bye match - auto-win for entryA
          if (match.entryB === null) {
            continue;
          }

          // Check if user already voted this match
          const existingVote = roundVotes.find(
            (v) => v.match_order === match.matchOrder,
          );

          if (!existingVote) {
            // This is the current match
            setCurrentRound(round);
            setCurrentMatchIndex(i);
            setCurrentMatch(match);
            setIsUserComplete(false);
            return;
          }
        }

        // All matches in this round are done, compute winners for next round
        if (round < totalRounds) {
          const winners: string[] = [];
          for (const match of roundMatches) {
            if (match.entryB === null) {
              // Bye: entryA advances
              winners.push(match.entryA);
            } else {
              const vote = roundVotes.find(
                (v) => v.match_order === match.matchOrder,
              );
              if (vote) {
                winners.push(vote.winner_id);
              }
            }
          }
          roundMatches = generateNextRound(winners);
        }
      }

      // All rounds complete
      setIsUserComplete(true);
      setCurrentMatch(null);
      setCurrentRound(totalRounds);
    },
    [],
  );

  // Fetch tournament + user votes
  const fetchTournament = useCallback(async () => {
    if (!tripId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Find active/pending tournament for this trip
      const { data: t, error: tErr } = await supabase
        .from("tournaments")
        .select("*")
        .eq("trip_id", tripId)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (tErr && tErr.code !== "PGRST116") throw tErr;

      if (!t) {
        setTournament(null);
        setLoading(false);
        return;
      }

      const tournament: Tournament = {
        ...t,
        seed_order: t.seed_order as string[],
      };
      setTournament(tournament);

      // Load entry details for display
      const entryIds = tournament.seed_order;
      const { data: entries } = await supabase
        .from("food_entries")
        .select(
          "id, title, restaurant_name, food_photos(photo_url, display_order)",
        )
        .in("id", entryIds);

      const { data: scores } = await supabase
        .from("v_entry_avg_scores")
        .select("entry_id, avg_score")
        .in("entry_id", entryIds);

      const scoreMap = new Map<string, number>();
      scores?.forEach((s) => {
        if (s.entry_id && s.avg_score != null)
          scoreMap.set(s.entry_id, s.avg_score);
      });

      const newEntryMap = new Map<string, TournamentEntryInfo>();
      entries?.forEach((e) => {
        const photos = (
          e.food_photos as { photo_url: string; display_order: number | null }[]
        )?.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
        newEntryMap.set(e.id, {
          id: e.id,
          title: e.title,
          restaurant_name: e.restaurant_name,
          photo_url: photos?.[0]?.photo_url ?? null,
          avg_score: scoreMap.get(e.id) ?? null,
        });
      });
      setEntryMap(newEntryMap);

      // Load user votes
      if (user) {
        const { data: votes } = await supabase
          .from("tournament_votes")
          .select("*")
          .eq("tournament_id", tournament.id)
          .eq("user_id", user.id)
          .order("voted_at", { ascending: true });

        const userVotes = (votes ?? []) as TournamentVote[];
        setUserVotes(userVotes);
        computeCurrentState(tournament, userVotes);
      } else {
        setIsUserComplete(true);
        setCurrentMatch(null);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch tournament",
      );
    } finally {
      setLoading(false);
    }
  }, [supabase, tripId, computeCurrentState]);

  useEffect(() => {
    fetchTournament();
  }, [fetchTournament]);

  // Create a new tournament
  const createTournament = useCallback(async () => {
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Must be logged in");

      // Fetch entries for this trip
      const { data: entries, error: eErr } = await supabase
        .from("food_entries")
        .select("id")
        .eq("trip_id", tripId);

      if (eErr) throw eErr;
      if (!entries || entries.length < 4)
        throw new Error("Need at least 4 entries to start a tournament");

      // Fetch avg scores for seeding
      const { data: scores } = await supabase
        .from("v_entry_avg_scores")
        .select("entry_id, avg_score")
        .eq("trip_id", tripId);

      const scoreMap = new Map<string, number>();
      scores?.forEach((s) => {
        if (s.entry_id && s.avg_score != null)
          scoreMap.set(s.entry_id, s.avg_score);
      });

      const seedable = entries.map((e) => ({
        id: e.id,
        avg_score: scoreMap.get(e.id) ?? null,
      }));

      const seeded = seedEntries(seedable);
      const bracketSize = calculateBracketSize(seeded.length);
      const totalRounds = calculateRounds(bracketSize);
      const seedOrder = seeded.map((e) => e.id);

      const { data: t, error: tErr } = await supabase
        .from("tournaments")
        .insert({
          trip_id: tripId,
          created_by: user.id,
          status: "active",
          total_rounds: totalRounds,
          total_entries: seeded.length,
          bracket_size: bracketSize,
          seed_order: seedOrder,
        })
        .select()
        .single();

      if (tErr) throw tErr;

      const tournament: Tournament = {
        ...t,
        seed_order: t.seed_order as string[],
      };
      setTournament(tournament);
      setUserVotes([]);
      computeCurrentState(tournament, []);

      // Refetch to get entry details
      await fetchTournament();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create tournament",
      );
      throw err;
    }
  }, [supabase, tripId, computeCurrentState, fetchTournament]);

  // Vote for a winner in the current match
  const vote = useCallback(
    async (winnerId: string) => {
      if (!tournament || !currentMatch || voting) return;

      setVoting(true);
      setError(null);

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Must be logged in");

        const { error: vErr } = await supabase
          .from("tournament_votes")
          .insert({
            tournament_id: tournament.id,
            user_id: user.id,
            round_number: currentRound,
            match_order: currentMatch.matchOrder,
            entry_a_id: currentMatch.entryA,
            entry_b_id: currentMatch.entryB!,
            winner_id: winnerId,
          });

        if (vErr) throw vErr;

        const newVote: TournamentVote = {
          id: crypto.randomUUID(),
          tournament_id: tournament.id,
          user_id: user.id,
          round_number: currentRound,
          match_order: currentMatch.matchOrder,
          entry_a_id: currentMatch.entryA,
          entry_b_id: currentMatch.entryB!,
          winner_id: winnerId,
        };

        const updatedVotes = [...userVotes, newVote];
        setUserVotes(updatedVotes);
        computeCurrentState(tournament, updatedVotes);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to vote");
      } finally {
        setVoting(false);
      }
    },
    [supabase, tournament, currentMatch, currentRound, userVotes, voting, computeCurrentState],
  );

  // Auto-vote byes
  const voteBye = useCallback(async () => {
    if (!tournament || !currentMatch || currentMatch.entryB !== null) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error: vErr } = await supabase.from("tournament_votes").insert({
      tournament_id: tournament.id,
      user_id: user.id,
      round_number: currentRound,
      match_order: currentMatch.matchOrder,
      entry_a_id: currentMatch.entryA,
      entry_b_id: currentMatch.entryA, // bye: same entry for both
      winner_id: currentMatch.entryA,
    });

    if (!vErr) {
      const newVote: TournamentVote = {
        id: crypto.randomUUID(),
        tournament_id: tournament.id,
        user_id: user.id,
        round_number: currentRound,
        match_order: currentMatch.matchOrder,
        entry_a_id: currentMatch.entryA,
        entry_b_id: currentMatch.entryA,
        winner_id: currentMatch.entryA,
      };

      const updatedVotes = [...userVotes, newVote];
      setUserVotes(updatedVotes);
      computeCurrentState(tournament, updatedVotes);
    }
  }, [supabase, tournament, currentMatch, currentRound, userVotes, computeCurrentState]);

  // Get results (all users' votes aggregated)
  const getResults = useCallback(async () => {
    if (!tournament) return [];

    const { data, error: err } = await supabase
      .from("v_tournament_results")
      .select("*")
      .eq("tournament_id", tournament.id);

    if (err) throw err;

    return (data ?? [])
      .map((r) => ({
        entryId: r.entry_id as string,
        totalWins: Number(r.total_wins),
        entry: entryMap.get(r.entry_id as string),
      }))
      .sort((a, b) => b.totalWins - a.totalWins);
  }, [supabase, tournament, entryMap]);

  // Calculate progress
  const totalMatchesInRound = tournament
    ? tournament.bracket_size / Math.pow(2, currentRound)
    : 0;

  const matchesCompletedInRound = tournament
    ? userVotes.filter((v) => v.round_number === currentRound).length
    : 0;

  return {
    tournament,
    currentRound,
    currentMatch,
    totalRounds: tournament?.total_rounds ?? 0,
    totalMatchesInRound,
    matchesCompletedInRound,
    isUserComplete,
    loading,
    voting,
    error,
    entryMap,
    createTournament,
    vote,
    voteBye,
    getResults,
    refetch: fetchTournament,
  };
}
