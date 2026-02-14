"use client";

import { useRef } from "react";

interface DateInputProps {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  min?: string;
  max?: string;
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function DateInput({
  id,
  value,
  onChange,
  placeholder = "Select date",
  className = "",
  min,
  max,
}: DateInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    try {
      inputRef.current?.showPicker();
    } catch {
      // ShowPicker() unsupported browser

      inputRef.current?.focus();
    }
  };

  return (
    <div className={`relative ${className}`} onClick={handleClick}>
      {/* Visual display layer */}
      <div className="flex items-center gap-3 bg-white dark:bg-surface-dark rounded-xl border border-gray-100 dark:border-white/5 px-4 py-3 cursor-pointer">
        <span className="material-icons-round text-xl text-gray-400">
          calendar_today
        </span>
        <span
          className={
            value ? "text-gray-900 dark:text-gray-50" : "text-gray-400"
          }
        >
          {value ? formatDate(value) : placeholder}
        </span>
      </div>

      {/* Invisible native date input — catches taps, triggers OS picker */}
      <input
        ref={inputRef}
        id={id}
        type="date"
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        className="date-input-hidden absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
    </div>
  );
}
