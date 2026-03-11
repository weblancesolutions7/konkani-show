
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
        <Link href={`/event/${event.slug}`} className="group flex flex-col h-full">
            <div className="relative w-full h-[270px] md:h-[390px] overflow-hidden rounded-2xl bg-surface-100 shadow-card transition-all duration-300 group-hover:shadow-premium group-hover:-translate-y-1 shrink-0">
                <Image
                    src={event.featureImage}
                    alt={event.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                />
                <div className="absolute top-4 left-4 flex flex-wrap gap-1">
                    <TagChip label={event.category} variant="primary" className="opacity-95 shadow-md backdrop-blur-md" />
                </div>
            </div>

            <div className="mt-4 flex flex-col flex-1">
                <h3 className="text-xl font-bold text-surface-900 line-clamp-2 group-hover:text-primary transition-colors leading-tight mb-2 min-h-[3rem]">
                    {event.title}
                </h3>
                <div className="mt-auto space-y-3">
                    <p className="text-sm font-medium text-surface-600 flex items-center gap-1.5 line-clamp-1">
                        <span className="text-primary text-base">📍</span> {event.location}
                    </p>
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-surface-100 mt-2">
                        <span className="text-[10px] uppercase font-black tracking-widest px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary whitespace-nowrap">
                            {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                        </span>
                        <span className="text-xs font-bold text-surface-500 flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 opacity-50">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                            {event.time}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default EventCard;
