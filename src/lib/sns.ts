
import { SNSClient } from "@aws-sdk/client-sns";

const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const region = process.env.AWS_REGION || 'ap-south-1';

if (!accessKeyId || !secretAccessKey) {
    throw new Error("AWS credentials are not set in environment variables.");
}

export const snsClient = new SNSClient({
    region,
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
});
