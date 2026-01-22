import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Link, Loader2, Image as ImageIcon, Video as VideoIcon, Trash2 } from 'lucide-react';
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
    const videoInputRef = useRef<HTMLInputElement>(null);

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

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'image' | 'videoUrl') => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const uploadData = new FormData();
            uploadData.append('file', file);

            const response = await api.post('/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setFormData(prev => ({ ...prev, [field]: response.data.url }));
        } catch (error) {
            console.error('Upload failed', error);
            alert('Dosya yüklenirken bir hata oluştu.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#1A1A17] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 h-[90vh] flex flex-col">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">
                        {editingSlide ? 'Slide Düzenle' : 'Yeni Slide Ekle'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto no-scrollbar flex-1">

                    {/* TYPE SELECTION */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Slide Tipi</label>
                            <div className="flex bg-black/40 p-1 rounded-lg border border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: 'image' })}
                                    className={`flex-1 py-3 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-2 ${formData.type === 'image' ? 'bg-[#E2FF3B] text-black shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                >
                                    <ImageIcon className="w-4 h-4" />
                                    Görsel Slide
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: 'video' })}
                                    className={`flex-1 py-3 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-2 ${formData.type === 'video' ? 'bg-[#E2FF3B] text-black shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                >
                                    <VideoIcon className="w-4 h-4" />
                                    Video Slide
                                </button>
                            </div>
                        </div>

                        {/* TEXT FIELDS */}
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Başlık</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-[#E2FF3B] focus:outline-none transition-colors placeholder:text-gray-700"
                                placeholder="Örn: YENİ SEZON"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Alt Başlık</label>
                            <input
                                type="text"
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-[#E2FF3B] focus:outline-none transition-colors placeholder:text-gray-700"
                                placeholder="Örn: Koleksiyonu Keşfet"
                                value={formData.subtitle}
                                onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                            />
                        </div>

                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Buton Metni (CTA)</label>
                            <input
                                type="text"
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-[#E2FF3B] focus:outline-none transition-colors placeholder:text-gray-700"
                                placeholder="Örn: İNCELE"
                                value={formData.cta}
                                onChange={e => setFormData({ ...formData, cta: e.target.value })}
                            />
                        </div>

                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Yönlendirme (Link)</label>
                            <input
                                type="text"
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-[#E2FF3B] focus:outline-none transition-colors placeholder:text-gray-700"
                                placeholder="Örn: shop"
                                value={formData.action}
                                onChange={e => setFormData({ ...formData, action: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="h-px bg-white/10 my-4" />

                    {/* MEDIA UPLOAD SECTION */}
                    <div className="space-y-6">

                        {/* 1. COVER IMAGE (Always Visible - Required for Poster) */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 flex justify-between">
                                <span>{formData.type === 'video' ? 'Kapak Görseli (Poster)' : 'Ana Görsel'}</span>
                                {formData.type === 'video' && <span className="text-xs text-yellow-500 font-normal normal-case">*Video yüklenmeden önce görünür</span>}
                            </label>

                            <div className="flex gap-4 items-start">
                                {/* Preview */}
                                <div className="w-32 h-20 bg-black/50 rounded-lg border border-white/10 flex-shrink-0 overflow-hidden relative group">
                                    {formData.image ? (
                                        <>
                                            <img src={formData.image} className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, image: '' })}
                                                className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="w-5 h-5 text-red-500" />
                                            </button>
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                                            <ImageIcon className="w-6 h-6" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 space-y-3">
                                    <div className="flex gap-2">
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => handleFileUpload(e, 'image')}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploading}
                                            className="whitespace-nowrap"
                                        >
                                            <Upload className="w-4 h-4 mr-2" />
                                            {isUploading ? '...' : 'Görsel Yükle'}
                                        </Button>
                                        <input
                                            type="text"
                                            className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 text-sm text-white focus:border-[#E2FF3B] focus:outline-none transition-colors placeholder:text-gray-700"
                                            placeholder="veya Görsel Bağlantısı (URL)"
                                            value={formData.image}
                                            onChange={e => setFormData({ ...formData, image: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. VIDEO SOURCE (Only if Type is Video) */}
                        {formData.type === 'video' && (
                            <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Video Kaynağı</label>

                                <div className="flex gap-4 items-start">
                                    {/* Preview */}
                                    <div className="w-32 h-20 bg-black/50 rounded-lg border border-white/10 flex-shrink-0 overflow-hidden relative group">
                                        {formData.videoUrl ? (
                                            <>
                                                <video src={formData.videoUrl} className="w-full h-full object-cover opacity-60" />
                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                    <VideoIcon className="w-6 h-6 text-white" />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, videoUrl: '' })}
                                                    className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer pointer-events-auto"
                                                >
                                                    <Trash2 className="w-5 h-5 text-red-500" />
                                                </button>
                                            </>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-600">
                                                <VideoIcon className="w-6 h-6" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 space-y-3">
                                        <div className="flex gap-2">
                                            <input
                                                type="file"
                                                ref={videoInputRef}
                                                className="hidden"
                                                accept="video/*"
                                                onChange={(e) => handleFileUpload(e, 'videoUrl')}
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => videoInputRef.current?.click()}
                                                disabled={isUploading}
                                                className="whitespace-nowrap"
                                            >
                                                <Upload className="w-4 h-4 mr-2" />
                                                {isUploading ? '...' : 'Video Yükle'}
                                            </Button>
                                            <input
                                                type="text"
                                                className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 text-sm text-white focus:border-[#E2FF3B] focus:outline-none transition-colors placeholder:text-gray-700"
                                                placeholder="veya Video Bağlantısı (URL)"
                                                value={formData.videoUrl}
                                                onChange={e => setFormData({ ...formData, videoUrl: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>

                    <div className="pt-6 flex justify-end gap-3 border-t border-white/10 mt-6">
                        <Button type="button" variant="outline" onClick={onClose} className="hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50">İptal</Button>
                        <Button type="submit" disabled={isUploading} className="bg-[#E2FF3B] text-black hover:bg-[#ccee00] px-8">
                            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Değişiklikleri Kaydet'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
