"use client";

import { useEffect, useRef, useState } from "react";
import { useAiQuestions } from "@/hooks/useAiQuestions";
import { useAuth } from "@/hooks/useAuth";

interface FollowUpQuestionsProps {
  entryId: string;
  title: string;
  restaurantName?: string;
  tags?: string[];
  score?: number;
  description?: string;
  onComplete: () => void;
  onSkip: () => void;
}

export function FollowUpQuestions({
  entryId,
  title,
  restaurantName,
  tags,
  score,
  description,
  onComplete,
  onSkip,
}: FollowUpQuestionsProps) {
  const { user } = useAuth();
  const { questions, loading, generateQuestions, saveResponses } =
    useAiQuestions();
  const [responses, setResponses] = useState<
    Map<string, { text?: string; value?: number }>
  >(new Map());
  const [saving, setSaving] = useState(false);
  const generated = useRef(false);

  useEffect(() => {
    if (generated.current) return;
    generated.current = true;
    generateQuestions({
      entryId,
      title,
      restaurantName,
      tags,
      score,
      description,
    });
  }, [entryId, title, restaurantName, tags, score, description, generateQuestions]);

  // Auto-skip when no questions after generation completes
  useEffect(() => {
    if (!loading && generated.current && questions.length === 0) {
      onSkip();
    }
  }, [loading, questions, onSkip]);

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

  const handleDone = async () => {
    if (!user || responses.size === 0) {
      onComplete();
      return;
    }

    setSaving(true);
    try {
      await saveResponses(user.id, responses);
    } catch {
      // Silently proceed even if save fails
    }
    onComplete();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="text-gray-500 dark:text-gray-400 font-medium">
          Generating questions...
        </p>
      </div>
    );
  }

  if (questions.length === 0) return null;

  return (
    <div className="flex flex-col gap-6 px-6 py-6">
      {/* Header */}
      <div className="text-center">
        <span className="material-icons-round text-4xl text-primary mb-2">
          auto_awesome
        </span>
        <h2 className="text-xl font-bold dark:text-white">
          Quick Follow-up
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Help us understand your experience better
        </p>
      </div>

      {/* Questions */}
      <div className="flex flex-col gap-5">
        {questions.map((q) => (
          <div
            key={q.id}
            className="bg-white dark:bg-surface-dark rounded-xl p-5 shadow-sm border border-gray-100 dark:border-white/5"
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
                className="w-full bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10 p-3 outline-none focus:border-primary transition-colors text-sm placeholder:text-gray-300 dark:placeholder:text-gray-600 resize-none dark:text-white"
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

      {/* Actions */}
      <div className="flex gap-3 mt-2">
        <button
          type="button"
          onClick={onSkip}
          className="flex-1 py-4 rounded-full font-bold text-gray-500 bg-gray-100 dark:bg-surface-dark active:scale-[0.97] transition-all"
        >
          Skip
        </button>
        <button
          type="button"
          onClick={handleDone}
          disabled={saving}
          className="flex-1 py-4 rounded-full font-bold text-white bg-primary shadow-lg shadow-primary/30 active:scale-[0.97] transition-all disabled:opacity-50"
        >
          {saving ? "Saving..." : "Done"}
        </button>
      </div>
    </div>
  );
}
