import Story from '../models/Story.js';

// @desc    Get all stories
// @route   GET /api/stories
// @access  Public
export const getStories = async (req, res) => {
    try {
        const stories = await Story.find().sort({ createdAt: -1 });
        res.status(200).json(stories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new story
// @route   POST /api/stories
// @access  Private (Admin)
export const createStory = async (req, res) => {
    try {
        const { title, category, coverImg, videoUrl, duration } = req.body;

        const story = await Story.create({
            title,
            category,
            coverImg,
            videoUrl,
            duration
        });

        res.status(201).json(story);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a story
// @route   PUT /api/stories/:id
// @access  Private (Admin)
export const updateStory = async (req, res) => {
    try {
        const story = await Story.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!story) {
            return res.status(404).json({ message: 'Story not found' });
        }

        res.status(200).json(story);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a story
// @route   DELETE /api/stories/:id
// @access  Private (Admin)
export const deleteStory = async (req, res) => {
    try {
        const story = await Story.findByIdAndDelete(req.params.id);

        if (!story) {
            return res.status(404).json({ message: 'Story not found' });
        }

        res.status(200).json({ message: 'Story deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
