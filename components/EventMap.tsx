'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in Next.js
const icon = L.icon({
    iconUrl: '/images/marker-icon.png',
    shadowUrl: '/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface MapProps {
    location: string; // Address string
}

export default function EventMap({ location }: MapProps) {
    const [coords, setCoords] = useState<[number, number] | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simple geocoding using OpenStreetMap Nominatim API (Free)
        const geocode = async () => {
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`);
                const data = await response.json();
                if (data && data.length > 0) {
                    setCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
                }
            } catch (error) {
                console.error('Geocoding error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (location) {
            geocode();
        }
    }, [location]);

    if (isLoading) {
        return <div className="h-full w-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-2xl flex items-center justify-center text-gray-400">Loading Map...</div>;
    }

    if (!coords) {
        return <div className="h-full w-full bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-gray-400">Map not available</div>;
    }

    return (
        <MapContainer center={coords} zoom={15} scrollWheelZoom={false} className="h-full w-full rounded-2xl z-0">
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={coords} icon={icon}>
                <Popup>{location}</Popup>
            </Marker>
        </MapContainer>
    );
}
