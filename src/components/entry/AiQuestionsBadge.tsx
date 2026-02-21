"use client";

import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import { FollowUpQuestions } from "./FollowUpQuestions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface AiQuestionsBadgeProps {
  entryId: string;
  entryTitle: string;
  createdBy: string;
  creatorName: string;
  creatorAvatar?: string;
  hasUnanswered: boolean;
  user: User | null;
  onAnswered?: () => void;
}

export function AiQuestionsBadge({
  entryId,
  entryTitle,
  createdBy,
  creatorName,
  creatorAvatar,
  hasUnanswered,
  user,
  onAnswered,
}: AiQuestionsBadgeProps) {
  const [dismissed, setDismissed] = useState(false);
  const [open, setOpen] = useState(false);

  const isCreator = user?.id === createdBy;

  if (!hasUnanswered || dismissed || isCreator) return null;

  const handleComplete = () => {
    setOpen(false);
    setDismissed(true);
    onAnswered?.();
  };

  const handleSkip = () => {
    setOpen(false);
    setDismissed(true);
    onAnswered?.();
  };

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className="absolute top-2 right-2 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-primary/90 backdrop-blur-sm shadow-lg shadow-primary/30 animate-pulse"
        aria-label="AI follow-up questions available"
      >
        <span className="material-icons-round text-white text-base">
          auto_awesome
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-w-md mx-auto max-h-[85vh] overflow-y-auto bg-white dark:bg-background-dark"
          showCloseButton={false}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <span className="material-icons-round text-primary text-xl">
                auto_awesome
              </span>
              Quick Follow-up
            </DialogTitle>
            <DialogDescription>
              {isCreator
                ? `Help us understand your experience with ${entryTitle}`
                : `Rate and share your thoughts on ${entryTitle}`}
            </DialogDescription>
          </DialogHeader>

          <FollowUpQuestions
            entryId={entryId}
            isCreator={isCreator}
            creatorName={creatorName}
            creatorAvatar={creatorAvatar}
            onComplete={handleComplete}
            onSkip={handleSkip}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
