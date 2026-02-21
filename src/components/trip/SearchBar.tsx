"use client";

import { useRef, useEffect, useCallback } from "react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Debounce delay in ms (default: 300) */
  debounceMs?: number;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search trips...",
  debounceMs = 300,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const localRef = useRef(value);

  // Sync local ref when controlled value changes externally
  useEffect(() => {
    localRef.current = value;
    if (inputRef.current && inputRef.current.value !== value) {
      inputRef.current.value = value;
    }
  }, [value]);

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      localRef.current = val;

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        onChange(val);
      }, debounceMs);
    },
    [onChange, debounceMs],
  );

  const handleClear = useCallback(() => {
    localRef.current = "";
    if (inputRef.current) inputRef.current.value = "";
    if (timerRef.current) clearTimeout(timerRef.current);
    onChange("");
  }, [onChange]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="relative">
      <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl pointer-events-none">
        search
      </span>
      <input
        ref={inputRef}
        type="text"
        defaultValue={value}
        onChange={handleInput}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-3 bg-white dark:bg-surface-dark rounded-full border border-gray-100 dark:border-white/10 text-sm font-medium text-gray-800 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
      />
      {value && (
        <button
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
        >
          <span className="material-icons-round text-xl">close</span>
        </button>
      )}
    </div>
  );
}
