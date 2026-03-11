import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEvent extends Document {
    title: string;
    slug: string;
    description: string;
    date: string;
    time: string;
    startAt?: Date;
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
    gallery?: string[];
    entry?: string;
    price?: number;
    currency?: string;
    language?: string;
    meetingLink?: string;
    status: 'PENDING' | 'APPROVED' | 'DELETED' | 'REJECTED';
    views: number;
    createdAt: Date;
    updatedAt: Date;
}

function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
        + '-' + Date.now().toString(36);
}

const EventSchema = new Schema<IEvent>(
    {
        title: { type: String, required: true, trim: true },
        slug: { type: String, unique: true, index: true },
        description: { type: String, required: true },
        date: { type: String, required: true },
        time: { type: String, required: true },
        startAt: { type: Date, index: true },
        location: { type: String, required: true },
        locationDetails: {
            venueAddress: { type: String },
            city: { type: String },
            state: { type: String },
            country: { type: String },
            zipCode: { type: String },
        },
        locationCoords: {
            type: {
                type: String,
                enum: ['Point'],
                required: false,
            },
            coordinates: {
                type: [Number],
                required: false,
            }
        },
        category: { type: String, required: true },
        tags: { type: [String], default: [] },
        featureImage: { type: String, required: true },
        gallery: { type: [String], default: [] },
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
        views: { type: Number, default: 0 },
    },
    { 
        timestamps: true,
        collection: 'events',
        autoIndex: true
    }
);

// Add 2dsphere index for geolocation queries
EventSchema.index({ locationCoords: '2dsphere' });

// Add index for fast sorting by popularity
EventSchema.index({ views: -1 });

// Auto-generate slug and parse date before saving
EventSchema.pre('save', async function () {
    if (!this.slug || this.isModified('title')) {
        this.slug = generateSlug(this.title);
    }

    if (this.isModified('date') || this.isModified('time')) {
        try {
            // Our date is DD-MM-YYYY, time is HH:mm
            const [day, month, year] = this.date.split('-').map(Number);
            const [hours, minutes] = this.time.split(':').map(Number);
            const dateObj = new Date(year, month - 1, day, hours || 0, minutes || 0);
            if (!isNaN(dateObj.getTime())) {
                this.startAt = dateObj;
            }
        } catch (e) {
            console.error('Error parsing date for startAt:', e);
        }
    }
});

if (mongoose.models.Event) {
    delete mongoose.models.Event;
}
const EventModel: Model<IEvent> = mongoose.model<IEvent>('Event', EventSchema);

export default EventModel;
