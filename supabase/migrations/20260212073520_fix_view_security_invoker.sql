-- Fix views to use SECURITY INVOKER so RLS policies are respected
ALTER VIEW public.v_entry_avg_scores SET (security_invoker = on);
ALTER VIEW public.v_trip_rankings SET (security_invoker = on);
