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

        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '20', 10);

        const timeline = searchParams.get('timeline');
        const featuredOnly = searchParams.get('featured') === 'true';

        // We use .scan() because we have complex and heavily varied filters
        let scan = EventModel.scan();

        if (categories.length > 0) {
            scan = scan.where('category').in(categories);
        }

        if (featuredOnly) {
            scan = scan.where('isFeatured').eq(true);
            if (!status) {
                scan = scan.where('status').eq('APPROVED');
            }
        }

        if (status) {
            scan = scan.where('status').eq(status);
        } else if (!timeline && sort !== 'featured') {
            // Default: Only show approved events for general search/category views
            scan = scan.where('status').eq('APPROVED');
        }
        // Note: For timeline and featured views, we broad-scan and filter in-memory for robustness


        if (language) {
            const languages = language.split(',');
            scan = scan.where('language').in(languages);
        }

        // Execute scan to get the items
        let allEvents = await scan.exec();

        // Helper to parse date consistently (reused from AdminDashboard)
        const parseEventDate = (ev: any): number => {
            if (ev.startAt && ev.startAt > 0) return ev.startAt;
            const dateStr = ev.date || '';
            const timeStr = ev.time || '00:00';
            
            // Try standard Date parsing
            let d = new Date(`${dateStr} ${timeStr}`);
            if (!isNaN(d.getTime())) return d.getTime();
            
            // Try manual split for DD-MM-YYYY or YYYY-MM-DD
            const parts = dateStr.split('-');
            if (parts.length === 3) {
                const [p1, p2, p3] = parts.map(Number);
                const [hours, mins] = timeStr.split(':').map(Number);
                if (p1 > 31) d = new Date(p1, p2 - 1, p3, hours || 0, mins || 0);
                else d = new Date(p3, p2 - 1, p1, hours || 0, mins || 0);
                return d.getTime();
            }
            return 0;
        };

        const now = Date.now();
        const EVENT_DURATION = 6 * 60 * 60 * 1000;

        // In-memory status filter for timeline/featured (Exclude DELETED/REJECTED)
        if (!status && (timeline || sort === 'featured')) {
            allEvents = allEvents.filter(ev => ev.status !== 'DELETED' && ev.status !== 'REJECTED') as any;
        }

        // In-memory timeline filtering
        if (timeline) {
            allEvents = allEvents.filter(ev => {
                const start = parseEventDate(ev);
                if (timeline === 'upcoming') return start > now;
                if (timeline === 'ongoing') return start <= now && start > now - EVENT_DURATION;
                if (timeline === 'completed') return start <= now - EVENT_DURATION;
                return true;
            }) as any;
        }

        // Cross-filter remaining items in-memory for complex text search or multiple tags
        const query = searchParams.get('q') || searchParams.get('search');
        if (query) {
            const lowerQuery = query.toLowerCase();
            allEvents = allEvents.filter(ev =>
                (ev.title && ev.title.toLowerCase().includes(lowerQuery)) ||
                (ev.description && ev.description.toLowerCase().includes(lowerQuery)) ||
                (ev.location && ev.location.toLowerCase().includes(lowerQuery)) ||
                (ev.category && ev.category.toLowerCase().includes(lowerQuery)) ||
                (ev.tags && ev.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
            ) as any;
        }

        // 🚨 Strict Location Filtering if location is provided
        if (locations.length > 0 && !locations.some(loc => loc.toLowerCase() === 'worldwide')) {
            allEvents = allEvents.filter(ev => {
                const eventLocation = (ev.location || '').toLowerCase();
                const eventCity = (ev.locationDetails?.city || '').toLowerCase();
                
                return locations.some(loc => {
                    const l = loc.toLowerCase();
                    // Basic match
                    if (eventLocation.includes(l) || eventCity.includes(l)) return true;
                    
                    // Common Aliases/Mappings for the region
                    if (l === 'mangalore' && (eventLocation.includes('mangaluru') || eventCity.includes('mangaluru'))) return true;
                    if (l === 'mangaluru' && (eventLocation.includes('mangalore') || eventCity.includes('mangalore'))) return true;
                    if (l === 'bangalore' && (eventLocation.includes('bengaluru') || eventCity.includes('bengaluru'))) return true;
                    if (l === 'bengaluru' && (eventLocation.includes('bangalore') || eventCity.includes('bangalore'))) return true;
                    
                    return false;
                });
            }) as any;
        }

        // In-memory tags filtering (to avoid Dynamoose/DynamoDB issues with .contains() on reserved words during scan)
        if (tags.length > 0) {
            allEvents = allEvents.filter(ev =>
                tags.every(t => ev.tags && Array.isArray(ev.tags) && ev.tags.includes(t))
            ) as any;
        }

        // In-memory price filtering
        if (minPrice !== null || maxPrice !== null) {
            const min = minPrice !== null ? parseFloat(minPrice) : 0;
            const max = maxPrice !== null ? parseFloat(maxPrice) : Infinity;

            allEvents = allEvents.filter(ev => {
                let price = Number(ev.price);
                
                // Fallback for legacy data: try to extract price from entry field
                if ((price === 0 || isNaN(price)) && ev.entry) {
                    const match = ev.entry.match(/\d+/);
                    if (match) price = parseInt(match[0], 10);
                    else if (ev.entry.toLowerCase().includes('free')) price = 0;
                    else if (ev.entry.toLowerCase().includes('paid')) price = 1;
                }
                if (isNaN(price)) price = 0;

                // Special case for "Free" (0, 0)
                if (min === 0 && max === 0) return price === 0;
                // Case for "Paid" (1, 1000000) or any other range
                return price >= min && price <= max;
            }) as any;
        }

        let transformed = allEvents.map((event: any) => ({
            ...event,
        }));

        // Sorting
        const parsedLat = lat ? parseFloat(lat) : NaN;
        const parsedLng = lng ? parseFloat(lng) : NaN;
        const hasCoords = !isNaN(parsedLat) && !isNaN(parsedLng);

        transformed.sort((a: any, b: any) => {
            // 1. Featured Sort (Primary when requested)
            if (sort === 'featured') {
                if (a.isFeatured && !b.isFeatured) return -1;
                if (!a.isFeatured && b.isFeatured) return 1;
            }

            if (sort === 'popular') {
                return (b.views || 0) - (a.views || 0);
            } else if (sort === 'recommended') {
                const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return timeB - timeA;
            }

            // 2. Proximity Sort (if coordinates available)
            if (hasCoords && a.locationCoords?.coordinates && b.locationCoords?.coordinates) {
                const distA = Math.pow(a.locationCoords.coordinates[0] - parsedLng, 2) +
                    Math.pow(a.locationCoords.coordinates[1] - parsedLat, 2);
                const distB = Math.pow(b.locationCoords.coordinates[0] - parsedLng, 2) +
                    Math.pow(b.locationCoords.coordinates[1] - parsedLat, 2);
                if (distA !== distB) return distA - distB;
            }

            // 3. Timeline specific Sort
            if (timeline) {
                const tA = parseEventDate(a);
                const tB = parseEventDate(b);
                // Completed: Latest first. Others: Soonest first.
                return timeline === 'completed' ? tB - tA : tA - tB;
            }

            // 4. Location priority (City name match)
            if (locations.length > 0) {
                const aMatch = locations.some(loc => a.location?.toLowerCase().includes(loc.toLowerCase()));
                const bMatch = locations.some(loc => b.location?.toLowerCase().includes(loc.toLowerCase()));
                if (aMatch && !bMatch) return -1;
                if (!aMatch && bMatch) return 1;
            }

            // 5. Date priority (Upcoming events first)
            const timeA = parseEventDate(a);
            const timeB = parseEventDate(b);

            if (!isNaN(timeA) && !isNaN(timeB)) {
                if (timeA !== timeB) return timeA - timeB;
            }

            return 0;
        });

        // Pagination slicing
        const total = transformed.length;
        const totalPages = Math.ceil(total / limit);
        const offset = (page - 1) * limit;
        const paginatedData = transformed.slice(offset, offset + limit);

        return NextResponse.json({
            data: paginatedData,
            pagination: {
                total,
                page,
                limit,
                totalPages
            }
        });
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
            const dateStr = body.date;
            const timeStr = body.time || '00:00';
            const parts = dateStr.split('-');
            if (parts.length === 3) {
                const [p1, p2, p3] = parts.map(Number);
                const [hours, minutes] = timeStr.split(':').map(Number);
                
                let dateObj: Date;
                if (p1 > 31) {
                    // YYYY-MM-DD
                    dateObj = new Date(p1, p2 - 1, p3, hours || 0, minutes || 0);
                } else {
                    // DD-MM-YYYY
                    dateObj = new Date(p3, p2 - 1, p1, hours || 0, minutes || 0);
                }
                
                if (!isNaN(dateObj.getTime())) {
                    startAt = dateObj.getTime();
                }
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
            price: body.price !== undefined ? body.price : 0,
            meetingLink: body.meetingLink || '',
            status: 'PENDING',
            isFeatured: false,
        });

        await newEvent.save();

        return NextResponse.json(
            { ...newEvent },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Error creating event:', error);
        return NextResponse.json(
            { error: 'Failed to create event', details: error.message },
            { status: 500 }
        );
    }
}
