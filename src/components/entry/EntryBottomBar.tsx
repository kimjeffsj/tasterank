"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LoginPrompt } from "@/components/auth/LoginPrompt";
import { AddReviewSheet } from "./AddReviewSheet";

interface EntryBottomBarProps {
  entryId: string;
  entryTitle: string;
}

export function EntryBottomBar({ entryId, entryTitle }: EntryBottomBarProps) {
  const { user } = useAuth();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showReviewSheet, setShowReviewSheet] = useState(false);

  const handleAddReviewClick = () => {
    if (!user) {
      setShowLoginPrompt(true);
    } else {
      setShowReviewSheet(true);
    }
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({
          title: entryTitle,
          text: `Check out ${entryTitle} on TasteRank!`,
          url,
        });
      } catch {
        // 사용자가 취소했거나 오류 발생 시 무시
      }
    } else if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
      } catch {
        // 클립보드 쓰기 실패 시 무시
      }
    }
  };

  return (
    <>
      {/* Bottom action bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-20">
        <div className="flex items-center gap-3 bg-white/90 backdrop-blur-lg rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 px-4 py-3">
          {/* Add Review button */}
          <button
            aria-label="Add Review"
            onClick={handleAddReviewClick}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full bg-primary text-white font-bold text-sm shadow-glow transition-all active:scale-[0.97]"
          >
            <span className="material-icons-round text-base">rate_review</span>
            Add Review
          </button>

          {/* Share button */}
          <button
            aria-label="Share"
            onClick={handleShare}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 transition-all active:scale-[0.97]"
          >
            <span className="material-icons-round">share</span>
          </button>
        </div>
      </div>

      {/* Login Prompt (Lazy Auth) */}
      <LoginPrompt open={showLoginPrompt} onOpenChange={setShowLoginPrompt} />

      {/* Add Review Sheet (authenticated) */}
      <AddReviewSheet
        entryId={entryId}
        open={showReviewSheet}
        onOpenChange={setShowReviewSheet}
      />
    </>
  );
}
