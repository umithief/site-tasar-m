import mongoose from 'mongoose';

const storySchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Story title is required'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        default: 'LIFESTYLE'
    },
    coverImg: {
        type: String,
        required: [true, 'Cover image URL is required']
    },
    videoUrl: {
        type: String,
        required: [true, 'Video URL is required']
    },
    duration: {
        type: String,
        required: [true, 'Duration is required'],
        default: '0:30'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Story = mongoose.models.Story || mongoose.model('Story', storySchema);
export default Story;
