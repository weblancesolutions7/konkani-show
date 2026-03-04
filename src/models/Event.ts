import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEvent extends Document {
    title: string;
    slug: string;
    description: string;
    date: string;
    time: string;
    location: string;
    category: string;
    tags: string[];
    featureImage: string;
    gallery: string[];
    entry?: string;
    meetingLink?: string;
    status: 'PENDING' | 'APPROVED' | 'DELETED' | 'REJECTED';
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
        location: { type: String, required: true },
        category: { type: String, required: true },
        tags: { type: [String], default: [] },
        featureImage: { type: String, required: true },
        gallery: { type: [String], default: [] },
        entry: { type: String, default: '' },
        meetingLink: { type: String, default: '' },
        status: {
            type: String,
            enum: ['PENDING', 'APPROVED', 'DELETED', 'REJECTED'],
            default: 'PENDING',
        },
    },
    { timestamps: true }
);

// Auto-generate slug before saving
EventSchema.pre('save', function () {
    if (!this.slug || this.isModified('title')) {
        this.slug = generateSlug(this.title);
    }
});

const EventModel: Model<IEvent> =
    mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);

export default EventModel;
