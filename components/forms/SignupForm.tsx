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

const signupSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    saveInfo: z.boolean().default(false),
});

type SignupFormValues = z.infer<typeof signupSchema>;

interface SignupFormProps {
    eventId: string;
}

export function SignupForm({ eventId }: SignupFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

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
        setIsLoading(true);
        try {
            // Insert into Supabase
            const { data: signup, error } = await supabase
                .from('signups')
                .insert({
                    event_id: eventId,
                    attendee_name: data.name,
                    attendee_email: data.email,
                    attendee_phone: data.phone,
                    status: 'pending',
                })
                .select()
                .single();

            if (error) throw error;

            if (data.saveInfo) {
                localStorage.setItem('dancer_info', JSON.stringify({
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                }));
            }

            // Redirect to payment page
            router.push(`/payment/${signup.id}`);
        } catch (error) {
            console.error('Signup error:', error);
            // Ideally show toast error here
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
