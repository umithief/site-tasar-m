import mongoose from 'mongoose';

const meetupEventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    type: { type: String, required: true }, // 'night-ride', 'coffee', 'track-day'
    date: { type: String, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    organizer: { type: String, required: true },
    attendees: { type: Number, default: 0 },
    image: { type: String, required: true },
    description: { type: String, required: true },
    attendeeList: [{
        userId: { type: String },
        name: { type: String },
        avatar: { type: String }
    }],
    messages: [{
        id: String,
        userId: String,
        userName: String,
        text: String,
        time: String
    }]
}, { timestamps: true });

const MeetupEvent = mongoose.model('MeetupEvent', meetupEventSchema);
export default MeetupEvent;
