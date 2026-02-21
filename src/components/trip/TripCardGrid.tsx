import Link from "next/link";
import type { Tables } from "@/types/database";

type Trip = Tables<"trips">;

interface TripCardGridProps {
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

export function TripCardGrid({ trip }: TripCardGridProps) {
  const dateRange = formatDateRange(trip.start_date, trip.end_date);

  return (
    <Link
      href={`/trips/${trip.id}`}
      className="group relative w-full aspect-4/5 rounded-3xl overflow-hidden shadow-lg active:scale-[0.98] transition-transform"
    >
      {/* Cover Image / Gradient Fallback */}
      {trip.cover_image_url ? (
        <img
          src={trip.cover_image_url}
          alt={trip.name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition duration-700"
        />
      ) : (
        <div className="absolute inset-0 bg-linear-to-br from-primary/30 via-primary/10 to-primary/5">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="material-icons-round text-primary/20 text-7xl">
              restaurant
            </span>
          </div>
        </div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent" />

      {/* Badge (top) */}
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <span
          className={`px-3 py-1 rounded-full text-[10px] font-bold backdrop-blur-sm ${
            trip.is_public
              ? "bg-primary/90 text-white"
              : "bg-white/20 text-white/90"
          }`}
        >
          {trip.is_public ? "Public" : "Private"}
        </span>
        {dateRange && (
          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-white/20 backdrop-blur-sm text-white/90">
            {dateRange}
          </span>
        )}
      </div>

      {/* Content (bottom) */}
      <div className="absolute bottom-0 w-full p-6">
        <h3 className="text-2xl font-bold text-white">{trip.name}</h3>
        {trip.description && (
          <p className="mt-1 text-sm text-white/70 line-clamp-2">
            {trip.description}
          </p>
        )}
      </div>
    </Link>
  );
}
