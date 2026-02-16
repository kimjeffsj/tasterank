-- ============================================
-- Tournament tables for Food Tournament feature
-- ============================================

-- tournaments table
CREATE TABLE public.tournaments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed')),
    total_rounds INT NOT NULL,
    total_entries INT NOT NULL,
    bracket_size INT NOT NULL,
    seed_order JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- tournament_votes table
CREATE TABLE public.tournament_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id),
    round_number INT NOT NULL,
    match_order INT NOT NULL,
    entry_a_id UUID NOT NULL REFERENCES public.food_entries(id),
    entry_b_id UUID NOT NULL REFERENCES public.food_entries(id),
    winner_id UUID NOT NULL REFERENCES public.food_entries(id),
    voted_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tournament_id, user_id, round_number, match_order),
    CHECK (winner_id IN (entry_a_id, entry_b_id))
);

-- Aggregated results view
CREATE VIEW public.v_tournament_results AS
SELECT tournament_id, winner_id AS entry_id, COUNT(*) AS total_wins
FROM public.tournament_votes
GROUP BY tournament_id, winner_id;

-- ============================================
-- RLS: tournaments
-- ============================================
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;

-- Public trips: anyone can view tournaments
CREATE POLICY "anon_select_public_tournaments" ON public.tournaments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.trips
            WHERE trips.id = tournaments.trip_id AND trips.is_public = TRUE
        )
    );

-- Members can view tournaments of their trips (including private)
CREATE POLICY "member_select_tournaments" ON public.tournaments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.trip_members
            WHERE trip_members.trip_id = tournaments.trip_id
              AND trip_members.user_id = auth.uid()
        )
    );

-- Editor/owner can create tournaments
CREATE POLICY "editor_insert_tournaments" ON public.tournaments
    FOR INSERT WITH CHECK (
        auth.uid() = created_by
        AND EXISTS (
            SELECT 1 FROM public.trip_members
            WHERE trip_members.trip_id = tournaments.trip_id
              AND trip_members.user_id = auth.uid()
              AND trip_members.role IN ('owner', 'editor')
        )
    );

-- Creator can update their tournament
CREATE POLICY "creator_update_tournaments" ON public.tournaments
    FOR UPDATE USING (auth.uid() = created_by);

-- ============================================
-- RLS: tournament_votes
-- ============================================
ALTER TABLE public.tournament_votes ENABLE ROW LEVEL SECURITY;

-- Public tournament votes: anyone can view
CREATE POLICY "anon_select_public_votes" ON public.tournament_votes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.tournaments t
            JOIN public.trips tr ON tr.id = t.trip_id
            WHERE t.id = tournament_votes.tournament_id AND tr.is_public = TRUE
        )
    );

-- Members can view votes
CREATE POLICY "member_select_votes" ON public.tournament_votes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.tournaments t
            JOIN public.trip_members tm ON tm.trip_id = t.trip_id
            WHERE t.id = tournament_votes.tournament_id
              AND tm.user_id = auth.uid()
        )
    );

-- Members can insert their own votes
CREATE POLICY "member_insert_votes" ON public.tournament_votes
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM public.tournaments t
            JOIN public.trip_members tm ON tm.trip_id = t.trip_id
            WHERE t.id = tournament_votes.tournament_id
              AND tm.user_id = auth.uid()
        )
    );
