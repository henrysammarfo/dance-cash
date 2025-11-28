'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";

const signupSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    saveInfo: z.boolean().default(false),
});

type SignupFormValues = z.infer<typeof signupSchema>;

interface SignupFormProps {
    eventId: string;
    capacity: number;
    currentSignups: number | null;
}

function generateUUID() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export function SignupForm({ eventId, capacity, currentSignups }: SignupFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();
    const confirmedCount = currentSignups || 0;
    const isSoldOut = confirmedCount >= capacity;
    const spotsLeft = capacity - confirmedCount;

    const form = useForm<SignupFormValues>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            saveInfo: false,
        },
    });

    const onSubmit = async (data: SignupFormValues) => {
        if (isSoldOut) return;

        setIsLoading(true);
        try {
            // Fetch event to get studio_id
            const { data: event, error: eventError } = await supabase
                .from('events')
                .select('studio_id')
                .eq('id', eventId)
                .single();

            if (eventError) throw eventError;
            if (!event) throw new Error('Event not found');

            // Generate ID client-side to avoid RLS select issue
            const signupId = generateUUID();

            const payload = {
                id: signupId,
                event_id: eventId,
                studio_id: event.studio_id,
                attendee_name: data.name,
                attendee_email: data.email,
                attendee_phone: data.phone,
            };

            console.log('Submitting signup payload:', payload);

            // Insert into Supabase
            const { error } = await supabase
                .from('signups')
                .insert(payload);

            if (error) throw error;

            if (data.saveInfo) {
                localStorage.setItem('dancer_info', JSON.stringify({
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                }));
            }

            // Redirect to payment page
            router.push(`/payment/${signupId}`);
        } catch (error: any) {
            console.error('Signup error object:', error);
            console.error('Signup error stringified:', JSON.stringify(error, null, 2));
            console.error('Error details:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            toast({
                title: "Signup Failed",
                description: error.message || "An error occurred during signup. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (isSoldOut) {
        return (
            <div className="text-center py-8">
                <div className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl mb-4 inline-block">
                    <p className="font-bold text-lg">Event Sold Out</p>
                </div>
                <p className="text-gray-500 dark:text-gray-400">
                    Sorry, all {capacity} spots have been taken.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/50 p-4 rounded-lg mb-6">
                <p className="text-sm text-purple-700 dark:text-purple-300 font-medium flex items-center">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                    Only {spotsLeft} spots remaining!
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                    id="name"
                    placeholder="Jane Doe"
                    {...form.register('name')}
                    className={form.formState.errors.name ? 'border-red-500' : ''}
                />
                {form.formState.errors.name && (
                    <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="jane@example.com"
                    {...form.register('email')}
                    className={form.formState.errors.email ? 'border-red-500' : ''}
                />
                {form.formState.errors.email && (
                    <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    {...form.register('phone')}
                />
            </div>

            <div className="flex items-center space-x-2">
                <Checkbox
                    id="saveInfo"
                    onCheckedChange={(checked) => form.setValue('saveInfo', checked as boolean)}
                />
                <Label htmlFor="saveInfo" className="text-sm font-normal text-gray-600 dark:text-gray-400">
                    Save my information for next time
                </Label>
            </div>

            <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 text-lg rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all"
                disabled={isLoading}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                    </>
                ) : (
                    <>
                        Continue to Payment
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                )}
            </Button>
        </form>
    );
}
