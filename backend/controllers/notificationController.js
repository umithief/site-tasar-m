import Notification from '../models/Notification.js';
import { sendNotification } from '../socket.js';

// Get notifications for the current user
export const getNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const notifications = await Notification.find({ recipient: userId })
            .populate('sender', 'name username avatar')
            .populate('post', 'mediaUrl type') // To show thumbnail
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const totalUnread = await Notification.countDocuments({ recipient: userId, isRead: false });

        res.status(200).json({
            notifications,
            totalUnread,
            hasMore: notifications.length === limit
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Mark a single notification as read
export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const notification = await Notification.findOneAndUpdate(
            { _id: id, recipient: userId },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.status(200).json(notification);
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Mark ALL notifications as read
export const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user._id;
        await Notification.updateMany(
            { recipient: userId, isRead: false },
            { isRead: true }
        );
        res.status(200).json({ message: 'All marked as read' });
    } catch (error) {
        console.error('Error marking all as read:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete a notification
export const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const deleted = await Notification.findOneAndDelete({ _id: id, recipient: userId });

        if (!deleted) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.status(200).json({ message: 'Notification deleted' });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Internal Helper to create notification (called from other controllers like Post/User)
export const createNotification = async ({ recipient, sender, type, post, commentId }) => {
    try {
        if (recipient.toString() === sender.toString()) return; // Don't notify self

        const notification = await Notification.create({
            recipient,
            sender,
            type,
            post,
            commentId
        });

        // Populate for immediate socket emission
        const populatedNotification = await notification.populate([
            { path: 'sender', select: 'name username avatar' },
            { path: 'post', select: 'mediaUrl type' }
        ]);

        // Emit via Socket
        sendNotification(recipient, 'new_notification', populatedNotification);

        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};
