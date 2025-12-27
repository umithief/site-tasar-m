import React, { useEffect } from 'react';
import { motion, AnimatePresence, PanInfo, useAnimation } from 'framer-motion';
import { Trash2, Heart, MessageCircle, UserPlus, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useNotificationStore } from '../../store/useNotificationStore';
import { Notification } from '../../services/notificationApiService';

const NotificationItem = ({ notification }: { notification: Notification }) => {
    const navigate = useNavigate();
    const { markAsRead, deleteNotification } = useNotificationStore();
    const controls = useAnimation();

    const handleTap = () => {
        markAsRead(notification._id);

        if (notification.type === 'FOLLOW') {
            navigate(`/profile/${notification.sender.username}`);
        } else if (notification.post) {
            navigate(`/post/${notification.post._id}`);
        }
    };

    const handleDragEnd = async (event: any, info: PanInfo) => {
        if (info.offset.x < -100) {
            await controls.start({ x: -1000, opacity: 0, transition: { duration: 0.2 } });
            deleteNotification(notification._id);
        } else {
            controls.start({ x: 0 });
        }
    };

    const getIcon = () => {
        switch (notification.type) {
            case 'LIKE': return <Heart size={12} className="text-white fill-current" />;
            case 'COMMENT': return <MessageCircle size={12} className="text-white fill-current" />;
            case 'FOLLOW': return <UserPlus size={12} className="text-white" />;
            default: return <Bell size={12} className="text-white" />;
        }
    };

    const getIconBg = () => {
        switch (notification.type) {
            case 'LIKE': return 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]';
            case 'COMMENT': return 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]';
            case 'FOLLOW': return 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]';
            default: return 'bg-gray-500';
        }
    };

    const getMessage = () => {
        const name = notification.sender.name || notification.sender.username;
        switch (notification.type) {
            case 'LIKE': return <span><span className="font-bold text-white">{name}</span> gönderini beğendi.</span>;
            case 'COMMENT': return <span><span className="font-bold text-white">{name}</span> gönderine yorum yaptı.</span>;
            case 'FOLLOW': return <span><span className="font-bold text-white">{name}</span> seni takip etmeye başladı.</span>;
            default: return <span><span className="font-bold text-white">{name}</span> bir etkileşimde bulundu.</span>;
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="relative w-full max-w-md mx-auto mb-3"
        >
            {/* Delete Background Layer */}
            <div className="absolute inset-0 bg-red-500/20 rounded-xl flex items-center justify-end pr-6 border border-red-500/30">
                <Trash2 className="text-red-500" size={20} />
            </div>

            {/* Swipeable Content */}
            <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={{ left: 0.7, right: 0.1 }}
                onDragEnd={handleDragEnd}
                animate={controls}
                className={`relative flex items-center p-4 rounded-xl border backdrop-blur-md transition-colors cursor-pointer touch-pan-y
                ${!notification.isRead
                        ? 'bg-zinc-900/60 border-orange-500/30 shadow-[0_0_15px_-5px_rgba(249,115,22,0.15)]'
                        : 'bg-black/40 border-white/5'
                    }`}
                onClick={handleTap}
            >
                {/* Unread Indicator */}
                {!notification.isRead && (
                    <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1 h-8 bg-orange-500 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                )}

                {/* Avatar Section */}
                <div className="relative mr-4 shrink-0">
                    <img
                        src={notification.sender.avatar || `https://ui-avatars.com/api/?name=${notification.sender.name}&background=random`}
                        alt="User"
                        className="w-12 h-12 rounded-full object-cover border border-white/10"
                    />
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border border-black ${getIconBg()}`}>
                        {getIcon()}
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 min-w-0 pr-2">
                    <p className="text-sm text-zinc-300 truncate-2-lines leading-snug">
                        {getMessage()}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: tr })}
                    </p>
                </div>

                {/* Post Thumbnail (If Applicable) */}
                {notification.post && (
                    <div className="shrink-0 ml-2">
                        {notification.post.type === 'video' ? (
                            <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-white/10 flex items-center justify-center overflow-hidden">
                                {/* Simple video placeholder or actual thumb if avail */}
                                <video src={notification.post.mediaUrl} className="w-full h-full object-cover opacity-50" muted />
                            </div>
                        ) : (
                            <img
                                src={notification.post.mediaUrl}
                                alt="Post"
                                className="w-10 h-10 rounded-lg object-cover border border-white/10"
                            />
                        )}
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

const MobileNotifications = () => {
    const { notifications, isLoading, fetchNotifications } = useNotificationStore();

    useEffect(() => {
        fetchNotifications();
    }, []);

    if (isLoading && notifications.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-zinc-500 gap-3">
                <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm animate-pulse">Bildirimler yükleniyor...</p>
            </div>
        );
    }

    if (notifications.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] px-8 text-center">
                <div className="w-20 h-20 bg-zinc-900/50 rounded-full flex items-center justify-center mb-6 border border-white/5">
                    <Bell size={32} className="text-zinc-600" />
                </div>
                <h3 className="text-white text-lg font-bold mb-2">Henüz ses yok...</h3>
                <p className="text-zinc-500 text-sm max-w-[200px]">
                    Burada henüz bir motor sesi yok. Etkileşime başla ve garajı canlandır!
                </p>
            </div>
        );
    }

    return (
        <div className="pb-24 pt-4 px-4 max-w-md mx-auto">
            <h2 className="text-xl font-bold text-white mb-6 px-1 flex items-center gap-2">
                Bildirim Merkezi
                {notifications.some(n => !n.isRead) && (
                    <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full border border-orange-500/20">
                        {notifications.filter(n => !n.isRead).length} Yeni
                    </span>
                )}
            </h2>

            <AnimatePresence mode='popLayout'>
                {notifications.map((notification) => (
                    <NotificationItem key={notification._id} notification={notification} />
                ))}
            </AnimatePresence>
        </div>
    );
};

export default MobileNotifications;
