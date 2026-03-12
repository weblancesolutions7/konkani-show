
'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Dynamically import MapComponent to avoid SSR issues
const MapComponent = dynamic(() => import('./MapComponent'), { 
    ssr: false,
    loading: () => <div className="h-[300px] w-full bg-surface-50 animate-pulse  flex items-center justify-center font-bold text-surface-400">Loading Map...</div>
});

interface LocationPickerProps {
    initialLat?: number;
    initialLng?: number;
    onLocationSelect: (lat: number, lng: number) => void;
}

export default function LocationPicker({ initialLat, initialLng, onLocationSelect }: LocationPickerProps) {
    const [position, setPosition] = useState<[number, number] | null>(
        initialLat && initialLng ? [initialLat, initialLng] : null
    );
    const [L, setL] = useState<any>(null);

    useEffect(() => {
        // Fix for default marker icon issue in Leaflet + Next.js
        import('leaflet').then((leaflet) => {
            setL(leaflet);
            delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
            leaflet.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
                iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
            });
        });
    }, []);

    const handleSelect = (lat: number, lng: number) => {
        setPosition([lat, lng]);
        onLocationSelect(lat, lng);
    };

    const defaultCenter: [number, number] = [12.9141, 74.8560]; // Mangalore

    if (!L) return <div className="h-[300px] w-full bg-surface-50 animate-pulse  flex items-center justify-center font-bold text-surface-400">Loading Map...</div>;

    return (
        <div className="space-y-4">
            <div className="h-[300px] w-full  overflow-hidden border-2 border-surface-100 relative z-0">
                <MapComponent 
                    position={position} 
                    onLocationSelect={handleSelect} 
                    defaultCenter={defaultCenter} 
                />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-surface-800/30 text-center">
                Click on the map to pin the exact event venue location
            </p>
        </div>
    );
}

