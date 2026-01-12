import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    lastMessage: {
        type: String,
        default: ''
    },
    lastMessageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    // Using a Map for unread counts per user is best practice, 
    // but we'll include a simple unreadCount field if strictly needed, 
    // defaulting to 0. Logic will typically update this for the receiver.
    unreadCount: {
        type: Number,
        default: 0
    },
    unreadCounts: {
        type: Map,
        of: Number,
        default: {}
    }
}, {
    timestamps: true,
    versionKey: false
});

// Compound index for quick lookup of private chats
conversationSchema.index({ participants: 1 });

const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema);
export default Conversation;
