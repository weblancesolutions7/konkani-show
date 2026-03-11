import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPreferences extends Document {
    tags: { id: string; name: string }[];
    categories: { id: string; name: string; count?: number }[];
    cities: string[];
    languages: string[];
    featuredCategories: {
        id: string;
        category: string;
        title?: string;
        description?: string;
        featuredImage?: string;
        link?: string;
        highlightClass?: string;
    }[];
}

const PreferencesSchema = new Schema<IPreferences>(
    {
        tags: [
            {
                id: { type: String, required: true },
                name: { type: String, required: true },
            },
        ],
        categories: [
            {
                id: { type: String, required: true },
                name: { type: String, required: true },
                count: { type: Number, default: 0 },
            },
        ],
        cities: [{ type: String }],
        languages: [{ type: String }],
        featuredCategories: [
            {
                id: { type: String, required: true },
                category: { type: String, required: true },
                title: { type: String },
                description: { type: String },
                featuredImage: { type: String },
                link: { type: String },
                highlightClass: { type: String },
            },
        ],
    },
    {
        timestamps: true,
        collection: 'preferences'
    }
);

const PreferencesModel: Model<IPreferences> =
    mongoose.models.Preferences ||
    mongoose.model<IPreferences>('Preferences', PreferencesSchema);

export default PreferencesModel;
