"use client";

import { Slider } from "@/components/ui/slider";

interface RatingSliderProps {
  value: number;
  onChange: (value: number) => void;
}

function getMood(score: number): string {
  if (score <= 3) return "Meh 😕";
  if (score <= 6) return "Okay 😐";
  if (score <= 8) return "Good 😋";
  return "Amazing 🤩";
}

export function RatingSlider({ value, onChange }: RatingSliderProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Score Display */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
          Taste Score
        </span>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-primary">
            {value.toFixed(1)}
          </span>
          <span className="text-sm font-medium text-gray-400">/ 10</span>
        </div>
      </div>

      {/* Slider */}
      <div className="relative">
        {/* Gradient track background */}
        <div className="absolute inset-0 top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-gradient-to-r from-red-400 via-yellow-400 to-green-500 opacity-20" />
        <Slider
          value={[value]}
          onValueChange={([v]) => onChange(v)}
          min={1}
          max={10}
          step={0.5}
          aria-label="Taste score"
        />
      </div>

      {/* Mood Labels */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400">Meh 😕</span>
        <span className="font-bold text-primary">{getMood(value)}</span>
        <span className="text-gray-400">Amazing 🤩</span>
      </div>
    </div>
  );
}
