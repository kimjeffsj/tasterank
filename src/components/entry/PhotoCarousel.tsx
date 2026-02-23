"use client";

import { useRef, useState } from "react";

interface Photo {
  photo_url: string;
  display_order: number | null;
}

interface PhotoCarouselProps {
  photos: Photo[];
  title: string;
  shareUrl?: string;
  showShareButton?: boolean;
}

export function PhotoCarousel({
  photos,
  title,
  shareUrl,
  showShareButton,
}: PhotoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleShare = async () => {
    const url =
      shareUrl ||
      (typeof window !== "undefined" ? window.location.href : "");
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // 취소 무시
      }
    } else if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
      } catch {
        // 무시
      }
    }
  };

  const sortedPhotos = [...photos].sort(
    (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
  );

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
    if (scrollRef.current) {
      const width = scrollRef.current.offsetWidth;
      scrollRef.current.scrollTo({ left: width * index, behavior: "smooth" });
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const width = scrollRef.current.offsetWidth;
      const index = Math.round(scrollRef.current.scrollLeft / width);
      setCurrentIndex(index);
    }
  };

  if (sortedPhotos.length === 0) {
    return (
      <div
        data-testid="photo-carousel"
        className="h-[400px] bg-gray-100 dark:bg-gray-800 flex items-center justify-center relative"
      >
        <span className="material-icons-round text-6xl text-gray-300">
          restaurant
        </span>
        {showShareButton && (
          <button
            aria-label="Share"
            onClick={handleShare}
            className="absolute top-4 right-4 bg-black/30 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center text-white z-10"
          >
            <span className="material-icons-round text-[18px]">ios_share</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div data-testid="photo-carousel" className="h-[400px] relative">
      {showShareButton && (
        <button
          aria-label="Share"
          onClick={handleShare}
          className="absolute top-4 right-4 bg-black/30 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center text-white z-10"
        >
          <span className="material-icons-round text-[18px]">ios_share</span>
        </button>
      )}

      {/* Scrollable carousel */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="h-full flex overflow-x-auto snap-x snap-mandatory no-scrollbar"
      >
        {sortedPhotos.map((photo, index) => (
          <div key={index} className="h-full w-full shrink-0 snap-center">
            <img
              src={photo.photo_url}
              alt={`${title} ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Pagination dots */}
      {sortedPhotos.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {sortedPhotos.map((_, index) => (
            <button
              key={index}
              aria-label={`Go to photo ${index + 1}`}
              onClick={() => handleDotClick(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex
                  ? "bg-white w-4"
                  : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
