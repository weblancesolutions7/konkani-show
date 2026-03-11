
const { MongoClient } = require('mongodb');

const MONGODB_URI = "mongodb+srv://weblancesolutions7_db_user:8irPpBtIOYEAjUxZ@cluster0.msdbfuq.mongodb.net/konkani-show?appName=Cluster0";

async function inspectDocs() {
    const client = new MongoClient(MONGODB_URI);
    try {
        await client.connect();
        const db = client.db();
        const collection = db.collection('events');
        const doc = await collection.findOne({ locationCoords: { $exists: true } });
        console.log('Sample Doc with coords:', JSON.stringify(doc, null, 2));

        const allDocs = await collection.find({}).limit(5).toArray();
        console.log('All sample docs fields:', allDocs.map(d => Object.keys(d)));
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.close();
    }
}

inspectDocs();
