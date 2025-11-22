import { supabase } from '@/lib/supabase';
import { EventCard } from '@/components/EventCard';
import { Event } from '@/types';
import { Calendar, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

// Revalidate every 60 seconds
export const revalidate = 60;

async function getEvents() {
    const { data, error } = await supabase
        .from('events')
        .select('*')
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true });

    if (error) {
        console.error('Error fetching events:', error);
        return [];
    }

    return (data as Event[]) || [];
}

export default async function EventsPage() {
    const events = await getEvents();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black pt-20 pb-20">
            <div className="container mx-auto px-4">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400">
                        Browse Events
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Discover and book the best dance masterclasses and workshops.
                    </p>
                </div>

                {/* Search/Filter Placeholder */}
                <div className="max-w-md mx-auto mb-12 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                        type="text"
                        placeholder="Search events..."
                        className="pl-10 py-6 rounded-full border-gray-200 dark:border-gray-800 bg-white dark:bg-black focus:ring-2 focus:ring-purple-500"
                    />
                </div>

                {events.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {events.map((event) => (
                            <EventCard key={event.id} event={event} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white dark:bg-black rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 shadow-sm">
                        <div className="bg-purple-100 dark:bg-purple-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar size={32} className="text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            No Upcoming Events
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                            Check back later for new workshops and masterclasses.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
