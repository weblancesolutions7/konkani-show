
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Event } from '@/types';
import { API_ROUTES } from '@/config/api';

export function useEvents(
    category?: string, 
    status?: string, 
    tag?: string, 
    location?: string, 
    q?: string, 
    lat?: number, 
    lng?: number, 
    sort?: string,
    language?: string,
    minPrice?: number,
    maxPrice?: number,
    dateFilter?: string,
    tags?: string[]
) {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (category) params.set('category', category);
            if (status) params.set('status', status);
            if (tag) params.set('tag', tag);
            if (location) params.set('location', location);
            if (q) params.set('q', q);
            if (lat) params.set('lat', lat.toString());
            if (lng) params.set('lng', lng.toString());
            if (sort) params.set('sort', sort);
            if (language) params.set('language', language);
            if (minPrice !== undefined) params.set('minPrice', minPrice.toString());
            if (maxPrice !== undefined) params.set('maxPrice', maxPrice.toString());
            if (dateFilter) params.set('dateFilter', dateFilter);
            if (tags && tags.length > 0) params.set('tags', tags.join(','));

            const url = params.toString()
                ? `${API_ROUTES.EVENTS}?${params.toString()}`
                : API_ROUTES.EVENTS;

            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch events');
            const data = await response.json();
            setEvents(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
            setEvents([]);
        } finally {
            setLoading(false);
        }
    }, [category, status, tag, location, q, lat, lng, sort, language, minPrice, maxPrice, dateFilter, tags]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const refetch = () => fetchEvents();

    return { events, loading, error, refetch };
}
