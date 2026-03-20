'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Event } from '@/types';
import { X, ArrowLeft } from 'lucide-react';

interface EventPreviewProps {
    event: Event;
    onApprove?: (id: string) => Promise<void>;
    onReject?: (id: string) => Promise<void>;
}

export default function EventPreview({ event, onApprove, onReject }: EventPreviewProps) {
    const router = useRouter();

    const handleEdit = () => {
        router.push(`/admin/events/${event.id}/edit`);
    };

    const handleBack = () => {
        router.back();
    };

    return (
        <div className="bg-white shadow-premium border border-surface-200 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
            {/* Left: Visual Content */}
            <div className="md:w-1/2 bg-surface-100 relative min-h-[400px]">
                <img 
                    src={event.detailImage || event.featureImage} 
                    alt={event.title} 
                    className="w-full h-full object-cover" 
                />
                <div className="absolute top-6 left-6 flex gap-3">
                    <span className="px-4 py-1.5 bg-primary text-white text-xs font-black uppercase tracking-widest shadow-lg">{event.category}</span>
                    {event.status === 'PENDING' && (
                        <span className="px-4 py-1.5 bg-amber-500 text-white text-xs font-black uppercase tracking-widest shadow-lg">Pending Review</span>
                    )}
                </div>
                <button 
                    onClick={handleBack}
                    className="absolute top-6 right-6 w-12 h-12 bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                    title="Go Back"
                >
                    <ArrowLeft size={24} strokeWidth={3} />
                </button>
            </div>

            {/* Right: Details & Actions */}
            <div className="md:w-1/2 p-10 flex flex-col">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h2 className="text-4xl font-black leading-tight mb-3">{event.title}</h2>
                        <div className="flex flex-col gap-1">
                            <p className="text-primary text-lg font-bold">{event.date} • {event.time}</p>
                            <p className="text-surface-800/60 font-medium">{event.location}</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-4 mb-10">
                    <div className="space-y-8">
                        <section>
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-surface-400 mb-3">About Event</h3>
                            <p className="text-surface-800 text-base leading-relaxed whitespace-pre-wrap">{event.description}</p>
                        </section>

                        <div className="grid grid-cols-2 gap-6 pt-6 border-t border-surface-100">
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-surface-400 mb-2">Entry Fee</h3>
                                <p className="font-bold text-primary text-lg">{event.entry || 'Free Entry'}</p>
                            </div>
                            {event.meetingLink && (
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-surface-400 mb-2">Meeting Link</h3>
                                    <a href={event.meetingLink} target="_blank" className="text-sm font-bold text-blue-600 truncate block hover:underline">{event.meetingLink}</a>
                                </div>
                            )}
                        </div>

                        {event.tags && event.tags.length > 0 && (
                            <div className="pt-6 border-t border-surface-100">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-surface-400 mb-3">Tags</h3>
                                <div className="flex flex-wrap gap-2">
                                    {event.tags.map(tag => (
                                        <span key={tag} className="px-3 py-1.5 bg-surface-100 text-xs font-bold text-surface-600 uppercase tracking-wider">#{tag}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {event.locationDetails && (
                            <div className="pt-6 border-t border-surface-100">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-surface-400 mb-3">Venue Details</h3>
                                <div className="space-y-1 text-sm font-medium text-surface-800/80">
                                    <p>{event.locationDetails.venueAddress}</p>
                                    <p>{event.locationDetails.city}, {event.locationDetails.state}</p>
                                    <p>{event.locationDetails.country} - {event.locationDetails.zipCode}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-8 border-t border-surface-100 flex flex-wrap gap-4">
                    {onApprove && event.status === 'PENDING' && (
                        <button 
                            onClick={() => onApprove(event.id)}
                            className="flex-1 px-8 py-4 bg-emerald-600 text-white font-black text-sm uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
                        >
                            Approve Event
                        </button>
                    )}
                    {onReject && event.status === 'PENDING' && (
                        <button 
                            onClick={() => onReject(event.id)}
                            className="flex-1 px-8 py-4 bg-rose-600 text-white font-black text-sm uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20"
                        >
                            Reject
                        </button>
                    )}
                    <button 
                        onClick={handleEdit}
                        className="px-8 py-4 bg-surface-100 text-surface-800 font-black text-sm uppercase tracking-widest hover:bg-surface-200 transition-all border border-surface-200"
                    >
                        Edit Details
                    </button>
                </div>
            </div>
        </div>
    );
}
