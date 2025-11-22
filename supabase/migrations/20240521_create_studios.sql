-- Create studios table
CREATE TABLE IF NOT EXISTS public.studios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    bch_address TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.studios ENABLE ROW LEVEL SECURITY;

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
CREATE POLICY "Anyone can create studio"
    ON public.studios
    FOR INSERT
    WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS studios_email_idx ON public.studios(email);
