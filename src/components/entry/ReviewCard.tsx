interface ReviewCardProps {
  displayName: string | null;
  avatarUrl: string | null;
  score: number;
  comment: string | null;
  createdAt: string;
}

export function ReviewCard({
  displayName,
  avatarUrl,
  score,
  comment,
  createdAt,
}: ReviewCardProps) {
  const formattedDate = new Date(createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div
      data-testid="review-card"
      className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 dark:bg-surface-dark dark:border-white/10"
    >
      <div className="flex items-center justify-between mb-3">
        {/* Reviewer info */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName ?? "User"}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="material-icons-round text-sm text-gray-400">
                person
              </span>
            )}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {displayName ?? "Anonymous"}
            </p>
            <p className="text-xs text-gray-400">{formattedDate}</p>
          </div>
        </div>

        {/* Score badge */}
        <div className="flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-full">
          <span className="material-icons-round text-amber-400 text-sm">star</span>
          <span className="font-bold text-primary text-sm">{score.toFixed(1)}</span>
        </div>
      </div>

      {/* Comment */}
      {comment && (
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          {comment}
        </p>
      )}
    </div>
  );
}
