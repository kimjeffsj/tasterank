"use client";

import { useState } from "react";

export interface TagItem {
  name: string;
  category?: string;
  isAiSuggested?: boolean;
}

interface TagSelectorProps {
  selectedTags: TagItem[];
  onChange: (tags: TagItem[]) => void;
  onAiSuggest?: () => void;
  aiLoading?: boolean;
}

export function TagSelector({
  selectedTags,
  onChange,
  onAiSuggest,
  aiLoading = false,
}: TagSelectorProps) {
  const [input, setInput] = useState("");

  const addTag = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    if (selectedTags.some((t) => t.name.toLowerCase() === trimmed.toLowerCase()))
      return;

    onChange([...selectedTags, { name: trimmed }]);
    setInput("");
  };

  const removeTag = (index: number) => {
    onChange(selectedTags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex overflow-x-auto gap-2 pb-1 no-scrollbar">
          {selectedTags.map((tag, i) => (
            <button
              key={tag.name}
              type="button"
              onClick={() => removeTag(i)}
              aria-label={`Remove ${tag.name}`}
              className="flex items-center gap-1 bg-primary text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-md shadow-primary/20 whitespace-nowrap transition transform active:scale-95"
            >
              {tag.isAiSuggested && (
                <span className="material-icons-round text-base">
                  auto_awesome
                </span>
              )}
              {tag.name}
              <span className="material-icons-round text-base ml-0.5">
                close
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Input + Actions */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center bg-white dark:bg-surface-dark rounded-full border border-gray-100 dark:border-white/5 px-4 py-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a tag..."
            className="flex-1 bg-transparent outline-none text-sm dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600"
          />
          <button
            type="button"
            onClick={addTag}
            aria-label="Add tag"
            className="text-primary ml-1"
          >
            <span className="material-icons-round text-xl">add_circle</span>
          </button>
        </div>

        {onAiSuggest && (
          <button
            type="button"
            onClick={onAiSuggest}
            disabled={aiLoading}
            className="flex items-center gap-1 bg-linear-to-r from-purple-500 to-primary text-white px-4 py-2.5 rounded-full text-sm font-bold whitespace-nowrap disabled:opacity-50 transition active:scale-95"
          >
            <span className="material-icons-round text-base">
              auto_awesome
            </span>
            {aiLoading ? "Suggesting..." : "AI Suggest"}
          </button>
        )}
      </div>
    </div>
  );
}
