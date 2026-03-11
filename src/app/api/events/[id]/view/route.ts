import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import EventModel from '@/models/Event';
import mongoose from 'mongoose';

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        
        const { id } = params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'Invalid event ID' }, { status: 400 });
        }

        // Atomically increment the views counter by 1
        const updatedEvent = await EventModel.findByIdAndUpdate(
            id,
            { $inc: { views: 1 } },
            { new: true, runValidators: false }
        ).lean();

        if (!updatedEvent) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

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
