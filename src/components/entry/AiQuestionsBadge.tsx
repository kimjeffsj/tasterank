"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
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
}

export function AiQuestionsBadge({
  entryId,
  entryTitle,
  createdBy,
  creatorName,
  creatorAvatar,
}: AiQuestionsBadgeProps) {
  const { user } = useAuth();
  const [hasUnanswered, setHasUnanswered] = useState(false);
  const [open, setOpen] = useState(false);

  const isCreator = user?.id === createdBy;

  useEffect(() => {
    if (!user) return;

    const checkUnanswered = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("ai_questions")
        .select("id, ai_responses!left(id)")
        .eq("entry_id", entryId)
        .eq("ai_responses.user_id", user.id);

      if (!data || data.length === 0) {
        setHasUnanswered(false);
        return;
      }

      // If user has ANY response, consider done
      const hasAnyResponse = data.some((q) => {
        const responses = q.ai_responses as unknown as
          | { id: string }[]
          | null;
        return responses && responses.length > 0;
      });

      setHasUnanswered(!hasAnyResponse);
    };

    checkUnanswered();
  }, [entryId, user]);

  if (!hasUnanswered) return null;

  const handleComplete = () => {
    setOpen(false);
    setHasUnanswered(false);
  };

  const handleSkip = () => {
    setOpen(false);
    setHasUnanswered(false);
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
