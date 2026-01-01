import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User } from 'lucide-react';
import { UserAvatar } from './ui/UserAvatar'; // Adjust path if needed
import { FollowButton } from './social/FollowButton'; // Adjust path if needed
import { useNavigate } from 'react-router-dom'; // Or use onNavigate prop

interface UserListModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    users: any[]; // Array of user objects { _id, name, avatar, bio? }
    onNavigate?: (view: any, data?: any) => void;
}

export const UserListModal: React.FC<UserListModalProps> = ({ isOpen, onClose, title, users, onNavigate }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 20 }}
                    className="bg-[#111] border border-white/10 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
                        <h3 className="text-xl font-display font-black text-white uppercase tracking-tight">{title}</h3>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* List */}
                    <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-4 space-y-2">
                        {users && users.length > 0 ? (
                            users.map((user) => (
                                <div key={user._id || user.id} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-colors group">
                                    <div
                                        className="flex items-center gap-3 cursor-pointer"
                                        onClick={() => {
                                            if (onNavigate) {
                                                onNavigate('public-profile', { _id: user._id || user.id });
                                                onClose();
                                            }
                                        }}
                                    >
                                        <UserAvatar src={user.avatar} name={user.name} size={40} />
                                        <div>
                                            <div className="font-bold text-sm text-white group-hover:text-moto-accent transition-colors">
                                                {user.name}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {user.username ? `@${user.username}` : 'Rider'}
                                            </div>
                                        </div>
                                    </div>
                                    {/* Action - only if not self */}
                                    <FollowButton targetUserId={user._id || user.id} className="scale-75 origin-right" />
                                </div>
                            ))
                        ) : (
                            <div className="py-12 flex flex-col items-center justify-center text-gray-500">
                                <User className="w-12 h-12 mb-2 opacity-20" />
                                <p className="text-sm font-medium">Kimse bulunamadı.</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
