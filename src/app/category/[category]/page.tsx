
'use client';

import { use } from 'react';
import { useEvents } from '@/hooks/useEvents';
import EventCard from '@/components/ui/EventCard';
import { CONFIG } from '@/config/api';
import Pagination from '@/components/ui/Pagination';
import { useState } from 'react';

interface Props {
    params: Promise<{ category: string }>;
}

export default function CategoryPage({ params }: Props) {
    const { category: rawCategory } = use(params);
    const category = decodeURIComponent(rawCategory);
    const [page, setPage] = useState(1);
    const limit = 15;
    const { events, pagination, loading } = useEvents(category, 'APPROVED', undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, page, limit);

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
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                            {events.map(event => <EventCard key={event.id} event={event} />)}
                        </div>
                        <Pagination 
                            currentPage={pagination.currentPage}
                            totalPages={pagination.totalPages}
                            totalItems={pagination.total}
                            itemsPerPage={pagination.limit}
                            onPageChange={(p) => {
                                setPage(p);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                        />
                    </>
                ) : (
                    <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-surface-200">
                        <p className="text-xl font-bold text-surface-800/40">No events found in this category.</p>
                    </div>
                )}
            </div>
        </main>
    );
}
