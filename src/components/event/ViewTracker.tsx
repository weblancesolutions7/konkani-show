'use client';

import { useEffect } from 'react';

interface ViewTrackerProps {
    eventId: string;
}

export default function ViewTracker({ eventId }: ViewTrackerProps) {
    useEffect(() => {
        if (!eventId) return;

        // Prevent double-counting in React Strict Mode during dev
        let hasFired = false;

        const trackView = async () => {
            if (hasFired) return;
            hasFired = true;

            try {
                await fetch(`/api/events/${eventId}/view`, {
                    method: 'POST',
                    // Fire and forget, don't await the response or block anything
                });
            } catch (err) {
                console.error('Failed to track event view:', err);
            }
        };

        trackView();
    }, [eventId]);

    // This component renders nothing, it silently tracks views in the background
    return null;
}
