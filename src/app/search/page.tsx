
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useEvents } from '@/hooks/useEvents';
import EventCard from '@/components/ui/EventCard';
import Link from 'next/link';

function SearchResults() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';
    const location = searchParams.get('location') || '';

    const { events, loading } = useEvents(undefined, undefined, undefined, location, query);

    return (
        <main className="min-h-screen bg-surface-50 py-12 pb-24">
            <div className="max-w-7xl mx-auto px-6">
                <header className="mb-12">
                    <div className="flex items-center gap-2 text-surface-400 text-sm mb-4 font-bold uppercase tracking-widest">
                        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                        <span>/</span>
                        <span>Search Results</span>
                    </div>
                    <h1 className="text-4xl font-black text-foreground mb-2">
                        {query ? `Search for "${query}"` : 'Search Results'}
                    </h1>
                    <p className="text-surface-800/60 font-medium text-lg">
                        {events.length} {events.length === 1 ? 'event' : 'events'} found {location ? `in ${location.split(',').length} cities` : 'across all cities'}.
                    </p>
                </header>

                <div className="space-y-16">
                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
                            {Array.from({ length: 10 }).map((_, i) => (
                                <div key={i} className="aspect-[2/3] rounded-xl bg-surface-200 animate-pulse" />
                            ))}
                        </div>
                    ) : events.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
                            {events.map(event => (
                                <EventCard key={event.id} event={event} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-surface-200 shadow-sm">
                            <div className="text-6xl mb-4">🔍</div>
                            <h3 className="text-2xl font-bold text-surface-900 mb-2">No results found</h3>
                            <p className="text-surface-600 mb-8">We couldn't find any events matching "{query}" in the selected locations.</p>
                            <Link
                                href="/events"
                                className="px-8 py-3 bg-primary text-white font-black rounded-2xl hover:shadow-lg hover:shadow-primary/25 transition-all inline-block"
                            >
                                Browse All Events
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-surface-50 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        }>
            <SearchResults />
        </Suspense>
    );
}
