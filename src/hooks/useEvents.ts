
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Event } from '@/types';
import { API_ROUTES } from '@/config/api';

export function useEvents(category?: string, status?: string, tag?: string) {
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
    }, [category, status, tag]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const refetch = () => fetchEvents();

    return { events, loading, error, refetch };
}
