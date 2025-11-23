'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArtistForm } from '@/components/studio/ArtistForm';
import { Artist } from '@/types';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function EditArtistPage({ params }: { params: Promise<{ id: string }> }) {
    const [artist, setArtist] = useState<Artist | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const [id, setId] = useState<string>('');

    useEffect(() => {
        params.then(p => {
            setId(p.id);
            fetchArtist(p.id);
        });
    }, [params]);

    const fetchArtist = async (artistId: string) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/studio/login');
                return;
            }

            const { data, error } = await supabase
                .from('artists')
                .select('*')
                .eq('id', artistId)
                .single();

            if (error) throw error;
            setArtist(data);
        } catch (error) {
            console.error('Error fetching artist:', error);
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

    if (!artist) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black pt-28 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <Link href="/studio/dashboard">
                        <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-purple-600">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-4">Edit Artist</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Update artist profile information</p>
                </div>

                <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
                    <ArtistForm
                        initialData={artist}
                        onSuccess={() => router.push('/studio/dashboard')}
                    />
                </div>
            </div>
        </div>
    );
}
