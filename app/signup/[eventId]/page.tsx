import { supabase } from '@/lib/supabase';
import { Event } from '@/types';
import { SignupForm } from '@/components/forms/SignupForm';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Calendar, MapPin, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

// Revalidate every 60 seconds
export const revalidate = 60;

async function getEvent(id: string) {
    const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !data) {
        return null;
    }

    return data as Event;
}

export default async function SignupPage({ params }: { params: { eventId: string } }) {
    const event = await getEvent(params.eventId);

    if (!event) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black py-12">
            <div className="container mx-auto px-4">
                <Link href={`/events/${event.id}`} className="inline-flex items-center text-gray-500 hover:text-purple-600 mb-8 transition-colors">
                    <ArrowLeft size={20} className="mr-2" />
                    Back to Event Details
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
                    {/* Event Summary */}
                    <div className="space-y-6">
                        <div className="relative h-64 w-full rounded-2xl overflow-hidden shadow-lg">
                            <Image
                                src={event.banner_url || '/placeholder-event.jpg'}
                                alt={event.name}
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute bottom-4 left-4 right-4 text-white">
                                <h2 className="text-2xl font-bold mb-2">{event.name}</h2>
                                <div className="flex items-center text-sm text-white/90">
                                    <Calendar size={16} className="mr-2" />
                                    <span>{format(new Date(event.date), 'MMMM d, yyyy')} • {event.time}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h3>
                            <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
                                <span className="text-gray-600 dark:text-gray-400">General Admission</span>
                                <span className="font-medium">${event.price_usd?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
                                <span className="text-gray-600 dark:text-gray-400">Booking Fee</span>
                                <span className="font-medium">$0.00</span>
                            </div>
                            <div className="flex justify-between items-center pt-4 text-lg font-bold">
                                <span>Total</span>
                                <span>${event.price_usd?.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Signup Form */}
                    <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Sign Up</h1>
                            <p className="text-gray-500 dark:text-gray-400">
                                Enter your details to secure your spot.
                            </p>
                        </div>

                        <SignupForm eventId={event.id} />
                    </div>
                </div>
            </div>
        </div>
    );
}
