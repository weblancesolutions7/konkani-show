import * as dynamoose from 'dynamoose';

const isProduction = process.env.NODE_ENV === 'production';

// In production, or when AWS credentials are provided locally, use them.
// Dynamoose will automatically use AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_REGION
// from the environment variables if provided.
// If you want to connect to a local DynamoDB instance (e.g. for development):
// Set LOCAL_DYNAMODB_URL in your .env file, e.g., LOCAL_DYNAMODB_URL=http://localhost:8000

if (!isProduction && process.env.LOCAL_DYNAMODB_URL) {
    dynamoose.aws.ddb.local(process.env.LOCAL_DYNAMODB_URL);
} else {
    // If not using local, we assume AWS credentials are set in the environment.
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const region = process.env.AWS_REGION || 'ap-south-1'; // Defaulting to ap-south-1, can be overridden

    if (accessKeyId && secretAccessKey) {
        const ddb = new dynamoose.aws.ddb.DynamoDB({
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
            region,
        });
        dynamoose.aws.ddb.set(ddb);
    }
}

export default dynamoose;
