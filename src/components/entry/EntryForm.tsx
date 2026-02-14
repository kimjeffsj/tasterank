"use client";

import { useState } from "react";
import type { Tables } from "@/types/database";
import { PhotoUploader } from "./PhotoUploader";
import { RatingSlider } from "./RatingSlider";
import { TagSelector, type TagItem } from "./TagSelector";

type Entry = Tables<"food_entries">;

interface EntryFormProps {
  /** Existing entry data for editing mode */
  entry?: Entry;
  /** Called on successful form submission */
  onSubmit: (data: EntryFormData) => Promise<void>;
  /** Called when user cancels */
  onCancel?: () => void;
  /** Submit button label */
  submitLabel?: string;
  /** Show photo uploader */
  showPhotos?: boolean;
}

export interface EntryFormData {
  title: string;
  restaurant_name: string;
  location_name: string;
  description: string;
  photos: File[];
  score: number;
  tags: TagItem[];
}

export function EntryForm({
  entry,
  onSubmit,
  onCancel,
  submitLabel = "Save Record",
  showPhotos = true,
}: EntryFormProps) {
  const [title, setTitle] = useState(entry?.title ?? "");
  const [restaurantName, setRestaurantName] = useState(
    entry?.restaurant_name ?? "",
  );
  const [locationName, setLocationName] = useState(entry?.location_name ?? "");
  const [description, setDescription] = useState(entry?.description ?? "");
  const [photos, setPhotos] = useState<File[]>([]);
  const [score, setScore] = useState(7);
  const [tags, setTags] = useState<TagItem[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAiSuggest = async () => {
    if (!title.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/suggest-tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          restaurantName: restaurantName.trim() || undefined,
          description: description.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to get suggestions");
      const data = await res.json();
      const aiTags: TagItem[] = (data.tags ?? []).map(
        (t: { name: string; category?: string }) => ({
          name: t.name,
          category: t.category,
          isAiSuggested: true,
        }),
      );
      // Merge without duplicates
      const existing = new Set(tags.map((t) => t.name.toLowerCase()));
      const newTags = aiTags.filter((t) => !existing.has(t.name.toLowerCase()));
      setTags([...tags, ...newTags]);
    } catch {
      // Silently fail — AI suggestions are optional
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Food name is required");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        title: title.trim(),
        restaurant_name: restaurantName.trim(),
        location_name: locationName.trim(),
        description: description.trim(),
        photos,
        score,
        tags,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Photos */}
      {showPhotos && (
        <div>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-2 px-1">
            Photos
          </p>
          <PhotoUploader photos={photos} onChange={setPhotos} />
        </div>
      )}

      {/* Food Name */}
      <div className="bg-white dark:bg-surface-dark rounded-xl p-6 shadow-sm border border-orange-100 dark:border-white/5">
        <label
          htmlFor="entry-title"
          className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-2"
        >
          Food Name
        </label>
        <input
          id="entry-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What did you eat?"
          className="w-full text-2xl font-extrabold bg-transparent border-b-2 border-gray-200 dark:border-white/10 focus:border-primary outline-none py-3 transition-colors placeholder:text-gray-300 dark:placeholder:text-gray-600 dark:text-white"
        />
      </div>

      {/* Restaurant & Location */}
      <div className="bg-white dark:bg-surface-dark rounded-xl p-6 shadow-sm border border-gray-100 dark:border-white/5 flex flex-col gap-5">
        <div>
          <label
            htmlFor="entry-restaurant"
            className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-2"
          >
            Restaurant
          </label>
          <div className="flex items-center gap-3">
            <span className="material-icons-round text-xl text-gray-400">
              restaurant
            </span>
            <input
              id="entry-restaurant"
              type="text"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              placeholder="Restaurant name"
              className="flex-1 bg-transparent border-b border-gray-200 dark:border-white/10 focus:border-primary outline-none py-2 font-medium transition-colors placeholder:text-gray-300 dark:placeholder:text-gray-600 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="entry-location"
            className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-2"
          >
            Location
          </label>
          <div className="flex items-center gap-3">
            <span className="material-icons-round text-xl text-gray-400">
              location_on
            </span>
            <input
              id="entry-location"
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="Where was it?"
              className="flex-1 bg-transparent border-b border-gray-200 dark:border-white/10 focus:border-primary outline-none py-2 font-medium transition-colors placeholder:text-gray-300 dark:placeholder:text-gray-600 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Rating */}
      <div className="bg-white dark:bg-surface-dark rounded-xl p-6 shadow-sm border border-gray-100 dark:border-white/5">
        <RatingSlider value={score} onChange={setScore} />
      </div>

      {/* Tags */}
      <div>
        <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-2 px-1">
          Tags
        </p>
        <TagSelector
          selectedTags={tags}
          onChange={setTags}
          onAiSuggest={handleAiSuggest}
          aiLoading={aiLoading}
        />
      </div>

      {/* Quick Review */}
      <div>
        <label
          htmlFor="entry-description"
          className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-2 px-1"
        >
          Quick Review
        </label>
        <textarea
          id="entry-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Leave a quick note about the taste..."
          rows={3}
          className="w-full bg-white dark:bg-surface-dark rounded-xl border border-gray-100 dark:border-white/5 p-4 outline-none focus:border-primary transition-colors placeholder:text-gray-300 dark:placeholder:text-gray-600 resize-none dark:text-white"
        />
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
          disabled={submitting || !title.trim()}
          className="flex-1 py-4 rounded-full font-bold text-white bg-primary shadow-lg shadow-primary/30 active:scale-[0.97] transition-all disabled:opacity-50 disabled:active:scale-100"
        >
          {submitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
