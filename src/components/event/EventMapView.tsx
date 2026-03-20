
'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

interface EventMapViewProps {
    lat: number;
    lng: number;
    title?: string;
    locationName?: string;
}

export default function EventMapView({ lat, lng, title, locationName }: EventMapViewProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        // Fix for default marker icon issue in Leaflet + Next.js
        import('leaflet').then((leaflet) => {
            delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
            leaflet.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
                iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
            });
        });
    }, []);

    if (!isMounted) {
        return (
            <div className="h-full w-full bg-surface-100 animate-pulse flex items-center justify-center font-bold text-surface-400">
                Loading Map...
            </div>
        );
    }

    return (
        <div className="h-full w-full rounded-xl overflow-hidden border border-surface-200 shadow-sm relative z-0">
            <MapContainer
                center={[lat, lng]}
                zoom={15}
                scrollWheelZoom={false}
                className="h-full w-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[lat, lng]}>
                    {(title || locationName) && (
                        <Popup>
                            <div className="text-xs font-bold leading-tight">
                                {title && <div className="text-primary mb-1">{title}</div>}
                                {locationName && <div className="text-surface-600 font-medium">{locationName}</div>}
                            </div>
                        </Popup>
                    )}
                </Marker>
            </MapContainer>
        </div>
    );
}
