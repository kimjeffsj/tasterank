import Link from "next/link";
import type { Tables } from "@/types/database";

type Trip = Tables<"trips">;

interface TripCardCompactProps {
  trip: Trip;
}

function formatDateRange(start: string | null, end: string | null): string {
  if (!start) return "";
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };
  const s = new Date(start).toLocaleDateString("en-US", options);
  if (!end) return s;
  const e = new Date(end).toLocaleDateString("en-US", options);
  return `${s} – ${e}`;
}

export function TripCardCompact({ trip }: TripCardCompactProps) {
  const dateRange = formatDateRange(trip.start_date, trip.end_date);

  return (
    <Link
      href={`/trips/${trip.id}`}
      className="flex items-center gap-4 p-3 bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 hover:shadow-md transition-all active:scale-[0.98] group"
    >
      {/* Thumbnail */}
      <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-linear-to-br from-primary/20 to-primary/5">
        {trip.cover_image_url ? (
          <img
            src={trip.cover_image_url}
            alt={trip.name}
            className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-icons-round text-primary/40 text-2xl">
              restaurant
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-gray-800 dark:text-white truncate text-sm">
            {trip.name}
          </h3>
          <span
            className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${
              trip.is_public
                ? "bg-primary/10 text-primary"
                : "bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400"
            }`}
          >
            {trip.is_public ? "Public" : "Private"}
          </span>
        </div>
        {trip.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
            {trip.description}
          </p>
        )}
        {dateRange && (
          <div className="flex items-center gap-1 mt-1">
            <span className="material-icons-round text-gray-400 text-xs">
              calendar_today
            </span>
            <span className="text-[11px] text-gray-400">{dateRange}</span>
          </div>
        )}
      </div>

      {/* Chevron */}
      <span className="material-icons-round text-gray-300 dark:text-gray-600 text-xl shrink-0">
        chevron_right
      </span>
    </Link>
  );
}
