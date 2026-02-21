"use client";

export type ViewMode = "grid" | "list";

interface ViewToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 bg-white dark:bg-surface-dark rounded-full border border-gray-100 dark:border-white/10 p-1">
      <button
        aria-label="Grid view"
        onClick={() => {
          if (value !== "grid") onChange("grid");
        }}
        className={`p-1.5 rounded-full transition ${
          value === "grid"
            ? "text-primary bg-primary/10"
            : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        }`}
      >
        <span className="material-icons-round text-lg">grid_view</span>
      </button>
      <button
        aria-label="List view"
        onClick={() => {
          if (value !== "list") onChange("list");
        }}
        className={`p-1.5 rounded-full transition ${
          value === "list"
            ? "text-primary bg-primary/10"
            : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        }`}
      >
        <span className="material-icons-round text-lg">view_list</span>
      </button>
    </div>
  );
}
