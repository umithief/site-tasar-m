import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    content: { type: String, required: true },
    isRead: { type: Boolean, default: false },

    type: { type: String, default: 'text' }, // text, image, location
    mediaUrl: String,

    timestamp: { type: Date, default: Date.now }
}, {
    timestamps: true,
    versionKey: false
});

// Index for fetching chat history quickly
messageSchema.index({ sender: 1, receiver: 1, timestamp: 1 });

const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);
export default Message;
