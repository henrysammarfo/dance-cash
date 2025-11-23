'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Calendar, Users, DollarSign, TrendingUp, User, Trash2, Edit, Eye } from 'lucide-react';
import { CreateEventForm } from '@/components/studio/CreateEventForm';
import { ArtistForm } from '@/components/studio/ArtistForm';
import { Event, Signup, Artist } from '@/types';
import Link from 'next/link';

export default function StudioDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState<Event[]>([]);
    const [artists, setArtists] = useState<Artist[]>([]);
    const [signups, setSignups] = useState<Signup[]>([]);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        checkUser();
        fetchDashboardData();
    }, []);

    const checkUser = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            router.push('/studio/login');
        }
    };

    const fetchDashboardData = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            // Fetch Events
            const { data: eventsData } = await supabase
                .from('events')
                .select('*')
                .eq('studio_id', session.user.id)
                .order('date', { ascending: true });

            if (eventsData) setEvents(eventsData);

            // Fetch Artists
            const { data: artistsData } = await supabase
                .from('artists')
                .select('*')
                .eq('studio_id', session.user.id)
                .order('created_at', { ascending: false });

            if (artistsData) setArtists(artistsData);

            // Fetch Signups for these events
            if (eventsData && eventsData.length > 0) {
                const eventIds = eventsData.map(e => e.id);
                const { data: signupsData } = await supabase
                    .from('signups')
                    .select('*, event:events(*)')
                    .in('event_id', eventIds)
                    .order('created_at', { ascending: false });

                if (signupsData) setSignups(signupsData);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteEvent = async (id: string) => {
        if (!confirm('Are you sure you want to delete this event?')) return;

        const { error } = await supabase
            .from('events')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting event:', error);
            alert('Failed to delete event');
        } else {
            fetchDashboardData();
        }
    };

    const deleteArtist = async (id: string) => {
        if (!confirm('Are you sure you want to delete this artist?')) return;

        const { error } = await supabase
            .from('artists')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting artist:', error);
            alert('Failed to delete artist');
        } else {
            fetchDashboardData();
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    const totalRevenue = signups
        .filter(s => s.status === 'confirmed')
        .reduce((acc, curr) => acc + (curr.event?.price || 0), 0);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black pt-28 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Studio Dashboard</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your events, artists, and track performance</p>
                    </div>
                    <Link href="/studio/create-event">
                        <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                            <Plus className="mr-2 h-4 w-4" /> Create Event
                        </Button>
                    </Link>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">${totalRevenue.toFixed(2)}</div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">+20.1% from last month</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Signups</CardTitle>
                            <Users className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{signups.length}</div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">+12 since last week</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Events</CardTitle>
                            <Calendar className="h-4 w-4 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{events.length}</div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">2 upcoming this week</p>
                        </CardContent>
                    </Card>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 p-1">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="events">Events</TabsTrigger>
                        <TabsTrigger value="artists">Artists</TabsTrigger>
                        <TabsTrigger value="signups">Signups</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                            <CardHeader>
                                <CardTitle>Recent Activity</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {signups.slice(0, 5).map((signup) => (
                                        <div key={signup.id} className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 last:border-0 last:pb-0">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold">
                                                    {signup.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">{signup.name}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">signed up for {signup.event?.title}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {signup.payment_method === 'bch' ? 'BCH' : 'Fiat'}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {new Date(signup.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    {signups.length === 0 && (
                                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">No recent activity</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="events">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {events.map((event) => (
                                <Card key={event.id} className="bg-white dark:bg-black border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-shadow">
                                    {event.image_url && (
                                        <div className="h-48 w-full relative">
                                            <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
                                            <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold">
                                                ${event.price}
                                            </div>
                                        </div>
                                    )}
                                    <CardContent className="p-6">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{event.title}</h3>
                                        <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-4">
                                            <Calendar className="h-4 w-4 mr-2" />
                                            {new Date(event.date).toLocaleDateString()}
                                        </div>
                                        <div className="flex justify-between items-center gap-2">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                {event.capacity} spots
                                            </span>
                                            <div className="flex gap-2">
                                                <Link href={`/events/${event.id}`}>
                                                    <Button variant="outline" size="icon" title="View">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/studio/events/${event.id}/edit`}>
                                                    <Button variant="outline" size="icon" title="Edit">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    onClick={() => deleteEvent(event.id)}
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            <Card className="bg-gray-50 dark:bg-black/50 border-dashed border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center min-h-[300px] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer group">
                                <Link href="/studio/create-event" className="flex flex-col items-center text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                                    <Plus className="h-12 w-12 mb-4" />
                                    <span className="font-medium">Create New Event</span>
                                </Link>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="artists">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Create Artist Form */}
                            <div className="lg:col-span-1">
                                <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                                    <CardHeader>
                                        <CardTitle>Add New Artist</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ArtistForm onSuccess={fetchDashboardData} />
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Artists List */}
                            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                {artists.map((artist) => (
                                    <Card key={artist.id} className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                                        <CardContent className="p-6 flex items-start gap-4">
                                            <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-black overflow-hidden flex-shrink-0">
                                                {artist.image_url ? (
                                                    <img src={artist.image_url} alt={artist.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="h-full w-full p-4 text-gray-400" />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">{artist.name}</h3>
                                                {artist.instagram && (
                                                    <p className="text-sm text-purple-600 dark:text-purple-400 mb-1">@{artist.instagram}</p>
                                                )}
                                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{artist.bio}</p>

                                                <div className="flex gap-2 mt-4">
                                                    <Link href={`/artists/${artist.id}`}>
                                                        <Button variant="outline" size="sm">
                                                            <Eye className="h-4 w-4 mr-1" /> View
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/studio/artists/${artist.id}/edit`}>
                                                        <Button variant="outline" size="sm">
                                                            <Edit className="h-4 w-4 mr-1" /> Edit
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => deleteArtist(artist.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                {artists.length === 0 && (
                                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                                        <User className="h-12 w-12 mb-4 opacity-50" />
                                        <p>No artists added yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="signups">
                        <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                            <CardHeader>
                                <CardTitle>All Signups</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200 dark:border-gray-800 text-left">
                                                <th className="pb-4 font-medium text-gray-500 dark:text-gray-400">Name</th>
                                                <th className="pb-4 font-medium text-gray-500 dark:text-gray-400">Event</th>
                                                <th className="pb-4 font-medium text-gray-500 dark:text-gray-400">Date</th>
                                                <th className="pb-4 font-medium text-gray-500 dark:text-gray-400">Payment</th>
                                                <th className="pb-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                            {signups.map((signup) => (
                                                <tr key={signup.id}>
                                                    <td className="py-4 text-gray-900 dark:text-white">{signup.name}</td>
                                                    <td className="py-4 text-gray-900 dark:text-white">{signup.event?.title}</td>
                                                    <td className="py-4 text-gray-500 dark:text-gray-400">{new Date(signup.created_at).toLocaleDateString()}</td>
                                                    <td className="py-4 text-gray-500 dark:text-gray-400 capitalize">{signup.payment_method}</td>
                                                    <td className="py-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${signup.status === 'confirmed'
                                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                            }`}>
                                                            {signup.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
