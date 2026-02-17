import type { Metadata } from "next";
import { anonClient } from "@/lib/supabase/anon";
import { notFound } from "next/navigation";
import type { RankedEntry } from "@/components/ranking/RankingList";
import { RankingPageClient } from "@/components/ranking/RankingPageClient";

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
    title: `${trip.name} Rankings`,
    description: trip.description ?? `Food rankings from ${trip.name}`,
    openGraph: {
      title: `${trip.name} Rankings`,
      description: trip.description ?? `Food rankings from ${trip.name}`,
      images: trip.cover_image_url
        ? [{ url: trip.cover_image_url }]
        : [{ url: "/og-image.png" }],
    },
  };
}

export default async function RankingPage({ params }: Props) {
  const { tripId } = await params;

  // Fetch trip info
  const { data: trip } = await anonClient
    .from("trips")
    .select("id, name")
    .eq("id", tripId)
    .eq("is_public", true)
    .single();

  if (!trip) {
    notFound();
  }

  // Fetch rankings from view
  const { data: rankings } = await anonClient
    .from("v_trip_rankings")
    .select("*")
    .eq("trip_id", tripId)
    .order("rank", { ascending: true });

  // Fetch photos for all ranked entries
  const entryIds = (rankings ?? [])
    .map((r) => r.entry_id)
    .filter(Boolean) as string[];

  const { data: photos } =
    entryIds.length > 0
      ? await anonClient
          .from("food_photos")
          .select("entry_id, photo_url, display_order")
          .in("entry_id", entryIds)
          .order("display_order", { ascending: true })
      : { data: [] };

  // Fetch tags for all ranked entries
  const { data: entryTags } =
    entryIds.length > 0
      ? await anonClient
          .from("food_entry_tags")
          .select("entry_id, tags(id, name, category)")
          .in("entry_id", entryIds)
      : { data: [] };

  // Build a map: entry_id -> first photo url
  const photoMap = new Map<string, string>();
  for (const photo of photos ?? []) {
    if (!photoMap.has(photo.entry_id)) {
      photoMap.set(photo.entry_id, photo.photo_url);
    }
  }

  // Build a map: entry_id -> tags
  const tagMap = new Map<
    string,
    { id: string; name: string; category: string | null }[]
  >();
  for (const et of entryTags ?? []) {
    if (!et.tags) continue;
    const tag = et.tags as unknown as {
      id: string;
      name: string;
      category: string | null;
    };
    const existing = tagMap.get(et.entry_id) ?? [];
    existing.push(tag);
    tagMap.set(et.entry_id, existing);
  }

  // Fetch AI ranking (latest)
  const { data: aiRankings } = await anonClient
    .from("ai_rankings")
    .select("ranking_data, generated_at")
    .eq("trip_id", tripId)
    .order("generated_at", { ascending: false })
    .limit(1);

  const aiRanking = aiRankings?.[0] ?? null;
  const aiRankingData =
    (aiRanking?.ranking_data as Array<{
      entry_id: string;
      composite_score: number;
      ai_comment: string;
      breakdown: {
        user_score: number;
        tournament: number;
        ai_questions: number;
        sentiment: number;
      };
    }>) ?? [];

  // Build AI data map
  const aiDataMap = new Map<
    string,
    {
      composite_score: number;
      ai_comment: string;
      breakdown: {
        user_score: number;
        tournament: number;
        ai_questions: number;
        sentiment: number;
      };
    }
  >();
  for (const item of aiRankingData) {
    aiDataMap.set(item.entry_id, {
      composite_score: item.composite_score,
      ai_comment: item.ai_comment,
      breakdown: item.breakdown,
    });
  }

  // Combine into RankedEntry[]
  const rankedEntries: RankedEntry[] = (rankings ?? []).map((r) => ({
    entry_id: r.entry_id!,
    title: r.title ?? "Untitled",
    restaurant_name: r.restaurant_name ?? null,
    rank: r.rank ?? 0,
    avg_score: r.avg_score !== null ? Math.round(r.avg_score! * 10) / 10 : null,
    rating_count: r.rating_count ?? 0,
    photo_url: photoMap.get(r.entry_id!) ?? null,
    tags: tagMap.get(r.entry_id!) ?? [],
    composite_score: aiDataMap.get(r.entry_id!)?.composite_score ?? null,
    ai_comment: aiDataMap.get(r.entry_id!)?.ai_comment ?? null,
    breakdown: aiDataMap.get(r.entry_id!)?.breakdown ?? null,
  }));

  return (
    <div className="mx-auto w-full max-w-md min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md px-6 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <a
            href={`/trips/${tripId}`}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10"
          >
            <span className="material-icons-round">arrow_back</span>
          </a>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold truncate dark:text-white">
              {trip.name}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Rankings</p>
          </div>
          <span className="material-icons-round text-2xl text-primary">
            emoji_events
          </span>
        </div>
      </div>

      {/* Client-side ranking view */}
      <RankingPageClient
        tripId={tripId}
        tripName={trip.name}
        entries={rankedEntries}
        hasAiRanking={!!aiRanking}
        aiGeneratedAt={aiRanking?.generated_at ?? null}
      />
    </div>
  );
}
