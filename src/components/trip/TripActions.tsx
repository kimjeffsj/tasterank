"use client";

import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { LoginPrompt } from "@/components/auth/LoginPrompt";
import { InviteShare } from "@/components/trip/InviteShare";

interface TripActionsProps {
  tripId: string;
  ownerId: string;
  inviteCode: string | null;
}

/** FAB and action buttons shown on trip detail page */
export function TripActions({ tripId, ownerId, inviteCode }: TripActionsProps) {
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showInvite, setShowInvite] = useState(false);

  const isOwner = user?.id === ownerId;

  const handleAddEntry = () => {
    if (!user) {
      setShowLogin(true);
      return;
    }
    window.location.href = `/trips/${tripId}/entries/new`;
  };

  return (
    <>
      {/* Top-right buttons (owner only) */}
      {isOwner && (
        <div className="absolute top-12 right-6 flex gap-2">
          <button
            onClick={() => setShowInvite(!showInvite)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-md"
          >
            <span className="material-icons-round text-white">person_add</span>
          </button>
          <a
            href={`/trips/${tripId}/edit`}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-md"
          >
            <span className="material-icons-round text-white">settings</span>
          </a>
        </div>
      )}

      {/* Invite panel (slides in below hero) */}
      {showInvite && inviteCode && (
        <div className="absolute top-24 right-6 z-30 w-72">
          <InviteShare inviteCode={inviteCode} />
        </div>
      )}

      {/* FAB: Add Entry */}
      <button
        onClick={handleAddEntry}
        className="fixed bottom-8 right-6 w-16 h-16 bg-primary rounded-full shadow-[0_8px_30px_rgb(236,127,19,0.4)] flex items-center justify-center z-20 active:scale-[0.95] transition-transform group"
      >
        <span className="material-icons-round text-2xl text-white group-hover:rotate-90 transition-transform duration-300">
          add
        </span>
      </button>

      <LoginPrompt open={showLogin} onOpenChange={setShowLogin} />
    </>
  );
}
