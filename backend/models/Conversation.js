import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    unreadCount: {
        type: Map,
        of: Number,
        default: {}
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { versionKey: false });

const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema);

export default Conversation;
