-- ============================================================
-- TasteRank Initial Schema
-- Phase 1: Core tables, RLS, helper functions, views, storage
-- Order: Tables → Functions → RLS → Views → Storage
-- ============================================================


-- ═══════════════════════════════════════════════════════════
-- PART 1: TABLES
-- ═══════════════════════════════════════════════════════════

-- ─── 1. profiles ────────────────────────────────────────────

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on Google OAuth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, display_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'preferred_username', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── 2. trips ───────────────────────────────────────────────

CREATE TABLE public.trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    invite_code TEXT UNIQUE DEFAULT substr(md5(random()::text), 1, 8),
    is_public BOOLEAN DEFAULT TRUE,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trips_owner ON public.trips(owner_id);
CREATE INDEX idx_trips_invite_code ON public.trips(invite_code);
CREATE INDEX idx_trips_public ON public.trips(is_public) WHERE is_public = TRUE;

-- ─── 3. trip_members ────────────────────────────────────────

CREATE TABLE public.trip_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('owner', 'editor')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(trip_id, user_id)
);

CREATE INDEX idx_trip_members_trip ON public.trip_members(trip_id);
CREATE INDEX idx_trip_members_user ON public.trip_members(user_id);

-- ─── 4. food_entries ────────────────────────────────────────

CREATE TABLE public.food_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    title TEXT NOT NULL,
    description TEXT,
    restaurant_name TEXT,
    location_name TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    visited_at DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_food_entries_trip ON public.food_entries(trip_id);

-- ─── 5. food_photos ─────────────────────────────────────────

CREATE TABLE public.food_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_id UUID NOT NULL REFERENCES public.food_entries(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    display_order INT DEFAULT 0,
    uploaded_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_food_photos_entry ON public.food_photos(entry_id);

-- ─── 6. tags + food_entry_tags ──────────────────────────────

CREATE TABLE public.tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    category TEXT DEFAULT 'general' CHECK (category IN ('cuisine', 'flavor', 'style', 'general')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.food_entry_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_id UUID NOT NULL REFERENCES public.food_entries(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    is_ai_suggested BOOLEAN DEFAULT FALSE,
    UNIQUE(entry_id, tag_id)
);

CREATE INDEX idx_food_entry_tags_entry ON public.food_entry_tags(entry_id);

-- ─── 7. ratings ─────────────────────────────────────────────

CREATE TABLE public.ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_id UUID NOT NULL REFERENCES public.food_entries(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id),
    score INT NOT NULL CHECK (score >= 1 AND score <= 10),
    review_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(entry_id, user_id)
);

CREATE INDEX idx_ratings_entry ON public.ratings(entry_id);


-- ═══════════════════════════════════════════════════════════
-- PART 2: HELPER FUNCTIONS (require trip_members to exist)
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.is_trip_member(trip_uuid UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.trip_members
        WHERE trip_id = trip_uuid AND user_id = auth.uid()
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_trip_editor(trip_uuid UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.trip_members
        WHERE trip_id = trip_uuid
          AND user_id = auth.uid()
          AND role IN ('owner', 'editor')
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_trip_owner(trip_uuid UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.trip_members
        WHERE trip_id = trip_uuid
          AND user_id = auth.uid()
          AND role = 'owner'
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;


-- ═══════════════════════════════════════════════════════════
-- PART 3: ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════

-- ─── profiles RLS ───────────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are publicly readable"
    ON public.profiles FOR SELECT USING (TRUE);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ─── trips RLS ──────────────────────────────────────────────

ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public trips visible to everyone"
    ON public.trips FOR SELECT USING (is_public = TRUE);

CREATE POLICY "Members can view private trips"
    ON public.trips FOR SELECT USING (is_trip_member(id));

CREATE POLICY "Auth users can create trips"
    ON public.trips FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = owner_id);

CREATE POLICY "Owner can update trips"
    ON public.trips FOR UPDATE USING (is_trip_owner(id));

CREATE POLICY "Owner can delete trips"
    ON public.trips FOR DELETE USING (is_trip_owner(id));

-- ─── trip_members RLS ───────────────────────────────────────

ALTER TABLE public.trip_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members visible in public trips"
    ON public.trip_members FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND t.is_public = TRUE)
    );

CREATE POLICY "Members can view co-members"
    ON public.trip_members FOR SELECT
    USING (is_trip_member(trip_id));

CREATE POLICY "Owner can manage members"
    ON public.trip_members FOR INSERT
    WITH CHECK (is_trip_owner(trip_id));

CREATE POLICY "Owner can remove members"
    ON public.trip_members FOR DELETE
    USING (is_trip_owner(trip_id) OR auth.uid() = user_id);

-- ─── food_entries RLS ───────────────────────────────────────

ALTER TABLE public.food_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public trip entries visible to everyone"
    ON public.food_entries FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND t.is_public = TRUE)
    );

