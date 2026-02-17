-- ============================================================
-- AI Composite Rankings
-- Table → Index → RLS
-- ============================================================

CREATE TABLE public.ai_rankings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    ranking_data JSONB NOT NULL,
    reasoning TEXT,
    weights_used JSONB DEFAULT '{"user_score":0.4,"tournament":0.25,"ai_questions":0.2,"sentiment":0.15}',
    generated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_rankings_trip ON public.ai_rankings(trip_id);

-- RLS
ALTER TABLE public.ai_rankings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public rankings visible" ON public.ai_rankings
    FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND t.is_public = TRUE));

CREATE POLICY "Members can view private rankings" ON public.ai_rankings
    FOR SELECT
    USING (is_trip_member(trip_id));

CREATE POLICY "Editors can generate rankings" ON public.ai_rankings
    FOR INSERT
    WITH CHECK (is_trip_editor(trip_id));

CREATE POLICY "Editors can delete rankings" ON public.ai_rankings
    FOR DELETE
    USING (is_trip_editor(trip_id));
