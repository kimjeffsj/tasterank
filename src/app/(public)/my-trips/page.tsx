"use client";

import { useAuth } from "@/hooks/useAuth";
import { useTrips } from "@/hooks/useTrips";
import { LoginPrompt } from "@/components/auth/LoginPrompt";
import { TripListContainer } from "@/components/trip/TripListContainer";
import { CreateTripButton } from "@/components/trip/CreateTripButton";
import { useState } from "react";

export default function MyTripsPage() {
  const { user, loading: authLoading } = useAuth();
  const {
    trips,
    loading: tripsLoading,
    error,
  } = useTrips({ myTripsOnly: true });
  const [showLogin, setShowLogin] = useState(false);

  // Auth loading
  if (authLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center pb-32">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  // Not logged in — sign-in prompt
  if (!user) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 pb-32">
        <span className="material-icons-round text-6xl text-gray-300 dark:text-gray-600 mb-4">
          luggage
        </span>
        <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
          My Trips
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-center text-sm mb-6">
          Sign in to see your trips and food collections.
        </p>
        <button
          onClick={() => setShowLogin(true)}
          className="px-6 py-3 bg-primary text-white font-bold rounded-full shadow-glow active:scale-[0.97] transition-transform"
        >
          Sign In
        </button>
        <LoginPrompt open={showLogin} onOpenChange={setShowLogin} />
      </main>
    );
  }

  // Logged in — show trips
  return (
    <div className="mx-auto w-full max-w-md min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-md px-6 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold dark:text-white">My Trips</h1>
        </div>
      </header>

      {/* Content */}
      <section className="px-6">
        {error && (
          <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-xl text-sm text-error font-medium">
            {error}
          </div>
        )}

        <TripListContainer
          trips={trips}
          loading={tripsLoading}
          emptyIcon="luggage"
          emptyTitle="No trips yet"
          emptyDescription="Start your first food adventure"
          emptyAction={<CreateTripButton />}
        />
      </section>
    </div>
  );
}
