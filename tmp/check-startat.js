const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://weblancesolutions7_db_user:8irPpBtIOYEAjUxZ@cluster0.msdbfuq.mongodb.net/konkani-show?appName=Cluster0";

const Schema = mongoose.Schema;
const EventSchema = new Schema({}, { strict: false, collection: 'events' });
const Event = mongoose.model('Event', EventSchema);

async function checkEvents() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        const countMissing = await Event.countDocuments({ startAt: { $exists: false } });
        console.log('Events without startAt:', countMissing);
        
        const countTotal = await Event.countDocuments({});
        console.log('Total events:', countTotal);

        const sample = await Event.findOne({ startAt: { $exists: true } });
        if (sample) {
            console.log('Sample event with startAt:', sample.title, 'startAt:', sample.startAt);
            console.log('Raw startAt value:', JSON.stringify(sample.startAt));
        } else {
            console.log('No events found with startAt field.');
        }
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkEvents();
