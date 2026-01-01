import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Heart, MessageCircle, Bell } from 'lucide-react';
import { useNotificationStore } from '../../store/useNotificationStore';
import { UserAvatar } from './UserAvatar';

export const NotificationToastUI: React.FC<{
    notification: any;
    onDismiss: () => void;
    visible: boolean;
}> = ({ notification, onDismiss, visible }) => {
    if (!notification) return null;

    useEffect(() => {
        if (visible) {
            const timer = setTimeout(onDismiss, 4000);
            return () => clearTimeout(timer);
        }
    }, [visible, onDismiss]);

    const getIcon = () => {
        switch (notification.type) {
            case 'LIKE': return <Heart className="w-4 h-4 text-red-500 fill-current" />;
            case 'COMMENT': return <MessageCircle className="w-4 h-4 text-blue-400 fill-current" />;
            case 'FOLLOW': return <User className="w-4 h-4 text-green-500 fill-current" />;
            default: return <Bell className="w-4 h-4 text-moto-accent" />;
        }
    };

    // Helper to get sender info safely
    const senderName = notification.senderName || notification.sender?.name || 'Kullanıcı';
    const senderAvatar = notification.senderAvatar || notification.sender?.avatar;
    const message = notification.message || (notification.type === 'LIKE' ? 'gönderini beğendi.' : notification.type === 'COMMENT' ? 'gönderine yorum yaptı.' : 'seni takip etmeye başladı.');

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, y: -50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md"
                >
                    <div className="bg-[#111]/90 backdrop-blur-xl border border-moto-accent/30 rounded-2xl shadow-[0_0_30px_rgba(255,87,34,0.3)] p-3 flex items-center gap-3 relative overflow-hidden group cursor-pointer" onClick={onDismiss}>
                        {/* Glow Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-moto-accent/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />

                        {/* Avatar */}
                        <div className="relative shrink-0">
                            <UserAvatar src={senderAvatar} name={senderName} size={40} className="border-2 border-moto-accent/50" />
                            <div className="absolute -bottom-1 -right-1 bg-[#111] rounded-full p-1 border border-white/10">
                                {getIcon()}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 z-10">
                            <h4 className="font-bold text-white text-sm truncate">{senderName}</h4>
                            <p className="text-gray-300 text-xs truncate leading-tight">{message}</p>
                        </div>

                        {/* Time/Close */}
                        <div className="text-[10px] text-gray-500 font-mono z-10 shrink-0">
                            ŞİMDİ
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
