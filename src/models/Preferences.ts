import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPreferences extends Document {
    tags: { id: string; name: string }[];
    categories: { id: string; name: string; count?: number }[];
    featuredCategories: {
        category: string;
        highlightClass?: string;
        featuredImage?: string;
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
        featuredCategories: [
            {
                category: { type: String, required: true },
                highlightClass: { type: String, default: '' },
                featuredImage: { type: String, default: '' },
            },
        ],
    },
    { timestamps: true }
);

const PreferencesModel: Model<IPreferences> =
    mongoose.models.Preferences ||
    mongoose.model<IPreferences>('Preferences', PreferencesSchema);

export default PreferencesModel;
