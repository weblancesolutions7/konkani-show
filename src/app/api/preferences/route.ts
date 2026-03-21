import { NextRequest, NextResponse } from 'next/server';
import PreferencesModel from '@/models/Preferences';
import EventModel from '@/models/Event';

// GET /api/preferences — Get the single preferences document
export async function GET() {
    try {
        let preferences;
        try {
            preferences = await PreferencesModel.get('singleton');
        } catch (e) {
            // It might not exist yet
        }

        if (!preferences) {
            // Create default preferences if none exist
            const defaultPrefs = new PreferencesModel({
                id: 'singleton',
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
                languages: ['Konkani', 'English', 'Hindi', 'Kannada', 'Marathi'],
                featuredCategories: [
                    {
                        id: '1',
                        category: 'Drama',
                        highlightClass: 'bg-primary',
                        featuredImage:
                            'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop',
                    },
                    {
                        id: '2',
                        category: 'Musical',
                        highlightClass: 'bg-accent',
                        featuredImage:
                            'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=2070&auto=format&fit=crop',
                    },
                    {
                        id: '3',
                        category: 'Comedy',
                        highlightClass: 'bg-secondary',
                        featuredImage:
                            'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2070&auto=format&fit=crop',
                    },
                ],
                heroBanners: [
                    {
                        id: '1',
                        imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop',
                    }
                ]
            });
            await defaultPrefs.save();
            preferences = defaultPrefs;
        }

        // Dynamically calculate category counts for APPROVED events
        // Note: DynamoDB doesn't aggregate natively. We fetch all approved events and array operations in-memory.
        const allApprovedEvents = await EventModel.scan().where('status').eq('APPROVED').exec();

        const countMap: Record<string, number> = {};
        const eventLanguagesSet = new Set<string>();

        for (const ev of allApprovedEvents) {
            // Count categories
            if (ev.category) {
                countMap[ev.category] = (countMap[ev.category] || 0) + 1;
            }
            // Gather languages
            if (ev.language) {
                eventLanguagesSet.add(ev.language);
            }
        }

        // Merge event languages with preferences, ensuring uniqueness
        let updated = false;

        const eventLanguages = Array.from(eventLanguagesSet);

        const existingLanguages = preferences.languages || [];
        const mergedLanguages = Array.from(new Set([...existingLanguages, ...eventLanguages])).filter(Boolean);
        if (mergedLanguages.length !== existingLanguages.length) {
            preferences.languages = mergedLanguages.sort() as string[];
            updated = true;
        }

        // Update the preferences categories array with dynamic counts
        if (preferences && preferences.categories) {
            const updatedCategories = preferences.categories.map((cat: any) => ({
                ...cat,
                count: countMap[cat.name] || 0
            }));

            // Check if count changed to avoid unnecessary saves
            const changed = JSON.stringify(updatedCategories) !== JSON.stringify(preferences.categories);
            if (changed) {
                preferences.categories = updatedCategories;
                updated = true;
            }
        }

        // Ensure heroBanners exists
        if (!preferences.heroBanners) {
            preferences.heroBanners = [];
            updated = true;
        }

        if (updated) {
            await preferences.save();
        }

        return NextResponse.json({ ...preferences });
    } catch (error: any) {
        console.error('Error fetching preferences:', error);
        return NextResponse.json(
            { error: 'Failed to fetch preferences', details: error.message },
            { status: 500 }
        );
    }
}

// PUT /api/preferences — Update preferences
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();

        // Ensure all featured items have an ID to satisfy validation
        if (body.heroBanners) {
            body.heroBanners = body.heroBanners.map((f: any) => ({
                ...f,
                id: f.id || Math.random().toString(36).substr(2, 9)
            }));
        }

        // Remove id from update body to avoid DynamoDB "Cannot update attribute id" error
        delete body.id;

        const preferences = await PreferencesModel.update(
            { id: 'singleton' },
            body
        ) as any;

        return NextResponse.json({ ...preferences });
    } catch (error: any) {
        console.error('Error updating preferences:', error);
        return NextResponse.json(
            { error: 'Failed to update preferences', details: error.message },
            { status: 500 }
        );
    }
}
