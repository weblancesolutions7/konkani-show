import { NextRequest, NextResponse } from 'next/server';
import EventModel from '@/models/Event';

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function POST(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { id } = await params;

        const event = await EventModel.get(id);
        
        if (!event) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        // Increment views
        const updatedEvent = await EventModel.update(
            { id },
            { $ADD: { views: 1 } }
        );

        return NextResponse.json({ 
            success: true, 
            views: updatedEvent.views 
        }, { status: 200 });

    } catch (error: any) {
        console.error('Failed to increment event view count:', error);
        return NextResponse.json(
            { error: 'Failed to increment view count', details: error.message },
            { status: 500 }
        );
    }
}
