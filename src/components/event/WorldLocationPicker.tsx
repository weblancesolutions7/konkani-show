'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
import { useMap, useMapEvents } from 'react-leaflet';
import { useNotification } from '@/components/ui/NotificationProvider';
import { MapPin, Loader2 } from 'lucide-react';

export interface LocationData {
    country: string;
    state: string;
    city: string;
    zipCode: string;
    venueAddress: string;
    lat: number;
    lng: number;
}

interface WorldLocationPickerProps {
    value?: Partial<LocationData>;
    onChange: (data: LocationData) => void;
}

// Map updater component to fly to new coordinates
function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center, map.getZoom());
    }, [center, map]);
    return null;
}

// Component to handle clicks on the map to drop a pin
function MapEvents({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e: any) {
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

export default function WorldLocationPicker({ value, onChange }: WorldLocationPickerProps) {
    const { showAlert } = useNotification();
    const [country, setCountry] = useState(value?.country || '');
    const [state, setState] = useState(value?.state || '');
    const [city, setCity] = useState(value?.city || '');
    const [zipCode, setZipCode] = useState(value?.zipCode || '');
    const [venueAddress, setVenueAddress] = useState(value?.venueAddress || '');
    const [lat, setLat] = useState<number>(value?.lat || 12.9141); // Default somewhere
    const [lng, setLng] = useState<number>(value?.lng || 74.8560);

    // Search & Geolocation functionality
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [searchResults, setSearchResults] = useState<any[]>([]);

    const [L, setL] = useState<any>(null);

    // Load leaflet icons
    useEffect(() => {
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

    // We removed the automatic ISO mapping effect since we don't use country-state-city anymore

    // Notify parent on change
    useEffect(() => {
        // Only trigger onChange if we have some minimal logical data or if we want to constantly sync
        // We'll sync everything to parent so it always has the latest state
        onChange({
            country,
            state,
            city,
            zipCode,
            venueAddress,
            lat,
            lng
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [country, state, city, zipCode, venueAddress, lat, lng]);

    // Function to reverse-geocode a lat/lng to update address fields automatically
    const reverseGeocode = async (latitude: number, longitude: number) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            if (response.ok) {
                const data = await response.json();
                if (data && data.address) {
                    setVenueAddress(data.display_name.split(',')[0] || ''); // Often first part is the premise/road
                    setCity(data.address.city || data.address.town || data.address.village || '');
                    setState(data.address.state || '');
                    setCountry(data.address.country || '');
                    setZipCode(data.address.postcode || '');
                }
            }
        } catch (error) {
            console.error("Error reverse geocoding:", error);
        }
    };

    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            showAlert("Geolocation is not supported by your browser.", "Feature Unavailable");
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setLat(latitude);
                setLng(longitude);
                await reverseGeocode(latitude, longitude);
                setIsLocating(false);
            },
            (error) => {
                console.error("Geolocation Error:", error);
                showAlert("Unable to retrieve your location. Check your permissions.", "Geolocation Error");
                setIsLocating(false);
            }
        );
    };

    const handleSearch = useCallback(async (queryToSearch: string) => {
        if (!queryToSearch.trim()) return;

        setIsSearching(true);
        // Do not clear search results immediately so the UI doesn't flicker while typing
        try {
            const query = encodeURIComponent(queryToSearch);
            // Added &addressdetails=1 to get full address breakdown including postcode
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=5&addressdetails=1`);
            if (response.ok) {
                const data = await response.json();
                setSearchResults(data || []);
            }
        } catch (error) {
            console.error("Error searching venue:", error);
        } finally {
            setIsSearching(false);
        }
    }, []);

    // Debounced Search Effect
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery.trim().length > 2) {
                handleSearch(searchQuery);
            } else if (searchQuery.trim().length === 0) {
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, handleSearch]);

    const handleSelectResult = (result: any) => {
        const newLat = parseFloat(result.lat);
        const newLng = parseFloat(result.lon);

        setLat(newLat);
        setLng(newLng);
        setVenueAddress(result.display_name.split(',')[0]); // First part is usually the venue

        // Populate broad details from nominatim
        setCity(result.address?.city || result.address?.town || result.address?.village || result.name || '');
        setState(result.address?.state || '');
        setCountry(result.address?.country || '');
        setZipCode(result.address?.postcode || '');

        // Clear search
        setSearchResults([]);
        setSearchQuery('');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex-1 space-y-2 relative">
                    <label className="text-xs font-black uppercase tracking-widest text-surface-800/40 ml-1">Search Venue / Address</label>
                    <div className="flex gap-2 relative">
                        <input
                            type="text"
                            placeholder="Search OpenStreetMap (e.g. Eiffel Tower, Paris)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full p-4 bg-surface-50  outline-none focus:bg-white border-2 border-transparent focus:border-primary transition-all font-bold text-sm"
                        />
                        {isSearching && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <Loader2 size={20} className="animate-spin text-primary" />
                            </div>
                        )}
                    </div>

                    {/* Search Results Dropdown */}
                    {searchResults.length > 0 && (
                        <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white border border-surface-200  shadow-xl overflow-hidden max-h-[300px] overflow-y-auto">
                            {searchResults.map((result, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => handleSelectResult(result)}
                                    className="p-4 hover:bg-surface-50 cursor-pointer border-b border-surface-100 last:border-0 transition-colors"
                                >
                                    <p className="text-sm font-bold text-surface-900 truncate">{result.name || result.display_name.split(',')[0]}</p>
                                    <p className="text-xs text-surface-500 truncate">{result.display_name}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={isLocating}
                    className="px-6 py-4 bg-surface-100 text-surface-900 font-black text-sm uppercase tracking-wider  hover:bg-surface-200 transition-all flex items-center justify-center gap-2 whitespace-nowrap border-2 border-transparent focus:border-primary shrink-0"
                >
                    {isLocating ? (
                        <>
                            <Loader2 size={16} className="animate-spin text-surface-900" />
                            Locating...
                        </>
                    ) : (
                        <>
                            <MapPin size={20} strokeWidth={2} />
                            Use Current Location
                        </>
                    )}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-surface-800/40 ml-1">Venue Address</label>
                    <input
                        type="text"
                        placeholder="Street, Building, etc."
                        value={venueAddress}
                        onChange={(e) => setVenueAddress(e.target.value)}
                        className="w-full p-4 bg-surface-50  outline-none focus:bg-white border-2 border-transparent focus:border-primary transition-all font-bold text-sm"
                    />
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-surface-800/40 ml-1">City</label>
                        <input
                            type="text"
                            placeholder="City"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full p-4 bg-surface-50  outline-none focus:bg-white border-2 border-transparent focus:border-primary transition-all font-bold text-sm"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-surface-800/40 ml-1">ZIP/Postal</label>
                        <input
                            type="text"
                            placeholder="ZIP Code"
                            value={zipCode}
                            onChange={(e) => setZipCode(e.target.value)}
                            className="w-full p-4 bg-surface-50  outline-none focus:bg-white border-2 border-transparent focus:border-primary transition-all font-bold text-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between ml-1 mb-2">
                    <label className="text-xs font-black uppercase tracking-widest text-surface-800/40">Pin Exact Location (Map)</label>
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 ">
                        {lat.toFixed(4)}, {lng.toFixed(4)}
                    </span>
                </div>

                {!L ? (
                    <div className="h-[250px] w-full bg-surface-50 animate-pulse  flex items-center justify-center font-bold text-surface-400">Loading Map...</div>
                ) : (
                    <div className="h-[350px] w-full  overflow-hidden border-2 border-surface-100 relative z-0">
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
                            <Marker position={[lat, lng]} />
                            <MapUpdater center={[lat, lng]} />
                            <MapEvents onLocationSelect={(la, ln) => {
                                setLat(la);
                                setLng(ln);
                                // Optionally reverse geocode on map click too:
                                reverseGeocode(la, ln);
                            }} />
                        </MapContainer>
                    </div>
                )}
                <p className="text-[10px] font-black uppercase tracking-widest text-surface-800/30 text-center mt-2">
                    Search for a venue above, or click anywhere on the map to place the precise map pin.
                </p>
            </div>
        </div>
    );
}

