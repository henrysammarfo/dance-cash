import { CreateEventForm } from '@/components/studio/CreateEventForm';

export default function CreateEventPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black pt-28 pb-12">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Create New Event
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Fill in the details below to publish your event.
                    </p>
                </div>

                <div className="bg-white dark:bg-black rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-8">
                    <CreateEventForm />
                </div>
            </div>
        </div>
    );
}
