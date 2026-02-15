import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/route";
import { getModel } from "@/lib/ai/client";
import {
  buildFollowUpPrompt,
  parseFollowUpQuestions,
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
  if (!body?.entryId || !body?.title) {
    return NextResponse.json(
      { error: "entryId and title are required" },
      { status: 400 },
    );
  }

  try {
    const model = getModel();
    const prompt = buildFollowUpPrompt({
      title: body.title,
      restaurantName: body.restaurantName,
      tags: body.tags,
      score: body.score,
      description: body.description,
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const questions = parseFollowUpQuestions(text);

    if (questions.length === 0) {
      return NextResponse.json({ questions: [] });
    }

    // Save questions to DB
    const rows = questions.map((q) => ({
      entry_id: body.entryId,
      question_text: q.question_text,
      question_type: q.question_type,
      options: q.options ?? null,
      question_order: q.question_order,
    }));

    const { data: saved, error: dbError } = await supabase
      .from("ai_questions")
      .insert(rows)
      .select();

    if (dbError) {
      return NextResponse.json({ questions: [] });
    }

    return NextResponse.json({ questions: saved });
  } catch {
    // Graceful degradation — AI failure returns empty, not 500
    return NextResponse.json({ questions: [] });
  }
}
