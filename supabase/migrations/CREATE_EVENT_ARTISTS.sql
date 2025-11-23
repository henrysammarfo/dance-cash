-- Create event_artists junction table for Many-to-Many relationship
CREATE TABLE public.event_artists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, artist_id) -- Prevent duplicate artist assignments
);

-- Enable RLS
ALTER TABLE public.event_artists ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Event artists are viewable by everyone"
    ON public.event_artists FOR SELECT USING (true);

CREATE POLICY "Studios can manage event artists"
    ON public.event_artists FOR ALL USING (
        EXISTS (
            SELECT 1 FROM events e
            WHERE e.id = event_artists.event_id AND e.studio_id = auth.uid()
        )
    );

-- Migrate existing data: Move artist_id from events table to event_artists table
INSERT INTO public.event_artists (event_id, artist_id)
SELECT id, artist_id
FROM public.events
WHERE artist_id IS NOT NULL;

-- Optional: Drop the old column (commented out for safety, can be done later)
-- ALTER TABLE public.events DROP COLUMN artist_id;
