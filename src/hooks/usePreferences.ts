
'use client';

import { useState, useEffect } from 'react';
import { Preferences } from '@/types';
import { API_ROUTES } from '@/config/api';

export function usePreferences() {
    const [preferences, setPreferences] = useState<Preferences | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function fetchPreferences() {
            try {
                const response = await fetch(API_ROUTES.PREFERENCES);
                if (!response.ok) throw new Error('Failed to fetch preferences');
                const data = await response.json();
                setPreferences(data);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Unknown error'));
            } finally {
                setLoading(false);
            }
        }

        fetchPreferences();
    }, []);

    async function updatePreferences(newPrefs: Preferences) {
        try {
            const response = await fetch(API_ROUTES.PREFERENCES, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newPrefs),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.details || errorData.error || 'Failed to update preferences');
            }
            const data = await response.json();
            setPreferences(data);
            return data;
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Unknown error');
            setError(error);
            throw error;
        }
    }

    return { preferences, loading, error, updatePreferences, setPreferences };
}
