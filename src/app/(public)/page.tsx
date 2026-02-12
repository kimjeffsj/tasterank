import { anonClient } from "@/lib/supabase/anon";
import { CreateTripButton } from "@/components/trip/CreateTripButton";

export default async function HomePage() {
  const { data: trips } = await anonClient
    .from("trips")
    .select("id, name, description, cover_image_url, created_at")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="mx-auto w-full max-w-md min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background-light/90 backdrop-blur-md px-6 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-icons-round text-primary text-2xl">
              restaurant
            </span>
            <h1 className="text-xl font-bold">TasteRank</h1>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 py-8">
        <h2 className="text-4xl font-extrabold leading-[1.1]">
          Record the taste
          <br />
          of your <span className="text-primary">travels</span>
        </h2>
        <p className="mt-3 text-lg text-gray-500">
          Rate and rank your travel food experiences together.
        </p>
        <div className="mt-6">
          <CreateTripButton />
        </div>
      </section>

      {/* Collections */}
      <section className="px-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Your Collections</h3>
        </div>

        {!trips || trips.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="material-icons-round text-6xl text-gray-300 mb-4">
              restaurant_menu
            </span>
            <p className="text-gray-500 font-medium">No collections yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Create your first trip to get started
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {trips.map((trip) => (
              <a
                key={trip.id}
                href={`/trips/${trip.id}`}
                className="group relative w-full aspect-[4/5] rounded-3xl overflow-hidden shadow-lg"
              >
                {trip.cover_image_url ? (
                  <img
                    src={trip.cover_image_url}
                    alt={trip.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition duration-700"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute bottom-0 w-full p-6">
                  <h4 className="text-2xl font-bold text-white">{trip.name}</h4>
                  {trip.description && (
                    <p className="mt-1 text-sm text-white/70 line-clamp-2">
                      {trip.description}
                    </p>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
