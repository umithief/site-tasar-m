import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Slide } from '../../../types';
import { Button } from '../../ui/Button';

interface SliderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (slide: Partial<Slide>) => void;
    editingSlide: Slide | null;
}

export const SliderModal: React.FC<SliderModalProps> = ({ isOpen, onClose, onSave, editingSlide }) => {
    const [formData, setFormData] = useState<Partial<Slide>>({
        title: '',
        subtitle: '',
        cta: 'İNCELE',
        action: 'shop',
        type: 'image',
        image: '',
        videoUrl: ''
    });

    useEffect(() => {
        if (editingSlide) {
            setFormData(editingSlide);
        } else {
            setFormData({
                title: '',
                subtitle: '',
                cta: 'İNCELE',
                action: 'shop',
                type: 'image',
                image: '',
                videoUrl: ''
            });
        }
    }, [editingSlide, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#1A1A17] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 h-[90vh] flex flex-col">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">
                        {editingSlide ? 'Slide Düzenle' : 'Yeni Slide Ekle'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto no-scrollbar flex-1">

                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Slide Tipi</label>
                            <div className="flex bg-black/40 p-1 rounded-lg border border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: 'image' })}
                                    className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${formData.type === 'image' ? 'bg-[#E2FF3B] text-black' : 'text-gray-400 hover:text-white'}`}
                                >
                                    Görsel
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: 'video' })}
                                    className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${formData.type === 'video' ? 'bg-[#E2FF3B] text-black' : 'text-gray-400 hover:text-white'}`}
                                >
                                    Video
                                </button>
                            </div>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Başlık</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-[#E2FF3B] focus:outline-none transition-colors"
                                placeholder="Örn: YENİ SEZON"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Alt Başlık</label>
                            <input
                                type="text"
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-[#E2FF3B] focus:outline-none transition-colors"
                                placeholder="Örn: En yeni ekipmanları keşfedin"
                                value={formData.subtitle}
                                onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                            />
                        </div>

                        {formData.type === 'image' && (
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Görsel URL</label>
                                <input
                                    type="text"
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-[#E2FF3B] focus:outline-none transition-colors"
                                    placeholder="https://..."
                                    value={formData.image}
                                    onChange={e => setFormData({ ...formData, image: e.target.value })}
                                />
                            </div>
                        )}

                        {formData.type === 'video' && (
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Video URL (MP4 / WebM)</label>
                                <input
                                    type="text"
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-[#E2FF3B] focus:outline-none transition-colors"
                                    placeholder="https://...mp4"
                                    value={formData.videoUrl}
                                    onChange={e => setFormData({ ...formData, videoUrl: e.target.value })}
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Buton Metni (CTA)</label>
                            <input
                                type="text"
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-[#E2FF3B] focus:outline-none transition-colors"
                                placeholder="Örn: İNCELE"
                                value={formData.cta}
                                onChange={e => setFormData({ ...formData, cta: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Aksiyon / Link</label>
                            <input
                                type="text"
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-[#E2FF3B] focus:outline-none transition-colors"
                                placeholder="Örn: shop veya /kategori/kask"
                                value={formData.action}
                                onChange={e => setFormData({ ...formData, action: e.target.value })}
                            />
                        </div>

                    </div>


                    <div className="pt-4 flex justify-end gap-3 border-t border-white/10 mt-4">
                        <Button type="button" variant="outline" onClick={onClose}>İptal</Button>
                        <Button type="submit" className="bg-[#E2FF3B] text-black hover:bg-[#ccee00]">Kaydet</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
