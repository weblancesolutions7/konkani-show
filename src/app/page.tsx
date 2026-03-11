
'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePreferences } from '@/hooks/usePreferences';
import { useEvents } from '@/hooks/useEvents';
import CategoryTabs from '@/components/ui/CategoryTabs';
import TagChip from '@/components/ui/TagChip';
import HeroBanner from '@/components/home/HeroBanner';
import { useEffect } from 'react';

// Lazy load heavy components
const EventCard = dynamic(() => import('@/components/ui/EventCard'), {
  loading: () => <div className="aspect-[2/3] rounded-xl bg-surface-200 animate-pulse" />,
});

const FeaturedCategoryCard = dynamic(() => import('@/components/ui/FeaturedCategoryCard'), {
  loading: () => <div className="aspect-square md:aspect-[4/5] rounded-2xl bg-surface-200 animate-pulse" />,
});

export default function HomePage() {
  const { preferences, loading: prefLoading } = usePreferences();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
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

  const { events, loading: eventsLoading } = useEvents(
    selectedCategory === 'All' ? undefined : selectedCategory,
    undefined,
    selectedTag || undefined,
    selectedCities.join(',')
  );

  if (prefLoading) {
    return (
      <div className="min-h-screen bg-surface-50 p-6 space-y-8 animate-pulse">
        <div className="h-64 md:h-96 rounded-2xl bg-surface-200" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="aspect-[2/3] rounded-xl bg-surface-200" />)}
        </div>
      </div>
    );
  }

  const allCategories = [{ id: 'all', name: 'All' }, ...(preferences?.categories || [])];
  const featuredItems = preferences?.featuredCategories || [];

  return (
    <main className="min-h-screen bg-surface-50 pb-20">
      {/* Wrapper to match container constraints */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        {/* Dynamic Hero Carousel */}
        <section className="mb-12">
          <HeroBanner items={featuredItems} />
        </section>

        {/* Featured Categories Grid (Stripe) */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-foreground">The Best of Konkani Shows</h2>
            <Link href="/categories" className="text-primary font-bold hover:underline">View All</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {featuredItems.reduce((acc: any[], item) => {
              if (!acc.some(i => i.category === item.category)) {
                acc.push(item);
              }
              return acc;
            }, []).map((item, i) => (
              <FeaturedCategoryCard
                key={i}
                item={item}
                onClick={() => {
                  setSelectedCategory(item.category);
                  document.getElementById('events-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            ))}
          </div>
        </section>

        {/* Category Navigation */}
        <section className="mb-8 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-black text-foreground">Categories</h2>
          </div>
          <CategoryTabs
            categories={allCategories as any}
            activeCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </section>

        {/* Tags Quick Filter */}
        <section className="mb-10">
          <div className="flex flex-wrap gap-2">
            {preferences?.tags.map(tag => (
              <TagChip
                key={tag.id}
                label={tag.name}
                variant={selectedTag === tag.name ? 'primary' : 'outline'}
                mode="subtle"
                showHash={true}
                onClick={() => setSelectedTag(prev => prev === tag.name ? null : tag.name)}
              />
            ))}
          </div>
        </section>

        {/* Events Grid */}
        <section id="events-section">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-foreground">
              {selectedCategory === 'All' ? 'Upcoming Shows' : `${selectedCategory} Events`}
            </h2>
            <Link href="/events" className="text-primary font-bold hover:underline">See All</Link>
          </div>

          <div className="space-y-12">
            {eventsLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-8">
                {Array.from({ length: 8 }).map((_, i) => (
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
                          <div className="flex items-center gap-4 mb-6">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary/60 whitespace-nowrap">Near You</h3>
                            <div className="h-px w-full bg-surface-200" />
                          </div>
                        )}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-8">
                          {selectedEvents.map(event => <EventCard key={event.id} event={event} />)}
                        </div>
                      </div>
                    )}

                    {/* Other Cities Section */}
                    {otherEvents.length > 0 && (
                      <div>
                        <div className="flex items-center gap-4 mb-6">
                          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-surface-400 whitespace-nowrap">Explore Other Cities</h3>
                          <div className="h-px w-full bg-surface-200" />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-8 opacity-90">
                          {otherEvents.map(event => <EventCard key={event.id} event={event} />)}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()
            ) : (
              <div className="py-20 text-center">
                <p className="text-surface-800/50 text-xl font-medium">No events found in this category.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
