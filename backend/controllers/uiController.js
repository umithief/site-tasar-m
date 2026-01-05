
import UISetting from '../models/UISetting.js';

export const getSettings = async (req, res) => {
    try {
        const settings = await UISetting.find();
        const settingsMap = settings.reduce((acc, curr) => ({ ...acc, [curr.component]: curr.config }), {});
        res.status(200).json(settingsMap);
    } catch (error) {
        console.error('UI Settings Fetch Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const updateSettings = async (req, res) => {
    try {
        const { component } = req.params;
        const config = req.body;

        const setting = await UISetting.findOneAndUpdate(
            { component },
            { config, updatedAt: new Date(), updatedBy: req.user ? req.user._id : 'admin' },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.status(200).json(setting);
    } catch (error) {
        console.error('UI Settings Update Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
