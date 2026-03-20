
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
    tags?: string[],
    page: number = 1,
    limit: number = 20
) {
    const [events, setEvents] = useState<Event[]>([]);
    const [pagination, setPagination] = useState({ total: 0, totalPages: 1, currentPage: 1, limit: 20 });
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
            params.set('page', page.toString());
            params.set('limit', limit.toString());

            const url = params.toString()
                ? `${API_ROUTES.EVENTS}?${params.toString()}`
                : API_ROUTES.EVENTS;

            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch events');
            const result = await response.json();
            
            // Handle both old array response and new paginated response structure
            if (Array.isArray(result)) {
                setEvents(result);
                setPagination({ total: result.length, totalPages: 1, currentPage: 1, limit: result.length });
            } else {
                setEvents(result.data || []);
                setPagination({
                    total: result.pagination?.total || 0,
                    totalPages: result.pagination?.totalPages || 1,
                    currentPage: result.pagination?.page || 1,
                    limit: result.pagination?.limit || limit
                });
            }
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
            setEvents([]);
        } finally {
            setLoading(false);
        }
    }, [category, status, tag, location, q, lat, lng, sort, language, minPrice, maxPrice, dateFilter, tags, page, limit]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const refetch = () => fetchEvents();

    return { events, pagination, loading, error, refetch };
}
