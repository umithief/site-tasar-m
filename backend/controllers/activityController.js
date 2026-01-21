import RideActivity from '../models/RideActivity.js';

export const getLatestActivity = async (req, res) => {
    try {
        // Fix: Use req.user.id (from checkAuth middleware) and query 'user' field
        const latestRide = await RideActivity.findOne({ user: req.user.id }).sort({ startTime: -1 });

        if (!latestRide) {
            // Demo Fallback: Return a mock ride so the UI isn't empty
            return res.json({
                user: req.user.id,
                distance: 12.5,
                maxSpeed: 184,
                leanAngle: 42,
                duration: "45dk",
                startTime: new Date().toISOString()
            });
        }

        res.json(latestRide);
    } catch (error) {
        console.error("Activity Error:", error);
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
