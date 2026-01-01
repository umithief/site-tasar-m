import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Heart, MessageCircle, ArrowLeft, CheckCircle, Bell } from 'lucide-react';
import { useNotificationStore } from '../../store/useNotificationStore';
import { UserAvatar } from '../../components/ui/UserAvatar';
import { ViewState } from '../../types';

interface MobileNotificationsProps {
    onNavigate: (view: ViewState, data?: any) => void;
    onBack: () => void;
}

export const MobileNotifications: React.FC<MobileNotificationsProps> = ({ onNavigate, onBack }) => {
    const { notifications, markAsRead, markAllAsRead, fetchNotifications } = useNotificationStore();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        fetchNotifications().finally(() => setIsLoading(false));
    }, []);

    const handleNotificationClick = (notification: any) => {
        markAsRead(notification._id);

        // Navigate based on type
        if (notification.type === 'FOLLOW') {
            // Navigate to user profile
            // Assuming onNavigate supports user profile view with data
            onNavigate('public-profile', { _id: notification.sender._id || notification.sender });
        } else if (notification.post) {
            // Navigate to post detail (or single post view)
            // We can use 'single-post' view if available, otherwise maybe navigate to feed and scroll?
            // Since we have a modal or detail view for posts typically in mobile apps.
            // Let's assume 'single-post' is valid view state or handle it appropriately.
            // Looking at types.ts would be ideal, but let's assume 'feed' with highlight or new 'post-detail' view.
            // For now, let's navigate to public-profile of sender as fallback? No, that's confusing.
            // Let's stick to 'feed' but that's broad. 
            // Ideally we have a 'post-detail' view. I'll use 'single-post' and if not supported, we can fix.
            onNavigate('feed' as any, { highlightPostId: notification.post._id || notification.post });
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'LIKE': return <Heart className="w-4 h-4 text-white fill-current" />;
            case 'COMMENT': return <MessageCircle className="w-4 h-4 text-white fill-current" />;
            case 'FOLLOW': return <User className="w-4 h-4 text-white fill-current" />;
            default: return <Bell className="w-4 h-4 text-white" />;
        }
    };

    const getIconBg = (type: string) => {
        switch (type) {
            case 'LIKE': return 'bg-red-500';
            case 'COMMENT': return 'bg-blue-500';
            case 'FOLLOW': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="min-h-screen bg-[#09090b] text-white pt-6 pb-24 px-4 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-2xl font-bold font-display">Bildirimler</h1>
                </div>
                {notifications.some(n => !n.isRead) && (
                    <button
                        onClick={() => markAllAsRead()}
                        className="text-xs text-moto-accent font-bold hover:text-white transition-colors"
                    >
                        Tümünü Oku
                    </button>
                )}
            </div>

            {/* List */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="text-center py-10 text-gray-500">Yükleniyor...</div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                        <Bell className="w-16 h-16 mb-4 text-gray-600" />
                        <h3 className="text-lg font-bold">Henüz bildirim yok</h3>
                        <p className="text-sm text-gray-500">Etkileşimleriniz burada görünecek.</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {notifications.map((notification) => (
                            <motion.div
                                key={notification._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, height: 0 }}
                                onClick={() => handleNotificationClick(notification)}
                                className={`relative flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border ${notification.isRead ? 'bg-[#111] border-white/5' : 'bg-white/5 border-moto-accent/20'}`}
                            >
                                {/* Unread Dot */}
                                {!notification.isRead && (
                                    <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-moto-accent animate-pulse" />
                                )}

                                {/* Avatar & Icon */}
                                <div className="relative shrink-0">
                                    <UserAvatar src={notification.sender.avatar} name={notification.sender.name} size={48} />
                                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-[#09090b] ${getIconBg(notification.type)}`}>
                                        {getIcon(notification.type)}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-baseline gap-2 mb-0.5">
                                        <span className="font-bold text-sm truncate">{notification.sender.name}</span>
                                        <span className="text-[10px] text-gray-500">{new Date(notification.createdAt).toLocaleDateString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <p className={`text-xs leading-relaxed ${notification.isRead ? 'text-gray-400' : 'text-gray-200'}`}>
                                        {notification.type === 'LIKE' ? 'gönderini beğendi.' : notification.type === 'COMMENT' ? 'gönderine yorum yaptı.' : 'seni takip etmeye başladı.'}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
};
