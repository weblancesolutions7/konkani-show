import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import EventModel from '@/models/Event';

// GET /api/events — List events with optional filters
export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        
        // Ensure indexes are ready
        await EventModel.syncIndexes().catch(err => console.error('Index sync failed:', err));

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
        const dateFilter = searchParams.get('dateFilter'); // today, tomorrow, weekend, or "YYYY-MM-DD,YYYY-MM-DD"

        // Build query filter
        const filter: Record<string, unknown> = {};

        if (categories.length > 0) {
            filter.category = { $in: categories };
        }

        if (status) {
            filter.status = status;
        } else {
            // Default: only show approved events for public listing
            filter.status = 'APPROVED';
        }

        // Tag filtering
        const tagsParam = searchParams.get('tag') || searchParams.get('tags');
        const tags = tagsParam ? tagsParam.split(',') : [];
        if (tags.length > 0) {
            filter.tags = { $in: tags };
        }

        if (language) {
            const languages = language.split(',');
            filter.language = { $in: languages };
        }

        if (minPrice || maxPrice) {
            const priceFilter: any = {};
            if (minPrice) priceFilter.$gte = parseFloat(minPrice);
            if (maxPrice) priceFilter.$lte = parseFloat(maxPrice);
            filter.price = priceFilter;
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
                const day = today.getDay(); // 0 is Sunday, 6 is Saturday
                startDate = new Date(today);
                // Move to Friday or Saturday? Usually "This Weekend" includes Sat/Sun.
                // Let's say Saturday and Sunday.
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

            if (startDate || endDate) {
                const rangeQuery: any = {};
                if (startDate) rangeQuery.$gte = startDate;
                if (endDate) rangeQuery.$lte = endDate;
                filter.startAt = rangeQuery;
            }
        }

        const query = searchParams.get('q') || searchParams.get('search');
        if (query) {
            filter.$or = [
                { title: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { location: { $regex: query, $options: 'i' } },
            ];
        }

        // Handle specific sort filters that modify the query tag
        if (sort === 'featured' && !tagsParam) {
            filter.tags = 'Featured';
        }

        // Proximity data for manual sorting
        const parsedLat = lat ? parseFloat(lat) : NaN;
        const parsedLng = lng ? parseFloat(lng) : NaN;
        const hasCoords = !isNaN(parsedLat) && !isNaN(parsedLng);

        // Determine Mongoose sort object (only for indexed sorts)
        const sortOptions: any = {};
        if (sort === 'popular') sortOptions.views = -1;
        else if (sort === 'recommended') sortOptions.createdAt = -1;

        // Fetch matching events
        let allEvents;
        if (Object.keys(sortOptions).length > 0) {
            allEvents = await EventModel.find(filter).sort(sortOptions).lean();
        } else {
            allEvents = await EventModel.find(filter).lean();
        }

        let transformed = allEvents.map((event: any) => ({
            ...event,
            id: event._id.toString(),
            _id: undefined,
        }));

        // Comprehensive manual sort
        if (!['popular', 'recommended'].includes(sort || '')) {
            transformed.sort((a: any, b: any) => {
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
                const timeA = a.startAt ? new Date(a.startAt).getTime() : new Date(`${a.date} ${a.time}`).getTime();
                const timeB = b.startAt ? new Date(b.startAt).getTime() : new Date(`${b.date} ${b.time}`).getTime();
                
                if (!isNaN(timeA) && !isNaN(timeB)) {
                    if (timeA !== timeB) return timeA - timeB;
                }

                return 0;
            });
        }

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
        await dbConnect();

        const body = await request.json();

        const event = new EventModel({
            title: body.title,
            description: body.description || '',
            date: body.date,
            time: body.time,
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

        await event.save();

        const eventObj = event.toObject();
        return NextResponse.json(
            {
                ...eventObj,
                id: eventObj._id.toString(),
                _id: undefined,
            },
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
