-- ============================================================
-- RPC: upsert_ai_ranking
-- SECURITY DEFINER so that the cron endpoint can write
-- ai_rankings via the anon key (no service-role key needed).
-- ============================================================

CREATE OR REPLACE FUNCTION public.upsert_ai_ranking(
  p_trip_id UUID,
  p_ranking_data JSONB,
  p_weights_used JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow for public trips (safety check)
  IF NOT EXISTS (
    SELECT 1 FROM public.trips WHERE id = p_trip_id AND is_public = TRUE
  ) THEN
    RAISE EXCEPTION 'Trip not found or not public';
  END IF;

  DELETE FROM public.ai_rankings WHERE trip_id = p_trip_id;

  INSERT INTO public.ai_rankings (trip_id, ranking_data, weights_used)
  VALUES (p_trip_id, p_ranking_data, p_weights_used);
END;
$$;
