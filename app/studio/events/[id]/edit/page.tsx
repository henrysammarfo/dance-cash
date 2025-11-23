'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { CreateEventForm } from '@/components/studio/CreateEventForm';
import { Event } from '@/types';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const [id, setId] = useState<string>('');

    useEffect(() => {
        params.then(p => {
            setId(p.id);
            fetchEvent(p.id);
        });
    }, [params]);

    const fetchEvent = async (eventId: string) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/studio/login');
                return;
            }

            const { data, error } = await supabase
                .from('events')
                .select('*')
                .eq('id', eventId)
                .single();

            if (error) throw error;
            setEvent(data);
        } catch (error) {
            console.error('Error fetching event:', error);
            router.push('/studio/dashboard');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    if (!event) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black pt-28 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <Link href="/studio/dashboard">
                        <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-purple-600">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-4">Edit Event</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Update event details</p>
                </div>

                <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
                    <CreateEventForm initialData={event} />
                </div>
            </div>
        </div>
    );
}
