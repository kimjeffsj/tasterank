import { after } from "next/server";
import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/route";
import { getModel } from "@/lib/ai/client";
import { buildCoverImagePrompt, parseCoverImageKeywords } from "@/lib/ai/prompts";
import { searchPhotos } from "@/lib/unsplash";

export async function POST(request: Request) {
  // 1. Auth check
  const supabase = await createRouteClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse body
  const body = await request.json().catch(() => null);
  if (!body?.tripId) {
    return NextResponse.json({ error: "tripId is required" }, { status: 400 });
  }

  const { tripId } = body as { tripId: string };

  // 3. Authorization: verify current user is a member of the trip
  const { data: membership } = await supabase
    .from("trip_members")
    .select("id")
    .eq("trip_id", tripId)
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 4. Return 202 immediately
  after(async () => {
    try {
      // a. Fetch trip details
      const { data: trip } = await supabase
        .from("trips")
        .select("name, description, cover_image_url")
        .eq("id", tripId)
        .single();

      if (!trip) return;

      // b. Skip if cover image already exists
      if (trip.cover_image_url) return;

      // c. Generate keywords with Gemini
      const model = getModel();
      const prompt = buildCoverImagePrompt({
        name: trip.name,
        description: trip.description ?? undefined,
      });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      let keywords = parseCoverImageKeywords(text);

      // d. Fallback to trip name if keywords are empty
      if (!keywords) {
        keywords = trip.name;
      }

      // e. Search Unsplash for a photo
      const photo = await searchPhotos(keywords);

      // f. Update cover_image_url if photo found
      if (photo) {
        await supabase
          .from("trips")
          .update({ cover_image_url: photo.url })
          .eq("id", tripId);
      }
    } catch (error) {
      console.error("[generate-trip-cover] Background job failed:", error);
    }
  });

  return NextResponse.json(
    { message: "Cover image generation started" },
    { status: 202 },
  );
}
