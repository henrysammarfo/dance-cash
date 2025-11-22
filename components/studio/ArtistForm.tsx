'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Upload, Instagram, Globe } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

const artistSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    bio: z.string().optional(),
    instagram: z.string().optional(),
    website: z.string().url('Invalid URL').optional().or(z.literal('')),
});

interface ArtistFormProps {
    onSuccess: () => void;
}

export function ArtistForm({ onSuccess }: ArtistFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof artistSchema>>({
        resolver: zodResolver(artistSchema),
        defaultValues: {
            name: '',
            bio: '',
            instagram: '',
            website: '',
        },
    });

    const onSubmit = async (values: z.infer<typeof artistSchema>) => {
        setIsLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');

            let image_url = '';

            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from('artist-images')
                    .upload(fileName, imageFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('artist-images')
                    .getPublicUrl(fileName);

                image_url = publicUrl;
            }

            const { error } = await supabase
                .from('artists')
                .insert({
                    studio_id: session.user.id,
                    name: values.name,
                    bio: values.bio,
                    instagram: values.instagram,
                    website: values.website,
                    image_url: image_url || null,
                });

            if (error) throw error;

            toast({
                title: 'Success',
                description: 'Artist created successfully',
            });

            form.reset();
            setImageFile(null);
            onSuccess();
        } catch (error: any) {
            console.error('Error creating artist:', error);
            toast({
                title: 'Error',
                description: error.message || 'Failed to create artist',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Artist Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. Sarah Dance" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Tell us about the artist..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="instagram"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Instagram Handle</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Instagram className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input className="pl-9" placeholder="@username" {...field} />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Website</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input className="pl-9" placeholder="https://..." {...field} />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormItem>
                    <FormLabel>Profile Image</FormLabel>
                    <FormControl>
                        <div className="flex items-center gap-4">
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                                className="cursor-pointer"
                            />
                        </div>
                    </FormControl>
                </FormItem>

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating Artist...
                        </>
                    ) : (
                        'Create Artist'
                    )}
                </Button>
            </form>
        </Form>
    );
}
