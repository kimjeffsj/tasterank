-- Atomic trip creation: inserts trip + adds creator as owner member
-- Solves chicken-and-egg RLS problem (trip_members INSERT requires is_trip_owner)
CREATE OR REPLACE FUNCTION public.create_trip(
    p_name TEXT,
    p_description TEXT DEFAULT NULL,
    p_is_public BOOLEAN DEFAULT TRUE,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
) RETURNS public.trips AS $$
DECLARE
    new_trip public.trips;
BEGIN
    INSERT INTO public.trips (name, description, is_public, start_date, end_date, owner_id)
    VALUES (p_name, p_description, p_is_public, p_start_date, p_end_date, auth.uid())
    RETURNING * INTO new_trip;

    INSERT INTO public.trip_members (trip_id, user_id, role)
    VALUES (new_trip.id, auth.uid(), 'owner');

    RETURN new_trip;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
