-- Allow anyone to view signups (needed for payment and confirmation pages)
DROP POLICY IF EXISTS "Signups viewable by event studio" ON public.signups;

CREATE POLICY "Signups viewable by event studio"
    ON public.signups FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM events e
            WHERE e.id = event_id AND e.studio_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can view signups"
    ON public.signups FOR SELECT USING (true);
