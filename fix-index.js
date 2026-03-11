
const { MongoClient } = require('mongodb');

// Get URI from process env directly or hardcode fallback if needed
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/booking-app"; 

async function fixIndex() {
    const client = new MongoClient(MONGODB_URI);
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        const db = client.db();
        const collection = db.collection('events');

        console.log('Dropping existing indexes...');
        try {
            await collection.dropIndex('locationCoords_2dsphere');
        } catch (e) {
            console.log('No existing 2dsphere index found or error dropping it.');
        }

        console.log('Creating 2dsphere index...');
        await collection.createIndex({ locationCoords: '2dsphere' });
        console.log('Index created successfully!');

        const indexes = await collection.listIndexes().toArray();
        console.log('Current indexes:', JSON.stringify(indexes, null, 2));

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.close();
    }
}

fixIndex();
