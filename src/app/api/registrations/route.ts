import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import RegistrationModel from '@/models/Registration';
import EventModel from '@/models/Event';
import mongoose from 'mongoose';

export async function POST(req: Request) {
    try {
        await connectDB();
        const body = await req.json();

        const { eventId, name, email, phone, tickets } = body;

        // Validation
        if (!eventId || !name || !email || !phone || !tickets) {
            return NextResponse.json(
                { success: false, error: 'All fields are required' },
                { status: 400 }
            );
        }

        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            return NextResponse.json(
                { success: false, error: 'Invalid event ID' },
                { status: 400 }
            );
        }

        // Check if event exists
        const event = await EventModel.findById(eventId);
        if (!event) {
            return NextResponse.json(
                { success: false, error: 'Event not found' },
                { status: 404 }
            );
        }

        // Create Registration
        const registration = await RegistrationModel.create({
            eventId,
            name,
            email,
            phone,
            tickets: parseInt(tickets, 10),
            status: 'CONFIRMED', // default as per requirements
        });

        return NextResponse.json({ success: true, data: registration }, { status: 201 });
    } catch (error: any) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
