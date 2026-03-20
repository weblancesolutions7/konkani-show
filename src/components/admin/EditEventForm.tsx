'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_ROUTES } from '@/config/api';
import { Event } from '@/types';
import EventForm from '@/components/event/EventForm';
import { useNotification } from '@/components/ui/NotificationProvider';
import { ArrowLeft } from 'lucide-react';

interface EditEventFormProps {
    event: Event;
    onSave?: () => void;
    onCancel?: () => void;
}

export default function EditEventForm({ event, onSave, onCancel }: EditEventFormProps) {
    const router = useRouter();
    const { showAlert } = useNotification();
    const [saving, setSaving] = useState(false);

    const handleSave = async (eventData: any) => {
        setSaving(true);
        try {
            const response = await fetch(API_ROUTES.EVENT_BY_ID(event.id), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(eventData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.details || errorData.error || 'Failed to update');
            }

            if (onSave) {
                onSave();
            } else {
                showAlert(`Event "${eventData.title}" updated successfully!`, 'Success');
                router.push(`/admin/events/${event.id}`);
            }
        } catch (error: any) {
            console.error('Update failed:', error);
            showAlert(`Failed to update event: ${error.message}`, 'Update Error');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            router.back();
        }
    };

    return (
        <div className="max-w-5xl mx-auto py-12 px-6">
            <div className="flex items-center gap-4 mb-12">
                <button
                    onClick={handleCancel}
                    className="w-12 h-12 bg-surface-50 flex items-center justify-center hover:bg-surface-100 transition-colors rounded-full border border-surface-200"
                    title="Go Back"
                >
                    <ArrowLeft size={24} strokeWidth={3} />
                </button>
                <div>
                    <h2 className="text-3xl font-black tracking-tight">Edit Event</h2>
                    <p className="text-surface-800/40 font-bold text-sm uppercase tracking-widest mt-1">Ref: {event.id}</p>
                </div>
            </div>

            <EventForm
                initialData={event}
                onSubmit={handleSave}
                isSubmitting={saving}
                submitLabel="Save Changes"
                isAdmin={true}
            />

            <div className="mt-8 flex justify-center">
                <button
                    onClick={handleCancel}
                    className="text-surface-800/40 font-black uppercase tracking-widest text-xs hover:text-primary transition-colors"
                >
                    Cancel and Return
                </button>
            </div>
        </div>
    );
}
