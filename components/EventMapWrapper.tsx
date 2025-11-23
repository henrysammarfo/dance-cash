'use client';

import dynamic from 'next/dynamic';

// Dynamically import Map component to avoid SSR issues with Leaflet
const EventMap = dynamic(() => import('@/components/EventMap'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-2xl" />
});

interface EventMapWrapperProps {
    location: string;
}

export default function EventMapWrapper({ location }: EventMapWrapperProps) {
    return <EventMap location={location} />;
}
