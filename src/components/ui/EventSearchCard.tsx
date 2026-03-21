'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Event } from '@/types';

interface EventSearchCardProps {
  event: Event;
}

const EventSearchCard: React.FC<EventSearchCardProps> = ({ event }) => {
  // Format date for the ribbon: "Wed, 8 Apr onwards"
  const formatDateRibbon = (dateStr: string) => {
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
            const [d, m, y] = dateStr.split('-').map(Number);
            const altDate = new Date(y, m - 1, d);
            if (isNaN(altDate.getTime())) return dateStr;
            return `${altDate.toLocaleDateString('en-US', { weekday: 'short' })}, ${altDate.getDate()} ${altDate.toLocaleDateString('en-US', { month: 'short' })} onwards`;
        }
        return `${date.toLocaleDateString('en-US', { weekday: 'short' })}, ${date.getDate()} ${date.toLocaleDateString('en-US', { month: 'short' })} onwards`;
    } catch (e) {
        return dateStr;
    }
  };

  // Extract price from entry or price field
  const getDisplayPrice = () => {
      if (event.entry) {
          const isNumeric = /^\d+$/.test(event.entry.trim().replace('₹', '').trim());
          if (isNumeric) return `₹ ${event.entry.trim().replace('₹', '').trim()} onwards`;
          return event.entry;
      }
      if (event.price) return `₹ ${event.price} onwards`;
      return '';
  };
  const displayPrice = getDisplayPrice();

  return (
    <Link href={`/event/${event.slug}`} className="group flex flex-col w-full h-full bg-white transition-all duration-300">
      {/* Image Container: Strict 2:3 aspect ratio */}
      <div className="relative w-full aspect-[2/3] overflow-hidden rounded-card-image bg-surface-100 shadow-sm transition-all duration-300 group-hover:shadow-card group-hover:-translate-y-1 shrink-0">
        <Image
          src={event.featureImage}
          alt={event.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          priority={false}
        />
        
        {/* Date Ribbon */}
        <div className="absolute bottom-0 left-0 right-0 bg-black py-2.5 px-4 overflow-hidden">
          <p className="text-white text-[12px] md:text-[13px] font-medium tracking-wide truncate">
            {formatDateRibbon(event.date)}
          </p>
        </div>
      </div>

      {/* Content Area */}
      <div className="mt-3.5 flex flex-col flex-1 px-1 pb-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-[17px] font-extrabold text-[#000000] line-clamp-2 leading-[1.25] transition-colors group-hover:text-primary">
            {event.title}
          </h3>
          
          <p className="text-[14px] font-medium text-[#707684] line-clamp-1">
            {event.location}
          </p>
          
          <div className="flex flex-col gap-0.5 mt-1">
              <p className="text-[14px] font-medium text-[#babecc] uppercase tracking-tight truncate">
                  {event.category}
              </p>
              {displayPrice && (
                  <p className="text-[15px] font-bold text-[#707684] truncate">
                      {displayPrice}
                  </p>
              )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventSearchCard;

