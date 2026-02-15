"use client";

import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { InviteShare } from "@/components/trip/InviteShare";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

interface TripActionsProps {
  tripId: string;
  ownerId: string;
  inviteCode: string | null;
  memberUserIds: string[];
}

/** FAB and action buttons shown on trip detail page */
export function TripActions({ tripId, ownerId, inviteCode, memberUserIds }: TripActionsProps) {
  const { user } = useAuth();
  const [showInvite, setShowInvite] = useState(false);

  const isOwner = user?.id === ownerId;
  const isMember = user ? memberUserIds.includes(user.id) : false;

  const handleAddEntry = () => {
    window.location.href = `/trips/${tripId}/entries/new`;
  };

  const handleInvite = async () => {
    if (!inviteCode) return;
    const inviteUrl = `${window.location.origin}/join/${inviteCode}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join my TasteRank trip!",
          text: "Join me on TasteRank to rate and rank food together.",
          url: inviteUrl,
        });
        return;
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") return;
      }
    }
    setShowInvite(true);
  };

  return (
    <>
      {/* Top-right buttons (owner only) */}
      {isOwner && (
        <div className="absolute top-12 right-6 flex gap-2 z-30">
          <button
            onClick={handleInvite}
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

      {/* Invite Sheet (fallback for desktop/unsupported browsers) */}
      <Sheet open={showInvite} onOpenChange={setShowInvite}>
        <SheetContent side="bottom" showCloseButton={false} className="rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>Invite Members</SheetTitle>
            <SheetDescription>
              Share this link to invite others to your trip.
            </SheetDescription>
          </SheetHeader>
          {inviteCode && <InviteShare inviteCode={inviteCode} />}
        </SheetContent>
      </Sheet>

      {/* FAB: Add Entry — only for logged-in members */}
      {user && isMember && (
        <button
          onClick={handleAddEntry}
          className="fixed bottom-8 right-6 w-16 h-16 bg-primary rounded-full shadow-[0_8px_30px_rgb(236,127,19,0.4)] flex items-center justify-center z-20 active:scale-[0.95] transition-transform group"
        >
          <span className="material-icons-round text-2xl text-white group-hover:rotate-90 transition-transform duration-300">
            add
          </span>
        </button>
      )}
    </>
  );
}
