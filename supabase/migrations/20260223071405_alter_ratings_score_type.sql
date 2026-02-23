-- Update the view to reflect the new type (though it might not be strictly necessary, it's good practice to recreate views when underlying columns change)
DROP VIEW IF EXISTS public.v_trip_rankings;
DROP VIEW IF EXISTS public.v_entry_avg_scores;

-- Change score column type from INT to NUMERIC(3,1) to support decimal ratings like 6.5
ALTER TABLE public.ratings
  ALTER COLUMN score TYPE NUMERIC(3,1) USING score::NUMERIC(3,1);

CREATE OR REPLACE VIEW public.v_entry_avg_scores WITH (security_invoker = on) AS
SELECT
    fe.id AS entry_id, fe.trip_id, fe.title, fe.restaurant_name,
    COUNT(r.id) AS rating_count,
    ROUND(AVG(r.score)::NUMERIC, 1) AS avg_score,
    MIN(r.score) AS min_score,
    MAX(r.score) AS max_score
FROM public.food_entries fe
LEFT JOIN public.ratings r ON r.entry_id = fe.id
GROUP BY fe.id, fe.trip_id, fe.title, fe.restaurant_name;

CREATE OR REPLACE VIEW public.v_trip_rankings WITH (security_invoker = on) AS
SELECT v.*,
    RANK() OVER (PARTITION BY v.trip_id ORDER BY v.avg_score DESC NULLS LAST) AS rank
FROM public.v_entry_avg_scores v;
