import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import PreferencesModel from '@/models/Preferences';
import EventModel from '@/models/Event';

// GET /api/preferences — Get the single preferences document
export async function GET() {
    try {
        await dbConnect();

        let preferences = await PreferencesModel.findOne().lean();

        if (!preferences) {
            // Create default preferences if none exist
            const defaultPrefs = new PreferencesModel({
                tags: [
                    { id: '1', name: 'Live' },
                    { id: '2', name: 'Virtual' },
                    { id: '3', name: 'Free' },
                ],
                categories: [
                    { id: '1', name: 'Drama', count: 0 },
                    { id: '2', name: 'Comedy', count: 0 },
                    { id: '3', name: 'Musical', count: 0 },
                    { id: '4', name: 'Workshop', count: 0 },
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
            });
            await defaultPrefs.save();
            preferences = defaultPrefs.toObject();
        }

        // Dynamically calculate category counts for APPROVED events
        const categoryCounts = await EventModel.aggregate([
            { $match: { status: 'APPROVED' } },
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);

        const countMap = categoryCounts.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
        }, {} as Record<string, number>);

        // Update the preferences categories array with dynamic counts
        if (preferences && preferences.categories) {
            preferences.categories = preferences.categories.map((cat: any) => ({
                ...cat,
                count: countMap[cat.name] || 0
            }));
        }

        return NextResponse.json(preferences);
    } catch (error) {
        console.error('Error fetching preferences:', error);
        return NextResponse.json(
            { error: 'Failed to fetch preferences' },
            { status: 500 }
        );
    }
}

// PUT /api/preferences — Update preferences
export async function PUT(request: NextRequest) {
    try {
        await dbConnect();
        const body = await request.json();

        const preferences = await PreferencesModel.findOneAndUpdate(
            {},
            { $set: body },
            { returnDocument: 'after', upsert: true, runValidators: true }
        ).lean();

        return NextResponse.json(preferences);
    } catch (error) {
        console.error('Error updating preferences:', error);
        return NextResponse.json(
            { error: 'Failed to update preferences' },
            { status: 500 }
        );
    }
}
