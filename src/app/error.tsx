"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-screen px-6">
      <div className="flex flex-col items-center text-center max-w-sm">
        <span className="material-icons-round text-6xl text-error mb-4">
          error_outline
        </span>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Something went wrong
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="bg-primary text-white font-bold px-6 py-3 rounded-full shadow-glow active:scale-95 transition"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
