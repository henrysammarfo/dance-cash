import { supabase } from '@/lib/supabase';
import { Signup, Event } from '@/types';
import { PaymentOptions } from '@/components/PaymentOptions';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Revalidate every 60 seconds
export const revalidate = 60;

async function getSignup(id: string) {
    const { data, error } = await supabase
        .from('signups')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !data) {
        return null;
    }

    return data as Signup;
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

export default async function PaymentPage({ params }: { params: { signupId: string } }) {
    const signup = await getSignup(params.signupId);

    if (!signup) {
        notFound();
    }

    if (signup.status === 'confirmed') {
        redirect(`/confirmation/${signup.id}`);
    }

    const event = await getEvent(signup.event_id);

    if (!event) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black py-12">
            <div className="container mx-auto px-4 max-w-3xl">
                <Link href={`/signup/${event.id}`} className="inline-flex items-center text-gray-500 hover:text-purple-600 mb-8 transition-colors">
                    <ArrowLeft size={20} className="mr-2" />
                    Back
                </Link>

                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                    <div className="p-8 border-b border-gray-100 dark:border-gray-800">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Complete Payment</h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Choose your preferred payment method to secure your ticket.
                        </p>
                    </div>

                    <div className="p-8">
                        <PaymentOptions
                            priceUsd={event.price_usd || 0}
                            signupId={signup.id}
                            // This will be handled client-side to redirect
                            onPaymentComplete={() => { }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
