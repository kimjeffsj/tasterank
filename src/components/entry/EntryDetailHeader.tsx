interface Tag {
  name: string;
  category: string;
}

interface EntryDetailHeaderProps {
  title: string;
  restaurantName: string | null;
  location: string | null;
  avgScore: number | null;
  ratingCount: number;
  tags: Tag[];
  creatorName: string | null;
  creatorAvatar: string | null;
}

export function EntryDetailHeader({
  title,
  restaurantName,
  location,
  avgScore,
  ratingCount,
  tags,
  creatorName,
  creatorAvatar,
}: EntryDetailHeaderProps) {
  return (
    <div className="px-6 pt-6 pb-4">
      {/* Score badge + title row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white leading-tight flex-1">
          {title}
        </h1>
        {avgScore != null && (
          <div className="flex items-center gap-1 bg-primary text-white px-3 py-1.5 rounded-2xl shadow-md shrink-0">
            <span className="material-icons-round text-amber-300 text-lg">
              star
            </span>
            <span className="font-bold text-xl">{avgScore.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Restaurant + location */}
      {restaurantName && (
        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 mb-1">
          <span className="material-icons-round text-base">store</span>
          <span className="text-sm font-medium">{restaurantName}</span>
        </div>
      )}
      {location && (
        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 mb-3">
          <span className="material-icons-round text-base">location_on</span>
          <span className="text-sm">{location}</span>
        </div>
      )}

      {/* Rating count */}
      {avgScore != null && (
        <p className="text-xs text-gray-400 mb-3">
          {ratingCount} review{ratingCount !== 1 ? "s" : ""}
        </p>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag) => (
            <span
              key={tag.name}
              className="px-4 py-1.5 rounded-full bg-orange-100 text-orange-700 text-xs font-bold uppercase"
            >
              {tag.name.toUpperCase()}
            </span>
          ))}
        </div>
      )}

      {/* Creator */}
      {creatorName && (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
            {creatorAvatar ? (
              <img
                src={creatorAvatar}
                alt={creatorName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="material-icons-round text-sm text-gray-400">
                person
              </span>
            )}
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {creatorName}
          </span>
        </div>
      )}
    </div>
  );
}
