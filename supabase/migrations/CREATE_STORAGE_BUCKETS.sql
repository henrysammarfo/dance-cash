-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('artist-images', 'artist-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('event-banners', 'event-banners', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Public Read for artist-images
CREATE POLICY "Public Read artist-images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'artist-images' );

-- Policy: Authenticated Upload for artist-images
CREATE POLICY "Authenticated Upload artist-images"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'artist-images' AND auth.role() = 'authenticated' );

-- Policy: Public Read for event-banners
CREATE POLICY "Public Read event-banners"
ON storage.objects FOR SELECT
USING ( bucket_id = 'event-banners' );

-- Policy: Authenticated Upload for event-banners
CREATE POLICY "Authenticated Upload event-banners"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'event-banners' AND auth.role() = 'authenticated' );
