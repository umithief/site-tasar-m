import Ride from '../models/Ride.js';
import User from '../models/User.js';

// Haversine Formula for Distance (in km)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

export const createRide = async (req, res) => {
    try {
        const { title, coordinates, telemetry, bikeId, description, isPublic } = req.body;
        const userId = req.user._id; // From auth middleware

        if (!coordinates || coordinates.length < 2) {
            return res.status(400).json({ success: false, message: 'Geçersiz koordinat verisi. En az 2 nokta gerekli.' });
        }

        // --- ANALYSIS LOGIC ---
        let maxSpeed = 0;
        let totalSpeed = 0;
        let maxLeanAngle = 0;
        let maxGForce = 0;

        // Analyze Telemetry
        if (telemetry && telemetry.length > 0) {
            telemetry.forEach(point => {
                if (point.speed > maxSpeed) maxSpeed = point.speed;
                if (point.leanAngle > maxLeanAngle) maxLeanAngle = point.leanAngle;
                if (point.gForce > maxGForce) maxGForce = point.gForce;
                totalSpeed += point.speed;
            });
        }

        // Analyze Route (Distance)
        let totalDistance = 0;
        for (let i = 0; i < coordinates.length - 1; i++) {
            const [lon1, lat1] = coordinates[i];
            const [lon2, lat2] = coordinates[i + 1];
            totalDistance += calculateDistance(lat1, lon1, lat2, lon2);
        }

        // Duration (from telemetry timestamps or simple mock if relying on interval)
        // Assuming telemetry is ordered by time
        let duration = 0;
        if (telemetry && telemetry.length > 1) {
            const start = new Date(telemetry[0].timestamp).getTime();
            const end = new Date(telemetry[telemetry.length - 1].timestamp).getTime();
            duration = (end - start) / 1000; // seconds
        }

        const avgSpeed = telemetry && telemetry.length > 0 ? (totalSpeed / telemetry.length) : 0;

        // Create Ride
        const newRide = await Ride.create({
            userId,
            bikeId,
            title: title || `Sürüş - ${new Date().toLocaleDateString('tr-TR')}`,
            description,
            isPublic: isPublic !== undefined ? isPublic : true,
            route: {
                type: 'LineString',
                coordinates: coordinates
            },
            telemetry: telemetry || [],
            stats: {
                maxSpeed,
                avgSpeed,
                maxLeanAngle,
                maxGForce,
                totalDistance: parseFloat(totalDistance.toFixed(2)),
                duration: Math.round(duration)
            }
        });

        // Optional: Update User Stats (Total KM)
        await User.findByIdAndUpdate(userId, {
            $inc: { 'points': parseFloat((totalDistance * 10).toFixed(0)) } // 10 points per km
        });

        res.status(201).json({
            success: true,
            message: 'Sürüş başarıyla kaydedildi ve analiz edildi.',
            data: newRide
        });

    } catch (error) {
        console.error('Ride Create Error:', error);
        res.status(500).json({ success: false, message: 'Sürüş kaydedilemedi.', error: error.message });
    }
};

export const getRide = async (req, res) => {
    try {
        const ride = await Ride.findById(req.params.id)
            .populate('userId', 'name avatar rank')
            .populate('bikeId'); // Assuming bike model/brand is needed

        if (!ride) {
            return res.status(404).json({ success: false, message: 'Sürüş verisi bulunamadı.' });
        }

        res.status(200).json({ success: true, data: ride });
    } catch (error) {
        console.error('Get Ride Error:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası.' });
    }
};

export const getUserRides = async (req, res) => {
    try {
        const { userId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const rides = await Ride.find({ userId })
            .sort({ date: -1 }) // Newest first
            .skip(skip)
            .limit(limit);

        const total = await Ride.countDocuments({ userId });

        res.status(200).json({
            success: true,
            count: rides.length,
            pagination: { total, page, pages: Math.ceil(total / limit) },
            data: rides
        });
    } catch (error) {
        console.error('Get User Rides Error:', error);
        res.status(500).json({ success: false, message: 'Kullanıcı sürüşleri getirilemedi.' });
    }
};

export const deleteRide = async (req, res) => {
    try {
        const ride = await Ride.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

        if (!ride) {
            return res.status(404).json({ success: false, message: 'Sürüş bulunamadı veya yetkiniz yok.' });
        }

        res.status(200).json({ success: true, message: 'Sürüş silindi.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Silme işlemi başarısız.' });
    }
};
