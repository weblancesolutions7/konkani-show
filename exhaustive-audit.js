
const { MongoClient } = require('mongodb');

const MONGODB_URI = "mongodb+srv://weblancesolutions7_db_user:8irPpBtIOYEAjUxZ@cluster0.msdbfuq.mongodb.net/konkani-show?appName=Cluster0";

async function exhaustiveAudit() {
    const client = new MongoClient(MONGODB_URI);
    try {
        await client.connect();
        console.log('Connected to MongoDB Atlas');
        
        const admin = client.db().admin();
        const dbs = await admin.listDatabases();
        
        for (const dbInfo of dbs.databases) {
            const dbName = dbInfo.name;
            const db = client.db(dbName);
            const collections = await db.listCollections({}, { nameOnly: true }).toArray();
            console.log(`DB: ${dbName} | Collections: ${collections.map(c => c.name).join(', ')}`);
            
            for (const colInfo of collections) {
                if (colInfo.name.includes('events')) {
                    const col = db.collection(colInfo.name);
                    const indexes = await col.listIndexes().toArray();
                    console.log(`  - [INDEXES] ${dbName}.${colInfo.name}:`, indexes.map(i => i.name));
                }
            }
        }
    } catch (err) {
        console.error('Audit Error:', err);
    } finally {
        await client.close();
    }
}

exhaustiveAudit();
