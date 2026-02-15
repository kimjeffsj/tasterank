import type { MetadataRoute } from "next";
import { anonClient } from "@/lib/supabase/anon";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const { data: trips } = await anonClient
    .from("trips")
    .select("id, updated_at")
    .eq("is_public", true);

  const tripEntries = (trips ?? []).flatMap((trip) => [
    {
      url: `${baseUrl}/trips/${trip.id}`,
      lastModified: trip.updated_at ?? undefined,
    },
    {
      url: `${baseUrl}/trips/${trip.id}/ranking`,
      lastModified: trip.updated_at ?? undefined,
    },
  ]);

  return [{ url: baseUrl, lastModified: new Date() }, ...tripEntries];
}
