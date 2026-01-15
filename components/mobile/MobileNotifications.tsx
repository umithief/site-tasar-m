import React, { useEffect } from 'react';
import { useNotificationStore } from '../../store/useNotificationStore';
import { Bell, MessageSquare, Heart, MapPin, Check, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

export const MobileNotifications: React.FC = () => {
    const { notifications, fetchNotifications, markAsRead, markAllAsRead, isLoading } = useNotificationStore();

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Icon Mapping
    const getIcon = (type: string) => {
        switch (type) {
            case 'LIKE': return <Heart className="w-4 h-4 text-white" fill="currentColor" />;
            case 'COMMENT': return <MessageSquare className="w-4 h-4 text-white" fill="currentColor" />;
            case 'FOLLOW': return <Plus className="w-4 h-4 text-black" />;
            case 'RIDE_INVITE': return <MapPin className="w-4 h-4 text-black" />;
            default: return <Bell className="w-4 h-4 text-black" />;
        }
    };

    // Color Mapping
    const getColor = (type: string) => {
        switch (type) {
            case 'LIKE': return 'bg-red-500';
            case 'COMMENT': return 'bg-blue-500';
            case 'FOLLOW': return 'bg-moto-accent';
            case 'RIDE_INVITE': return 'bg-yellow-400';
            default: return 'bg-gray-500';
        }
    };

    // Construct Message
    const getMessage = (notification: any) => {
        const name = notification.sender?.name || 'Bir kullanıcı';
        switch (notification.type) {
            case 'LIKE': return <span><span className="font-bold">{name}</span> gönderini beğendi.</span>;
            case 'COMMENT': return <span><span className="font-bold">{name}</span> gönderine yorum yaptı.</span>;
            case 'FOLLOW': return <span><span className="font-bold">{name}</span> seni takip etmeye başladı.</span>;
            case 'RIDE_INVITE': return <span><span className="font-bold">{name}</span> seni bir sürüşe davet etti.</span>;
            default: return <span><span className="font-bold">{name}</span> seninle etkileşime geçti.</span>;
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] pb-20">
            {/* Header */}
            <div className="bg-[#050505]/90 backdrop-blur-md sticky top-0 z-20 border-b border-white/5 px-4 h-16 flex items-center justify-between">
                <h1 className="text-xl font-display font-black text-white">Bildirimler</h1>
                {notifications.some(n => !n.isRead) && (
                    <button
                        onClick={markAllAsRead}
                        className="text-xs font-bold text-moto-accent bg-moto-accent/10 px-3 py-1.5 rounded-full hover:bg-moto-accent/20 transition-colors"
                    >
                        Tümünü Okundu İşaretle
                    </button>
                )}
            </div>

            {/* List */}
            <div className="p-4 space-y-3">
                {isLoading ? (
                    <div className="flex justify-center p-8">
                        <div className="w-8 h-8 border-4 border-white/10 border-t-moto-accent rounded-full animate-spin"></div>
                    </div>
                ) : notifications.length > 0 ? (
                    <AnimatePresence>
                        {notifications.map((notification) => (
                            <motion.div
                                key={notification._id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={`relative p-4 rounded-2xl border ${notification.isRead ? 'bg-[#111] border-white/5' : 'bg-white/5 border-moto-accent/20'} flex gap-4 items-start shadow-sm`}
                                onClick={() => markAsRead(notification._id)}
                            >
                                {/* Interact User Avatar */}
                                <div className="relative shrink-0">
                                    <div className="w-12 h-12 rounded-full bg-gray-800 overflow-hidden">
                                        {/* Safe avatar loading */}
                                        <img
                                            src={notification.sender?.avatar || `https://ui-avatars.com/api/?name=${notification.sender?.name || 'User'}&background=random`}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-[#111] flex items-center justify-center ${getColor(notification.type)}`}>
                                        {getIcon(notification.type)}
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-200 leading-snug">
                                        {getMessage(notification)}
                                    </p>
                                    <p className="text-xs text-gray-500 font-medium mt-1">
                                        {(() => {
                                            try {
                                                if (!notification.createdAt) return '';
                                                return formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: tr });
                                            } catch (e) {
                                                return '';
                                            }
                                        })()}
                                    </p>
                                </div>

                                {!notification.isRead && (
                                    <div className="w-2 h-2 rounded-full bg-moto-accent mt-2 shrink-0" />
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                ) : (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-600">
                            <Bell className="w-8 h-8" />
                        </div>
                        <h3 className="text-white font-bold mb-1">Hiç bildirim yok</h3>
                        <p className="text-gray-500 text-xs text-center max-w-[200px] mx-auto">
                            Şu an için her şey sakin görünüyor.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
