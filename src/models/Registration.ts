import dynamoose from '@/lib/dynamodb';
import { Item } from 'dynamoose/dist/Item';
import { v4 as uuidv4 } from 'uuid';

export interface IRegistration extends Item {
    id: string; // The partition key
    eventId: string; // UUID from event
    name: string;
    email: string;
    phone: string;
    tickets: number;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
    createdAt?: number;
    updatedAt?: number;
}

const RegistrationSchema = new dynamoose.Schema(
    {
        id: {
            type: String,
            hashKey: true,
            default: () => uuidv4(),
        },
        eventId: {
            type: String,
            required: true,
            index: { name: 'eventIdIndex' }
        },
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        tickets: { type: Number, required: true, default: 1 },
        status: {
            type: String,
            enum: ['PENDING', 'CONFIRMED', 'CANCELLED'],
            default: 'CONFIRMED',
        },
        createdAt: { type: Number, default: () => Date.now() },
        updatedAt: { type: Number, default: () => Date.now() },
    },
    { 
        saveUnknown: true
    }
);

const RegistrationModel = dynamoose.model<IRegistration>('app_registrations', RegistrationSchema, {
    create: true
});

export default RegistrationModel;
