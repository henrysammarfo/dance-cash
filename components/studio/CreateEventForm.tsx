'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Calendar as CalendarIcon, MapPin, DollarSign, Users, Image as ImageIcon, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

const eventSchema = z.object({
    name: z.string().min(3, 'Event name must be at least 3 characters'),
    description: z.string().optional(),
    date: z.string().refine((val) => new Date(val) > new Date(), 'Date must be in the future'),
    time: z.string().min(1, 'Time is required'),
    location: z.string().min(3, 'Location is required'),
    style: z.string().min(1, 'Style is required'),
    teacher: z.string().min(2, 'Teacher name is required'),
    price: z.string().transform((val) => parseFloat(val)).refine((val) => !isNaN(val) && val >= 0, 'Price must be a valid number'),
    capacity: z.string().transform((val) => parseInt(val)).refine((val) => !isNaN(val) && val > 0, 'Capacity must be a positive number'),
    artist_id: z.string().optional(),
});

type EventFormValues = z.infer<typeof eventSchema>;

export function CreateEventForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [artists, setArtists] = useState<{ id: string; name: string }[]>([]);
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        checkAuth();
        fetchArtists();
    }, []);

    const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            toast({
                title: 'Authentication Required',
                description: 'Please sign in to create an event.',
                variant: 'destructive',
            });
            router.push('/studio/login');
        }
    };

    const fetchArtists = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data } = await supabase
            .from('artists')
            .select('id, name')
            .eq('studio_id', session.user.id);

        if (data) setArtists(data);
    };

    const form = useForm<EventFormValues>({
        resolver: zodResolver(eventSchema),
        defaultValues: {
            name: '',
            description: '',
            date: '',
            time: '',
            location: '',
            style: '',
            teacher: '',
            price: 0,
            capacity: 20,
            artist_id: '',
        },
    });

    const onSubmit = async (data: EventFormValues) => {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                throw new Error('You must be logged in to create an event');
            }

            let imageUrl = null;

            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `${user.id}/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('events')
                    .upload(filePath, imageFile);

                if (uploadError) {
                    console.error('Upload error:', uploadError);
                    toast({
                        title: 'Upload Failed',
                        description: 'Failed to upload event image.',
                        variant: 'destructive',
                    });
                } else {
                    const { data: { publicUrl } } = supabase.storage
                        .from('events')
                        .getPublicUrl(filePath);
                    imageUrl = publicUrl;
                }
            }

            const { error } = await supabase
                .from('events')
                .insert({
                    studio_id: user.id,
                    name: data.name,
                    description: data.description,
                    date: data.date,
                    time: data.time,
                    location: data.location,
                    style: data.style,
                    teacher: data.teacher,
                    price_usd: data.price,
                    capacity: data.capacity,
                    banner_url: imageUrl,
                    artist_id: data.artist_id || null,
                });

            if (error) throw error;

            toast({
                title: 'Success!',
                description: 'Event created successfully!',
            });
            router.push('/studio/dashboard');
            router.refresh();
        } catch (error: any) {
            console.error('Create event error:', error);
            toast({
                title: 'Error',
                description: error.message || 'Failed to create event.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Event Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Salsa Night Workshop" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Join us for an amazing night of dancing..."
                                        className="h-32"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Date</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <CalendarIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                            <Input type="date" className="pl-10" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="time"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Time</FormLabel>
                                    <FormControl>
                                        <Input type="time" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Location</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                            <Input placeholder="123 Dance St, New York, NY" className="pl-10" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="artist_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Artist / Teacher (Optional)</FormLabel>
                                    <FormControl>
                                        <select
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            onChange={field.onChange}
                                            value={field.value || ''}
                                        >
                                            <option value="">Select an artist</option>
                                            {artists.map((artist) => (
                                                <option key={artist.id} value={artist.id}>
                                                    {artist.name}
                                                </option>
                                            ))}
                                        </select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="style"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Dance Style</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select style" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Salsa">Salsa</SelectItem>
                                            <SelectItem value="Bachata">Bachata</SelectItem>
                                            <SelectItem value="Hip Hop">Hip Hop</SelectItem>
                                            <SelectItem value="Contemporary">Contemporary</SelectItem>
                                            <SelectItem value="Ballet">Ballet</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="teacher"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Instructor Name (Manual)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Jane Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Price (USD)</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                            <Input type="number" step="0.01" className="pl-10" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="capacity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Capacity</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Users className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                            <Input type="number" className="pl-10" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="image">Event Image</Label>
                        <div className="flex items-center justify-center w-full">
                            <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <ImageIcon className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                                </div>
                                <input
                                    id="image-upload"
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                                />
                            </label>
                        </div>
                        {imageFile && (
                            <p className="text-sm text-green-600">Selected: {imageFile.name}</p>
                        )}
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 text-lg rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Creating Event...
                        </>
                    ) : (
                        <>
                            Publish Event
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                    )}
                </Button>
            </form>
        </Form>
    );
}
