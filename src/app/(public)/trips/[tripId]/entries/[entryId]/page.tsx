import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { anonClient } from "@/lib/supabase/anon";
import { PhotoCarousel } from "@/components/entry/PhotoCarousel";
import { EntryDetailHeader } from "@/components/entry/EntryDetailHeader";
import { ReviewCard } from "@/components/entry/ReviewCard";
import type { Json } from "@/types/database";

interface Props {
  params: Promise<{ tripId: string; entryId: string }>;
}

interface RankingDataEntry {
  entry_id?: string;
  id?: string;
  rank?: number;
  score?: number;
  verdict?: string;
}

function extractAiVerdict(
  rankingData: Json,
  entryId: string,
): { rank: number | null; verdict: string | null } {
  if (!rankingData || !Array.isArray(rankingData)) {
    return { rank: null, verdict: null };
  }

  const found = rankingData.find((item: unknown) => {
    const entry = item as RankingDataEntry;
    return entry?.entry_id === entryId || entry?.id === entryId;
  });

  if (!found) return { rank: null, verdict: null };
  const entry = found as RankingDataEntry;
  return {
    rank: entry.rank ?? null,
    verdict: entry.verdict ?? null,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { entryId } = await params;

  const { data: entry } = await anonClient
    .from("food_entries")
    .select(
      `
      title,
      restaurant_name,
      food_photos(photo_url, display_order),
      trips!trip_id(name, is_public)
    `,
    )
    .eq("id", entryId)
    .single();

  if (!entry) return {};

  const trip = entry.trips as { name: string; is_public: boolean } | null;
  if (!trip?.is_public) return {};

  const photos = entry.food_photos as
    | { photo_url: string; display_order: number | null }[]
    | null;
  const firstPhoto = photos?.sort(
    (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0),
  )[0];

  return {
    title: `${entry.title} — ${trip.name}`,
    description: entry.restaurant_name
      ? `${entry.title} at ${entry.restaurant_name}`
      : entry.title,
    openGraph: {
      title: `${entry.title} — ${trip.name}`,
      description: entry.restaurant_name
        ? `${entry.title} at ${entry.restaurant_name}`
        : entry.title,
      images: firstPhoto
        ? [{ url: firstPhoto.photo_url }]
        : [{ url: "/og-image.png" }],
    },
  };
}

export default async function EntryDetailPage({ params }: Props) {
  const { tripId, entryId } = await params;

  // Entry + photos + tags + creator profile + trip public check
  const { data: entry } = await anonClient
    .from("food_entries")
    .select(
      `
      *,
      food_photos(photo_url, display_order),
      food_entry_tags(tag_id, tags(name, category)),
      profiles!created_by(display_name, avatar_url),
      trips!trip_id(id, name, is_public)
    `,
    )
    .eq("id", entryId)
    .single();

  const trip = entry?.trips as {
    id: string;
    name: string;
    is_public: boolean;
  } | null;

  if (!entry || !trip?.is_public) {
    notFound();
  }

  // Avg score from view
  const { data: avgScoreData } = await anonClient
    .from("v_entry_avg_scores")
    .select("avg_score, rating_count")
    .eq("entry_id", entryId)
    .single();

  // Ratings (reviews) with profile
  const { data: ratings } = await anonClient
    .from("ratings")
    .select("*, profiles!user_id(display_name, avatar_url)")
    .eq("entry_id", entryId)
    .order("created_at", { ascending: false });

  // AI ranking (trip-level)
  const { data: aiRanking } = await anonClient
    .from("ai_rankings")
    .select("ranking_data, reasoning")
    .eq("trip_id", entry.trip_id)
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const aiVerdict = aiRanking
    ? extractAiVerdict(aiRanking.ranking_data, entryId)
    : { rank: null, verdict: null };

  const photos =
    (entry.food_photos as
      | { photo_url: string; display_order: number | null }[]
      | null) ?? [];
  const tags =
    (
      entry.food_entry_tags as
        | { tag_id: string; tags: { name: string; category: string } | null }[]
        | null
    )
      ?.map((t) => t.tags)
      .filter((t): t is { name: string; category: string } => t !== null) ?? [];
  const profile = entry.profiles as {
    display_name: string | null;
    avatar_url: string | null;
  } | null;

  const avgScore = avgScoreData?.avg_score ?? null;
  const ratingCount = avgScoreData?.rating_count ?? 0;

  // Google Maps link for location
  const mapsUrl =
    entry.latitude && entry.longitude
      ? `https://maps.google.com/?q=${entry.latitude},${entry.longitude}`
      : entry.location_name
        ? `https://maps.google.com/?q=${encodeURIComponent(entry.location_name)}`
        : null;

  return (
    <div className="mx-auto w-full max-w-md min-h-screen pb-32">
      {/* Back button */}
      <div className="absolute top-12 left-4 z-10">
        <Link
          href={`/trips/${tripId}`}
          prefetch={false}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-black/30 backdrop-blur-md"
        >
          <span className="material-icons-round text-white">arrow_back</span>
        </Link>
      </div>

      {/* Photo carousel */}
      <PhotoCarousel photos={photos} title={entry.title} showShareButton={true} />

      {/* Entry header */}
      <EntryDetailHeader
        title={entry.title}
        restaurantName={entry.restaurant_name}
        location={entry.location_name}
        avgScore={avgScore ? Number(avgScore) : null}
        ratingCount={Number(ratingCount)}
        tags={tags}
        creatorName={profile?.display_name ?? null}
        creatorAvatar={profile?.avatar_url ?? null}
      />

      {/* Map button */}
      {mapsUrl && (
        <div className="px-6 mb-4">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-primary font-medium"
          >
            <span className="material-icons-round text-base">map</span>
            View on Google Maps
          </a>
        </div>
      )}

      {/* AI Verdict section */}
      {aiVerdict.verdict && (
        <div className="px-6 mb-6">
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-[2rem] border border-primary/10">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-icons-round text-primary">
                auto_awesome
              </span>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wide">
                AI Verdict
              </h3>
              {aiVerdict.rank && (
                <span className="ml-auto text-xs font-bold text-primary">
                  #{aiVerdict.rank}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {aiVerdict.verdict}
            </p>
            {aiRanking?.reasoning && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                {aiRanking.reasoning}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Reviews section */}
      <div className="px-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Reviews
        </h2>

        {ratings && ratings.length > 0 ? (
          <div className="flex flex-col gap-3">
            {ratings.map((rating) => {
              const ratingProfile = rating.profiles as {
                display_name: string | null;
                avatar_url: string | null;
              } | null;
              return (
                <ReviewCard
                  key={rating.id}
                  displayName={ratingProfile?.display_name ?? null}
                  avatarUrl={ratingProfile?.avatar_url ?? null}
                  score={rating.score}
                  comment={rating.review_text ?? null}
                  createdAt={rating.created_at ?? new Date().toISOString()}
                />
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center py-10 text-center">
            <span className="material-icons-round text-4xl text-gray-300 dark:text-gray-600 mb-2">
              rate_review
            </span>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No reviews yet
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Be the first to leave a review
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
