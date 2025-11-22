import Link from 'next/link';
import { APP_NAME } from '@/lib/config';

export function Footer() {
    return (
        <footer className="bg-gray-50 dark:bg-black border-t border-gray-200 dark:border-white/10">
            <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                            {APP_NAME}
                        </span>
                        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                            The premier Bitcoin Cash event booking platform. Experience the future of ticketing with NFT rewards and instant cashback.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase">
                            Platform
                        </h3>
                        <ul className="mt-4 space-y-4">
                            <li>
                                <Link href="/events" className="text-base text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400">
                                    Browse Events
                                </Link>
                            </li>
                            <li>
                                <Link href="/studio/dashboard" className="text-base text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400">
                                    For Studios
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase">
                            Support
                        </h3>
                        <ul className="mt-4 space-y-4">
                            <li>
                                <Link href="#" className="text-base text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400">
                                    Help Center
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-base text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400">
                                    Terms of Service
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 border-t border-gray-200 dark:border-gray-800 pt-8">
                    <p className="text-base text-gray-400 text-center">
                        &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved. Built on Bitcoin Cash (Chipnet).
                    </p>
                </div>
            </div>
        </footer>
    );
}
