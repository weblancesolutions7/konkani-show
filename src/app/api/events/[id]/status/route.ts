import { NextRequest, NextResponse } from 'next/server';
import EventModel from '@/models/Event';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// PATCH /api/events/[id]/status — Update event status (approve/reject/delete)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();

        const updateData: any = {};
        if (body.status) {
            const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'DELETED'];
            if (validStatuses.includes(body.status)) {
                updateData.status = body.status;
            }
        }
        
        if (typeof body.isFeatured === 'boolean') {
            updateData.isFeatured = body.isFeatured;
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
        }

        const event = await EventModel.get(id);

        if (!event) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        const updatedEvent = await EventModel.update(
            { id },
            updateData
        ) as any;

        return NextResponse.json({ ...updatedEvent });
    } catch (error) {
        console.error('Error updating event status:', error);
        return NextResponse.json(
            { error: 'Failed to update event status' },
            { status: 500 }
        );
    }
}
