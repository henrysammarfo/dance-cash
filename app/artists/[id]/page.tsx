import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { EventCard } from '@/components/EventCard';
import { Instagram, Globe, Calendar } from 'lucide-react';

// Revalidate every hour
export const revalidate = 3600;

async function getArtist(id: string) {
    const { data: artist } = await supabase
        .from('artists')
        .select('*')
        .eq('id', id)
        .single();

    if (!artist) return null;

    // Fetch upcoming events for this artist
    // Check BOTH direct assignment (artist_id) AND featured artists (event_artists table)
    const { data: directEvents } = await supabase
        .from('events')
        .select('*')
        .eq('artist_id', id)
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true });

    // Fetch events where this artist is in event_artists table
    const { data: featuredData } = await supabase
        .from('event_artists')
        .select('event_id')
        .eq('artist_id', id);

    // Fetch the actual event details for featured events
    let featuredEvents: any[] = [];
    if (featuredData && featuredData.length > 0) {
        const eventIds = featuredData.map((item: any) => item.event_id);
        const { data: eventsData } = await supabase
            .from('events')
            .select('*')
            .in('id', eventIds)
            .gte('date', new Date().toISOString());

        featuredEvents = eventsData || [];
    }

    // Combine both arrays
    const allEvents = [...(directEvents || []), ...featuredEvents];

    // Deduplicate by ID
    const uniqueEvents = Array.from(
        new Map(allEvents.map(item => [item.id, item])).values()
    );

    // Sort by date
    uniqueEvents.sort((a: any, b: any) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    console.log('Artist ID:', id);
    console.log('Direct events:', directEvents?.length || 0);
    console.log('Featured events:', featuredEvents.length);
    console.log('Total unique events:', uniqueEvents.length);

    return { artist, events: uniqueEvents };
}

export default async function ArtistPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const data = await getArtist(id);

    if (!data) {
        notFound();
    }

    const { artist, events } = data;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black pt-20 pb-12">
            {/* Hero Section */}
            <div className="relative bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 mb-12">
                <div className="container mx-auto px-4 py-12 md:py-20">
                    <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                        <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl flex-shrink-0">
                            {artist.image_url ? (
                                <img
                                    src={artist.image_url}
                                    alt={artist.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-4xl font-bold text-gray-400">
                                    {artist.name.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div className="text-center md:text-left flex-grow">
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                                {artist.name}
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mb-6">
                                {artist.bio || 'No bio available.'}
                            </p>
                            <div className="flex items-center justify-center md:justify-start gap-4">
                                {artist.instagram && (
                                    <a
                                        href={`https://instagram.com/${artist.instagram.replace('@', '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-pink-50 text-pink-600 hover:bg-pink-100 dark:bg-pink-900/20 dark:text-pink-400 transition-colors"
                                    >
                                        <Instagram size={20} />
                                        <span>@{artist.instagram.replace('@', '')}</span>
                                    </a>
                                )}
                                {artist.website && (
                                    <a
                                        href={artist.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 transition-colors"
                                    >
                                        <Globe size={20} />
                                        <span>Website</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Events Section */}
            <div className="container mx-auto px-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-2">
                    <Calendar className="text-purple-600" />
                    Upcoming Events with {artist.name}
                </h2>

                {events.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {events.map((event: any) => (
                            <EventCard key={event.id} event={event} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white dark:bg-black rounded-2xl border border-gray-200 dark:border-gray-800">
                        <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No upcoming events</h3>
                        <p className="text-gray-500 dark:text-gray-400">Check back later for new classes and workshops.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
