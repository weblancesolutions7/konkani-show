const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://weblancesolutions7_db_user:8irPpBtIOYEAjUxZ@cluster0.msdbfuq.mongodb.net/konkani-show?appName=Cluster0";

const Schema = mongoose.Schema;
const EventSchema = new Schema({}, { strict: false, collection: 'events' });
const Event = mongoose.model('Event', EventSchema);

async function checkCoords() {
    try {
        await mongoose.connect(MONGODB_URI);
        const countWith = await Event.countDocuments({ locationCoords: { $exists: true } });
        const total = await Event.countDocuments({});
        console.log('Events with locationCoords:', countWith);
        console.log('Total events:', total);
        
        if (countWith > 0) {
            const sample = await Event.findOne({ locationCoords: { $exists: true } });
            console.log('Sample event with coords:', sample.title, sample.locationCoords);
        }
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkCoords();
