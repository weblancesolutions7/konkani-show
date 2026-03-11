
const { MongoClient } = require('mongodb');

const MONGODB_URI = "mongodb+srv://weblancesolutions7_db_user:8irPpBtIOYEAjUxZ@cluster0.msdbfuq.mongodb.net/konkani-show?appName=Cluster0";

async function listCollections() {
    const client = new MongoClient(MONGODB_URI);
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        const db = client.db();
        const collections = await db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.close();
    }
}

listCollections();
