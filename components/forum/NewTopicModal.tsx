import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageProvider';

interface NewTopicModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (title: string, content: string, category: string) => void;
}

export const NewTopicModal: React.FC<NewTopicModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const { t } = useLanguage();
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Genel');
    const [content, setContent] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim() && content.trim()) {
            onSubmit(title, content, category);
            setTitle('');
            setContent('');
            setCategory('Genel');
            onClose();
        }
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
                        <h3 className="text-lg font-bold text-white">{t('forum.create_topic')}</h3>
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                            <X size={20} className="text-gray-400" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Başlık</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-[#09090b] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-moto-accent focus:outline-none"
                                placeholder="Konu başlığı..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Kategori</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full bg-[#09090b] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-moto-accent focus:outline-none"
                            >
                                <option value="Genel">Genel</option>
                                <option value="Teknik">Teknik</option>
                                <option value="Gezi">Gezi</option>
                                <option value="Ekipman">Ekipman</option>
                                <option value="Etkinlik">Etkinlik</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-1">İçerik</label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={5}
                                className="w-full bg-[#09090b] border border-white/10 rounded-lg px-4 py-2 text-white resize-none focus:border-moto-accent focus:outline-none"
                                placeholder="Düşüncelerinizi paylaşın..."
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
                                {t('forum.post')}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
