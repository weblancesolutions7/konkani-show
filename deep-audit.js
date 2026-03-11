
const { MongoClient } = require('mongodb');

const MONGODB_URI = "mongodb+srv://weblancesolutions7_db_user:8irPpBtIOYEAjUxZ@cluster0.msdbfuq.mongodb.net/konkani-show?appName=Cluster0";

async function deepAudit() {
    const client = new MongoClient(MONGODB_URI);
    try {
        await client.connect();
        const dbs = await client.db().admin().listDatabases();
        
        for (const dbInfo of dbs.databases) {
            const dbName = dbInfo.name;
            const db = client.db(dbName);
            const collections = await db.listCollections().toArray();
            console.log(`Database: ${dbName}`);
            console.log(`Collections:`, collections.map(c => c.name));
            
            for (const col of collections) {
                if (col.name.includes('events')) {
                    const count = await db.collection(col.name).countDocuments();
                    const indexes = await db.collection(col.name).listIndexes().toArray();
                    console.log(`  - [INFO] Collection ${col.name} has ${count} docs and indexes:`, 
                        indexes.map(idx => idx.name));
                }
            }
            console.log('---');
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.close();
    }
}

deepAudit();
