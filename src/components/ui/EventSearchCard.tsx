'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Event } from '@/types';

interface EventSearchCardProps {
  event: Event;
}

const EventSearchCard: React.FC<EventSearchCardProps> = ({ event }) => {
  // Format date for the ribbon
  const formatDateRibbon = (dateStr: string) => {
    try {
      const [day, month, year] = dateStr.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = date.getDate();
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      return `${weekday}, ${dayNum} ${monthName} onwards`;
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <Link href={`/event/${event.slug}`} className="group flex flex-col h-full">
      {/* Target Image Container: 2:3 Aspect Ratio */}
      <div className="relative w-full aspect-[2/3] overflow-hidden rounded-2xl bg-surface-100 shadow-sm transition-all duration-300 group-hover:shadow-premium group-hover:-translate-y-1">
        <Image
          src={event.featureImage}
          alt={event.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />
        
        {/* Date Ribbon */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm py-2 px-4">
          <p className="text-white text-xs font-bold truncate">
            {formatDateRibbon(event.date)}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mt-4 flex flex-col flex-1">
        <h3 className="text-lg font-black text-surface-900 line-clamp-2 group-hover:text-primary transition-colors leading-tight mb-1">
          {event.title}
        </h3>
        <p className="text-sm font-medium text-surface-500 line-clamp-1">
          {event.location}
        </p>
        <p className="text-xs font-bold text-surface-400 mt-1 uppercase tracking-wider">
          {event.category}
        </p>
      </div>
    </Link>
  );
};

export default EventSearchCard;
