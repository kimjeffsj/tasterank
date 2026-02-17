-- Allow anonymous users to create tournaments on demo trips only.
-- Demo trip IDs are hardcoded for safety — only these two trips allow anon INSERT.

CREATE POLICY "anon_insert_demo_tournaments" ON public.tournaments
    FOR INSERT WITH CHECK (
        -- Only for demo trips
        trip_id IN (
            '00000000-0000-4000-a000-000000000010'::uuid,
            '00000000-0000-4000-a000-000000000020'::uuid
        )
        -- created_by must be the demo user
        AND created_by = '00000000-0000-4000-a000-000000000001'::uuid
    );
