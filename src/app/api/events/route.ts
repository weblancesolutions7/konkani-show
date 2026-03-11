import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import EventModel from '@/models/Event';

// GET /api/events — List events with optional filters
export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const status = searchParams.get('status');
        const locationsParam = searchParams.get('location');
        const locations = locationsParam ? locationsParam.split(',') : [];

        // Build query filter
        const filter: Record<string, unknown> = {};

        if (category) {
            filter.category = category;
        }

        if (status) {
            filter.status = status;
        } else {
            // Default: only show approved events for public listing
            filter.status = 'APPROVED';
        }

        const tag = searchParams.get('tag');
        if (tag) {
            filter.tags = tag;
        }

        const query = searchParams.get('q') || searchParams.get('search');
        if (query) {
            filter.$or = [
                { title: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { location: { $regex: query, $options: 'i' } },
            ];
        }

        // Fetch matching events
        const allEvents = await EventModel.find(filter).lean();

        let transformed = allEvents.map((event) => ({
            ...event,
            id: event._id.toString(),
            _id: undefined,
        }));

        // Comprehensive sort: Location priority (if provided) followed by Date (nearest first)
        transformed.sort((a: any, b: any) => {
            // 1. Location priority
            if (locations.length > 0) {
                const aMatch = locations.some(loc => a.location.toLowerCase().includes(loc.toLowerCase()));
                const bMatch = locations.some(loc => b.location.toLowerCase().includes(loc.toLowerCase()));

                if (aMatch && !bMatch) return -1;
                if (!aMatch && bMatch) return 1;
            }

            // 2. Chronological priority (nearest first)
            try {
                const timeA = new Date(`${a.date} ${a.time}`).getTime();
                const timeB = new Date(`${b.date} ${b.time}`).getTime();
                
                if (!isNaN(timeA) && !isNaN(timeB)) {
                    return timeA - timeB;
                }
            } catch (err) {
                // Fallback to createdAt if date parsing fails
                const createA = new Date(a.createdAt).getTime();
                const createB = new Date(b.createdAt).getTime();
                return createB - createA;
            }

            return 0;
        });

        return NextResponse.json(transformed);
    } catch (error) {
        console.error('Error fetching events:', error);
        return NextResponse.json(
            { error: 'Failed to fetch events' },
            { status: 500 }
        );
    }
}

// POST /api/events — Create a new event
export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const body = await request.json();

        const event = new EventModel({
            title: body.title,
            description: body.description || '',
            date: body.date,
            time: body.time,
            location: body.location,
            category: body.category,
            tags: body.tags || [],
            featureImage: body.featureImage,
            gallery: body.gallery || [],
            entry: body.entry || '',
            meetingLink: body.meetingLink || '',
            status: 'PENDING',
        });

        await event.save();

        const eventObj = event.toObject();
        return NextResponse.json(
            {
                ...eventObj,
                id: eventObj._id.toString(),
                _id: undefined,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating event:', error);
        return NextResponse.json(
            { error: 'Failed to create event' },
            { status: 500 }
        );
    }
}
