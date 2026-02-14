"use client";

import { useRef, useMemo } from "react";

interface PhotoUploaderProps {
  photos: File[];
  onChange: (photos: File[]) => void;
  maxPhotos?: number;
}

export function PhotoUploader({
  photos,
  onChange,
  maxPhotos = 5,
}: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const previews = useMemo(
    () => photos.map((file) => URL.createObjectURL(file)),
    [photos],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    const combined = [...photos, ...newFiles].slice(0, maxPhotos);
    onChange(combined);

    // Reset input so the same file can be selected again
    e.target.value = "";
  };

  const handleRemove = (index: number) => {
    const updated = photos.filter((_, i) => i !== index);
    onChange(updated);
  };

  const canAddMore = photos.length < maxPhotos;

  return (
    <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
      {/* Previews */}
      {previews.map((url, index) => (
        <div
          key={`${photos[index].name}-${index}`}
          className="relative flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden"
        >
          <img
            src={url}
            alt={`Photo ${index + 1}`}
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={() => handleRemove(index)}
            aria-label="Remove photo"
            className="absolute top-1 right-1 w-6 h-6 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center"
          >
            <span className="material-icons-round text-white text-sm">
              close
            </span>
          </button>
        </div>
      ))}

      {/* Add button */}
      {canAddMore && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          aria-label="Add photo"
          className="flex-shrink-0 w-24 h-24 rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-primary hover:text-primary transition-colors"
        >
          <span className="material-icons-round text-2xl">add_a_photo</span>
          <span className="text-[10px] font-bold">
            {photos.length}/{maxPhotos}
          </span>
        </button>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        data-testid="photo-input"
        className="hidden"
      />
    </div>
  );
}
