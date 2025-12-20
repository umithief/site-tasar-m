import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// POST /api/analytics/visit
router.post('/visit', async (req, res) => {
    try {
        const Visitor = mongoose.model('Visitor');
        const today = new Date().toLocaleDateString('tr-TR');

        // Find today's entry or create it
        let todayStats = await Visitor.findOne({ date: today });

        if (todayStats) {
            todayStats.count += 1;
            await todayStats.save();
        } else {
            todayStats = new Visitor({ date: today, count: 1 });
            await todayStats.save();
        }

        res.status(200).json({ message: 'Visit recorded' });
    } catch (error) {
        console.error('Visit error:', error);
        res.status(500).json({ message: error.message });
    }
});

// GET /api/analytics/visitors
router.get('/visitors', async (req, res) => {
    try {
        const Visitor = mongoose.model('Visitor');
        const today = new Date().toLocaleDateString('tr-TR');

        const allStats = await Visitor.find();

        const totalVisits = allStats.reduce((sum, item) => sum + item.count, 0);
        const todayEntry = allStats.find(s => s.date === today);

        res.json({
            totalVisits,
            todayVisits: todayEntry ? todayEntry.count : 0
        });
    } catch (error) {
        res.status(500).json({ totalVisits: 0, todayVisits: 0 });
    }
});

// POST /api/analytics/event
router.post('/event', async (req, res) => {
    try {
        const Analytics = mongoose.model('Analytics');
        const eventData = req.body;

        if (!eventData.type) {
            return res.status(400).json({ message: 'Event type required' });
        }

        const newEvent = new Analytics({
            ...eventData,
            timestamp: Date.now(),
            date: new Date().toLocaleDateString('tr-TR')
        });

        await newEvent.save();
        res.status(201).json({ message: 'Event tracked' });
    } catch (error) {
        console.error('Event error:', error);
        res.status(500).json({ message: error.message });
    }
});

// GET /api/analytics/dashboard
router.get('/dashboard', async (req, res) => {
    try {
        const { range } = req.query; // '24h', '7d', '30d'
        const Analytics = mongoose.model('Analytics');

        const now = Date.now();
        let startTime = 0;

        if (range === '24h') startTime = now - (24 * 60 * 60 * 1000);
        else if (range === '30d') startTime = now - (30 * 24 * 60 * 60 * 1000);
        else startTime = now - (7 * 24 * 60 * 60 * 1000); // Default 7d

        const events = await Analytics.find({ timestamp: { $gte: startTime } });

        // Aggregation Logic (Similar to Frontend Mock Logic)
        const productViews = {};
        const productAdds = {};
        let totalProductViews = 0;
        let totalAddToCart = 0;
        let totalCheckouts = 0;
        let totalDuration = 0;
        let durationCount = 0;

        events.forEach(e => {
            if (e.type === 'view_product') {
                totalProductViews++;
                if (e.productName) {
                    productViews[e.productName] = (productViews[e.productName] || 0) + 1;
                }
            } else if (e.type === 'add_to_cart') {
                totalAddToCart++;
                if (e.productName) {
                    productAdds[e.productName] = (productAdds[e.productName] || 0) + 1;
                }
            } else if (e.type === 'checkout_start') {
                totalCheckouts++;
            } else if (e.type === 'session_duration' && e.duration) {
                totalDuration += e.duration;
                durationCount++;
            }
        });

        // Build Timeline
        let activityTimeline = [];

        if (range === '24h') {
            const currentHour = new Date().getHours();
            // Initialize last 12-24h
            // Simplified: Just buckets for 24h
            const buckets = {};

            events.forEach(e => {
                const d = new Date(e.timestamp);
                const h = d.getHours();
                buckets[h] = (buckets[h] || 0) + 1;
            });

            for (let i = 0; i < 12; i++) {
                const h = (currentHour - 11 + i + 24) % 24;
                activityTimeline.push({ label: `${h}:00`, value: buckets[h] || 0 });
            }

        } else {
            const daysCount = range === '30d' ? 30 : 7;
            const buckets = {};

            events.forEach(e => {
                const day = new Date(e.timestamp).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
                buckets[day] = (buckets[day] || 0) + 1;
            });

            for (let i = daysCount - 1; i >= 0; i--) {
                const d = new Date(now - (i * 24 * 60 * 60 * 1000));
                const label = d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
                activityTimeline.push({ label, value: buckets[label] || 0 });
            }
        }

        const topViewedProducts = Object.entries(productViews)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        const topAddedProducts = Object.entries(productAdds)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        const avgSessionDuration = durationCount > 0 ? Math.round(totalDuration / durationCount) : 0;

        res.json({
            totalProductViews,
            totalAddToCart,
            totalCheckouts,
            avgSessionDuration,
            topViewedProducts,
            topAddedProducts,
            activityTimeline
        });

    } catch (error) {
        console.error('Dashboard Error:', error);
        res.status(500).json({ message: error.message });
    }
});

export default router;
