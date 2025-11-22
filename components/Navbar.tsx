'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, Music, LayoutDashboard, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { APP_NAME } from '@/lib/config';
import { ThemeToggle } from '@/components/ThemeToggle';
import { supabase } from '@/lib/supabase';

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [user, setUser] = useState<any>(null);
    const pathname = usePathname();
    const router = useRouter();
    const isHome = pathname === '/';

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        // Check current auth state
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    return (
        <motion.nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${scrolled
                ? 'bg-white/90 dark:bg-black/90 backdrop-blur-md border-gray-200/50 dark:border-white/10'
                : 'bg-transparent border-transparent'
                }`}
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <Link href="/" className="flex items-center space-x-2 group relative z-50">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:shadow-purple-500/50 transition-all duration-300 transform group-hover:scale-105">
                            <Music size={20} />
                        </div>
                        <span className={`text-2xl font-bold transition-colors duration-300 ${scrolled
                            ? 'bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 dark:from-white dark:to-gray-300'
                            : isHome ? 'text-white' : 'text-gray-900 dark:text-white'
                            }`}>
                            {APP_NAME}
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center space-x-8">
                        <Link
                            href="/events"
                            className={`relative text-sm font-medium transition-colors group ${scrolled
                                ? 'text-gray-700 hover:text-purple-600 dark:text-gray-200 dark:hover:text-white'
                                : isHome
                                    ? 'text-white/90 hover:text-white'
                                    : 'text-gray-700 hover:text-purple-600 dark:text-gray-200 dark:hover:text-white'
                                }`}
                        >
                            Browse Events
                            <span className="absolute left-0 bottom-[-4px] w-0 h-[2px] bg-purple-600 transition-all duration-300 group-hover:w-full" />
                        </Link>

                        {!user && (
                            <Link
                                href="/studio/dashboard"
                                className={`relative text-sm font-medium transition-colors group ${scrolled
                                    ? 'text-gray-700 hover:text-purple-600 dark:text-gray-200 dark:hover:text-white'
                                    : isHome
                                        ? 'text-white/90 hover:text-white'
                                        : 'text-gray-700 hover:text-purple-600 dark:text-gray-200 dark:hover:text-white'
                                    }`}
                            >
                                For Studios
                                <span className="absolute left-0 bottom-[-4px] w-0 h-[2px] bg-purple-600 transition-all duration-300 group-hover:w-full" />
                            </Link>
                        )}

                        <div className={`w-px h-6 ${scrolled || !isHome ? 'bg-gray-200 dark:bg-gray-800' : 'bg-white/20'}`} />

                        <ThemeToggle />

                        {user ? (
                            <div className="relative group">
                                <Button
                                    variant="default"
                                    size="sm"
                                    className={`border shadow-sm hover:shadow-md transition-all duration-300 rounded-full px-6 ${scrolled || !isHome
                                        ? 'bg-purple-600 hover:bg-purple-700 text-white border-transparent'
                                        : 'bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white hover:text-black'
                                        }`}
                                >
                                    <LayoutDashboard size={16} className="mr-2" />
                                    Dashboard
                                </Button>
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                    <Link href="/studio/dashboard" className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-gray-900 rounded-t-xl transition-colors">
                                        <LayoutDashboard size={16} className="inline mr-2" />
                                        Dashboard
                                    </Link>
                                    <Link href="/studio/settings" className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-gray-900 transition-colors">
                                        <Settings size={16} className="inline mr-2" />
                                        Settings
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-b-xl transition-colors"
                                    >
                                        <LogOut size={16} className="inline mr-2" />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <Link href="/studio/login">
                                <Button
                                    variant="default"
                                    size="sm"
                                    className={`border shadow-sm hover:shadow-md transition-all duration-300 rounded-full px-6 ${scrolled || !isHome
                                        ? 'bg-white dark:bg-white text-black hover:bg-gray-100 dark:hover:bg-gray-200 border-gray-200 dark:border-transparent'
                                        : 'bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white hover:text-black'
                                        }`}
                                >
                                    <User size={16} className="mr-2" />
                                    Sign In
                                </Button>
                            </Link>
                        )}
                    </div>

                    <div className="md:hidden flex items-center space-x-4">
                        <ThemeToggle />
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className={`p-2 rounded-full transition-colors focus:outline-none ${scrolled || !isHome
                                ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-purple-100 dark:hover:bg-gray-700'
                                : 'bg-white/10 text-white hover:bg-white/20'
                                }`}
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white/95 backdrop-blur-xl dark:bg-black/95 border-b border-gray-200 dark:border-gray-800 overflow-hidden"
                    >
                        <div className="px-4 pt-2 pb-8 space-y-4">
                            <Link
                                href="/events"
                                className="block px-4 py-3 rounded-xl text-lg font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50 dark:text-gray-200 dark:hover:bg-gray-800 transition-all"
                                onClick={() => setIsOpen(false)}
                            >
                                Browse Events
                            </Link>
                            {!user && (
                                <Link
                                    href="/studio/dashboard"
                                    className="block px-4 py-3 rounded-xl text-lg font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50 dark:text-gray-200 dark:hover:bg-gray-800 transition-all"
                                    onClick={() => setIsOpen(false)}
                                >
                                    For Studios
                                </Link>
                            )}
                            <div className="pt-4 px-4 space-y-3">
                                {user ? (
                                    <>
                                        <Link href="/studio/dashboard" onClick={() => setIsOpen(false)}>
                                            <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 rounded-xl text-lg shadow-lg">
                                                <LayoutDashboard size={20} className="mr-2" />
                                                Dashboard
                                            </Button>
                                        </Link>
                                        <Link href="/studio/settings" onClick={() => setIsOpen(false)}>
                                            <Button variant="outline" className="w-full border-gray-200 dark:border-gray-800 py-6 rounded-xl text-lg">
                                                <Settings size={20} className="mr-2" />
                                                Settings
                                            </Button>
                                        </Link>
                                        <Button
                                            onClick={() => { handleLogout(); setIsOpen(false); }}
                                            className="w-full bg-red-600 hover:bg-red-700 text-white py-6 rounded-xl text-lg shadow-lg"
                                        >
                                            <LogOut size={20} className="mr-2" />
                                            Logout
                                        </Button>
                                    </>
                                ) : (
                                    <Link href="/studio/login" onClick={() => setIsOpen(false)}>
                                        <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 rounded-xl text-lg shadow-lg">
                                            <User size={20} className="mr-2" />
                                            Sign In
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
}
