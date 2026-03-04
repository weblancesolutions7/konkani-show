
'use client';

import React from 'react';
import { useEvents } from '@/hooks/useEvents';
import EventCard from '@/components/ui/EventCard';
import { CONFIG } from '@/config/api';

interface Props {
    params: { category: string };
}

export default function CategoryPage({ params }: Props) {
    const category = decodeURIComponent(params.category);
    const { events, loading } = useEvents(category);

    return (
        <main className="min-h-screen bg-surface-50 py-12">
            <div className="max-w-7xl mx-auto px-6">
                <header className="mb-12">
                    <h1 className="text-4xl font-black text-foreground capitalize mb-2">{category} Shows</h1>
                    <p className="text-surface-800/60 font-medium">
                        Discover all {category.toLowerCase()} events happening in the Konkani community.
                    </p>
                </header>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="aspect-[2/3] rounded-xl bg-surface-200 animate-pulse" />
                        ))}
                    </div>
                ) : events.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                        {events.map(event => <EventCard key={event.id} event={event} />)}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-surface-200">
                        <p className="text-xl font-bold text-surface-800/40">No events found in this category.</p>
                    </div>
                )}
            </div>
        </main>
    );
}
