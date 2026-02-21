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

  const fetchQuestions = useCallback(async (entryId: string) => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data, error: dbError } = await supabase
        .from("ai_questions")
        .select("id, question_text, question_type, options, question_order")
        .eq("entry_id", entryId)
        .order("question_order");

      if (dbError) {
        setError(dbError.message);
        setQuestions([]);
        return [];
      }

      const fetched = (data ?? []) as AiQuestion[];
      setQuestions(fetched);
      return fetched;
    } catch {
      setQuestions([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnansweredCount = useCallback(
    async (entryIds: string[], userId: string) => {
      const supabase = createClient();

      const { data, error: dbError } = await supabase
        .from("ai_questions")
        .select("id, entry_id, ai_responses!left(id)")
        .in("entry_id", entryIds)
        .eq("ai_responses.user_id", userId);

      if (dbError || !data) return new Map<string, number>();

      const answeredEntries = new Set<string>();
      for (const q of data) {
        const responses = q.ai_responses as unknown as { id: string }[] | null;
        if (responses && responses.length > 0) {
          answeredEntries.add(q.entry_id);
        }
      }

      const countMap = new Map<string, number>();
      for (const q of data) {
        if (!answeredEntries.has(q.entry_id)) {
          countMap.set(q.entry_id, 1);
        }
      }

      return countMap;
    },
    [],
  );

  const dismissQuestions = useCallback(
    async (entryId: string, userId: string) => {
      const supabase = createClient();
      const { data: questions } = await supabase
        .from("ai_questions")
        .select("id")
        .eq("entry_id", entryId);

      if (!questions || questions.length === 0) return;

      const rows = questions.map((q) => ({
        question_id: q.id,
        user_id: userId,
      }));

      await supabase
        .from("ai_responses")
        .upsert(rows, { onConflict: "question_id,user_id" });
    },
    [],
  );

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
    fetchQuestions,
    fetchUnansweredCount,
    dismissQuestions,
    saveResponses,
  };
}
