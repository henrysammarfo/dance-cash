'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, PlusCircle, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function StudioNav() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        toast.success('Logged out successfully');
        router.push('/studio/login');
        router.refresh();
    };

    const navItems = [
        { href: '/studio/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/studio/create-event', label: 'Create Event', icon: PlusCircle },
    ];

    return (
        <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/studio/dashboard" className="text-xl font-bold text-purple-600 dark:text-purple-400 mr-8">
                            Studio Portal
                        </Link>
                        <div className="hidden md:flex space-x-4">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                                                ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                            }`}
                                    >
                                        <Icon size={18} className="mr-2" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-500 hover:text-red-600">
                            <LogOut size={18} className="mr-2" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
