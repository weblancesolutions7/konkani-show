import dynamoose from '@/lib/dynamodb';
import { Item } from 'dynamoose/dist/Item';

export interface IPreferences extends Item {
    id: string; // DynamoDB partition key
    tags: { id: string; name: string }[];
    categories: { id: string; name: string; count?: number }[];
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

const TagSchema = new dynamoose.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
});

const CategorySchema = new dynamoose.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    count: { type: Number, default: 0 },
});

const FeaturedCategorySchema = new dynamoose.Schema({
    id: { type: String, required: true },
    category: { type: String, required: true },
    title: { type: String },
    description: { type: String },
    featuredImage: { type: String },
    link: { type: String },
    highlightClass: { type: String },
});

const PreferencesSchema = new dynamoose.Schema(
    {
        id: { 
            type: String, 
            hashKey: true,
            default: 'singleton' // We use 'singleton' because preferences is mostly a single global document
        },
        tags: { type: Array, schema: [TagSchema] },
        categories: { type: Array, schema: [CategorySchema] },
        languages: { type: Array, schema: [String] },
        featuredCategories: { type: Array, schema: [FeaturedCategorySchema] },
        createdAt: { type: Number, default: () => Date.now() },
        updatedAt: { type: Number, default: () => Date.now() },
    },
    { 
        saveUnknown: true 
    }
);

const PreferencesModel = dynamoose.model<IPreferences>('app_preferences', PreferencesSchema, {
    create: true
});

export default PreferencesModel;
