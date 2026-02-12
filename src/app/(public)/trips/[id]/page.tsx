import { anonClient } from "@/lib/supabase/anon";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TripDetailPage({ params }: Props) {
  const { id } = await params;

  const { data: trip } = await anonClient
    .from("trips")
    .select("*")
    .eq("id", id)
    .eq("is_public", true)
    .single();

  if (!trip) {
    notFound();
  }

  const { data: entries } = await anonClient
    .from("food_entries")
    .select("id, title, restaurant_name, created_at")
    .eq("trip_id", id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto w-full max-w-md min-h-screen">
      {/* Hero */}
      <div className="relative h-[420px]">
        {trip.cover_image_url ? (
          <img
            src={trip.cover_image_url}
            alt={trip.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/10" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        {/* Back button */}
        <div className="absolute top-12 left-6">
          <a
            href="/"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-md"
          >
            <span className="material-icons-round text-white">arrow_back</span>
          </a>
        </div>

        {/* Title */}
        <div className="absolute bottom-0 w-full p-6">
          <h1 className="text-4xl font-extrabold text-white">{trip.name}</h1>
          {trip.description && (
            <p className="mt-2 text-white/70">{trip.description}</p>
          )}
        </div>
      </div>

      {/* Food entries */}
      <section className="px-6 py-6">
        <h2 className="text-xl font-bold mb-4">Recent Eats</h2>

        {!entries || entries.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <span className="material-icons-round text-5xl text-gray-300 mb-3">
              restaurant_menu
            </span>
            <p className="text-gray-500">No food entries yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="bg-white dark:bg-surface-dark rounded-3xl overflow-hidden shadow-sm"
              >
                <div className="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <span className="material-icons-round text-4xl text-gray-300">
                    restaurant
                  </span>
                </div>
                <div className="p-3">
                  <p className="font-bold text-sm leading-tight">
                    {entry.title}
                  </p>
                  {entry.restaurant_name && (
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {entry.restaurant_name}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
