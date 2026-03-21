'use client';

import React, { useState, useEffect } from 'react';
import { useEvents } from '@/hooks/useEvents';
import { usePreferences } from '@/hooks/usePreferences';
import { useUserLocation } from '@/hooks/useUserLocation';
import EventSearchCard from '@/components/ui/EventSearchCard';
import FilterSidebar from '@/components/event/FilterSidebar';
import CategoryPills from '@/components/event/CategoryPills';
import { Theater } from 'lucide-react';

export default function EventsPage() {
    const { preferences } = usePreferences();
    const { location } = useUserLocation();
    const [selectedCities, setSelectedCities] = useState<string[]>([]);
    
    const [filters, setFilters] = useState({
        date: '',
        categories: [] as string[],
        tags: [] as string[],
        priceRange: [0, 0] as [number, number],
    });

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

    // Derive top category for the pill bar
    const topCategory = filters.categories.length === 1 ? filters.categories[0] : (filters.categories.length === 0 ? 'all' : '');

    // Sync top category with sidebar categories
    const handleTopCategorySelect = (catId: string) => {
        if (catId === 'all') {
            setFilters(f => ({ ...f, categories: [] }));
        } else {
            setFilters(f => ({ ...f, categories: [catId] }));
        }
    };

    const { events, loading } = useEvents(
        filters.categories.join(','),
        'APPROVED',
        undefined,
        selectedCities.length > 0 && selectedCities[0] !== 'Worldwide' ? selectedCities.join(',') : undefined,
        undefined,
        location?.lat,
        location?.lng,
        undefined,
        undefined, // language (removed)
        filters.priceRange[0] || undefined,
        filters.priceRange[1] || undefined,
        filters.date,
        filters.tags
    );

    const activeCity = selectedCities.length > 0 ? (selectedCities[0] === 'Worldwide' ? 'All Cities' : selectedCities[0]) : 'All Cities';

    const availableCategories = preferences?.categories?.map(c => ({ id: c.name, name: c.name })) || [];
    const allCategories = [{ id: 'all', name: 'All' }, ...availableCategories];
    
    const availableTags = preferences?.tags || [];

    return (
        <main className="min-h-screen bg-surface-50 py-12 pb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
                    
                    {/* Sticky Sidebar */}
                    <aside className="w-full md:w-64 lg:w-72 shrink-0">
                        <div className="sticky top-24">
                            <FilterSidebar 
                                filters={filters}
                                onFilterChange={setFilters}
                                availableCategories={availableCategories}
                                availableTags={availableTags}
                            />
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                        <header className="mb-8">
                            <h1 className="text-3xl font-black text-foreground mb-6">
                                Events In {activeCity}
                            </h1>
                            <CategoryPills 
                                categories={allCategories}
                                selectedCategory={topCategory}
                                onSelect={handleTopCategorySelect}
                            />
                        </header>

                        <div className="space-y-16">
                            {loading ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                                    {Array.from({ length: 8 }).map((_, i) => (
                                        <div key={i} className="aspect-[2/3]  bg-surface-200 animate-pulse" />
                                    ))}
                                </div>
                            ) : events.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                                    {events.map(event => (
                                        <EventSearchCard key={event.id} event={event} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-24 bg-white  border-2 border-dashed border-surface-200 shadow-sm">
                                <div className="mb-4">
                                    <Theater size={64} className="text-surface-300 mx-auto" strokeWidth={1.5} />
                                </div>
                                    <h3 className="text-2xl font-bold text-surface-900 mb-2">No events found</h3>
                                    <p className="text-surface-600 px-6">Try adjusting your filters to find what you're looking for.</p>
                                    <button 
                                        onClick={() => {
                                            setFilters({ date: '', categories: [], tags: [], priceRange: [0, 0] });
                                        }}
                                        className="mt-6 text-primary font-bold hover:underline"
                                    >
                                        Clear All Filters
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}


