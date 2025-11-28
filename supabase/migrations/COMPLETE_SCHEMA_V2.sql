-- COMPLETE DATABASE SCHEMA V2 FOR DANCE.CASH
-- This creates all tables with the LATEST schema matching the critical fixes.
-- Run this in Supabase SQL Editor to set up the database from scratch.

-- ============================================
-- 1. STUDIOS
-- ============================================
DROP TABLE IF EXISTS public.studios CASCADE;

CREATE TABLE public.studios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    bch_address TEXT NOT NULL,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.studios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable insert for registration" ON public.studios FOR INSERT WITH CHECK (true);
CREATE POLICY "Studios can view own data" ON public.studios FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Studios can update own data" ON public.studios FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- 2. ARTISTS
-- ============================================
DROP TABLE IF EXISTS public.artists CASCADE;

CREATE TABLE public.artists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    bio TEXT,
    instagram TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Artists are viewable by everyone" ON public.artists FOR SELECT USING (true);
CREATE POLICY "Studios can manage own artists" ON public.artists FOR ALL USING (auth.uid() = studio_id);

-- ============================================
-- 3. EVENTS (Updated with start_time, end_time)
-- ============================================
DROP TABLE IF EXISTS public.events CASCADE;

CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    start_time TEXT NOT NULL, -- Changed to TEXT for flexibility (HH:MM)
    end_time TEXT NOT NULL,   -- Changed to TEXT for flexibility (HH:MM)
    location VARCHAR(255),
    style VARCHAR(100),
    teacher VARCHAR(255),
    banner_url TEXT,
    price_usd DECIMAL(10, 2),
    capacity INT,
    recurring BOOLEAN DEFAULT FALSE,
    recurring_pattern VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events are viewable by everyone" ON public.events FOR SELECT USING (true);
CREATE POLICY "Studios can insert own events" ON public.events FOR INSERT WITH CHECK (auth.uid() = studio_id);
CREATE POLICY "Studios can update own events" ON public.events FOR UPDATE USING (auth.uid() = studio_id);
CREATE POLICY "Studios can delete own events" ON public.events FOR DELETE USING (auth.uid() = studio_id);

-- ============================================
-- 4. EVENT_ARTISTS (Many-to-Many)
-- ============================================
DROP TABLE IF EXISTS public.event_artists CASCADE;

CREATE TABLE public.event_artists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, artist_id)
);

ALTER TABLE public.event_artists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Event artists are viewable by everyone" ON public.event_artists FOR SELECT USING (true);
CREATE POLICY "Studios can manage event artists" ON public.event_artists FOR ALL USING (
    EXISTS (SELECT 1 FROM events e WHERE e.id = event_artists.event_id AND e.studio_id = auth.uid())
);

-- ============================================
-- 5. SIGNUPS (Updated for persistence)
-- ============================================
DROP TABLE IF EXISTS public.signups CASCADE;

CREATE TABLE public.signups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE SET NULL, -- Nullable for deleted events
    studio_id UUID REFERENCES studios(id) ON DELETE CASCADE, -- Direct link to studio
    event_name VARCHAR(255), -- Persist event name
    attendee_name VARCHAR(255) NOT NULL,
    attendee_phone VARCHAR(20),
    attendee_email VARCHAR(255),
    payment_method VARCHAR(50),
    price_paid_usd DECIMAL(10, 2),
    price_paid_bch DECIMAL(16, 8),
    transaction_id VARCHAR(255),
    nft_txid VARCHAR(255),
    cashtamp_id VARCHAR(255),
    confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create signup" ON public.signups FOR INSERT WITH CHECK (true);
CREATE POLICY "Signups viewable by studio" ON public.signups FOR SELECT USING (
    auth.uid() = studio_id
);

-- ============================================
-- 6. PAYMENT_ADDRESSES
-- ============================================
DROP TABLE IF EXISTS public.payment_addresses CASCADE;

CREATE TABLE public.payment_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    signup_id UUID NOT NULL REFERENCES signups(id) ON DELETE CASCADE,
    address TEXT NOT NULL UNIQUE,
    amount_bch DECIMAL(16, 8) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.payment_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view payment addresses" ON public.payment_addresses FOR SELECT USING (true);
CREATE POLICY "System can create payment addresses" ON public.payment_addresses FOR INSERT WITH CHECK (true);

-- ============================================
-- 7. CASHTAMPS
-- ============================================
DROP TABLE IF EXISTS public.cashtamps CASCADE;

CREATE TABLE public.cashtamps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    signup_id UUID NOT NULL REFERENCES signups(id) ON DELETE CASCADE,
    qr_code_data TEXT NOT NULL,
    amount_bch DECIMAL(16, 8) NOT NULL,
    claimed BOOLEAN DEFAULT FALSE,
    claimed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.cashtamps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view cashtamps" ON public.cashtamps FOR SELECT USING (true);
CREATE POLICY "System can create cashtamps" ON public.cashtamps FOR INSERT WITH CHECK (true);

-- ============================================
-- 8. STORAGE BUCKETS
-- ============================================
-- Note: You usually create these in the Supabase Dashboard, but here is the SQL
INSERT INTO storage.buckets (id, name, public) 
VALUES ('event-banners', 'event-banners', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('artist-images', 'artist-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('studio-logos', 'studio-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id IN ('event-banners', 'artist-images', 'studio-logos') );
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT WITH CHECK ( auth.role() = 'authenticated' );
