import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/route";
import { getModel } from "@/lib/ai/client";
import {
  buildTagSuggestionPrompt,
  parseTagSuggestions,
} from "@/lib/ai/prompts";

export async function POST(request: Request) {
  // Auth check
  const supabase = await createRouteClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse body
  const body = await request.json().catch(() => null);
  if (!body?.title) {
    return NextResponse.json(
      { error: "title is required" },
      { status: 400 },
    );
  }

  try {
    const model = getModel();
    const prompt = buildTagSuggestionPrompt({
      title: body.title,
      restaurantName: body.restaurantName,
      description: body.description,
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const tags = parseTagSuggestions(text);

    return NextResponse.json({ tags });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate tag suggestions" },
      { status: 500 },
    );
  }
}
