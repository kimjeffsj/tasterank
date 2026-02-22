import type { Metadata } from "next";
import { anonClient } from "@/lib/supabase/anon";
import { notFound } from "next/navigation";
import { TripActions } from "@/components/trip/TripActions";
import { EntryGridWithBadges } from "@/components/entry/EntryGridWithBadges";

interface Props {
  params: Promise<{ tripId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tripId } = await params;
  const { data: trip } = await anonClient
    .from("trips")
    .select("name, description, cover_image_url")
    .eq("id", tripId)
    .eq("is_public", true)
    .single();

  if (!trip) return {};

  return {
    title: trip.name,
    description: trip.description ?? `Food rankings from ${trip.name}`,
    openGraph: {
      title: trip.name,
      description: trip.description ?? `Food rankings from ${trip.name}`,
      images: trip.cover_image_url
        ? [{ url: trip.cover_image_url }]
        : [{ url: "/og-image.png" }],
    },
  };
}

export default async function TripDetailPage({ params }: Props) {
  const { tripId } = await params;

  const { data: trip } = await anonClient
    .from("trips")
    .select("*")
    .eq("id", tripId)
    .eq("is_public", true)
    .single();

  if (!trip) {
    notFound();
  }

  const { data: entries } = await anonClient
    .from("food_entries")
    .select(
      "id, title, restaurant_name, created_by, created_at, food_photos(photo_url, display_order), profiles!created_by(display_name, avatar_url)",
    )
    .eq("trip_id", tripId)
    .order("created_at", { ascending: false });

  // Fetch avg scores for rating badges
  const { data: avgScores } = await anonClient
    .from("v_entry_avg_scores")
    .select("entry_id, avg_score")
    .eq("trip_id", tripId);

  const scoreMap = new Map<string, number>();
  avgScores?.forEach((s) => {
    if (s.entry_id && s.avg_score != null) {
      scoreMap.set(s.entry_id, s.avg_score);
    }
  });

  const { data: members } = await anonClient
    .from("trip_members")
    .select("user_id, role, profiles(display_name, avatar_url)")
    .eq("trip_id", tripId);

  return (
    <div className="mx-auto w-full max-w-md min-h-screen pb-24">
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

        {/* Client-side actions (edit button, FAB) */}
        <TripActions
          tripId={tripId}
          ownerId={trip.owner_id}
          inviteCode={trip.invite_code}
          memberUserIds={members?.map((m) => m.user_id) ?? []}
        />

        {/* Title + meta */}
        <div className="absolute bottom-0 w-full p-6">
          {/* Date badge */}
          {trip.start_date && (
            <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
              <span className="material-icons-round text-sm">
                calendar_today
              </span>
              {trip.start_date}
              {trip.end_date && ` — ${trip.end_date}`}
            </span>
          )}
          <h1 className="text-4xl font-extrabold text-white">{trip.name}</h1>
          {trip.description && (
            <p className="mt-2 text-white/70">{trip.description}</p>
          )}

          {/* Member avatars */}
          {members && members.length > 0 && (
            <div className="flex items-center gap-2 mt-3">
              <div className="flex -space-x-2">
                {members.slice(0, 4).map((m) => (
                  <div
                    key={m.user_id}
                    className="w-8 h-8 rounded-full border-2 border-gray-800 bg-gray-600 flex items-center justify-center overflow-hidden"
                  >
                    {m.profiles?.avatar_url ? (
                      <img
                        src={m.profiles.avatar_url}
                        alt={m.profiles.display_name ?? ""}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="material-icons-round text-sm text-white">
                        person
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <span className="text-xs text-white/60">
                {members.length} member{members.length !== 1 && "s"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Pill tabs */}
      <div className="sticky top-0 z-10 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md px-6 py-3">
        <div className="flex bg-gray-100 dark:bg-white/10 p-1.5 rounded-full">
          <div className="flex-1 text-center py-2 rounded-full bg-primary text-white text-sm font-bold">
            Food List
          </div>
          <a
            href={`/trips/${tripId}/ranking`}
            className="flex-1 text-center py-2 rounded-full text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-700 transition-colors"
          >
            Ranking
          </a>
          <a
            href={`/trips/${tripId}/tournament`}
            className="flex-1 text-center py-2 rounded-full text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-700 transition-colors"
          >
            Tournament
          </a>
        </div>
      </div>

      {/* Food entries */}
      <section className="px-6 py-6">
        <h2 className="text-xl font-bold dark:text-white mb-4">Recent Eats</h2>
        <EntryGridWithBadges
          entries={(entries ?? []).map((entry) => ({
            ...entry,
            created_at: entry.created_at ?? new Date().toISOString(),
          }))}
          scoreMap={Object.fromEntries(scoreMap)}
        />
      </section>
    </div>
  );
}
