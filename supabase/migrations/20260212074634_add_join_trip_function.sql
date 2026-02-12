-- Join a trip by invite code: adds authenticated user as editor
-- Bypasses trip_members INSERT RLS (which requires owner)
CREATE OR REPLACE FUNCTION public.join_trip_by_invite(p_invite_code TEXT)
RETURNS public.trips AS $$
DECLARE
    found_trip public.trips;
BEGIN
    -- Find trip by invite code
    SELECT * INTO found_trip
    FROM public.trips
    WHERE invite_code = p_invite_code;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid invite code';
    END IF;

    -- Check if already a member
    IF EXISTS (
        SELECT 1 FROM public.trip_members
        WHERE trip_id = found_trip.id AND user_id = auth.uid()
    ) THEN
        -- Already a member, just return the trip
        RETURN found_trip;
    END IF;

    -- Add as editor
    INSERT INTO public.trip_members (trip_id, user_id, role)
    VALUES (found_trip.id, auth.uid(), 'editor');

    RETURN found_trip;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
