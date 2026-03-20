'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import TagChip from '@/components/ui/TagChip';
import CalendarButtons from '@/components/event/CalendarButtons';
import EventMapView from '@/components/event/EventMapView';
import { Event } from '@/types';
import { Clock, MapPin, ArrowLeft, Map } from 'lucide-react';

interface EventDetailsViewProps {
    event: Event;
    isAdminView?: boolean;
}

export default function EventDetailsView({ event, isAdminView = false }: EventDetailsViewProps) {
    return (
        <div className="min-h-screen bg-surface-50">
            {/* Breadcrumbs & Navigation - Only show for users */}
            {!isAdminView && (
                <div className="bg-white border-b border-surface-200">
                    <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-surface-400 text-[10px] font-black uppercase tracking-widest">
                            <Link href="/" className="hover:text-primary">Home</Link>
                            <span>/</span>
                            <Link href="/events" className="hover:text-primary">Events</Link>
                            <span>/</span>
                            <span className="text-surface-900 line-clamp-1">{event.title}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Visual Header */}
            <div className="relative w-full h-[50vh] md:h-[60vh] bg-surface-900 overflow-hidden">
                {event.detailImage ? (
                    <Image
                        src={event.detailImage}
                        alt={event.title}
                        fill
                        priority
                        className="object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-surface-800 to-surface-950" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-surface-900 via-surface-900/40 to-transparent opacity-80" />

                <div className="absolute bottom-10 left-0 right-0 max-w-7xl mx-auto px-6">
                    <div className="flex flex-wrap gap-2 mb-4">
                        <TagChip
                            label={event.category}
                            variant="primary"
                            href={isAdminView ? undefined : `/events?category=${encodeURIComponent(event.category)}`}
                        />
                        {event.tags.map(tag => (
                            <TagChip
                                key={tag}
                                label={tag}
                                href={isAdminView ? undefined : `/events?tag=${encodeURIComponent(tag)}`}
                                className="bg-white/10 text-white border-white/20"
                            />
                        ))}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-2 leading-tight">
                        {event.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-6 text-white/90 font-medium pt-2">
                        <div className="flex items-center">
                            <span className="text-sm uppercase font-black tracking-wider px-4 py-1.5 rounded-lg bg-primary/20 text-white whitespace-nowrap border border-primary/30 backdrop-blur-sm">
                                {new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' })}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-surface-200">
                            <Clock size={18} strokeWidth={2.5} className="opacity-80" />
                            {event.time}
                        </div>
                        <div className="flex items-center gap-2 text-primary-200 font-bold">
                            <MapPin size={18} strokeWidth={2.5} />
                            {event.location}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-10 focus:outline-none">
                    {!isAdminView && (
                        <div className="flex items-center gap-4 mb-2">
                            <Link href="/events" className="flex items-center gap-2 text-xs font-black text-primary uppercase tracking-widest hover:translate-x-[-4px] transition-transform">
                                <ArrowLeft size={16} strokeWidth={3} />
                                Back to Events
                            </Link>
                        </div>
                    )}
                    <section>
                        <h2 className="text-2xl font-black mb-4">About the Event</h2>
                        <p className="text-surface-800 leading-relaxed text-lg whitespace-pre-wrap">
                            {event.description}
                        </p>
                    </section>

                    {event.gallery && event.gallery.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-black mb-4">Gallery</h2>
                            <div className="grid grid-cols-2 gap-4">
                                {event.gallery.map((img, i) => (
                                    <div key={i} className="relative aspect-video rounded-xl overflow-hidden shadow-card group">
                                        <Image src={img} alt={`Gallery ${i}`} fill className="object-cover" />
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    <section className="p-8 bg-white rounded-3xl border border-surface-200 shadow-sm">
                        <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                            <MapPin size={24} className="text-primary" strokeWidth={3} />
                            Venue & Location
                        </h3>
                        
                        <div className="space-y-6">
                            <div className="aspect-video bg-surface-100 rounded-2xl overflow-hidden shadow-inner border border-surface-100">
                                {event.locationCoords?.coordinates ? (
                                    <EventMapView 
                                        lat={event.locationCoords.coordinates[1]} 
                                        lng={event.locationCoords.coordinates[0]} 
                                        title={event.title}
                                        locationName={event.location}
                                    />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-surface-800/40">
                                        <Map size={40} strokeWidth={1.5} />
                                        <span className="ml-3 font-medium uppercase tracking-widest text-xs">Map Location Not Provided</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-4 p-6 bg-surface-50 rounded-2xl border border-surface-100">
                                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-surface-200 flex items-center justify-center shrink-0">
                                    <MapPin size={20} className="text-primary" strokeWidth={2.5} />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-surface-400 uppercase tracking-widest mb-1">Venue Address</p>
                                    <p className="text-lg font-bold text-surface-900 leading-snug">
                                        {event.locationDetails ? (
                                            <>
                                                {event.locationDetails.venueAddress && <span>{event.locationDetails.venueAddress}<br /></span>}
                                                <span className="text-surface-600 font-semibold">
                                                    {[event.locationDetails.city, event.locationDetails.state, event.locationDetails.country].filter(Boolean).join(', ')}
                                                    {event.locationDetails.zipCode && ` - ${event.locationDetails.zipCode}`}
                                                </span>
                                            </>
                                        ) : (
                                            event.location
                                        )}
                                    </p>
                                    
                                    {event.locationCoords?.coordinates && (
                                        <a 
                                            href={`https://www.google.com/maps/dir/?api=1&destination=${event.locationCoords.coordinates[1]},${event.locationCoords.coordinates[0]}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-white border border-surface-200 rounded-xl text-sm font-black text-primary hover:bg-surface-50 transition-all shadow-sm group/btn"
                                        >
                                            <Map size={16} strokeWidth={3} className="group-hover/btn:scale-110 transition-transform" />
                                            Get Directions
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Sidebar / Sidebar Actions */}
                <div className="space-y-6">
                    <div className="sticky top-10 space-y-6">
                        <div className="p-8 bg-surface-50 rounded-2xl shadow-premium border border-primary/10">
                            <div className="mb-6">
                                <p className="text-sm uppercase tracking-widest font-black text-surface-800/40 mb-1">Entry Fee</p>
                                <h4 className="text-3xl font-black text-primary">{event.entry || 'Free Entry'}</h4>
                            </div>

                            <div className="space-y-4">
                                {event.meetingLink && (
                                    <a
                                        href={event.meetingLink}
                                        target="_blank"
                                        className="flex items-center justify-center w-full py-3 bg-surface-900 text-white font-bold rounded-xl"
                                    >
                                        Join Meeting
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="p-6 bg-surface-100 rounded-2xl border border-surface-200">
                            <h4 className="font-bold mb-4 text-center">Add to Calendar</h4>
                            <CalendarButtons event={event} />
                        </div>

                        <div className="p-6 flex flex-col items-center gap-4 border-t border-surface-200 mt-4">
                            <p className="text-xs font-black text-surface-400 uppercase tracking-widest">Share this Event</p>
                            <div className="flex gap-4">
                                <a 
                                    href={`https://www.facebook.com/sharer/sharer.php?u=${typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : ''}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:scale-110 transition-transform shadow-sm"
                                    title="Share on Facebook"
                                >
                                    <svg width={20} height={20} fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                </a>
                                <a 
                                    href={`https://twitter.com/intent/tweet?url=${typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : ''}&text=${encodeURIComponent(event.title)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:scale-110 transition-transform shadow-sm"
                                    title="Share on X"
                                >
                                    <svg width={18} height={18} fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                                </a>
                                <a 
                                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(event.title)}%20${typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : ''}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:scale-110 transition-transform shadow-sm"
                                    title="Share on WhatsApp"
                                >
                                    <svg width={22} height={22} fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.634 1.437h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                </a>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
