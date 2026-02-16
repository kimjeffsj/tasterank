"use client";

interface UserCompleteStateProps {
  onViewResults: () => void;
}

export function UserCompleteState({ onViewResults }: UserCompleteStateProps) {
  return (
    <div className="flex flex-col items-center py-16 text-center px-6">
      <span className="material-icons-round text-6xl text-primary mb-4">
        check_circle
      </span>
      <h2 className="text-xl font-extrabold dark:text-white mb-2">
        You&apos;re Done!
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xs">
        You&apos;ve completed all your matchups. See how everyone voted!
      </p>
      <button
        onClick={onViewResults}
        className="px-6 py-3 bg-primary text-white font-bold rounded-full shadow-glow hover:opacity-90 active:scale-95 transition-all"
      >
        View Results
      </button>
    </div>
  );
}
