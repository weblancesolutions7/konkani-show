
'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePreferences } from '@/hooks/usePreferences';
import { useEvents } from '@/hooks/useEvents';
import CategoryTabs from '@/components/ui/CategoryTabs';
import TagChip from '@/components/ui/TagChip';
import HeroBanner from '@/components/home/HeroBanner';

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
  const { events, loading: eventsLoading } = useEvents(
    selectedCategory === 'All' ? undefined : selectedCategory,
    undefined,
    selectedTag || undefined
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
            {featuredItems.map((item, i) => (
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

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-8">
            {eventsLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] rounded-xl bg-surface-200 animate-pulse" />
              ))
            ) : events.length > 0 ? (
              events.map(event => <EventCard key={event.id} event={event} />)
            ) : (
              <div className="col-span-full py-20 text-center">
                <p className="text-surface-800/50 text-xl font-medium">No events found in this category.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
