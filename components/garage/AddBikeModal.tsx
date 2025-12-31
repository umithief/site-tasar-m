
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { X, Bike, Camera, Save, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserBike } from '../../types';

interface AddBikeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (bike: Omit<UserBike, '_id'>) => Promise<void>;
}

export const AddBikeModal: React.FC<AddBikeModalProps> = ({ isOpen, onClose, onAdd }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        brand: '',
        model: '',
        year: '',
        km: '',
        color: '',
        image: '',
        notes: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onAdd({
                ...formData,
                image: formData.image || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=1000' // Fallback image
            } as any);
            onClose();
            setFormData({ brand: '', model: '', year: '', km: '', color: '', image: '', notes: '' });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-[#1A1A17] border border-white/10 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
            >
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#1A1A17]">
                    <h2 className="text-xl font-display font-black text-white flex items-center gap-2">
                        <Bike className="w-6 h-6 text-moto-accent" /> YENİ MOTOSİKLET EKLE
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Marka</label>
                            <input
                                required
                                value={formData.brand}
                                onChange={e => setFormData({ ...formData, brand: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-moto-accent outline-none font-bold"
                                placeholder="Örn: Yamaha"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Model</label>
                            <input
                                required
                                value={formData.model}
                                onChange={e => setFormData({ ...formData, model: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-moto-accent outline-none font-bold"
                                placeholder="Örn: R25"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Yıl</label>
                            <input
                                required
                                type="number"
                                value={formData.year}
                                onChange={e => setFormData({ ...formData, year: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-moto-accent outline-none font-mono"
                                placeholder="2023"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">KM</label>
                            <input
                                required
                                value={formData.km}
                                onChange={e => setFormData({ ...formData, km: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-moto-accent outline-none font-mono"
                                placeholder="12500"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Renk</label>
                            <input
                                required
                                value={formData.color}
                                onChange={e => setFormData({ ...formData, color: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-moto-accent outline-none"
                                placeholder="Siyah"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Fotoğraf URL (Opsiyonel)</label>
                        <div className="relative">
                            <Camera className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                value={formData.image}
                                onChange={e => setFormData({ ...formData, image: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:border-moto-accent outline-none text-sm"
                                placeholder="https://..."
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Notlar</label>
                        <textarea
                            value={formData.notes}
                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-moto-accent outline-none min-h-[100px] resize-none text-sm"
                            placeholder="Motor hakkında kısa notlar..."
                        />
                    </div>

                    <button
                        disabled={loading}
                        className="w-full bg-moto-accent hover:bg-white text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> GARAJA EKLE</>}
                    </button>

                </form>
            </motion.div>
        </div>
    );
};
