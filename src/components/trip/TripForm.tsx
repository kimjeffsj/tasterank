"use client";

import { useState } from "react";
import type { Tables } from "@/types/database";
import { DateInput } from "@/components/ui/DateInput";

type Trip = Tables<"trips">;

interface TripFormProps {
  /** Existing trip data for editing mode */
  trip?: Trip;
  /** Called on successful form submission */
  onSubmit: (data: TripFormData) => Promise<void>;
  /** Called when user cancels */
  onCancel?: () => void;
  /** Submit button label */
  submitLabel?: string;
}

export interface TripFormData {
  name: string;
  description: string;
  is_public: boolean;
  start_date: string;
  end_date: string;
}

export function TripForm({
  trip,
  onSubmit,
  onCancel,
  submitLabel = "Create Trip",
}: TripFormProps) {
  const [name, setName] = useState(trip?.name ?? "");
  const [description, setDescription] = useState(trip?.description ?? "");
  const [isPublic, setIsPublic] = useState(trip?.is_public ?? true);
  const [startDate, setStartDate] = useState(trip?.start_date ?? "");
  const [endDate, setEndDate] = useState(trip?.end_date ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Trip name is required");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        is_public: isPublic,
        start_date: startDate,
        end_date: endDate,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Trip Name */}
      <div>
        <label
          htmlFor="trip-name"
          className="block text-sm font-bold text-gray-600 mb-2"
        >
          Trip Name
        </label>
        <input
          id="trip-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Tokyo Food Tour 2026"
          className="w-full text-xl font-bold bg-transparent border-b-2 border-gray-200 focus:border-primary outline-none py-3 transition-colors placeholder:text-gray-300"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="trip-description"
          className="block text-sm font-bold text-gray-600 mb-2"
        >
          Description
        </label>
        <textarea
          id="trip-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What's this trip about?"
          rows={3}
          className="w-full bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/5 p-4 outline-none focus:border-primary transition-colors placeholder:text-gray-300 resize-none"
        />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="trip-start-date"
            className="block text-sm font-bold text-gray-600 mb-2"
          >
            Start Date
          </label>
          <DateInput
            id="trip-start-date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            max={endDate || undefined}
          />
        </div>
        <div>
          <label
            htmlFor="trip-end-date"
            className="block text-sm font-bold text-gray-600 mb-2"
          >
            End Date
          </label>
          <DateInput
            id="trip-end-date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate || undefined}
          />
        </div>
      </div>

      {/* Public/Private Toggle */}
      <div className="flex items-center justify-between bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/5 p-4">
        <div className="flex items-center gap-3">
          <span className="material-icons-round text-xl text-gray-500">
            {isPublic ? "public" : "lock"}
          </span>
          <div>
            <p className="font-bold text-sm">
              {isPublic ? "Public" : "Private"}
            </p>
            <p className="text-xs text-gray-500">
              {isPublic
                ? "Anyone can view this trip"
                : "Only members can view"}
            </p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={isPublic}
          onClick={() => setIsPublic(!isPublic)}
          className={`relative w-12 h-7 rounded-full transition-colors ${
            isPublic ? "bg-primary" : "bg-gray-300"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
              isPublic ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-error font-medium" role="alert">
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-3 mt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-4 rounded-full font-bold text-gray-500 bg-gray-100 dark:bg-surface-dark active:scale-[0.97] transition-all"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting || !name.trim()}
          className="flex-1 py-4 rounded-full font-bold text-white bg-primary shadow-glow active:scale-[0.97] transition-all disabled:opacity-50 disabled:active:scale-100"
        >
          {submitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
