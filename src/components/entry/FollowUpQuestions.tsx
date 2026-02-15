"use client";

import { useEffect, useRef, useState } from "react";
import { useAiQuestions } from "@/hooks/useAiQuestions";
import { useAuth } from "@/hooks/useAuth";
import { RatingSlider } from "./RatingSlider";
import { createClient } from "@/lib/supabase/client";

interface FollowUpQuestionsProps {
  entryId: string;
  isCreator: boolean;
  creatorName?: string;
  creatorAvatar?: string;
  onComplete: () => void;
  onSkip: () => void;
}

export function FollowUpQuestions({
  entryId,
  isCreator,
  creatorName,
  creatorAvatar,
  onComplete,
  onSkip,
}: FollowUpQuestionsProps) {
  const { user } = useAuth();
  const { questions, loading, fetchQuestions, saveResponses, dismissQuestions } =
    useAiQuestions();
  const [responses, setResponses] = useState<
    Map<string, { text?: string; value?: number }>
  >(new Map());
  const [ratingScore, setRatingScore] = useState<number>(5);
  const [saving, setSaving] = useState(false);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetchQuestions(entryId);
  }, [entryId, fetchQuestions]);

  const setResponse = (
    questionId: string,
    resp: { text?: string; value?: number },
  ) => {
    setResponses((prev) => {
      const next = new Map(prev);
      next.set(questionId, resp);
      return next;
    });
  };

  const handleSkip = async () => {
    if (user) {
      await dismissQuestions(entryId, user.id);
    }
    onSkip();
  };

  const handleDone = async () => {
    if (!user) {
      onComplete();
      return;
    }

    setSaving(true);
    try {
      const promises: Promise<unknown>[] = [];

      // Save rating (non-creator only)
      if (!isCreator) {
        const supabase = createClient();
        promises.push(
          supabase
            .from("ratings")
            .upsert(
              { entry_id: entryId, user_id: user.id, score: ratingScore },
              { onConflict: "entry_id,user_id" },
            )
            .then(),
        );
      }

      // Save AI responses
      if (responses.size > 0) {
        promises.push(saveResponses(user.id, responses));
      }

      await Promise.all(promises).catch(() => {});
    } catch {
      // Silently proceed even if save fails
    }
    onComplete();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
          Loading questions...
        </p>
      </div>
    );
  }

  if (questions.length === 0 && isCreator) return null;

  return (
    <div className="flex flex-col gap-5">
      {/* Creator info for non-creator */}
      {!isCreator && creatorName && (
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
          {creatorAvatar ? (
            <img
              src={creatorAvatar}
              alt={creatorName}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center">
              <span className="material-icons-round text-sm text-gray-500">
                person
              </span>
            </div>
          )}
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Added by{" "}
            <span className="font-semibold text-gray-800 dark:text-gray-200">
              {creatorName}
            </span>
          </span>
        </div>
      )}

      {/* Rating slider for non-creator */}
      {!isCreator && (
        <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4">
          <RatingSlider value={ratingScore} onChange={setRatingScore} />
        </div>
      )}

      {/* Questions */}
      {questions.length > 0 && (
        <div className="flex flex-col gap-4">
          {questions.map((q) => (
            <div
              key={q.id}
              className="bg-gray-50 dark:bg-white/5 rounded-xl p-4"
            >
              <p className="font-semibold text-sm dark:text-white mb-3">
                {q.question_text}
              </p>

              {q.question_type === "scale" && (
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setResponse(q.id, { value: n })}
                      className={`w-11 h-11 rounded-full font-bold text-sm transition-all ${
                        responses.get(q.id)?.value === n
                          ? "bg-primary text-white shadow-lg shadow-primary/30 scale-110"
                          : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              )}

              {q.question_type === "text" && (
                <textarea
                  placeholder="Type your answer..."
                  rows={2}
                  value={responses.get(q.id)?.text ?? ""}
                  onChange={(e) =>
                    setResponse(q.id, { text: e.target.value })
                  }
                  className="w-full bg-white dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10 p-3 outline-none focus:border-primary transition-colors text-sm placeholder:text-gray-300 dark:placeholder:text-gray-600 resize-none dark:text-white"
                />
              )}

              {q.question_type === "choice" &&
                Array.isArray(q.options) && (
                  <div className="flex flex-wrap gap-2">
                    {q.options.map((option: string) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() =>
                          setResponse(q.id, { text: option })
                        }
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          responses.get(q.id)?.text === option
                            ? "bg-primary text-white shadow-md shadow-primary/20"
                            : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleSkip}
          className="flex-1 py-3 rounded-full font-bold text-gray-500 bg-gray-100 dark:bg-surface-dark active:scale-[0.97] transition-all text-sm"
        >
          Skip
        </button>
        <button
          type="button"
          onClick={handleDone}
          disabled={saving}
          className="flex-1 py-3 rounded-full font-bold text-white bg-primary shadow-lg shadow-primary/30 active:scale-[0.97] transition-all disabled:opacity-50 text-sm"
        >
          {saving ? "Saving..." : "Done"}
        </button>
      </div>
    </div>
  );
}
