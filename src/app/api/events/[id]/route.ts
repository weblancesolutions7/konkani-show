import { NextRequest, NextResponse } from 'next/server';
import EventModel from '@/models/Event';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/events/[id] — Get single event by ID or slug
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        let event = await EventModel.get(id);

        if (!event) {
            // If not found by ID (Partition Key), try by slug via query
            const slugResults = await EventModel.query('slug').eq(id).exec();
            if (slugResults.length > 0) {
                event = slugResults[0];
            }
        }

        if (!event) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        return NextResponse.json({ ...event });
    } catch (error: any) {
        console.error('Error fetching event:', error);
        return NextResponse.json(
            { error: 'Failed to fetch event', details: error.message },
            { status: 500 }
        );
    }
}

// PUT /api/events/[id] — Update an event
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Process potential startAt date changes
        if (body.date && body.time) {
            try {
                const [day, month, year] = body.date.split('-').map(Number);
                const [hours, minutes] = body.time.split(':').map(Number);
                const dateObj = new Date(year, month - 1, day, hours || 0, minutes || 0);
                if (!isNaN(dateObj.getTime())) {
                    body.startAt = dateObj;
                }
            } catch (e) {
                console.error('Error parsing date for startAt:', e);
            }
        }

        const existingEvent = await EventModel.get(id);
        if (!existingEvent) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        // prevent updating partitioning keys
        delete body.id;

        const updatedEvent = await EventModel.update({ id }, body) as any;

        return NextResponse.json({ ...updatedEvent });
    } catch (error: any) {
        console.error('Error updating event:', error);
        return NextResponse.json(
            { error: 'Failed to update event', details: error.message },
            { status: 500 }
        );
    }
}

// DELETE /api/events/[id] — Delete an event
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        await EventModel.delete(id);

        return NextResponse.json({ message: 'Event deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting event:', error);
        return NextResponse.json(
            { error: 'Failed to delete event', details: error.message },
            { status: 500 }
        );
    }
}
