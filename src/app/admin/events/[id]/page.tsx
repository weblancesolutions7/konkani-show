'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { API_ROUTES } from '@/config/api';
import { Event } from '@/types';
import EventDetailsView from '@/components/event/EventDetailsView';
import { Loader2, ArrowLeft, Check, X, Pencil, Star } from 'lucide-react';
import { useNotification } from '@/components/ui/NotificationProvider';

export default function AdminEventReviewPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const from = searchParams.get('from') || 'approval';
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
            {/* Branded Admin Control Bar */}
            <div className="sticky top-0 z-50 text-white shadow-premium overflow-hidden">
                {/* Background & Animation Container */}
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(135deg, #7030ef 0%, #db1fff 100%)' }}>
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute inset-y-0 w-1/4 bg-white/30 -skew-x-12 animate-sweep blur-2xl" style={{ left: '-50%' }} />
                    </div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => router.push(`/admin?view=${from}`)}
                            className="w-10 h-10 flex items-center justify-center hover:bg-white/20 rounded-xl transition-all border border-white/10 active:scale-95"
                            title="Back to Dashboard"
                        >
                            <ArrowLeft size={20} strokeWidth={3} />
                        </button>
                        
                        <div className="flex flex-col">
                            <h1 className="text-sm font-black leading-none tracking-tight">Reviewing: {event.title}</h1>
                            <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] mt-1">Status: {event.status}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {event.status === 'PENDING' && (
                            <>
                                <button
                                    onClick={handleApprove}
                                    disabled={actionLoading}
                                    className="px-5 py-2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-900/20 flex items-center gap-2 rounded-lg border border-white/10"
                                >
                                    {actionLoading ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} strokeWidth={4} />}
                                    Approve
                                </button>
                                <button
                                    onClick={handleReject}
                                    disabled={actionLoading}
                                    className="px-5 py-2 bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-rose-400 transition-all shadow-lg shadow-rose-900/20 flex items-center gap-2 rounded-lg border border-white/10"
                                >
                                    {actionLoading ? <Loader2 size={12} className="animate-spin" /> : <X size={12} strokeWidth={4} />}
                                    Reject
                                </button>
                            </>
                        )}

                        {event.status !== 'REJECTED' && (() => {
                            // Check if event is completed (Simplified robust check)
                            const now = new Date().setHours(0,0,0,0);
                            const parts = event.date.split('-');
                            let eventTime = 0;
                            if (parts.length === 3) {
                                const [p1, p2, p3] = parts.map(Number);
                                const d = p1 > 2000 ? new Date(p1, p2-1, p3) : new Date(p3, p2-1, p1);
                                eventTime = d.getTime();
                            }
                            const isCompleted = event.startAt ? event.startAt < Date.now() : (eventTime < now);
                            
                            if (isCompleted) return null;

                            return (
                                <>
                                    <button
                                        onClick={handleToggleFeatured}
                                        disabled={actionLoading}
                                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-md group border border-white/10 ${event.isFeatured ? 'bg-amber-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                                    >
                                        <Star size={12} fill={event.isFeatured ? 'currentColor' : 'none'} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
                                        {event.isFeatured ? 'Featured' : 'Feature'}
                                    </button>

                                    <button
                                        onClick={() => router.push(`/admin/events/${event.id}/edit?from=${from}`)}
                                        className="px-5 py-2 bg-white text-[#7030ef] text-[10px] font-black uppercase tracking-widest hover:bg-surface-50 transition-all flex items-center gap-2 rounded-lg shadow-xl shadow-black/10"
                                    >
                                        <Pencil size={12} strokeWidth={4} />
                                        Edit Details
                                    </button>
                                </>
                            );
                        })()}
                    </div>
                </div>

                <style jsx>{`
                    @keyframes sweep {
                        0% { transform: translateX(0) skewX(-12deg); }
                        100% { transform: translateX(1000%) skewX(-12deg); }
                    }
                    .animate-sweep {
                        animation: sweep 5s infinite;
                    }
                `}</style>
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
