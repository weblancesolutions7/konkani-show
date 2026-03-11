
export interface LocationData {
    lat: number;
    lng: number;
    city?: string;
    source: 'browser' | 'ip' | 'manual';
    timestamp: number;
}

const LOCATION_STORAGE_KEY = 'user_location_data';

export async function getBrowserLocation(): Promise<Pick<LocationData, 'lat' | 'lng'>> {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
            },
            (error) => {
                reject(error);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
    });
}

export async function getIPLocation(): Promise<LocationData> {
    try {
        // Using ip-api.com (free for non-commercial use, 45 requests/min)
        // Alternatively, use a more robust production-grade service like MaxMind or IpStack
        const response = await fetch('http://ip-api.com/json/');
        if (!response.ok) throw new Error('IP location failed');
        const data = await response.json();
        
        return {
            lat: data.lat,
            lng: data.lon,
            city: data.city,
            source: 'ip',
            timestamp: Date.now(),
        };
    } catch (error) {
        console.error('IP Location error:', error);
        // Fallback to a default location (e.g., Goa, India)
        return {
            lat: 15.2993,
            lng: 74.1240,
            city: 'Goa',
            source: 'manual',
            timestamp: Date.now(),
        };
    }
}

export function saveLocation(data: LocationData) {
    if (typeof window !== 'undefined') {
        localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(data));
        window.dispatchEvent(new CustomEvent('locationChange', { detail: data }));
    }
}

export function getStoredLocation(): LocationData | null {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(LOCATION_STORAGE_KEY);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                return null;
            }
        }
    }
    return null;
}
