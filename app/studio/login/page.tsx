import { StudioLoginForm } from '@/components/auth/StudioLoginForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function StudioLoginPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link href="/" className="inline-flex items-center text-gray-500 hover:text-purple-600 mb-8 transition-colors">
                    <ArrowLeft size={20} className="mr-2" />
                    Back to Home
                </Link>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                    Sign in to your studio
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                    Or{' '}
                    <Link href="/studio/register" className="font-medium text-purple-600 hover:text-purple-500">
                        create a new account
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-black py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200 dark:border-gray-800">
                    <StudioLoginForm />
                </div>
            </div>
        </div>
    );
}
