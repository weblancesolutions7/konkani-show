
import dynamoose from '@/lib/dynamodb';
import { Item } from 'dynamoose/dist/Item';

export interface IUserOTP extends Item {
    email: string; // The partition key (e.g., user@example.com)
    otp: string;
    expiresAt: number; // TTL (epoch time in seconds)
}

const UserOTPSchema = new dynamoose.Schema(
    {
        email: {
            type: String,
            hashKey: true,
        },
        otp: {
            type: String,
            required: true,
        },
        expiresAt: {
            type: Number,
            required: true,
            // DynamoDB can use this for TTL
        },
        createdAt: { type: Number, default: () => Date.now() },
        updatedAt: { type: Number, default: () => Date.now() },
    },
    {
        saveUnknown: true,
    }
);

const UserOTPModel = dynamoose.model<IUserOTP>('app_user_email_otps', UserOTPSchema, {
    create: true,
});

export default UserOTPModel;