CREATE POLICY "Members can view private entries"
    ON public.food_entries FOR SELECT
    USING (is_trip_member(trip_id));

CREATE POLICY "Editors can create entries"
    ON public.food_entries FOR INSERT
    WITH CHECK (is_trip_editor(trip_id) AND auth.uid() = created_by);

CREATE POLICY "Creator can update entries"
    ON public.food_entries FOR UPDATE
    USING (auth.uid() = created_by);

CREATE POLICY "Creator or owner can delete entries"
    ON public.food_entries FOR DELETE
    USING (auth.uid() = created_by OR is_trip_owner(trip_id));

-- ─── food_photos RLS ────────────────────────────────────────

ALTER TABLE public.food_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public photos visible"
    ON public.food_photos FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.food_entries fe
            JOIN public.trips t ON t.id = fe.trip_id
            WHERE fe.id = entry_id AND t.is_public = TRUE
        )
    );

CREATE POLICY "Members view private photos"
    ON public.food_photos FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.food_entries fe
            WHERE fe.id = entry_id AND is_trip_member(fe.trip_id)
        )
    );

CREATE POLICY "Editors can upload photos"
    ON public.food_photos FOR INSERT
    WITH CHECK (
        auth.uid() = uploaded_by AND
        EXISTS (
            SELECT 1 FROM public.food_entries fe
            WHERE fe.id = entry_id AND is_trip_editor(fe.trip_id)
        )
    );

-- ─── tags RLS ───────────────────────────────────────────────

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tags are public" ON public.tags FOR SELECT USING (TRUE);
CREATE POLICY "Auth users can create tags" ON public.tags FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ─── food_entry_tags RLS ────────────────────────────────────

ALTER TABLE public.food_entry_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Entry tags visible with entries"
    ON public.food_entry_tags FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.food_entries fe
            JOIN public.trips t ON t.id = fe.trip_id
            WHERE fe.id = entry_id AND (t.is_public = TRUE OR is_trip_member(fe.trip_id))
        )
    );

CREATE POLICY "Editors can tag entries"
    ON public.food_entry_tags FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.food_entries fe
            WHERE fe.id = entry_id AND is_trip_editor(fe.trip_id)
        )
    );

CREATE POLICY "Editors can remove tags"
    ON public.food_entry_tags FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.food_entries fe
            WHERE fe.id = entry_id AND is_trip_editor(fe.trip_id)
        )
    );

-- ─── ratings RLS ────────────────────────────────────────────

ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public trip ratings visible"
    ON public.ratings FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.food_entries fe
            JOIN public.trips t ON t.id = fe.trip_id
            WHERE fe.id = entry_id AND t.is_public = TRUE
        )
    );

CREATE POLICY "Members can view private ratings"
    ON public.ratings FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.food_entries fe
            WHERE fe.id = entry_id AND is_trip_member(fe.trip_id)
        )
    );

CREATE POLICY "Editors can rate"
    ON public.ratings FOR INSERT
    WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.food_entries fe
            WHERE fe.id = entry_id AND is_trip_editor(fe.trip_id)
        )
    );

CREATE POLICY "Users can update own ratings"
    ON public.ratings FOR UPDATE
    USING (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════════
-- PART 4: VIEWS
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW public.v_entry_avg_scores AS
SELECT
    fe.id AS entry_id, fe.trip_id, fe.title, fe.restaurant_name,
    COUNT(r.id) AS rating_count,
    ROUND(AVG(r.score)::NUMERIC, 1) AS avg_score,
    MIN(r.score) AS min_score,
    MAX(r.score) AS max_score
FROM public.food_entries fe
LEFT JOIN public.ratings r ON r.entry_id = fe.id
GROUP BY fe.id, fe.trip_id, fe.title, fe.restaurant_name;

CREATE OR REPLACE VIEW public.v_trip_rankings AS
SELECT v.*,
    RANK() OVER (PARTITION BY v.trip_id ORDER BY v.avg_score DESC NULLS LAST) AS rank
FROM public.v_entry_avg_scores v;


-- ═══════════════════════════════════════════════════════════
-- PART 5: STORAGE BUCKETS
-- ═══════════════════════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public) VALUES ('food-photos', 'food-photos', TRUE);
INSERT INTO storage.buckets (id, name, public) VALUES ('trip-covers', 'trip-covers', TRUE);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', TRUE);

CREATE POLICY "Auth upload" ON storage.objects FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Public read" ON storage.objects FOR SELECT
    USING (bucket_id IN ('food-photos', 'trip-covers', 'avatars'));
