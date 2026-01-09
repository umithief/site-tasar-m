import Story from '../models/Story.js';
import StoryView from '../models/StoryView.js';
import User from '../models/User.js';

// @desc    Create a new story
// @route   POST /api/stories
// @access  Private
export const createStory = async (req, res) => {
    try {
        const { mediaUrl, mediaType } = req.body;

        if (!mediaUrl) {
            return res.status(400).json({ message: 'Media URL is required' });
        }

        const story = new Story({
            userId: req.user._id,
            mediaUrl,
            mediaType: mediaType || 'IMAGE'
        });

        await story.save();

        // Populate user details
        // Note: populate typically works on the document, but depending on mongoose version/setup, 
        // sometimes we need to re-fetch or use execPopulate. 
        // Safe bet:
        await story.populate('userId', 'name avatar');

        res.status(201).json(story);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get active stories grouped by user
// @route   GET /api/stories
// @access  Private
export const getStories = async (req, res) => {
    try {
        const currentUserId = req.user._id;

        // 1. Fetch current user's following list
        const currentUser = await User.findById(currentUserId).select('following');
        const followingIds = currentUser.following || [];

        // Add current user to list to see own story
        const allowedUserIds = [...followingIds, currentUserId];

        // 2. Fetch all active stories from allowed users
        const stories = await Story.aggregate([
            {
                $match: {
                    expiresAt: { $gt: new Date() }, // Only active stories
                    userId: { $in: allowedUserIds } // Only from following + self
                }
            },
            {
                $sort: { createdAt: 1 }
            },
            {
                $group: {
                    _id: '$userId',
                    stories: { $push: '$$ROOT' },
                    lastUpdated: { $max: '$createdAt' }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            },
            {
                $project: {
                    _id: 1,
                    user: {
                        _id: 1,
                        name: 1,
                        avatar: 1
                    },
                    stories: 1,
                    lastUpdated: 1
                }
            },
            {
                $sort: { lastUpdated: -1 }
            }
        ]);

        // 2. Fetch viewed stories for the current user
        const viewedStoryIds = await StoryView.find({ viewerId: currentUserId }).distinct('storyId');
        const viewedSet = new Set(viewedStoryIds.map(id => id.toString()));

        // 3. Mark seen
        const result = stories.map(group => {
            const storiesWithSeen = group.stories.map(story => ({
                ...story,
                seen: viewedSet.has(story._id.toString())
            }));

            const allSeen = storiesWithSeen.every(s => s.seen);

            return {
                user: group.user,
                stories: storiesWithSeen,
                allSeen
            };
        });

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Mark a story as viewed
// @route   POST /api/stories/:id/view
// @access  Private
export const viewStory = async (req, res) => {
    try {
        const storyId = req.params.id;
        const userId = req.user._id;

        const story = await Story.findById(storyId);
        if (!story) {
            return res.status(404).json({ message: 'Story not found' });
        }

        const existingView = await StoryView.findOne({ storyId, viewerId: userId });

        if (!existingView) {
            await StoryView.create({
                storyId,
                viewerId: userId
            });

            await Story.findByIdAndUpdate(storyId, { $inc: { views: 1 } });
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
