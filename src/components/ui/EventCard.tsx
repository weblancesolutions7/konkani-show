
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Event } from '@/types';
import TagChip from './TagChip';

interface EventCardProps {
    event: Event;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
    return (
        <Link href={`/event/${event.slug}`} className="group block">
            <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-surface-100 shadow-card transition-all duration-300 group-hover:shadow-premium group-hover:-translate-y-1">
                <Image
                    src={event.featureImage}
                    alt={event.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                />
                <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                    <TagChip label={event.category} variant="primary" className="opacity-90 shadow-sm" />
                </div>
            </div>

            <div className="mt-4 space-y-2">
                <h3 className="text-xl font-black text-surface-900 line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                    {event.title}
                </h3>
                <p className="text-sm font-semibold text-surface-800/80 flex items-center gap-1">
                    <span className="text-primary/60">📍</span> {event.location}
                </p>
                <div className="flex items-center gap-4 pt-2">
                    <span className="text-xs uppercase font-black tracking-wider px-3 py-1 rounded-lg bg-primary/10 text-primary whitespace-nowrap">
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' })}
                    </span>
                    <span className="text-sm font-bold text-surface-800/60 flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 opacity-60">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        {event.time}
                    </span>
                </div>
            </div>
        </Link>
    );
};

export default EventCard;
