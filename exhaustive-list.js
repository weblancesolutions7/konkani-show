
const { MongoClient } = require('mongodb');

const MONGODB_URI = "mongodb+srv://weblancesolutions7_db_user:8irPpBtIOYEAjUxZ@cluster0.msdbfuq.mongodb.net/konkani-show?appName=Cluster0";

async function exhaustiveList() {
    const client = new MongoClient(MONGODB_URI);
    try {
        await client.connect();
        const dbs = (await client.db().admin().listDatabases()).databases;
        console.log('--- EXHAUSTIVE LIST ---');
        for (const dbInfo of dbs) {
            const db = client.db(dbInfo.name);
            const collections = await db.listCollections().toArray();
            console.log(`DB [${dbInfo.name}]: ${collections.map(c => c.name).join(', ')}`);
        }
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

exhaustiveList();
