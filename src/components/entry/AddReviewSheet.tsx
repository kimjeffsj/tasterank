"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { RatingSlider } from "./RatingSlider";
import { useRatings } from "@/hooks/useRatings";
import { useAuth } from "@/hooks/useAuth";

interface AddReviewSheetProps {
  entryId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReviewAdded: () => void;
}

export function AddReviewSheet({
  entryId,
  open,
  onOpenChange,
  onReviewAdded,
}: AddReviewSheetProps) {
  const [score, setScore] = useState(7);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { upsertRating } = useRatings(entryId);
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!user) return;

    setSubmitting(true);
    try {
      await upsertRating({
        entry_id: entryId,
        user_id: user.id,
        score,
        review_text: comment.trim() || null,
      });
      onReviewAdded();
      onOpenChange(false);
      setScore(7);
      setComment("");
    } catch (err) {
      console.error("Failed to submit review", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-3xl px-6 pt-6 pb-8 max-w-md mx-auto"
      >
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl font-bold text-gray-900 dark:text-white">
            Add Review
          </SheetTitle>
        </SheetHeader>

        {/* Rating slider */}
        <div className="mb-6">
          <RatingSlider value={score} onChange={setScore} />
        </div>

        {/* Comment textarea */}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Leave a comment (optional)"
          rows={3}
          className="w-full rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-surface-dark p-4 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 mb-6"
        />

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-4 rounded-full bg-primary text-white font-bold text-base shadow-glow transition-all active:scale-[0.97] disabled:opacity-60"
        >
          {submitting ? "Submitting..." : "Submit Review"}
        </button>
      </SheetContent>
    </Sheet>
  );
}
