'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudioSettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [studio, setStudio] = useState({
        name: '',
        email: '',
        bch_address: '',
        logo_url: ''
    });

    useEffect(() => {
        checkUser();
        fetchStudioData();
    }, []);

    const checkUser = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            router.push('/studio/login');
        }
    };

    const fetchStudioData = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { data, error } = await supabase
                .from('studios')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (error) throw error;
            if (data) {
                setStudio({
                    name: data.name || '',
                    email: data.email || session.user.email || '',
                    bch_address: data.bch_address || '',
                    logo_url: data.logo_url || ''
                });
            }
        } catch (error) {
            console.error('Error fetching studio data:', error);
            toast.error('Failed to load studio data');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            // Validate BCH address
            if (studio.bch_address && !studio.bch_address.startsWith('bchtest:')) {
                toast.error('BCH address must start with bchtest: for Chipnet');
                setSaving(false);
                return;
            }

            const { error } = await supabase
                .from('studios')
                .update({
                    name: studio.name,
                    bch_address: studio.bch_address,
                    logo_url: studio.logo_url || null
                })
                .eq('id', session.user.id);

            if (error) throw error;

            toast.success('Settings saved successfully!');
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black pt-28 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                        <Settings className="h-8 w-8 text-purple-600" />
                        Studio Settings
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Manage your studio profile and payment settings
                    </p>
                </div>

                <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                    <CardHeader>
                        <CardTitle>Profile Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSave} className="space-y-6">
                            <div>
                                <Label htmlFor="name">Studio Name</Label>
                                <Input
                                    id="name"
                                    value={studio.name}
                                    onChange={(e) => setStudio({ ...studio, name: e.target.value })}
                                    placeholder="Enter your studio name"
                                    className="mt-1"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={studio.email}
                                    disabled
                                    className="mt-1 bg-gray-100 dark:bg-gray-900"
                                />
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Email cannot be changed
                                </p>
                            </div>

                            <div>
                                <Label htmlFor="bch_address">BCH Address (Chipnet)</Label>
                                <Input
                                    id="bch_address"
                                    value={studio.bch_address}
                                    onChange={(e) => setStudio({ ...studio, bch_address: e.target.value })}
                                    placeholder="bchtest:..."
                                    className="mt-1 font-mono text-sm"
                                    required
                                />
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    This is where you'll receive payments from event signups
                                </p>
                            </div>

                            <div>
                                <Label htmlFor="logo_url">Logo URL (Optional)</Label>
                                <Input
                                    id="logo_url"
                                    type="url"
                                    value={studio.logo_url}
                                    onChange={(e) => setStudio({ ...studio, logo_url: e.target.value })}
                                    placeholder="https://example.com/logo.png"
                                    className="mt-1"
                                />
                            </div>

                            <div className="flex gap-4">
                                <Button
                                    type="submit"
                                    disabled={saving}
                                    className="bg-purple-600 hover:bg-purple-700 text-white"
                                >
                                    <Save className="mr-2 h-4 w-4" />
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push('/studio/dashboard')}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
