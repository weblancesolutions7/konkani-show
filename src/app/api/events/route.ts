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

        const events = await EventModel.find(filter).sort({ createdAt: -1 }).lean();

        // Transform _id to id for frontend compatibility
        const transformed = events.map((event) => ({
            ...event,
            id: event._id.toString(),
            _id: undefined,
        }));

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
