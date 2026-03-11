
const { MongoClient } = require('mongodb');

const MONGODB_URI = "mongodb+srv://weblancesolutions7_db_user:8irPpBtIOYEAjUxZ@cluster0.msdbfuq.mongodb.net/konkani-show?appName=Cluster0";

async function listDbs() {
    const client = new MongoClient(MONGODB_URI);
    try {
        await client.connect();
        const dbs = await client.db().admin().listDatabases();
        console.log('Databases:', dbs.databases.map(db => db.name));
        
        for (const dbInfo of dbs.databases) {
            const db = client.db(dbInfo.name);
            const collections = await db.listCollections().toArray();
            console.log(`Collections in ${dbInfo.name}:`, collections.map(c => c.name));
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.close();
    }
}

listDbs();
