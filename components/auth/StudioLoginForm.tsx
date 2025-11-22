'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, ArrowRight, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function StudioLoginForm() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = async (data: LoginFormValues) => {
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            });

            if (error) {
                throw error;
            }

            toast.success('Welcome back!');
            router.push('/studio/dashboard');
            router.refresh();
        } catch (error: any) {
            console.error('Login error:', error);
            if (error.message && error.message.includes('Email not confirmed')) {
                toast.error('Please verify your email address before logging in. Check your inbox.');
            } else {
                toast.error(error.message || 'Failed to login');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                        id="email"
                        type="email"
                        placeholder="studio@example.com"
                        {...form.register('email')}
                        className={`pl-10 ${form.formState.errors.email ? 'border-red-500' : ''}`}
                    />
                </div>
                {form.formState.errors.email && (
                    <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        {...form.register('password')}
                        className={`pl-10 ${form.formState.errors.password ? 'border-red-500' : ''}`}
                    />
                </div>
                {form.formState.errors.password && (
                    <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
                )}
            </div>

            <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 text-lg rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all"
                disabled={isLoading}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Signing in...
                    </>
                ) : (
                    <>
                        Sign In
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                )}
            </Button>
        </form>
    );
}
