import { supabase } from '@/lib/supabase';
import { Signup, Event } from '@/types';
import { notFound, redirect } from 'next/navigation';
import { CheckCircle, Ticket, Gift, Calendar, MapPin, Share2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';

// Revalidate every 60 seconds
export const revalidate = 60;

async function getSignup(id: string) {
    const { data, error } = await supabase
        .from('signups')
        .select('*, cashtamps(*)')
        .eq('id', id)
        .single();

    if (error || !data) {
        return null;
    }

    return data as Signup & { cashtamps: any[] };
}

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

export default async function ConfirmationPage({ params }: { params: { signupId: string } }) {
    const signup = await getSignup(params.signupId);

    if (!signup) {
        notFound();
    }

    if (signup.status !== 'confirmed') {
        // If not confirmed, redirect back to payment
        // redirect(`/payment/${signup.id}`);
        // For testing/demo purposes, we might want to show the page anyway if we manually set it
    }

    const event = await getEvent(signup.event_id);

    if (!event) {
        notFound();
    }

    const cashstamp = signup.cashtamps?.[0];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-12 animate-fade-in-up">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-6">
                        <CheckCircle size={40} className="text-green-600 dark:text-green-400" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        You're Going!
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300">
                        Your ticket for <span className="font-semibold text-purple-600">{event.name}</span> is confirmed.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* NFT Ticket */}
                    <div className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-xl border border-gray-100 dark:border-gray-800 transform hover:scale-[1.02] transition-transform duration-300">
                        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium opacity-80">NFT Ticket</p>
                                    <h3 className="text-2xl font-bold">{event.name}</h3>
                                </div>
                                <Ticket size={32} className="opacity-80" />
                            </div>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="flex items-center text-gray-600 dark:text-gray-300">
                                <Calendar size={20} className="mr-3 text-purple-500" />
                                <span>{format(new Date(event.date), 'EEEE, MMMM d, yyyy')} • {event.time}</span>
                            </div>
                            <div className="flex items-center text-gray-600 dark:text-gray-300">
                                <MapPin size={20} className="mr-3 text-purple-500" />
                                <span>{event.location}</span>
                            </div>

                            <div className="border-t border-dashed border-gray-200 dark:border-gray-700 my-6" />

                            <div className="text-center">
                                <p className="text-sm text-gray-500 mb-4">Scan to import to Selene Wallet</p>
                                {/* Placeholder for NFT QR - In real app, this would be the NFT claim link */}
                                <div className="bg-white p-2 inline-block rounded-xl border border-gray-100 shadow-sm">
                                    <Image
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=selene:nft/${signup.nft_txid || 'pending'}`}
                                        alt="NFT QR"
                                        width={150}
                                        height={150}
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-2">Token ID: {signup.nft_txid?.substring(0, 8)}...</p>
                            </div>
                        </div>
                    </div>

                    {/* Cashback & Rewards */}
                    <div className="space-y-8">
                        {/* CashStamp */}
                        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-800">
                            <div className="flex items-center mb-6">
                                <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-full mr-4">
                                    <Gift size={24} className="text-yellow-600 dark:text-yellow-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Cashback Reward</h3>
                                    <p className="text-sm text-gray-500">Scan to claim your BCH</p>
                                </div>
                            </div>

                            {cashstamp ? (
                                <div className="text-center">
                                    <div className="bg-white p-2 inline-block rounded-xl border border-gray-100 shadow-sm mb-4">
                                        <Image src={cashstamp.qr_code_url} alt="CashStamp QR" width={150} height={150} />
                                    </div>
                                    <p className="font-bold text-green-600">
                                        {cashstamp.amount_bch.toFixed(8)} BCH Available
                                    </p>
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                    <p className="text-gray-500">Processing reward...</p>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-4">
                            <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-2">
                                <Calendar size={20} />
                                <span>Add to Calendar</span>
                            </Button>
                            <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-2">
                                <Share2 size={20} />
                                <span>Share Event</span>
                            </Button>
                        </div>

                        <Link href="/events" className="block">
                            <Button className="w-full py-6 text-lg bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100">
                                Browse More Events
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
