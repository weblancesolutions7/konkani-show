import dynamoose from '@/lib/dynamodb';
import { Item } from 'dynamoose/dist/Item';
import { v4 as uuidv4 } from 'uuid';

export interface IEvent extends Item {
    id: string;
    title: string;
    slug: string;
    description: string;
    date: string;
    time: string;
    startAt?: number;
    location: string;
    locationDetails?: {
        venueAddress?: string;
        city?: string;
        state?: string;
        country?: string;
        zipCode?: string;
    };
    locationCoords?: {
        type: 'Point';
        coordinates: [number, number]; // [longitude, latitude]
    };
    category: string;
    tags: string[];
    featureImage: string;
    detailImage?: string;
    gallery?: string[];
    entry?: string;
    price?: number;
    currency?: string;
    language?: string;
    meetingLink?: string;
    status: 'PENDING' | 'APPROVED' | 'DELETED' | 'REJECTED';
    isFeatured: boolean;
    views: number;
    createdAt?: number;
    updatedAt?: number;
}

export function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
        + '-' + Date.now().toString(36);
}

const locationDetailsSchema = new dynamoose.Schema({
    venueAddress: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    zipCode: { type: String },
});

const EventSchema = new dynamoose.Schema(
    {
        id: {
            type: String,
            hashKey: true,
            default: () => uuidv4(),
        },
        title: { type: String, required: true },
        slug: {
            type: String,
            index: { name: 'slugIndex' }
        },
        description: { type: String, required: true },
        date: { type: String, required: true },
        time: { type: String, required: true },
        startAt: {
            type: Number
        },
        location: { type: String, required: true },
        locationDetails: {
            type: Object,
            schema: locationDetailsSchema,
        },
        locationCoords: {
            type: Object,
            schema: {
                type: { type: String, default: 'Point' },
                coordinates: {
                    type: Array,
                    schema: [Number],
                }
            }
        },
        category: { type: String, required: true },
        tags: { type: Array, schema: [String], default: [] },
        featureImage: { type: String, required: true },
        detailImage: { type: String },
        gallery: { type: Array, schema: [String], default: [] },
        entry: { type: String, default: '' },
        price: { type: Number, default: 0 },
        currency: { type: String, default: 'INR' },
        language: { type: String, default: 'Konkani' },
        meetingLink: { type: String, default: '' },
        status: {
            type: String,
            enum: ['PENDING', 'APPROVED', 'DELETED', 'REJECTED'],
            default: 'PENDING',
        },
        isFeatured: { type: Boolean, default: false },
        views: { type: Number, default: 0 },
        createdAt: { type: Number, default: () => Date.now() },
        updatedAt: { type: Number, default: () => Date.now() },
    },
    {
        saveUnknown: true
    }
);

const EventModel = dynamoose.model<IEvent>('app_events', EventSchema, {
    create: true // Auto-create actual DB table locally
});

export default EventModel;
