import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageProvider';
import { MeetupEvent } from '../../types';

interface CreateEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (event: Omit<MeetupEvent, '_id'>) => void;
    user: any;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({ isOpen, onClose, onSubmit, user }) => {
    const { t } = useLanguage();

    const [formData, setFormData] = useState({
        title: '',
        type: 'night-ride',
        date: '',
        time: '',
        location: '',
        description: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            attendees: 1,
            organizer: user.name,
            coordinates: { lat: 41.0082, lng: 28.9784 }, // Mock coords
            image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=800&auto=format&fit=crop', // Default image
            messages: []
        } as any);
        onClose();
        setFormData({
            title: '',
            type: 'night-ride',
            date: '',
            time: '',
            location: '',
            description: ''
        });
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-[#121214] w-full max-w-lg rounded-2xl border border-white/10 overflow-hidden"
                >
                    <div className="flex items-center justify-between p-4 border-b border-white/5">
                        <h3 className="text-lg font-bold text-white">Etkinlik Oluştur</h3>
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                            <X size={20} className="text-gray-400" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Etkinlik Adı</label>
                            <input
                                required
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-[#09090b] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-moto-accent focus:outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Tarih</label>
                                <input
                                    required
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full bg-[#09090b] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-moto-accent focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Saat</label>
                                <input
                                    required
                                    type="time"
                                    value={formData.time}
                                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                    className="w-full bg-[#09090b] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-moto-accent focus:outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Konum</label>
                            <input
                                required
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full bg-[#09090b] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-moto-accent focus:outline-none"
                                placeholder="Başlangıç noktası..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Açıklama</label>
                            <textarea
                                required
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                className="w-full bg-[#09090b] border border-white/10 rounded-lg px-4 py-2 text-white resize-none focus:border-moto-accent focus:outline-none"
                            />
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-moto-accent text-black font-bold rounded-lg hover:bg-white transition-colors"
                            >
                                Oluştur
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
