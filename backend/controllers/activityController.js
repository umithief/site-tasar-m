import RideActivity from '../models/RideActivity.js';

export const getLatestActivity = async (req, res) => {
    try {
        const userId = req.user.userId;
        const latestRide = await RideActivity.findOne({ userId }).sort({ startTime: -1 });

        if (!latestRide) {
            return res.status(404).json({ message: 'No ride activity found' });
        }

        res.json(latestRide);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching latest activity', error: error.message });
    }
};

export const createActivity = async (req, res) => {
    try {
        const newRide = new RideActivity({
            ...req.body,
            userId: req.user.userId
        });
        await newRide.save();
        res.status(201).json(newRide);
    } catch (error) {
        res.status(500).json({ message: 'Error creating activity', error: error.message });
    }
};
