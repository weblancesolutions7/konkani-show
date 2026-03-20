'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { API_ROUTES } from '@/config/api';
import { Event } from '@/types';
import EventDetailsView from '@/components/event/EventDetailsView';
import { Loader2, ArrowLeft, Check, X, Pencil, Star } from 'lucide-react';
import { useNotification } from '@/components/ui/NotificationProvider';

export default function AdminEventReviewPage() {
    const params = useParams();
    const router = useRouter();
    const { showAlert } = useNotification();
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchEvent = async () => {
        setLoading(true);
        try {
            const response = await fetch(API_ROUTES.EVENT_BY_ID(params.id as string));
            if (!response.ok) throw new Error('Failed to fetch event');
            const data = await response.json();
            setEvent(data);
        } catch (error) {
            console.error('Fetch failed:', error);
            showAlert('Failed to load event details.', 'Error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (params.id) fetchEvent();
    }, [params.id]);

    const handleApprove = async () => {
        if (!event) return;
        setActionLoading(true);
        try {
            const response = await fetch(API_ROUTES.EVENT_STATUS(event.id), {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'APPROVED' }),
            });
            if (!response.ok) throw new Error('Failed to approve');
            showAlert('Event approved successfully!', 'Success');
            fetchEvent();
        } catch (error) {
            console.error('Approve failed:', error);
            showAlert('Failed to approve event.', 'Error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!event) return;
        setActionLoading(true);
        try {
            const response = await fetch(API_ROUTES.EVENT_STATUS(event.id), {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'REJECTED' }),
            });
            if (!response.ok) throw new Error('Failed to reject');
            showAlert('Event rejected successfully.', 'Success');
            fetchEvent();
        } catch (error) {
            console.error('Reject failed:', error);
            showAlert('Failed to reject event.', 'Error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleToggleFeatured = async () => {
        if (!event) return;
        setActionLoading(true);
        try {
            const response = await fetch(API_ROUTES.EVENT_STATUS(event.id), {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isFeatured: !event.isFeatured }),
            });
            if (!response.ok) throw new Error('Failed to update featured status');
            showAlert(event.isFeatured ? 'Feature removed.' : 'Event featured successfully!', 'Success');
            fetchEvent();
        } catch (error) {
            console.error('Feature toggle failed:', error);
            showAlert('Failed to update featured status.', 'Error');
        } finally {
            setActionLoading(false);
        }
    };

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
        <div className="bg-surface-50">
            {/* Admin Control Bar */}
            <div className="sticky top-0 z-50 bg-white border-b border-surface-200 shadow-sm p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/admin')}
                        className="w-10 h-10 flex items-center justify-center hover:bg-surface-100 rounded-xl transition-colors"
                    >
                        <ArrowLeft size={20} strokeWidth={3} />
                    </button>
                    <div>
                        <h1 className="text-lg font-black leading-none">Reviewing: {event.title}</h1>
                        <p className="text-xs font-bold text-surface-400 uppercase tracking-widest mt-1">Status: {event.status}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {event.status === 'PENDING' && (
                        <>
                            <button
                                onClick={handleApprove}
                                disabled={actionLoading}
                                className="px-6 py-2.5 bg-emerald-600 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 rounded-xl"
                            >
                                {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} strokeWidth={3} />}
                                Approve
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={actionLoading}
                                className="px-6 py-2.5 bg-rose-600 text-white text-xs font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-500/20 flex items-center gap-2 rounded-xl"
                            >
                                {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <X size={14} strokeWidth={3} />}
                                Reject
                            </button>
                        </>
                    )}

                    <button
                        onClick={handleToggleFeatured}
                        disabled={actionLoading}
                        className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-md group ${event.isFeatured ? 'bg-amber-500 text-white shadow-amber-500/20' : 'bg-surface-200 text-surface-600 hover:bg-surface-300'}`}
                    >
                        <Star size={14} fill={event.isFeatured ? 'currentColor' : 'none'} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
                        {event.isFeatured ? 'Featured' : 'Feature'}
                    </button>

                    <button
                        onClick={() => router.push(`/admin/events/${event.id}/edit`)}
                        className="px-6 py-2.5 bg-surface-900 text-white text-xs font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 rounded-xl"
                    >
                        <Pencil size={14} strokeWidth={3} />
                        Edit Details
                    </button>
                </div>
            </div>

            <div className="relative">
                <EventDetailsView event={event} isAdminView={true} />

                {/* Status Ribbon Overlay for non-approved events */}
                {event.status !== 'APPROVED' && (
                    <div className="absolute top-20 left-0 w-full bg-amber-500/10 border-y border-amber-500/20 py-2 text-center backdrop-blur-sm pointer-events-none">
                        <span className="text-xs font-black text-amber-700 uppercase tracking-[0.3em]">
                            Preview Mode - Event is {event.status}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
