'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import TagChip from '@/components/ui/TagChip';
import CalendarButtons from '@/components/event/CalendarButtons';
import EventMapView from '@/components/event/EventMapView';
import { Event } from '@/types';
import { Clock, MapPin, ArrowLeft, Map, Heart } from 'lucide-react';

interface EventDetailsViewProps {
    event: Event;
    isAdminView?: boolean;
}

export default function EventDetailsView({ event, isAdminView = false }: EventDetailsViewProps) {
    const [shareUrl, setShareUrl] = useState('');

    useEffect(() => {
        setShareUrl(window.location.href);
    }, []);

    return (
        <div className="min-h-screen bg-[#F5F5F5] text-gray-800">
            {/* Breadcrumbs */}
            {!isAdminView && (
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                            <Link href="/" className="hover:underline">Home</Link>
                            <span>/</span>
                            <Link href="/events" className="hover:underline">Events</Link>
                            <span>/</span>
                            <span className="text-gray-900 font-semibold truncate max-w-[200px]">{event.title}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Hero Section */}
            <div className="relative w-full md:min-h-[480px] bg-gray-950 overflow-hidden flex items-center">
                {/* Backdrop image to blur */}
                <div className="absolute inset-0 select-none">
                    {event.detailImage || event.featureImage ? (
                        <Image src={event.detailImage || event.featureImage} fill className="object-cover blur-xl opacity-30 scale-110" alt="" />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
                </div>

                {/* Hero Container */}
                <div className="relative max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center md:items-start gap-8 z-10 w-full text-white">
                    {/* Left: Poster */}
                    <div className="w-64 md:w-60 aspect-[2/3] relative rounded-xl overflow-hidden shadow-2xl flex-shrink-0 border border-white/10 group">
                        <Image src={event.featureImage || event.detailImage || ''} fill className="object-cover" alt={event.title} />
                    </div>

                    {/* Right: Info */}
                    <div className="flex-1 space-y-4 text-center md:text-left">
                        <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">{event.title}</h1>
                        


                        {/* Format / Tag Pills */}
                        <div className="flex flex-wrap justify-center md:justify-start gap-2">
                            <span className="bg-white/10 border border-white/20 text-xs font-semibold px-3 py-1 rounded cursor-pointer hover:bg-white/20">{event.category}</span>
                            {event.tags.map(tag => (
                                <span key={tag} className="bg-white/10 text-white/80 text-xs px-2 py-1 rounded cursor-pointer hover:bg-white/20">{tag}</span>
                            ))}
                        </div>

                        {/* Metadata row */}
                        <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 text-sm text-gray-300">
                            <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</span>
                            <span className="opacity-50">•</span>
                            <span>{event.time}</span>
                            <span className="opacity-50">•</span>
                            <span className="text-[#7030ef] font-bold">{event.location}</span>
                        </div>

                        {/* Price */}
                        <div className="text-2xl font-black text-[#7030ef]">{event.entry || 'Free Entry'}</div>

                        {/* CTA button */}
                        {event.meetingLink && (
                            <div className="pt-2">
                                <a href={event.meetingLink} target="_blank" className="inline-block bg-gradient-to-r from-[#7030ef] to-[#db1fff] hover:opacity-90 text-white font-bold px-12 py-3 rounded-lg transition-all text-center min-w-[200px] shadow-lg hover:scale-[1.02] shadow-[#7030ef]/20">
                                    Book tickets
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Body */}
            <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main Content (2 cols) */}
                <div className="lg:col-span-2 space-y-8">
                    {!isAdminView && (
                        <div className="flex items-center gap-4">
                            <Link href="/events" className="flex items-center gap-2 text-xs font-bold text-[#7030ef] uppercase tracking-wider hover:translate-x-[-4px] transition-transform">
                                <ArrowLeft size={16} strokeWidth={3} />
                                Back to Events
                            </Link>
                        </div>
                    )}

                    <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h2 className="text-xl font-bold mb-4 text-gray-900 border-b pb-2">About the Event</h2>
                        <p className="text-gray-700 leading-relaxed text-base whitespace-pre-wrap">
                            {event.description}
                        </p>
                    </section>

                    {event.gallery && event.gallery.length > 0 && (
                        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h2 className="text-xl font-bold mb-4 text-gray-900 border-b pb-2">Gallery</h2>
                            <div className="grid grid-cols-2 gap-4">
                                {event.gallery.map((img, i) => (
                                    <div key={i} className="relative aspect-video rounded-lg overflow-hidden border border-gray-100 shadow-sm">
                                        <Image src={img} alt={`Gallery ${i}`} fill className="object-cover" />
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900 border-b pb-2">
                            Venue & Location
                        </h3>
                        
                        <div className="space-y-4">
                            <div className="aspect-video bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                                {event.locationCoords?.coordinates ? (
                                    <EventMapView 
                                        lat={event.locationCoords.coordinates[1]} 
                                        lng={event.locationCoords.coordinates[0]} 
                                        title={event.title}
                                        locationName={event.location}
                                    />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-gray-400">Map location not provided</div>
                                )}
                            </div>
                        </div>
                    </section>
                </div>

                {/* Sidebar (1 col) */}
                <div className="space-y-6">
                    <div className="sticky top-24 space-y-6">
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                            <h4 className="font-bold text-gray-900">Add to Calendar</h4>
                            <CalendarButtons event={event} />
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-center space-y-4">
                            <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Share this Event</p>
                            <div className="flex justify-center gap-4">
                                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[#3b5998] hover:bg-[#2d4373] text-white flex items-center justify-center hover:scale-110 transition-transform shadow-sm" title="Share on Facebook">
                                    <svg width={18} height={18} fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                </a>
                                <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(event.title)}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-black hover:bg-gray-800 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-sm" title="Share on X">
                                    <svg width={16} height={16} fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                                </a>
                                <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(event.title)}%20${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center hover:scale-110 transition-transform shadow-sm" title="Share on WhatsApp">
                                    <svg width={18} height={18} fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.634 1.437h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
