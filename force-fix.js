
const { MongoClient } = require('mongodb');

const MONGODB_URI = "mongodb+srv://weblancesolutions7_db_user:8irPpBtIOYEAjUxZ@cluster0.msdbfuq.mongodb.net/konkani-show?appName=Cluster0";

async function forceFix() {
    const client = new MongoClient(MONGODB_URI);
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        const db = client.db();
        
        const collections = ['events', 'eventsTree'];
        
        for (const colName of collections) {
            console.log(`Checking collection: ${colName}`);
            const col = db.collection(colName);
            
            // Log a sample to check data
            const sample = await col.findOne({});
            if (sample) {
                console.log(`  - Found data in ${colName}. Sample keys: ${Object.keys(sample)}`);
                console.log(`  - Creating 2dsphere index on ${colName}...`);
                await col.createIndex({ locationCoords: '2dsphere' });
                console.log(`  - Index created on ${colName}.`);
            } else {
                console.log(`  - Collection ${colName} is empty or missing.`);
            }
        }

        const stats = await db.collection('eventsTree').listIndexes().toArray();
        console.log('EventsTree indexes:', JSON.stringify(stats, null, 2));

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.close();
    }
}

forceFix();
