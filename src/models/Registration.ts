import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRegistration extends Document {
    eventId: mongoose.Types.ObjectId;
    name: string;
    email: string;
    phone: string;
    tickets: number;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
    createdAt: Date;
    updatedAt: Date;
}

const RegistrationSchema = new Schema<IRegistration>(
    {
        eventId: {
            type: Schema.Types.ObjectId,
            ref: 'Event',
            required: true,
            index: true,
        },
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true, lowercase: true },
        phone: { type: String, required: true, trim: true },
        tickets: { type: Number, required: true, min: 1, default: 1 },
        status: {
            type: String,
            enum: ['PENDING', 'CONFIRMED', 'CANCELLED'],
            default: 'CONFIRMED',
        },
    },
    { timestamps: true }
);

const RegistrationModel: Model<IRegistration> =
    mongoose.models.Registration ||
    mongoose.model<IRegistration>('Registration', RegistrationSchema);

export default RegistrationModel;
