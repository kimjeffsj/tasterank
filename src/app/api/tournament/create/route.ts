import { NextResponse } from "next/server";
import { isDemoTrip, DEMO_USER_ID } from "@/lib/constants";
import { anonClient } from "@/lib/supabase/anon";
import {
  calculateBracketSize,
  seedEntries,
  calculateRounds,
} from "@/lib/tournament/bracket";

export async function POST(request: Request) {
  const body = await request.json();
  const tripId = body?.tripId;

  if (!tripId || typeof tripId !== "string") {
    return NextResponse.json({ error: "tripId is required" }, { status: 400 });
  }

  if (!isDemoTrip(tripId)) {
    return NextResponse.json(
      { error: "Only demo trips support anonymous tournament creation" },
      { status: 403 },
    );
  }

  const supabase = anonClient;

  // Check if active tournament already exists
  const { data: existing } = await supabase
    .from("tournaments")
    .select("id")
    .eq("trip_id", tripId)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "An active tournament already exists for this trip" },
      { status: 409 },
    );
  }

  // Fetch entries
  const { data: entries, error: eErr } = await supabase
    .from("food_entries")
    .select("id")
    .eq("trip_id", tripId);

  if (eErr) {
    return NextResponse.json({ error: eErr.message }, { status: 500 });
  }

  if (!entries || entries.length < 4) {
    return NextResponse.json(
      { error: "Need at least 4 entries to start a tournament" },
      { status: 400 },
    );
  }

  // Fetch avg scores for seeding
  const { data: scores } = await supabase
    .from("v_entry_avg_scores")
    .select("entry_id, avg_score")
    .eq("trip_id", tripId);

  const scoreMap = new Map<string, number>();
  scores?.forEach((s) => {
    if (s.entry_id && s.avg_score != null)
      scoreMap.set(s.entry_id, s.avg_score);
  });

  const seedable = entries.map((e) => ({
    id: e.id,
    avg_score: scoreMap.get(e.id) ?? null,
  }));

  const seeded = seedEntries(seedable);
  const bracketSize = calculateBracketSize(seeded.length);
  const totalRounds = calculateRounds(bracketSize);
  const seedOrder = seeded.map((e) => e.id);

  const { data: t, error: tErr } = await supabase
    .from("tournaments")
    .insert({
      trip_id: tripId,
      created_by: DEMO_USER_ID,
      status: "active",
      total_rounds: totalRounds,
      total_entries: seeded.length,
      bracket_size: bracketSize,
      seed_order: seedOrder,
    })
    .select()
    .single();

  if (tErr) {
    return NextResponse.json({ error: tErr.message }, { status: 500 });
  }

  return NextResponse.json({ tournament: t });
}
