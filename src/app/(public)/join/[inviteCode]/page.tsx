"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";

type JoinState = "loading" | "joining" | "success" | "error" | "login_required";

export default function JoinTripPage() {
  const params = useParams<{ inviteCode: string }>();
  const router = useRouter();
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const [state, setState] = useState<JoinState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [tripName, setTripName] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setState("login_required");
      return;
    }

    // User is logged in — attempt to join
    const joinTrip = async () => {
      setState("joining");
      const supabase = createClient();

      const { data, error: err } = await supabase.rpc(
        "join_trip_by_invite",
        { p_invite_code: params.inviteCode },
      );

      if (err) {
        setError(err.message);
        setState("error");
        return;
      }

      const trip = data as unknown as { id: string; name: string };
      setTripName(trip.name);
      setState("success");

      // Redirect to trip after brief delay
      setTimeout(() => {
        router.push(`/trips/${trip.id}`);
      }, 1500);
    };

    joinTrip();
  }, [user, authLoading, params.inviteCode, router]);

  return (
    <div className="mx-auto w-full max-w-md min-h-screen flex flex-col items-center justify-center px-6">
      {state === "loading" && (
        <div className="flex flex-col items-center gap-4">
          <span className="material-icons-round text-5xl text-primary animate-spin">
            refresh
          </span>
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      )}

      {state === "login_required" && (
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="material-icons-round text-4xl text-primary">
              group_add
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold dark:text-white">Join Trip</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Sign in with Google to join this trip as a member.
            </p>
          </div>
          <button
            onClick={signInWithGoogle}
            className="w-full bg-primary text-white font-bold py-4 rounded-full shadow-glow active:scale-[0.97] transition-all flex items-center justify-center gap-3"
          >
            <span className="material-icons-round text-xl">login</span>
            Continue with Google
          </button>
          <a href="/" className="text-sm text-gray-400 mt-2">
            Back to home
          </a>
        </div>
      )}

      {state === "joining" && (
        <div className="flex flex-col items-center gap-4">
          <span className="material-icons-round text-5xl text-primary animate-spin">
            refresh
          </span>
          <p className="text-gray-500 dark:text-gray-400">Joining trip...</p>
        </div>
      )}

      {state === "success" && (
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center">
            <span className="material-icons-round text-4xl text-success">
              check_circle
            </span>
          </div>
          <h1 className="text-2xl font-bold dark:text-white">You&apos;re in!</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Welcome to <span className="font-bold">{tripName}</span>
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">Redirecting...</p>
        </div>
      )}

      {state === "error" && (
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-20 h-20 rounded-full bg-error/10 flex items-center justify-center">
            <span className="material-icons-round text-4xl text-error">
              error
            </span>
          </div>
          <h1 className="text-2xl font-bold dark:text-white">Oops!</h1>
          <p className="text-gray-500 dark:text-gray-400">
            {error ?? "Something went wrong. The invite link may be invalid."}
          </p>
          <a
            href="/"
            className="mt-4 text-primary font-bold"
          >
            Go to Home
          </a>
        </div>
      )}
    </div>
  );
}
