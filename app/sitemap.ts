import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://dance.cash';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Fetch all events
    const { data: events } = await supabase
        .from('events')
        .select('id, date')
        .order('date', { ascending: false });

    // Fetch all artists
    const { data: artists } = await supabase
        .from('artists')
        .select('id, created_at')
        .order('created_at', { ascending: false });

    const eventUrls = (events || []).map((event) => ({
        url: `${BASE_URL}/events/${event.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    const artistUrls = (artists || []).map((artist) => ({
        url: `${BASE_URL}/artists/${artist.id}`,
        lastModified: new Date(artist.created_at),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
    }));

    return [
        {
            url: BASE_URL,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${BASE_URL}/events`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/studio/login`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${BASE_URL}/studio/register`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        ...eventUrls,
        ...artistUrls,
    ];
}
