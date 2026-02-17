"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTournament } from "@/hooks/useTournament";
import { MatchCard } from "@/components/tournament/MatchCard";
import { TournamentHeader } from "@/components/tournament/TournamentHeader";
import {
  TournamentResults,
  type TournamentResultEntry,
} from "@/components/tournament/TournamentResults";
import { NoTournamentState } from "@/components/tournament/NoTournamentState";
import { UserCompleteState } from "@/components/tournament/UserCompleteState";
import { LoginPrompt } from "@/components/auth/LoginPrompt";
import { isDemoTrip } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { anonClient } from "@/lib/supabase/anon";

export default function TournamentPage() {
  const params = useParams<{ tripId: string }>();
  const router = useRouter();
  const isDemo = isDemoTrip(params.tripId);
  const { user, loading: authLoading } = useAuth();
  const {
    tournament,
    currentRound,
    currentMatch,
    totalRounds,
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
  } = useTournament(params.tripId, { isDemo });

  const [showLogin, setShowLogin] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<TournamentResultEntry[]>([]);
  const [starting, setStarting] = useState(false);
  const [entryCount, setEntryCount] = useState(0);
  const [isEditor, setIsEditor] = useState(isDemo);

  const handleClose = useCallback(() => {
    router.push(`/trips/${params.tripId}`);
  }, [router, params.tripId]);

  // Check member role & entry count
  useEffect(() => {
    if (isDemo) {
      // For demo trips, fetch entry count with anon client
      const fetchCount = async () => {
        const { count } = await anonClient
          .from("food_entries")
          .select("id", { count: "exact", head: true })
          .eq("trip_id", params.tripId);
        setEntryCount(count ?? 0);
      };
      fetchCount();
      return;
    }

    if (!user || !params.tripId) return;

    const checkAccess = async () => {
      const supabase = createClient();

      const { data: member } = await supabase
        .from("trip_members")
        .select("role")
        .eq("trip_id", params.tripId)
        .eq("user_id", user.id)
        .single();

      setIsEditor(member?.role === "owner" || member?.role === "editor");

      const { count } = await supabase
        .from("food_entries")
        .select("id", { count: "exact", head: true })
        .eq("trip_id", params.tripId);

      setEntryCount(count ?? 0);
    };

    checkAccess();
  }, [user, params.tripId, isDemo]);

  // Auto-handle bye matches
  useEffect(() => {
    if (currentMatch && currentMatch.entryB === null && !voting) {
      voteBye();
    }
  }, [currentMatch, voting, voteBye]);

  const handleStart = useCallback(async () => {
    if (!isDemo && !user) {
      setShowLogin(true);
      return;
    }
    setStarting(true);
    try {
      await createTournament();
    } catch {
      // error handled by hook
    } finally {
      setStarting(false);
    }
  }, [isDemo, user, createTournament]);

  const handleViewResults = useCallback(async () => {
    try {
      const data = await getResults();
      setResults(data);
      setShowResults(true);
    } catch {
      // error handled by hook
    }
  }, [getResults]);

  // Active match view
  const isActiveMatch =
    tournament && !isUserComplete && currentMatch && currentMatch.entryB !== null;

  // Loading state — skip auth loading for demo trips
  if ((!isDemo && authLoading) || loading) {
    return (
      <div className="mx-auto w-full max-w-md min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="animate-spin">
          <span className="material-icons-round text-4xl text-primary">
            sync
          </span>
        </div>
      </div>
    );
  }

  // Non-demo: show sign-in prompt for unauthenticated users
  if (!isDemo && !user) {
    return (
      <div className="mx-auto w-full max-w-md min-h-screen bg-background-light dark:bg-background-dark">
        <SimpleHeader onClose={handleClose} />
        <div className="flex flex-col items-center py-16 text-center px-6">
          <span className="material-icons-round text-6xl text-gray-300 dark:text-gray-600 mb-4">
            lock
          </span>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Sign in to participate in the tournament
          </p>
          <button
            onClick={() => setShowLogin(true)}
            className="px-6 py-3 bg-primary text-white font-bold rounded-full shadow-glow"
          >
            Sign In
          </button>
        </div>
        <LoginPrompt open={showLogin} onOpenChange={setShowLogin} />
      </div>
    );
  }

  if (isActiveMatch) {
    return (
      <div className="mx-auto w-full max-w-md min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
        <TournamentHeader
          currentRound={currentRound}
          totalRounds={totalRounds}
          matchesCompleted={matchesCompletedInRound}
          totalMatches={totalMatchesInRound}
          onClose={handleClose}
        />

        {error && (
          <div className="mx-5 mb-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-xl">
            {error}
          </div>
        )}

        <div className="flex-1 flex flex-col justify-center">
          <MatchCard
            entryA={
              entryMap.get(currentMatch.entryA) ?? {
                id: currentMatch.entryA,
                title: "Unknown",
                restaurant_name: null,
                photo_url: null,
                avg_score: null,
                tag_name: null,
              }
            }
            entryB={
              entryMap.get(currentMatch.entryB!) ?? {
                id: currentMatch.entryB!,
                title: "Unknown",
                restaurant_name: null,
                photo_url: null,
                avg_score: null,
                tag_name: null,
              }
            }
            onVote={vote}
            disabled={voting}
          />
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
          Tap your favorite to advance
        </p>

        {!isDemo && (
          <LoginPrompt open={showLogin} onOpenChange={setShowLogin} />
        )}
      </div>
    );
  }

  // Non-match states: no tournament, user complete, loading next match
  return (
    <div className="mx-auto w-full max-w-md min-h-screen bg-background-light dark:bg-background-dark pb-24">
      <SimpleHeader onClose={handleClose} />

      <div className="px-6 py-6 space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-xl">
            {error}
          </div>
        )}

        {showResults ? (
          <TournamentResults
            results={results}
            onBack={() => setShowResults(false)}
          />
        ) : !tournament ? (
          <NoTournamentState
            canCreate={isEditor}
            entryCount={entryCount}
            onStart={handleStart}
            starting={starting}
          />
        ) : isUserComplete ? (
          <UserCompleteState onViewResults={handleViewResults} />
        ) : (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin">
              <span className="material-icons-round text-4xl text-primary">
                sync
              </span>
            </div>
          </div>
        )}
      </div>

      {!isDemo && (
        <LoginPrompt open={showLogin} onOpenChange={setShowLogin} />
      )}
    </div>
  );
}

function SimpleHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="px-5 py-4 flex items-center gap-3">
      <button
        onClick={onClose}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10"
      >
        <span className="material-icons-round text-gray-600 dark:text-gray-300">
          arrow_back
        </span>
      </button>
      <h1 className="text-lg font-extrabold text-slate-900 dark:text-white">
        Food Tournament
      </h1>
    </div>
  );
}
