
'use client';

import React from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// This component handles map clicks to update coordinates
function MapEvents({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

interface MapComponentProps {
    position: [number, number] | null;
    onLocationSelect: (lat: number, lng: number) => void;
    defaultCenter: [number, number];
}

export default function MapComponent({ position, onLocationSelect, defaultCenter }: MapComponentProps) {
    return (
        <MapContainer
            center={position || defaultCenter}
            zoom={13}
            scrollWheelZoom={false}
            className="h-full w-full"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {position && <Marker position={position} />}
            <MapEvents onLocationSelect={onLocationSelect} />
        </MapContainer>
    );
}
