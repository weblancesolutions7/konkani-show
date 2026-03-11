
import { Metadata, ResolvingMetadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { CONFIG } from '@/config/api';
import TagChip from '@/components/ui/TagChip';
import CalendarButtons from '@/components/event/CalendarButtons';
import RegisterButton from '@/components/event/RegisterButton';
import { Event } from '@/types';

interface Props {
    params: Promise<{ slug: string }>;
}

async function getEvent(slug: string): Promise<Event | null> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/events/${slug}`, {
            cache: 'no-store',
        });
        if (!response.ok) return null;
        return await response.json();
    } catch {
        return null;
    }
}

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { slug } = await params;
    const event = await getEvent(slug);

    if (!event) {
        return { title: 'Event Not Found' };
    }

    return {
        title: `${event.title} | ${CONFIG.SITE_NAME}`,
        description: event.description,
        openGraph: {
            title: event.title,
            description: event.description,
            url: `https://konkanishow.com/event/${slug}`,
            siteName: CONFIG.SITE_NAME,
            images: [{ url: event.featureImage }],
            type: 'article',
        },
        twitter: {
            card: 'summary_large_image',
            title: event.title,
            description: event.description,
            images: [event.featureImage],
        },
    };
}

export default async function EventPage({ params }: Props) {
    const { slug } = await params;
    const event = await getEvent(slug);

    if (!event || event.status !== 'APPROVED') {
        notFound();
    }

    return (
        <main className="min-h-screen bg-surface-50">
            {/* Visual Header */}
            <div className="relative w-full h-[50vh] md:h-[60vh]">
                <Image
                    src={event.featureImage}
                    alt={event.title}
                    fill
                    priority
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-900 to-transparent opacity-80" />

                <div className="absolute bottom-10 left-0 right-0 max-w-7xl mx-auto px-6">
                    <div className="flex flex-wrap gap-2 mb-4">
                        <TagChip label={event.category} variant="primary" />
                        {event.tags.map(tag => <TagChip key={tag} label={tag} className="bg-white/10 text-white border-white/20" />)}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-2 leading-tight">
                        {event.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-6 text-white/90 font-medium pt-2">
                        <div className="flex items-center">
                            <span className="text-sm uppercase font-black tracking-wider px-4 py-1.5 rounded-lg bg-primary/20 text-white whitespace-nowrap border border-primary/30 backdrop-blur-sm">
                                {new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' })}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-surface-200">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 opacity-80">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                            {event.time}
                        </div>
                        <div className="flex items-center gap-2 text-primary-200 font-bold">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                            </svg>
                            {event.location}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-10 focus:outline-none">
                    <section>
                        <h2 className="text-2xl font-black mb-4">About the Event</h2>
                        <p className="text-surface-800 leading-relaxed text-lg whitespace-pre-wrap">
                            {event.description}
                        </p>
                    </section>

                    {event.gallery && event.gallery.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-black mb-4">Gallery</h2>
                            <div className="grid grid-cols-2 gap-4">
                                {event.gallery.map((img, i) => (
                                    <div key={i} className="relative aspect-video rounded-xl overflow-hidden shadow-card group">
                                        <Image src={img} alt={`Gallery ${i}`} fill className="object-cover transition-transform group-hover:scale-105" />
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    <section className="p-6 bg-surface-50 rounded-2xl border border-surface-200">
                        <h3 className="font-bold mb-4">Venue Details</h3>
                        <div className="aspect-video bg-surface-100 rounded-lg flex items-center justify-center text-surface-800/40">
                            <span className="text-4xl text-inherit">🗺️</span>
                            <span className="ml-2 font-medium">Interactive Map Not Available</span>
                        </div>
                    </section>
                </div>

                {/* Sidebar / Sidebar Actions */}
                <div className="space-y-6">
                    <div className="sticky top-10 space-y-6">
                        <div className="p-8 bg-surface-50 rounded-2xl shadow-premium border border-primary/10">
                            <div className="mb-6">
                                <p className="text-sm uppercase tracking-widest font-black text-surface-800/40 mb-1">Entry Fee</p>
                                <h4 className="text-3xl font-black text-primary">{event.entry || 'Free Entry'}</h4>
                            </div>

                            <div className="space-y-4">
                                <RegisterButton event={event} />
                                {event.meetingLink && (
                                    <a
                                        href={event.meetingLink}
                                        target="_blank"
                                        className="flex items-center justify-center w-full py-3 bg-surface-900 text-white font-bold rounded-xl"
                                    >
                                        Join Meeting
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="p-6 bg-surface-100 rounded-2xl border border-surface-200">
                            <h4 className="font-bold mb-4 text-center">Add to Calendar</h4>
                            <CalendarButtons event={event} />
                        </div>

                        <div className="p-6 flex items-center justify-between border-t border-surface-200">
                            <span className="text-sm font-bold text-surface-800/50">Shared by Admin</span>
                            <div className="flex gap-2">
                                <button className="w-8 h-8 rounded-full bg-surface-200 flex items-center justify-center text-xs">FB</button>
                                <button className="w-8 h-8 rounded-full bg-surface-200 flex items-center justify-center text-xs">X</button>
                                <button className="w-8 h-8 rounded-full bg-surface-200 flex items-center justify-center text-xs">WA</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
