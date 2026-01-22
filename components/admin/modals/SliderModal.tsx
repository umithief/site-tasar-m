import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Link, Loader2 } from 'lucide-react';
import { Slide } from '../../../types';
import { Button } from '../../ui/Button';
import { api } from '../../../services/api';

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
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const uploadData = new FormData();
            uploadData.append('file', file);

            const response = await api.post('/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (formData.type === 'image') {
                setFormData(prev => ({ ...prev, image: response.data.url }));
            } else {
                setFormData(prev => ({ ...prev, videoUrl: response.data.url }));
            }
        } catch (error) {
            console.error('Upload failed', error);
            alert('Dosya yüklenirken bir hata oluştu.');
        } finally {
            setIsUploading(false);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
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

                        {/* Image/Video Upload Section */}
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                {formData.type === 'image' ? 'Slide Görseli' : 'Slide Videosu'}
                            </label>

                            {/* Hidden File Input */}
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept={formData.type === 'image' ? "image/*" : "video/*"}
                                onChange={handleFileUpload}
                            />

                            <div className="flex flex-col gap-3">
                                {/* Upload Button */}
                                <div
                                    onClick={triggerFileInput}
                                    className="border-2 border-dashed border-white/20 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-[#E2FF3B] hover:bg-white/5 transition-all group"
                                >
                                    {isUploading ? (
                                        <Loader2 className="w-8 h-8 text-[#E2FF3B] animate-spin mb-2" />
                                    ) : (
                                        <Upload className="w-8 h-8 text-gray-400 group-hover:text-[#E2FF3B] mb-2" />
                                    )}
                                    <span className="text-sm text-gray-400 font-medium">
                                        {isUploading ? 'Yükleniyor...' : 'Cihazdan Yükle'}
                                    </span>
                                </div>

                                {/* OR Divider */}
                                <div className="flex items-center gap-3">
                                    <div className="h-px bg-white/10 flex-1" />
                                    <span className="text-xs text-gray-500 font-bold">VEYA URL GİR</span>
                                    <div className="h-px bg-white/10 flex-1" />
                                </div>

                                {/* URL Input */}
                                <div className="relative">
                                    <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="text"
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 pl-10 text-white focus:border-[#E2FF3B] focus:outline-none transition-colors"
                                        placeholder={formData.type === 'image' ? "https://... (Görsel URL)" : "https://... (Video URL)"}
                                        value={formData.type === 'image' ? formData.image : formData.videoUrl}
                                        onChange={e => formData.type === 'image'
                                            ? setFormData({ ...formData, image: e.target.value })
                                            : setFormData({ ...formData, videoUrl: e.target.value })
                                        }
                                    />
                                </div>
                            </div>
                        </div>

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
                        <Button type="submit" disabled={isUploading} className="bg-[#E2FF3B] text-black hover:bg-[#ccee00]">
                            {isUploading ? 'Yükleniyor...' : 'Kaydet'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
