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
        if (body.date) {
            try {
                const dateStr = body.date;
                const timeStr = body.time || '00:00';
                const parts = dateStr.split('-');
                if (parts.length === 3) {
                    const [p1, p2, p3] = parts.map(Number);
                    const [hours, minutes] = timeStr.split(':').map(Number);
                    
                    let dateObj: Date;
                    if (p1 > 31) {
                        // YYYY-MM-DD
                        dateObj = new Date(p1, p2 - 1, p3, hours || 0, minutes || 0);
                    } else {
                        // DD-MM-YYYY
                        dateObj = new Date(p3, p2 - 1, p1, hours || 0, minutes || 0);
                    }
                    
                    if (!isNaN(dateObj.getTime())) {
                        body.startAt = dateObj.getTime();
                    }
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

        // Soft delete by updating status to DELETED
        await EventModel.update({ id }, { status: 'DELETED' });

        return NextResponse.json({ message: 'Event deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting event:', error);
        return NextResponse.json(
            { error: 'Failed to delete event', details: error.message },
            { status: 500 }
        );
    }
}
