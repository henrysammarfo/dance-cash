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
        .filter(s => s.confirmed_at)
        .reduce((acc, curr) => acc + (curr.event?.price_usd || 0), 0);

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const activeEventsCount = events.filter(e => new Date(e.date) >= now).length;
    const upcomingWeekCount = events.filter(e => {
        const d = new Date(e.date);
        const diffTime = d.getTime() - now.getTime();
        const diffDays = diffTime / (1000 * 3600 * 24);
        return diffDays >= 0 && diffDays <= 7;
    }).length;

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
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Lifetime earnings</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Signups</CardTitle>
                            <Users className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{signups.length}</div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total registrations</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Events</CardTitle>
                            <Calendar className="h-4 w-4 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{activeEventsCount}</div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{upcomingWeekCount} upcoming this week</p>
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
                                                    {signup.attendee_name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">{signup.attendee_name}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">signed up for {signup.event?.name}</p>
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
                        <div className="space-y-4">
                            {events.map((event) => (
                                <Card key={event.id} className="bg-white dark:bg-black border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-shadow">
                                    <div className="flex flex-col sm:flex-row">
                                        <div className="sm:w-48 h-48 sm:h-auto relative bg-gray-100 dark:bg-gray-900">
                                            {event.banner_url ? (
                                                <img src={event.banner_url} alt={event.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <Calendar className="h-12 w-12" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 p-6 flex flex-col justify-center">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{event.name}</h3>
                                                    <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                                                        <Calendar className="h-4 w-4 mr-2" />
                                                        {new Date(event.date).toLocaleDateString()} {event.time && `at ${event.time}`}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-lg font-bold text-gray-900 dark:text-white">${event.price_usd}</span>
                                                </div>
                                            </div>

                                            <div className="mt-4 flex items-center justify-between">
                                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                    <Users className="h-4 w-4 mr-2" />
                                                    {event.capacity} spots
                                                </div>

                                                <div className="flex gap-2">
                                                    <Link href={`/events/${event.id}`}>
                                                        <Button variant="outline" size="sm" title="View">
                                                            <Eye className="h-4 w-4 mr-2" /> View
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/studio/events/${event.id}/edit`}>
                                                        <Button variant="outline" size="sm" title="Edit">
                                                            <Edit className="h-4 w-4 mr-2" /> Edit
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => deleteEvent(event.id)}
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}

                            <Link href="/studio/create-event">
                                <Button className="w-full py-8 bg-gray-50 dark:bg-black border-2 border-dashed border-gray-200 dark:border-gray-800 text-gray-500 hover:border-purple-500 hover:text-purple-600 transition-colors">
                                    <Plus className="mr-2 h-6 w-6" /> Create New Event
                                </Button>
                            </Link>
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
                                                    <td className="py-4 text-gray-900 dark:text-white">{signup.attendee_name}</td>
                                                    <td className="py-4 text-gray-900 dark:text-white">{signup.event?.name}</td>
                                                    <td className="py-4 text-gray-500 dark:text-gray-400">{new Date(signup.created_at).toLocaleDateString()}</td>
                                                    <td className="py-4 text-gray-500 dark:text-gray-400 capitalize">{signup.payment_method}</td>
                                                    <td className="py-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${signup.confirmed_at
                                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                            }`}>
                                                            {signup.confirmed_at ? 'confirmed' : 'pending'}
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
