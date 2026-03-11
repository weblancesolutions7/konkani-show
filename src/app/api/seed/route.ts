import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import EventModel from '@/models/Event';
import PreferencesModel from '@/models/Preferences';

function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
        + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}

// POST /api/seed — Seed initial data for development
export async function POST() {
    try {
        await dbConnect();

        // Seed Preferences (upsert)
        await PreferencesModel.findOneAndUpdate(
            {},
            {
                $set: {
                    tags: [
                        { id: '1', name: 'Live' },
                        { id: '2', name: 'Virtual' },
                        { id: '3', name: 'Free' },
                        { id: '4', name: 'Comedy' },
                        { id: '5', name: 'Unplugged' },
                        { id: '6', name: 'Family' },
                        { id: '7', name: 'Cultural' },
                        { id: '8', name: 'Workshop' },
                    ],
                    categories: [
                        { id: '1', name: 'Drama', count: 2 },
                        { id: '2', name: 'Comedy', count: 1 },
                        { id: '3', name: 'Musical', count: 1 },
                        { id: '4', name: 'Workshop', count: 1 },
                    ],
                    featuredCategories: [
                        {
                            category: 'Drama',
                            highlightClass: 'bg-primary',
                            featuredImage:
                                'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop',
                        },
                        {
                            category: 'Musical',
                            highlightClass: 'bg-accent',
                            featuredImage:
                                'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=2070&auto=format&fit=crop',
                        },
                        {
                            category: 'Comedy',
                            highlightClass: 'bg-secondary',
                            featuredImage:
                                'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2070&auto=format&fit=crop',
                        },
                    ],
                },
            },
            { upsert: true, returnDocument: 'after' }
        );

        // Clear existing events
        await EventModel.deleteMany({});

        // Seed sample events — manually generate slugs since insertMany skips pre-save hooks
        const sampleEvents = [
            {
                title: 'Vinnu Special Konkani Drama',
                slug: generateSlug('Vinnu Special Konkani Drama'),
                description:
                    'Experience the magic of Konkani drama with "Vinnu Special". This show brings together the best actors and traditional storytelling with a modern comedic twist. Perfect for the whole family!',
                date: 'March 15, 2026',
                time: '6:30 PM',
                location: 'Don Bosco Hall, Mangalore',
                locationCoords: {
                    type: 'Point',
                    coordinates: [74.8430, 12.8711], // Mangalore
                },
                category: 'Drama',
                tags: ['Comedy', 'Live', 'Family'],
                featureImage:
                    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2070&auto=format&fit=crop',
                gallery: [
                    'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=2070&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2070&auto=format&fit=crop',
                ],
                entry: 'Paid Entrance - ₹500',
                meetingLink: '',
                status: 'APPROVED',
            },
            {
                title: 'Konkani Musical Night',
                slug: generateSlug('Konkani Musical Night'),
                description:
                    'Melodious tunes of the coast come alive in this enchanting musical evening. Featuring renowned Konkani artists and a blend of classical and modern compositions.',
                date: 'April 02, 2026',
                time: '7:00 PM',
                location: 'Town Hall, Mangalore',
                locationCoords: {
                    type: 'Point',
                    coordinates: [74.8420, 12.8700], // Mangalore
                },
                category: 'Musical',
                tags: ['Unplugged', 'Live'],
                featureImage:
                    'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=2070&auto=format&fit=crop',
                gallery: [],
                entry: 'Free Entry',
                status: 'APPROVED',
            },
            {
                title: 'Konkani Comedy Fest 2026',
                slug: generateSlug('Konkani Comedy Fest 2026'),
                description:
                    'An evening full of laughter with the best Konkani comedians. Stand-up, skit performances, and a lot of fun!',
                date: 'April 20, 2026',
                time: '5:00 PM',
                location: 'Kala Mandir, Udupi',
                locationCoords: {
                    type: 'Point',
                    coordinates: [74.7421, 13.3409], // Udupi
                },
                category: 'Comedy',
                tags: ['Comedy', 'Live', 'Family'],
                featureImage:
                    'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2070&auto=format&fit=crop',
                gallery: [],
                entry: 'Paid Entrance - ₹300',
                status: 'APPROVED',
            },
            {
                title: 'Traditional Konkani Drama Night',
                slug: generateSlug('Traditional Konkani Drama Night'),
                description:
                    'A spectacular drama in the traditional Konkani style. Witness the rich cultural heritage of the coast brought to life on stage.',
                date: 'May 05, 2026',
                time: '6:00 PM',
                location: 'Ravindra Kalakshetra, Mangalore',
                category: 'Drama',
                tags: ['Cultural', 'Live'],
                featureImage:
                    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop',
                gallery: [],
                entry: 'Paid Entrance - ₹400',
                status: 'PENDING',
            },
            {
                title: 'Konkani Theatre Workshop',
                slug: generateSlug('Konkani Theatre Workshop'),
                description:
                    'Learn the art of Konkani theatre from masters. This hands-on workshop covers acting, scripting, and production techniques.',
                date: 'May 15, 2026',
                time: '10:00 AM',
                location: 'Cultural Centre, Mangalore',
                category: 'Workshop',
                tags: ['Workshop', 'Cultural'],
                featureImage:
                    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop',
                gallery: [],
                entry: 'Paid Entrance - ₹200',
                status: 'PENDING',
            },
        ];

        await EventModel.insertMany(sampleEvents);

        return NextResponse.json({
            message: 'Database seeded successfully!',
            eventsCount: sampleEvents.length,
        });
    } catch (error) {
        console.error('Error seeding database:', error);
        return NextResponse.json(
            { error: 'Failed to seed database' },
            { status: 500 }
        );
    }
}
