
import { NextResponse } from 'next/server';
import UserOTPModel from "@/models/UserOTP";

export async function POST(request: Request) {
    try {
        const { email, otp } = await request.json();

        if (!email || !otp) {
            return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
        }

        // 1. Fetch OTP from DynamoDB
        const record = await UserOTPModel.get({ email });

        if (!record) {
            return NextResponse.json({ error: 'OTP expired or not found' }, { status: 404 });
        }

        // 2. Check Expiration
        const now = Math.floor(Date.now() / 1000);
        if (record.expiresAt < now) {
            await UserOTPModel.delete({ email });
            return NextResponse.json({ error: 'OTP expired' }, { status: 410 });
        }

        // 3. Verify OTP
        if (record.otp !== otp) {
            return NextResponse.json({ error: 'Invalid OTP' }, { status: 401 });
        }

        // 4. Success - Delete OTP
        await UserOTPModel.delete({ email });

        return NextResponse.json({ success: true, message: 'OTP verified successfully' });
    } catch (error: any) {
        console.error('Error verifying OTP:', error);
        return NextResponse.json({ 
            error: 'Verification failed', 
            details: error.message 
        }, { status: 500 });
    }
}
