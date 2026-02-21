"use client";

import { useState, useRef, useEffect } from "react";

export type TripSort = "latest" | "name" | "start_date";

interface TripSortSelectProps {
  value: TripSort;
  onChange: (sort: TripSort) => void;
}

const options: { value: TripSort; label: string }[] = [
  { value: "latest", label: "Latest" },
  { value: "name", label: "Name" },
  { value: "start_date", label: "Start Date" },
];

export function TripSortSelect({ value, onChange }: TripSortSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const currentLabel =
    options.find((o) => o.value === value)?.label ?? "Latest";

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        aria-label="Sort"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-gray-500 dark:text-gray-400 bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/10 hover:border-primary/30 transition"
      >
        <span className="material-icons-round text-base">sort</span>
        {currentLabel}
        <span className="material-icons-round text-base">
          {open ? "expand_less" : "expand_more"}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-30 bg-white dark:bg-surface-dark rounded-xl shadow-lg border border-gray-100 dark:border-white/10 py-1 min-w-35">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm font-medium transition ${
                opt.value === value
                  ? "text-primary bg-primary/5"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
