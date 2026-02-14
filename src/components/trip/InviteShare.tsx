"use client";

import { useState } from "react";

interface InviteShareProps {
  inviteCode: string;
}

export function InviteShare({ inviteCode }: InviteShareProps) {
  const [copied, setCopied] = useState(false);

  const inviteUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/join/${inviteCode}`
      : `/join/${inviteCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement("input");
      input.value = inviteUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "Join my TasteRank trip!",
        text: "Join me on TasteRank to rate and rank our food experiences together.",
        url: inviteUrl,
      });
    } else {
      handleCopy();
    }
  };

  return (
    <div className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/5 p-4 shadow-lg">
      <div className="flex items-center gap-3 mb-3">
        <span className="material-icons-round text-xl text-primary">
          person_add
        </span>
        <p className="font-bold text-sm">Invite Members</p>
      </div>

      <div className="flex gap-2">
        <div className="flex-1 min-w-0 bg-gray-50 dark:bg-background-dark rounded-xl px-3 py-2.5 text-sm text-gray-500 truncate">
          {inviteUrl}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 dark:bg-surface-dark active:scale-[0.95] transition-transform"
        >
          <span className="material-icons-round text-lg">
            {copied ? "check" : "content_copy"}
          </span>
        </button>
        <button
          onClick={handleShare}
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-white active:scale-[0.95] transition-transform"
        >
          <span className="material-icons-round text-lg">share</span>
        </button>
      </div>

      {copied && (
        <p className="text-xs text-success font-medium mt-2">
          Link copied to clipboard!
        </p>
      )}
    </div>
  );
}
