const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://weblancesolutions7_db_user:8irPpBtIOYEAjUxZ@cluster0.msdbfuq.mongodb.net/konkani-show?appName=Cluster0";

const Schema = mongoose.Schema;
const EventSchema = new Schema({
    title: String,
    date: String,
    time: String,
    startAt: Date
}, { collection: 'events' });

const Event = mongoose.model('Event', EventSchema);

function parseEventDate(dateStr, timeStr) {
    if (!dateStr) return null;
    
    // Try DD-MM-YYYY first
    if (dateStr.includes('-')) {
        const parts = dateStr.split('-');
        if (parts.length === 3 && parts[2].length === 4) {
            const [day, month, year] = parts.map(Number);
            const [hours, minutes] = (timeStr || '00:00').split(':').map(Number);
            const d = new Date(year, month - 1, day, hours || 0, minutes || 0);
            if (!isNaN(d.getTime())) return d;
        }
    }
    
    // Try native parsing for "May 15, 2026" etc.
    // If timeStr is included in dateStr like "May 15, 2026 10:00 AM", it might just work
    const combined = timeStr ? `${dateStr} ${timeStr}` : dateStr;
    const native = new Date(combined);
    if (!isNaN(native.getTime())) return native;
    
    const justDate = new Date(dateStr);
    if (!isNaN(justDate.getTime())) return justDate;
    
    return null;
}

async function migrateDates() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        
        const events = await Event.find({});
        console.log(`Checking all ${events.length} events.`);

        let migratedCount = 0;
        for (const event of events) {
            const dateObj = parseEventDate(event.date, event.time);
            
            if (dateObj) {
                // Check if it's already correct to avoid unnecessary writes
                if (event.startAt && event.startAt.getTime() === dateObj.getTime()) {
                    continue;
                }
                
                event.startAt = dateObj;
                await event.save();
                console.log(`Migrated event "${event.title}": "${event.date}" "${event.time}" -> ${dateObj.toISOString()}`);
                migratedCount++;
            } else {
                console.log(`FAILED to parse date for "${event.title}": date="${event.date}", time="${event.time}"`);
            }
        }
        
        console.log(`Migration complete. Updated ${migratedCount} events.`);
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrateDates();
