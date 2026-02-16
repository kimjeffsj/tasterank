"use client";

import { useAuth } from "@/hooks/useAuth";
import { LoginPrompt } from "@/components/auth/LoginPrompt";
import { useState } from "react";

export default function MyTripsPage() {
  const { user, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center pb-32">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 pb-32">
        <span className="material-icons-round text-6xl text-gray-300 mb-4">
          luggage
        </span>
        <h1 className="text-xl font-bold text-gray-800 mb-2">My Trips</h1>
        <p className="text-gray-500 text-center text-sm mb-6">
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

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 pb-32">
      <span className="material-icons-round text-6xl text-gray-300 mb-4">
        luggage
      </span>
      <h1 className="text-xl font-bold text-gray-800 mb-2">My Trips</h1>
      <p className="text-gray-500 text-center text-sm">
        Your trips will appear here.
      </p>
    </main>
  );
}
