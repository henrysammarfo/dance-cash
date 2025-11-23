-- Add website column to artists table
ALTER TABLE public.artists 
ADD COLUMN IF NOT EXISTS website TEXT;
