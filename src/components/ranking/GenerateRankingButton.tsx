"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { LoginPrompt } from "@/components/auth/LoginPrompt";

interface GenerateRankingButtonProps {
  tripId: string;
  hasExistingRanking: boolean;
}

export function GenerateRankingButton({
  tripId,
  hasExistingRanking,
}: GenerateRankingButtonProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLogin, setShowLogin] = useState(false);

  const handleGenerate = async () => {
    if (!user) {
      setShowLogin(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/generate-ranking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Failed to generate ranking");
        return;
      }

      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return null;

  return (
    <>
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold text-sm transition-all hover:from-purple-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <span className="material-icons-round text-lg animate-spin">
              progress_activity
            </span>
            Generating...
          </>
        ) : (
          <>
            <span className="material-icons-round text-lg">auto_awesome</span>
            {hasExistingRanking ? "Regenerate AI Ranking" : "Generate AI Ranking"}
          </>
        )}
      </button>

      {error && (
        <p className="text-xs text-red-500 dark:text-red-400 text-center mt-2">
          {error}
        </p>
      )}

      <LoginPrompt open={showLogin} onOpenChange={setShowLogin} />
    </>
  );
}
