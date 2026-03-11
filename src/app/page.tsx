
'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePreferences } from '@/hooks/usePreferences';
import { useEvents } from '@/hooks/useEvents';
import HeroBanner from '@/components/home/HeroBanner';
import { useUserLocation } from '@/hooks/useUserLocation';
import ScrollRow from '@/components/ui/ScrollRow';

// Lazy load heavy components
const EventCard = dynamic(() => import('@/components/ui/EventCard'), {
  loading: () => <div className="aspect-[2/3] rounded-xl bg-surface-200 animate-pulse" />,
});

const FeaturedCategoryCard = dynamic(() => import('@/components/ui/FeaturedCategoryCard'), {
  loading: () => <div className="aspect-square md:aspect-[4/5] rounded-2xl bg-surface-200 animate-pulse" />,
});

export default function HomePage() {
  const { preferences, loading: prefLoading } = usePreferences();
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const { location, loading: locLoading } = useUserLocation();

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

  const { events: nearbyEvents, loading: nearbyLoading } = useEvents(
    undefined,
    undefined,
    undefined,
    selectedCities.join(','),
    undefined,
    location?.lat,
    location?.lng
  );

  const { events: recommendedEvents, loading: recLoading } = useEvents(
    undefined, undefined, undefined, undefined, undefined, undefined, undefined, 'recommended'
  );

  const { events: popularEvents, loading: popLoading } = useEvents(
    undefined, undefined, undefined, undefined, undefined, undefined, undefined, 'popular'
  );

  const { events: featuredEvents, loading: featLoading } = useEvents(
    undefined, undefined, undefined, undefined, undefined, undefined, undefined, 'featured'
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

        {/* Recommended Events Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-foreground">Recommended For You</h2>
            <Link href="/events?sort=recommended" className="text-primary font-bold hover:underline">See All</Link>
          </div>
          <div className="space-y-12">
            {recLoading ? (
              <div className="flex gap-4 md:gap-8 overflow-x-auto pb-4 snap-x no-scrollbar">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="min-w-[160px] md:min-w-[200px] aspect-[2/3] rounded-xl bg-surface-200 animate-pulse snap-start shrink-0" />
                ))}
              </div>
            ) : recommendedEvents.length > 0 ? (
              <ScrollRow>
                {recommendedEvents.map(event => (
                    <div key={event.id} className="flex w-[180px] md:w-[260px] snap-start shrink-0">
                        <EventCard event={event} />
                    </div>
                ))}
              </ScrollRow>
            ) : (
                <p className="text-surface-800/50">No recommendations available at the moment.</p>
            )}
          </div>
        </section>

        {/* Nearby Events Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-foreground">
                {location?.source === 'browser' ? 'Shows Near You (Precise)' : `Shows Near ${location?.city || 'You'}`}
            </h2>
          </div>
          <div className="space-y-12">
            {nearbyLoading ? (
              <div className="flex gap-4 md:gap-8 overflow-x-auto pb-4 snap-x no-scrollbar">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="min-w-[160px] md:min-w-[200px] aspect-[2/3] rounded-xl bg-surface-200 animate-pulse snap-start shrink-0" />
                ))}
              </div>
            ) : nearbyEvents.length > 0 ? (
                <ScrollRow>
                    {nearbyEvents.map(event => (
                        <div key={event.id} className="flex w-[180px] md:w-[260px] snap-start shrink-0">
                            <EventCard event={event} />
                        </div>
                    ))}
                </ScrollRow>
            ) : (
                <p className="text-surface-800/50">No events found in your area. Try searching for another city.</p>
            )}
          </div>
        </section>

        {/* The Best of Konkani Shows */}
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
                    // Navigate to category page since we removed tabs
                    window.location.href = `/events?category=${item.category}`; 
                }}
              />
            ))}
          </div>
        </section>

        {/* Popular Events Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-foreground">Popular Events</h2>
            <Link href="/events?sort=popular" className="text-primary font-bold hover:underline">See All</Link>
          </div>
          <div className="space-y-12">
            {popLoading ? (
              <div className="flex gap-4 md:gap-8 overflow-x-auto pb-4 snap-x no-scrollbar">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="min-w-[160px] md:min-w-[200px] aspect-[2/3] rounded-xl bg-surface-200 animate-pulse snap-start shrink-0" />
                ))}
              </div>
            ) : popularEvents.length > 0 ? (
              <ScrollRow>
                {popularEvents.map(event => (
                    <div key={event.id} className="flex w-[180px] md:w-[260px] snap-start shrink-0">
                        <EventCard event={event} />
                    </div>
                ))}
              </ScrollRow>
            ) : (
                <p className="text-surface-800/50">Events will appear here as they gain views.</p>
            )}
          </div>
        </section>

        {/* Featured Events Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-foreground">Featured Events</h2>
            <Link href="/events?sort=featured" className="text-primary font-bold hover:underline">See All</Link>
          </div>
          <div className="space-y-12">
            {featLoading ? (
              <div className="flex gap-4 md:gap-8 overflow-x-auto pb-4 snap-x no-scrollbar">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="min-w-[160px] md:min-w-[200px] aspect-[2/3] rounded-xl bg-surface-200 animate-pulse snap-start shrink-0" />
                ))}
              </div>
            ) : featuredEvents.length > 0 ? (
              <ScrollRow>
                {featuredEvents.map(event => (
                    <div key={event.id} className="flex w-[180px] md:w-[260px] snap-start shrink-0">
                        <EventCard event={event} />
                    </div>
                ))}
              </ScrollRow>
            ) : (
                <p className="text-surface-800/50">Check back later for handpicked events.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
