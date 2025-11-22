-- FIX: Drop the old studios table and recreate with correct schema
-- This aligns with Supabase Auth (no password_hash column needed)

-- Step 1: Drop existing table (WARNING: This will delete all studio data!)
DROP TABLE IF EXISTS public.studios CASCADE;

-- Step 2: Create studios table with correct schema
CREATE TABLE public.studios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    bch_address TEXT NOT NULL,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Enable Row Level Security
ALTER TABLE public.studios ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS Policies
-- Policy: Studios can read their own data
CREATE POLICY "Studios can view own data"
    ON public.studios
    FOR SELECT
    USING (auth.uid() = id);

-- Policy: Studios can update their own data
CREATE POLICY "Studios can update own data"
    ON public.studios
    FOR UPDATE
    USING (auth.uid() = id);

-- Policy: Anyone can insert (for registration)
CREATE POLICY "Enable insert for registration"
    ON public.studios
    FOR INSERT
    WITH CHECK (true);

-- Step 5: Create index for faster lookups
CREATE INDEX IF NOT EXISTS studios_email_idx ON public.studios(email);

-- Done! Studios table now works with Supabase Auth
