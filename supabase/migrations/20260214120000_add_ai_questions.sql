-- ============================================================
-- AI Follow-up Questions & Responses
-- Tables → Indexes → RLS
-- ============================================================


-- ═══════════════════════════════════════════════════════════
-- TABLES
-- ═══════════════════════════════════════════════════════════

-- ─── ai_questions ─────────────────────────────────────────
CREATE TABLE public.ai_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_id UUID NOT NULL REFERENCES public.food_entries(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL CHECK (question_type IN ('scale', 'text', 'choice')),
    options JSONB,
    question_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_questions_entry ON public.ai_questions(entry_id);

-- ─── ai_responses ─────────────────────────────────────────
CREATE TABLE public.ai_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.ai_questions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    response_text TEXT,
    response_value INT CHECK (response_value IS NULL OR (response_value >= 1 AND response_value <= 5)),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(question_id, user_id)
);

CREATE INDEX idx_ai_responses_question ON public.ai_responses(question_id);
CREATE INDEX idx_ai_responses_user ON public.ai_responses(user_id);


-- ═══════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════

-- ─── ai_questions RLS ─────────────────────────────────────
ALTER TABLE public.ai_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public trip questions visible"
    ON public.ai_questions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.food_entries fe
            JOIN public.trips t ON t.id = fe.trip_id
            WHERE fe.id = entry_id AND t.is_public = TRUE
        )
    );

CREATE POLICY "Members can view private questions"
    ON public.ai_questions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.food_entries fe
            WHERE fe.id = entry_id AND is_trip_member(fe.trip_id)
        )
    );

CREATE POLICY "Editors can create questions"
    ON public.ai_questions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.food_entries fe
            WHERE fe.id = entry_id AND is_trip_editor(fe.trip_id)
        )
    );

-- ─── ai_responses RLS ────────────────────────────────────
ALTER TABLE public.ai_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public trip responses visible"
    ON public.ai_responses FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.ai_questions aq
            JOIN public.food_entries fe ON fe.id = aq.entry_id
            JOIN public.trips t ON t.id = fe.trip_id
            WHERE aq.id = question_id AND t.is_public = TRUE
        )
    );

CREATE POLICY "Members can view private responses"
    ON public.ai_responses FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.ai_questions aq
            JOIN public.food_entries fe ON fe.id = aq.entry_id
            WHERE aq.id = question_id AND is_trip_member(fe.trip_id)
        )
    );

CREATE POLICY "Editors can respond"
    ON public.ai_responses FOR INSERT
    WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.ai_questions aq
            JOIN public.food_entries fe ON fe.id = aq.entry_id
            WHERE aq.id = question_id AND is_trip_editor(fe.trip_id)
        )
    );

CREATE POLICY "Users can update own responses"
    ON public.ai_responses FOR UPDATE
    USING (auth.uid() = user_id);
