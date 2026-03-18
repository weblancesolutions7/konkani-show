import { NextResponse } from 'next/server';
import RegistrationModel from '@/models/Registration';
import EventModel from '@/models/Event';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const { eventId, name, email, phone, tickets } = body;

        // Validation
        if (!eventId || !name || !email || !phone || !tickets) {
            return NextResponse.json(
                { success: false, error: 'All fields are required' },
                { status: 400 }
            );
        }

        // Check if event exists
        const event = await EventModel.get(eventId);
        if (!event) {
            return NextResponse.json(
                { success: false, error: 'Event not found' },
                { status: 404 }
            );
        }

        // Create Registration
        const registration = new RegistrationModel({
            id: uuidv4(),
            eventId,
            name,
            email,
            phone,
            tickets: parseInt(tickets, 10),
            status: 'CONFIRMED', // default as per requirements
        });

        await registration.save();

        return NextResponse.json({ success: true, data: { ...registration } }, { status: 201 });
    } catch (error: any) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
