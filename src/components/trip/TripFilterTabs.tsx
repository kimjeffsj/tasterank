"use client";

export type TripFilter = "all" | "public" | "private";

interface TripFilterTabsProps {
  value: TripFilter;
  onChange: (filter: TripFilter) => void;
}

const tabs: { value: TripFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "public", label: "Public" },
  { value: "private", label: "Private" },
];

export function TripFilterTabs({ value, onChange }: TripFilterTabsProps) {
  return (
    <div className="flex gap-2">
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            onClick={() => {
              if (!active) onChange(tab.value);
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              active
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "bg-white dark:bg-surface-dark text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-white/10 hover:border-primary/30"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
