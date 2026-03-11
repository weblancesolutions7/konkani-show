
'use client';

import { useState, useEffect, useCallback } from 'react';
import { LocationData, getBrowserLocation, getIPLocation, getStoredLocation, saveLocation } from '@/lib/location';

export function useUserLocation() {
    const [location, setLocation] = useState<LocationData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const detectLocation = useCallback(async (forceBrowser = true) => {
        setLoading(true);
        setError(null);
        try {
            // Try browser geolocation first if forced or no stored location
            if (forceBrowser || !location) {
                try {
                    const coords = await getBrowserLocation();
                    const newLocation: LocationData = {
                        ...coords,
                        source: 'browser',
                        timestamp: Date.now(),
                    };
                    setLocation(newLocation);
                    saveLocation(newLocation);
                    return;
                } catch (err) {
                    console.log('Browser geolocation failed or denied, falling back to IP data.');
                }
            }

            // Fallback to IP location
            const ipLoc = await getIPLocation();
            setLocation(ipLoc);
            saveLocation(ipLoc);
        } catch (err) {
            setError('Could not determine location');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const stored = getStoredLocation();
        if (stored) {
            setLocation(stored);
            setLoading(false);
        } else {
            detectLocation();
        }

        const handleLocationChange = (e: any) => {
            setLocation(e.detail);
        };

        window.addEventListener('locationChange', handleLocationChange);
        return () => window.removeEventListener('locationChange', handleLocationChange);
    }, [detectLocation]);

    return {
        location,
        loading,
        error,
        detectLocation,
    };
}
