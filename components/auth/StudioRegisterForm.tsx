'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, ArrowRight, Mail, Lock, Building, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const registerSchema = z.object({
    name: z.string().min(2, 'Studio name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    bchAddress: z.string().refine((val) => val.startsWith('bchtest:'), {
        message: "Must be a valid Chipnet address (starts with 'bchtest:')",
    }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function StudioRegisterForm() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            bchAddress: '',
        },
    });

    const onSubmit = async (data: RegisterFormValues) => {
        setIsLoading(true);
        try {
            // 1. Sign up with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    emailRedirectTo: `${window.location.origin}/studio/login`,
                    data: {
                        full_name: data.name,
                    },
                },
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error('No user returned from signup');

            // 2. Create studio profile in database
            const { error: profileError } = await supabase
                .from('studios')
                .insert({
                    id: authData.user.id,
                    name: data.name,
                    email: data.email,
                    bch_address: data.bchAddress,
                    logo_url: null, // Can be added later
                });

            if (profileError) throw profileError;

            // Show success message - don't redirect immediately
            toast.success(
                'Account created successfully! 📧 Please check your email inbox and click the confirmation link to verify your account before logging in.',
                { duration: 10000 } // Show for 10 seconds
            );

            // Reset form
            form.reset();
        } catch (error: any) {
            console.error('Registration error:', error);
            toast.error(error.message || 'Failed to register');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="name">Studio Name</Label>
                <div className="relative">
                    <Building className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                        id="name"
                        placeholder="Dance Studio X"
                        {...form.register('name')}
                        className={`pl-10 ${form.formState.errors.name ? 'border-red-500' : ''}`}
                    />
                </div>
                {form.formState.errors.name && (
                    <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                )}
            </div>

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            {...form.register('confirmPassword')}
                            className={`pl-10 ${form.formState.errors.confirmPassword ? 'border-red-500' : ''}`}
                        />
                    </div>
                    {form.formState.errors.confirmPassword && (
                        <p className="text-sm text-red-500">{form.formState.errors.confirmPassword.message}</p>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="bchAddress">BCH Wallet Address</Label>
                <div className="relative">
                    <Wallet className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                        id="bchAddress"
                        placeholder="bchtest:..."
                        {...form.register('bchAddress')}
                        className={`pl-10 ${form.formState.errors.bchAddress ? 'border-red-500' : ''}`}
                    />
                </div>
                <p className="text-xs text-gray-500">
                    This is where you'll receive payments. Use a Chipnet address for testing.
                </p>
                {form.formState.errors.bchAddress && (
                    <p className="text-sm text-red-500">{form.formState.errors.bchAddress.message}</p>
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
                        Creating Account...
                    </>
                ) : (
                    <>
                        Create Account
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                )}
            </Button>
        </form>
    );
}
