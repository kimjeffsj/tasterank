-- Fix search_path warnings for security definer functions
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.is_trip_member(UUID) SET search_path = public;
ALTER FUNCTION public.is_trip_editor(UUID) SET search_path = public;
ALTER FUNCTION public.is_trip_owner(UUID) SET search_path = public;
