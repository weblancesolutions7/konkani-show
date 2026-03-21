'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { API_ROUTES } from '@/config/api';
import { Event } from '@/types';
import EditEventForm from '@/components/admin/EditEventForm';
import { Loader2 } from 'lucide-react';
import { useNotification } from '@/components/ui/NotificationProvider';

// Note: ArrowLeft is from lucide-react, the above import had a typo in think block, fixing here.
import { ArrowLeft as ArrowLeftIcon } from 'lucide-react';

export default function AdminEventEditPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const from = searchParams.get('from') || 'approval';
    const { showAlert } = useNotification();
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchEvent = async () => {
        setLoading(true);
        try {
            const response = await fetch(API_ROUTES.EVENT_BY_ID(params.id as string));
            if (!response.ok) throw new Error('Failed to fetch event');
            const data = await response.json();
            setEvent(data);
        } catch (error) {
            console.error('Fetch failed:', error);
            showAlert('Failed to load event for editing.', 'Error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (params.id) fetchEvent();
    }, [params.id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-10 h-full">
                <Loader2 size={40} className="animate-spin text-primary" />
            </div>
        );
    }

    if (!event) {
        return (
            <div className="p-10">
                <div className="max-w-4xl mx-auto text-center py-20">
                    <h1 className="text-2xl font-black mb-4">Event Not Found</h1>
                    <button onClick={() => router.push('/admin')} className="text-primary font-bold hover:underline">Back to Dashboard</button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white">
            <EditEventForm
                event={event}
                onSave={() => {
                    showAlert('Changes saved successfully!', 'Success');
                    router.push(`/admin/events/${event.id}?from=${from}`);
                }}
                onCancel={() => router.push(`/admin/events/${event.id}?from=${from}`)}
            />
        </div>
    );
}
