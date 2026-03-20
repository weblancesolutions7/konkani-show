
import { NextResponse } from 'next/server';
import { SendEmailCommand } from "@aws-sdk/client-ses";
import { sesClient } from "@/lib/ses";
import UserOTPModel from "@/models/UserOTP";

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email address is required' }, { status: 400 });
        }

        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // 1. Save OTP in DynamoDB with 10-minute expiration
        const expiresAt = Math.floor(Date.now() / 1000) + 600;

        await UserOTPModel.update(
            { email },
            { otp, expiresAt },
            { returnValues: 'UPDATED_NEW' }
        );

        // 2. Send Email via AWS SES
        const command = new SendEmailCommand({
            Destination: {
                ToAddresses: [email],
            },
            Message: {
                Body: {
                    Text: { Data: `Your Konkani Show verification code is: ${otp}. It expires in 10 minutes.` },
                    Html: { 
                        Data: `
                            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
                                <h2 style="color: #7030ef;">Konkani Show Verification</h2>
                                <p>Your verification code is:</p>
                                <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #db1fff; padding: 10px 0;">${otp}</div>
                                <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes.</p>
                            </div>
                        ` 
                    },
                },
                Subject: { Data: "Your Konkani Show Verification Code" },
            },
            Source: process.env.SES_FROM_EMAIL || "noreply@konkanishow.com",
        });

        await sesClient.send(command);

        return NextResponse.json({ success: true, message: 'OTP sent successfully' });
    } catch (error: any) {
        console.error('Error sending OTP:', error);
        return NextResponse.json({ 
            error: 'Failed to send OTP', 
            details: error.message 
        }, { status: 500 });
    }
}
