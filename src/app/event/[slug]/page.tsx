import { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import { CONFIG } from '@/config/api';
import ViewTracker from '@/components/event/ViewTracker';
import EventDetailsView from '@/components/event/EventDetailsView';
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
            images: [{ url: event.detailImage || event.featureImage }],
            type: 'article',
        },
        twitter: {
            card: 'summary_large_image',
            title: event.title,
            description: event.description,
            images: [event.detailImage || event.featureImage],
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
        <>
            <ViewTracker eventId={event.id} />
            <EventDetailsView event={event} />
        </>
    );
}
