"use client";

import { useCallback, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface AiQuestion {
  id: string;
  question_text: string;
  question_type: string;
  options?: string[] | null;
  question_order: number;
}

interface GenerateInput {
  entryId: string;
  title: string;
  restaurantName?: string;
  tags?: string[];
  score?: number;
  description?: string;
}

export function useAiQuestions() {
  const [questions, setQuestions] = useState<AiQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateQuestions = useCallback(async (input: GenerateInput) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/follow-up-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        setQuestions([]);
        return;
      }

      const data = await res.json();
      setQuestions(data.questions ?? []);
    } catch {
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveResponses = useCallback(
    async (
      userId: string,
      responses: Map<string, { text?: string; value?: number }>,
    ) => {
      const supabase = createClient();

      const rows = Array.from(responses.entries()).map(
        ([questionId, resp]) => ({
          question_id: questionId,
          user_id: userId,
          response_value: resp.value,
          response_text: resp.text,
        }),
      );

      const { error: err } = await supabase
        .from("ai_responses")
        .upsert(rows, { onConflict: "question_id,user_id" });

      if (err) throw err;
    },
    [],
  );

  return {
    questions,
    loading,
    error,
    generateQuestions,
    saveResponses,
  };
}
