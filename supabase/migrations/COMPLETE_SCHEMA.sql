-- COMPLETE DATABASE SCHEMA FOR DANCE.CASH
-- This creates all tables with correct schemas matching the documentation
-- Run this in Supabase SQL Editor

-- ============================================
-- TABLE 1: STUDIOS (Fixed - No password_hash)
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

CREATE POLICY "Enable insert for registration"
    ON public.studios FOR INSERT WITH CHECK (true);

CREATE POLICY "Studios can view own data"
    ON public.studios FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Studios can update own data"
    ON public.studios FOR UPDATE USING (auth.uid() = id);

CREATE INDEX studios_email_idx ON public.studios(email);

-- ============================================
-- TABLE 2: ARTISTS (Must be created before events)
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

CREATE POLICY "Artists are viewable by everyone"
    ON public.artists FOR SELECT USING (true);

CREATE POLICY "Studios can manage own artists"
    ON public.artists FOR ALL USING (auth.uid() = studio_id);

CREATE INDEX idx_artists_studio_id ON public.artists(studio_id);

-- ============================================
-- TABLE 3: EVENTS
-- ============================================
DROP TABLE IF EXISTS public.events CASCADE;

CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time TIME NOT NULL,
    location VARCHAR(255),
    style VARCHAR(100),
    teacher VARCHAR(255),
    banner_url TEXT,
    price_usd DECIMAL(10, 2),
    capacity INT,
    recurring BOOLEAN DEFAULT FALSE,
    recurring_pattern VARCHAR(50),
    artist_id UUID REFERENCES artists(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events are viewable by everyone"
    ON public.events FOR SELECT USING (true);

CREATE POLICY "Studios can insert own events"
    ON public.events FOR INSERT WITH CHECK (auth.uid() = studio_id);

CREATE POLICY "Studios can update own events"
    ON public.events FOR UPDATE USING (auth.uid() = studio_id);

CREATE POLICY "Studios can delete own events"
    ON public.events FOR DELETE USING (auth.uid() = studio_id);

CREATE INDEX idx_events_studio_id ON public.events(studio_id);
CREATE INDEX idx_events_date ON public.events(date);
CREATE INDEX idx_events_artist_id ON public.events(artist_id);

-- ============================================
-- TABLE 4: SIGNUPS
-- ============================================
DROP TABLE IF EXISTS public.signups CASCADE;

CREATE TABLE public.signups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
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

CREATE POLICY "Anyone can create signup"
    ON public.signups FOR INSERT WITH CHECK (true);

CREATE POLICY "Signups viewable by event studio"
    ON public.signups FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM events e
            WHERE e.id = event_id AND e.studio_id = auth.uid()
        )
    );

CREATE INDEX idx_signups_event_id ON public.signups(event_id);
CREATE INDEX idx_signups_email ON public.signups(attendee_email);

-- ============================================
-- TABLE 5: PAYMENT_ADDRESSES
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

CREATE POLICY "Anyone can view payment addresses"
    ON public.payment_addresses FOR SELECT USING (true);

CREATE POLICY "System can create payment addresses"
    ON public.payment_addresses FOR INSERT WITH CHECK (true);

CREATE INDEX idx_payment_addresses_signup_id ON public.payment_addresses(signup_id);
CREATE INDEX idx_payment_addresses_address ON public.payment_addresses(address);

-- ============================================
-- TABLE 6: CASHTAMPS
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

CREATE POLICY "Anyone can view cashtamps"
    ON public.cashtamps FOR SELECT USING (true);

CREATE POLICY "System can create cashtamps"
    ON public.cashtamps FOR INSERT WITH CHECK (true);

CREATE INDEX idx_cashtamps_signup_id ON public.cashtamps(signup_id);

-- ============================================
-- DONE! All tables created with correct schema
-- ============================================
