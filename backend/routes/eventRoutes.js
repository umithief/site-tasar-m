import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// GET /api/events
router.get('/', async (req, res) => {
    try {
        const MeetupEvent = mongoose.model('MeetupEvent');
        const events = await MeetupEvent.find();
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/events
router.post('/', async (req, res) => {
    try {
        const MeetupEvent = mongoose.model('MeetupEvent');
        const newEvent = new MeetupEvent(req.body);
        await newEvent.save();
        res.status(201).json(newEvent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT /api/events/:id
router.put('/:id', async (req, res) => {
    try {
        const MeetupEvent = mongoose.model('MeetupEvent');
        const updatedEvent = await MeetupEvent.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedEvent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE /api/events/:id
router.delete('/:id', async (req, res) => {
    try {
        const MeetupEvent = mongoose.model('MeetupEvent');
        await MeetupEvent.findByIdAndDelete(req.params.id);
        res.json({ message: 'Etkinlik silindi' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/events/:id/join
router.post('/:id/join', async (req, res) => {
    try {
        const MeetupEvent = mongoose.model('MeetupEvent');
        const { userId, name, avatar } = req.body;
        const event = await MeetupEvent.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Etkinlik bulunamadı' });

        // Check if already joined
        const isJoined = event.attendeeList.some(a => a.userId === userId);
        if (!isJoined) {
            event.attendeeList.push({ userId, name, avatar });
            event.attendees = event.attendeeList.length;
            await event.save();
        }
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/events/:id/leave
router.post('/:id/leave', async (req, res) => {
    try {
        const MeetupEvent = mongoose.model('MeetupEvent');
        const { userId } = req.body;
        const event = await MeetupEvent.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Etkinlik bulunamadı' });

        event.attendeeList = event.attendeeList.filter(a => a.userId !== userId);
        event.attendees = event.attendeeList.length;
        await event.save();
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/events/:id/message
router.post('/:id/message', async (req, res) => {
    try {
        const MeetupEvent = mongoose.model('MeetupEvent');
        const { userId, userName, text, time } = req.body;
        const event = await MeetupEvent.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Etkinlik bulunamadı' });

        const newMessage = {
            id: new mongoose.Types.ObjectId().toString(),
            userId,
            userName,
            text,
            time: time || new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
        };

        event.messages.push(newMessage);
        await event.save();
        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
