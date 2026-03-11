'use client';

import React, { useState, useEffect } from 'react';
import { useEvents } from '@/hooks/useEvents';
import EventCard from '@/components/ui/EventCard';

export default function EventsPage() {
    const [selectedCities, setSelectedCities] = useState<string[]>([]);

    useEffect(() => {
        const loadCities = () => {
            const saved = localStorage.getItem('selectedCities');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    if (Array.isArray(parsed)) setSelectedCities(parsed);
                } catch (e) { console.error(e); }
            }
        };

        loadCities();
        window.addEventListener('cityChange', loadCities);
        return () => window.removeEventListener('cityChange', loadCities);
    }, []);

    const { events, loading } = useEvents(undefined, undefined, undefined, selectedCities.join(','));

    return (
        <main className="min-h-screen bg-surface-50 py-12 pb-24">
            <div className="max-w-7xl mx-auto px-6">
                <header className="mb-12">
                    <h1 className="text-4xl font-black text-foreground mb-2">All Upcoming Shows</h1>
                    <p className="text-surface-800/60 font-medium text-lg">
                        Explore every event happening in the Konkani community.
                    </p>
                </header>

                <div className="space-y-16">
                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div key={i} className="aspect-[2/3] rounded-xl bg-surface-200 animate-pulse" />
                            ))}
                        </div>
                    ) : events.length > 0 ? (
                        (() => {
                            const isSelected = (event: any) =>
                                selectedCities.length === 0 ||
                                selectedCities.some(city => event.location.toLowerCase().includes(city.toLowerCase()));

                            const selectedEvents = events.filter(isSelected);
                            const otherEvents = events.filter(e => !isSelected(e));

                            return (
                                <>
                                    {/* Selected Cities Section */}
                                    {selectedEvents.length > 0 && (
                                        <div>
                                            {selectedCities.length > 0 && (
                                                <div className="flex items-center gap-4 mb-8">
                                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary/60 whitespace-nowrap">Near You</h3>
                                                    <div className="h-px w-full bg-surface-200" />
                                                </div>
                                            )}
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
                                                {selectedEvents.map(event => <EventCard key={event.id} event={event} />)}
                                            </div>
                                        </div>
                                    )}

                                    {/* Other Cities Section */}
                                    {otherEvents.length > 0 && (
                                        <div>
                                            <div className="flex items-center gap-4 mb-8">
                                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-surface-400 whitespace-nowrap">Explore Other Cities</h3>
                                                <div className="h-px w-full bg-surface-200" />
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8 opacity-90">
                                                {otherEvents.map(event => <EventCard key={event.id} event={event} />)}
                                            </div>
                                        </div>
                                    )}
                                </>
                            );
                        })()
                    ) : (
                        <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-surface-200 shadow-sm">
                            <div className="text-6xl mb-4">🎭</div>
                            <h3 className="text-2xl font-bold text-surface-900 mb-2">No events found</h3>
                            <p className="text-surface-600">Check back later for new upcoming shows.</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
