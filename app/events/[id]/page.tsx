import { supabase } from '@/lib/supabase';
import { Event } from '@/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, MapPin, User, Clock, Share2, ArrowLeft } from 'lucide-react';
import { ShareButton } from '@/components/ShareButton';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';

// Revalidate every 60 seconds
export const revalidate = 60;

async function getEvent(id: string) {
  const { data: event, error } = await supabase
    .from('events')
    .select('*, artist:artists(*)')
    .eq('id', id)
    .single();

  if (error) {
    return { error };
  }

  return { event: event as Event };
}

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { event, error } = await getEvent(id);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black text-red-500 p-4">
        <div>
          <h1 className="text-2xl font-bold mb-2">Error Loading Event</h1>
          <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto max-w-2xl">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  if (!event) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.name,
    startDate: `${event.date}T${event.time || '00:00'}`, // Assuming time is stored or defaults
    endDate: `${event.date}T23:59`, // Placeholder end time
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: event.location,
      address: {
        '@type': 'PostalAddress',
        streetAddress: event.location, // Ideally split this
        addressLocality: 'Unknown', // Placeholder
        addressRegion: 'Unknown',
        postalCode: 'Unknown',
        addressCountry: 'US',
      },
    },
    image: [event.banner_url],
    description: event.description,
    offers: {
      '@type': 'Offer',
      url: `https://dance.cash/events/${event.id}`,
      price: event.price_usd,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      validFrom: event.created_at, // Assuming created_at exists on event
    },
    organizer: {
      '@type': 'Organization',
      name: 'Dance Cash Studio', // Ideally fetch studio name
      url: 'https://dance.cash',
    },
    performer: event.artist ? {
      '@type': 'Person',
      name: event.artist.name,
    } : undefined,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black pt-20 pb-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Banner */}
      <div className="relative h-[50vh] w-full">
        <Image
          src={event.banner_url || '/placeholder-event.jpg'}
          alt={event.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 container mx-auto">
          <Link href="/events" className="inline-flex items-center text-white/80 hover:text-white mb-4 transition-colors">
            <ArrowLeft size={20} className="mr-2" />
            Back to Events
          </Link>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 shadow-sm">
            {event.name}
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-white/90">
            <div className="flex items-center">
              <Calendar size={20} className="mr-2 text-purple-400" />
              <span className="text-lg">{format(new Date(event.date), 'EEEE, MMMM d, yyyy')}</span>
            </div>
            <div className="flex items-center">
              <MapPin size={20} className="mr-2 text-purple-400" />
              <span className="text-lg">{event.location}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Description */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">About This Event</h2>
              <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {event.description || 'No description provided.'}
              </div>
            </section>

            {/* Featured Artist Section */}
            {event.artist && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Featured Artist</h2>
                <Link href={`/artists/${event.artist.id}`}>
                  <div className="bg-white dark:bg-black rounded-2xl p-6 border border-gray-200 dark:border-gray-800 flex items-center gap-6 hover:border-purple-500 transition-colors group cursor-pointer">
                    <div className="h-24 w-24 rounded-full overflow-hidden flex-shrink-0 border-2 border-gray-100 dark:border-gray-800 group-hover:border-purple-500 transition-colors">
                      {event.artist.image_url ? (
                        <img src={event.artist.image_url} alt={event.artist.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-2xl font-bold text-gray-400">
                          {event.artist.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-purple-600 transition-colors">
                        {event.artist.name}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                        {event.artist.bio || 'Instructor'}
                      </p>
                      <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                        View Profile →
                      </span>
                    </div>
                  </div>
                </Link>
              </section>
            )}

            {/* Teacher */}
            {event.teacher && (
              <section className="bg-gray-50 dark:bg-gray-900 p-8 rounded-2xl">
                <div className="flex items-start gap-6">
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-full">
                    <User size={32} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      Instructor: {event.teacher}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Join {event.teacher} for an unforgettable experience.
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* Map Placeholder */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Location</h2>
              <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
                <p className="text-gray-500">Map Integration Coming Soon</p>
              </div>
              <p className="mt-4 text-gray-600 dark:text-gray-400 flex items-center">
                <MapPin size={18} className="mr-2" />
                {event.location}
              </p>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-xl">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Price per person</p>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      ${event.price_usd?.toFixed(2)}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">USD</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-purple-600 dark:text-purple-400 font-semibold mb-1">Pay with BCH</p>
                  <p className="text-xs text-green-600 font-medium">Save 10%</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center">
                    <Clock size={16} className="mr-2" /> Time
                  </span>
                  <span className="font-medium">{event.time}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center">
                    <User size={16} className="mr-2" /> Capacity
                  </span>
                  <span className="font-medium">{event.capacity} spots</span>
                </div>
              </div>

              <Link href={`/signup/${event.id}`} className="block w-full">
                <Button size="lg" className="w-full bg-purple-600 hover:bg-purple-700 text-white text-lg py-6 rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all">
                  Book Now
                </Button>
              </Link>

              <p className="mt-4 text-xs text-center text-gray-500">
                Secure payment via Bitcoin Cash or Credit Card
              </p>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800 flex justify-center">
                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-purple-600">
                  <Share2 size={16} className="mr-2" />
                  Share Event
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
