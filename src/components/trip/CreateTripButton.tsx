"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LoginPrompt } from "@/components/auth/LoginPrompt";

export function CreateTripButton() {
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  const handleClick = () => {
    if (!user) {
      setShowLogin(true);
      return;
    }
    window.location.href = "/trips/new";
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="w-full bg-primary text-white font-bold py-4 rounded-full shadow-glow active:scale-[0.97] transition-all"
      >
        Start New Trip
      </button>
      <LoginPrompt open={showLogin} onOpenChange={setShowLogin} />
    </>
  );
}
