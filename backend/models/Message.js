import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true
    },
    senderId: { // Renamed from sender for consistency with request
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Keeping receiver for backward compat or direct query, but it's optional in convo model
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    text: { // Renamed from content for consistency with request
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['TEXT', 'MAP_PIN', 'IMAGE', 'text', 'image', 'location'], // Support both old and new enum styles
        default: 'TEXT'
    },
    isRead: { type: Boolean, default: false },

    // Legacy support fields
    content: String,
    mediaUrl: String,

    createdAt: { type: Date, default: Date.now }
}, {
    timestamps: true,
    versionKey: false
});

// Middleware to sync 'text' and 'content' for backward compatibility
messageSchema.pre('save', function (next) {
    if (this.text && !this.content) this.content = this.text;
    if (this.content && !this.text) this.text = this.content;
    next();
});

// Index for fetching chat history in a conversation
messageSchema.index({ conversationId: 1, createdAt: 1 });

const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);
export default Message;
