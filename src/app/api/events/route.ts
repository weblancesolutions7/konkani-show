import { NextRequest, NextResponse } from 'next/server';
import EventModel, { generateSlug } from '@/models/Event';

// GET /api/events — List events with optional filters
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const categoriesParam = searchParams.get('category') || searchParams.get('categories');
        const categories = categoriesParam ? categoriesParam.split(',') : [];

        const status = searchParams.get('status');
        const locationsParam = searchParams.get('location');
        const locations = locationsParam ? locationsParam.split(',') : [];

        const lat = searchParams.get('lat');
        const lng = searchParams.get('lng');
        const radius = searchParams.get('radius') || '5000000';

        const sort = searchParams.get('sort');
        const language = searchParams.get('language');
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');
        const dateFilter = searchParams.get('dateFilter');

        const tagsParam = searchParams.get('tag') || searchParams.get('tags');
        const tags = tagsParam ? tagsParam.split(',') : [];

        // We use .scan() because we have complex and heavily varied filters
        let scan = EventModel.scan();

        if (categories.length > 0) {
            scan = scan.where('category').in(categories);
        }

        if (status) {
            scan = scan.where('status').eq(status);
        } else {
            scan = scan.where('status').eq('APPROVED');
        }

        if (tags.length > 0) {
            // Dynamoose scan checking if any tag is in the array. 
            // Dynamoose .contains() for arrays checks if the array contains the value.
            // Since `tags` can be multiple, we might need to filter manually if there are multiple tags,
            // or just use contains for the first tag and filter the rest in memory.
            scan = scan.where('tags').contains(tags[0]);
        }

        if (language) {
            const languages = language.split(',');
            scan = scan.where('language').in(languages);
        }

        if (minPrice || maxPrice) {
            if (minPrice && maxPrice) {
                scan = scan.where('price').between(parseFloat(minPrice), parseFloat(maxPrice));
            } else if (minPrice) {
                scan = scan.where('price').ge(parseFloat(minPrice));
            } else if (maxPrice) {
                scan = scan.where('price').le(parseFloat(maxPrice));
            }
        }

        if (dateFilter) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            let startDate: Date | null = null;
            let endDate: Date | null = null;

            if (dateFilter === 'today') {
                startDate = new Date(today);
                endDate = new Date(today);
                endDate.setHours(23, 59, 59, 999);
            } else if (dateFilter === 'tomorrow') {
                startDate = new Date(today);
                startDate.setDate(startDate.getDate() + 1);
                endDate = new Date(startDate);
                endDate.setHours(23, 59, 59, 999);
            } else if (dateFilter === 'weekend') {
                const day = today.getDay();
                startDate = new Date(today);
                startDate.setDate(today.getDate() + (6 - day));
                endDate = new Date(startDate);
                endDate.setDate(startDate.getDate() + 1);
                endDate.setHours(23, 59, 59, 999);
            } else if (dateFilter.includes(',')) {
                const [start, end] = dateFilter.split(',');
                if (start) {
                    const d = new Date(start);
                    if (!isNaN(d.getTime())) startDate = d;
                }
                if (end) {
                    const d = new Date(end);
                    if (!isNaN(d.getTime())) {
                        endDate = d;
                        endDate.setUTCHours(23, 59, 59, 999);
                    }
                }
            }

            if (startDate && endDate) {
                scan = scan.where('startAt').between(startDate.getTime(), endDate.getTime());
            } else if (startDate) {
                scan = scan.where('startAt').ge(startDate.getTime());
            } else if (endDate) {
                scan = scan.where('startAt').le(endDate.getTime());
            }
        }

        // Handle specific sort filters that modify the query tag
        if (sort === 'featured' && !tagsParam) {
            scan = scan.where('tags').contains('Featured');
        }

        // Execute scan to get the items
        let allEvents = await scan.exec();

        // Cross-filter remaining items in-memory for complex text search or multiple tags
        const query = searchParams.get('q') || searchParams.get('search');
        if (query) {
            const lowerQuery = query.toLowerCase();
            allEvents = allEvents.filter(ev =>
                (ev.title && ev.title.toLowerCase().includes(lowerQuery)) ||
                (ev.description && ev.description.toLowerCase().includes(lowerQuery)) ||
                (ev.location && ev.location.toLowerCase().includes(lowerQuery))
            ) as any;
        }

        // Additional tags filter if multiple tags were requested
        if (tags.length > 1) {
            allEvents = allEvents.filter(ev =>
                tags.every(t => ev.tags && ev.tags.includes(t))
            ) as any;
        }

        let transformed = allEvents.map((event: any) => ({
            ...event,
        }));

        // Sorting
        const parsedLat = lat ? parseFloat(lat) : NaN;
        const parsedLng = lng ? parseFloat(lng) : NaN;
        const hasCoords = !isNaN(parsedLat) && !isNaN(parsedLng);

        transformed.sort((a: any, b: any) => {
            if (sort === 'popular') {
                return (b.views || 0) - (a.views || 0);
            } else if (sort === 'recommended') {
                const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return timeB - timeA;
            }

            // 1. Proximity Sort (if coordinates available)
            if (hasCoords && a.locationCoords?.coordinates && b.locationCoords?.coordinates) {
                const distA = Math.pow(a.locationCoords.coordinates[0] - parsedLng, 2) +
                    Math.pow(a.locationCoords.coordinates[1] - parsedLat, 2);
                const distB = Math.pow(b.locationCoords.coordinates[0] - parsedLng, 2) +
                    Math.pow(b.locationCoords.coordinates[1] - parsedLat, 2);
                if (distA !== distB) return distA - distB;
            }

            // 2. Location priority (City name match)
            if (locations.length > 0) {
                const aMatch = locations.some(loc => a.location?.toLowerCase().includes(loc.toLowerCase()));
                const bMatch = locations.some(loc => b.location?.toLowerCase().includes(loc.toLowerCase()));
                if (aMatch && !bMatch) return -1;
                if (!aMatch && bMatch) return 1;
            }

            // 3. Date priority (Upcoming events first)
            const timeA = a.startAt ? a.startAt : new Date(`${a.date} ${a.time}`).getTime();
            const timeB = b.startAt ? b.startAt : new Date(`${b.date} ${b.time}`).getTime();

            if (!isNaN(timeA) && !isNaN(timeB)) {
                if (timeA !== timeB) return timeA - timeB;
            }

            return 0;
        });

        return NextResponse.json(transformed);
    } catch (error: any) {
        console.error('CRITICAL: API Error matching events:', error);
        return NextResponse.json(
            { error: 'Failed to fetch events', details: error.message },
            { status: 500 }
        );
    }
}

// POST /api/events — Create a new event
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        let startAt: number | undefined;
        try {
            const [day, month, year] = body.date.split('-').map(Number);
            const [hours, minutes] = body.time.split(':').map(Number);
            const dateObj = new Date(year, month - 1, day, hours || 0, minutes || 0);
            if (!isNaN(dateObj.getTime())) {
                startAt = dateObj.getTime();
            }
        } catch (e) {
            console.error('Error parsing date for startAt:', e);
        }

        const newEvent = new EventModel({
            title: body.title,
            slug: generateSlug(body.title),
            description: body.description || '',
            date: body.date,
            time: body.time,
            startAt,
            location: body.location,
            locationDetails: body.locationDetails,
            locationCoords: body.locationCoords,
            category: body.category,
            tags: body.tags || [],
            featureImage: body.featureImage,
            gallery: body.gallery || [],
            entry: body.entry || '',
            meetingLink: body.meetingLink || '',
            status: 'PENDING',
        });

        await newEvent.save();

        return NextResponse.json(
            { ...newEvent },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating event:', error);
        return NextResponse.json(
            { error: 'Failed to create event' },
            { status: 500 }
        );
    }
}
