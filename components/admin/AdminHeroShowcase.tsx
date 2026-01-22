import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Save, X, Image as ImageIcon, ArrowRight, Video } from 'lucide-react';
import { heroService } from '../../services/heroService';
import { Slide } from '../../types';
// @ts-ignore
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
// @ts-ignore
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import { storageService } from '../../services/storageService';

registerPlugin(FilePondPluginImagePreview);

export const AdminHeroShowcase = () => {
    const [slides, setSlides] = useState<Slide[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [files, setFiles] = useState<any[]>([]);
    const [uploadType, setUploadType] = useState<'image' | 'video'>('image');

    // Form State
    const [currentSlide, setCurrentSlide] = useState<Partial<Slide>>({
        title: '',
        subtitle: '',
        image: '',
        vibeText: '',
        accent: '#E2FF3B',
        buttonText: 'İNCELE',
        isActive: true,
        order: 0,
        mediaType: 'image',
        videoUrl: ''
    });

    useEffect(() => {
        loadSlides();
    }, []);

    const loadSlides = async () => {
        try {
            const data = await heroService.getSlides();
            setSlides(data);
        } catch (error) {
            console.error('Slides failed to load', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (currentSlide._id) {
                await heroService.updateSlide(currentSlide._id, currentSlide);
            } else {
                await heroService.addSlide(currentSlide as any);
            }
            setIsEditing(false);
            setCurrentSlide({});
            setFiles([]);
            loadSlides();
        } catch (error) {
            alert('İşlem başarısız');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu slide\'ı silmek istediğinize emin misiniz?')) return;
        try {
            await heroService.deleteSlide(id);
            loadSlides();
        } catch (error) {
            alert('Silinemedi');
        }
    };

    const handleEdit = (slide: Slide) => {
        setCurrentSlide(slide);
        setFiles([]); // Clear files on edit open, or populate if possible (FilePond makes this tricky with URLs)
        setUploadType(slide.mediaType || 'image');
        setIsEditing(true);
    };

    const handleAddNew = () => {
        setCurrentSlide({
            title: '',
            subtitle: '',
            image: '',
            vibeText: 'VIBE',
            accent: '#E2FF3B',
            buttonText: 'İNCELE',
            isActive: true,
            order: slides.length + 1,
            mediaType: 'image',
            videoUrl: ''
        });
        setFiles([]);
        setIsEditing(true);
    };

    return (
        <div className="space-y-6 text-white p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
                        Hero Showcase Yönetimi
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Ana sayfa açılış slider'ını yönetin</p>
                </div>
                <button
                    onClick={handleAddNew}
                    className="flex items-center gap-2 px-4 py-2 bg-[#E2FF3B] text-black font-bold rounded-lg hover:bg-white transition-colors"
                >
                    <Plus size={18} />
                    <span>Yeni Slide Ekle</span>
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {slides.map((slide) => (
                    <motion.div
                        key={slide._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col md:flex-row gap-6 items-center group"
                    >
                        {/* Preview Image */}
                        <div className="w-full md:w-48 aspect-video rounded-lg overflow-hidden bg-black relative">
                            <img src={slide.image} alt={slide.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <h3
                                    className="text-2xl font-black uppercase tracking-tighter text-white/20 stroke-text"
                                    style={{ WebkitTextStroke: `1px ${slide.accent}` }}
                                >
                                    {slide.vibeText}
                                </h3>
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 space-y-2 text-center md:text-left min-w-0">
                            <div className="flex items-center gap-3 justify-center md:justify-start">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: slide.accent }} />
                                <h3 className="text-xl font-bold truncate">{slide.title}</h3>
                                {!slide.isActive && <span className="text-xs bg-red-500/20 text-red-500 px-2 py-0.5 rounded">Pasif</span>}
                            </div>
                            <p className="text-gray-400 text-sm line-clamp-1">{slide.subtitle}</p>
                            <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-mono text-gray-500">
                                <span className="px-2 py-1 bg-white/5 rounded border border-white/5">Order: {slide.order}</span>
                                <span className="px-2 py-1 bg-white/5 rounded border border-white/5 flex items-center gap-1">
                                    BTN: {slide.buttonText} <ArrowRight className="w-3 h-3" />
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleEdit(slide)}
                                className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-blue-400"
                            >
                                <Edit2 size={18} />
                            </button>
                            <button
                                onClick={() => handleDelete(slide._id)}
                                className="p-3 bg-white/5 hover:bg-red-500/20 rounded-xl transition-colors text-red-500"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </motion.div>
                ))}

                {slides.length === 0 && !loading && (
                    <div className="text-center py-20 text-gray-500">
                        Henüz slide eklenmemiş.
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {isEditing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-[#111] z-10">
                                <h3 className="text-xl font-bold">
                                    {currentSlide._id ? 'Slide Düzenle' : 'Yeni Slide'}
                                </h3>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="p-2 hover:bg-white/10 rounded-full"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                {/* Visuals */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Medya</h4>

                                    <div className="flex gap-4 p-2 bg-white/5 rounded-lg w-fit">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setUploadType('image');
                                                setCurrentSlide(prev => ({ ...prev, mediaType: 'image' }));
                                            }}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded transition-colors ${uploadType === 'image' ? 'bg-[#E2FF3B] text-black font-bold' : 'text-gray-400 hover:text-white'}`}
                                        >
                                            <ImageIcon size={16} /> Görsel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setUploadType('video');
                                                setCurrentSlide(prev => ({ ...prev, mediaType: 'video' }));
                                            }}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded transition-colors ${uploadType === 'video' ? 'bg-[#E2FF3B] text-black font-bold' : 'text-gray-400 hover:text-white'}`}
                                        >
                                            <Video size={16} /> Video
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400">Dosya Yükle</label>
                                        <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                                            <FilePond
                                                files={files}
                                                onupdatefiles={setFiles}
                                                allowMultiple={false}
                                                server={{
                                                    process: async (fieldName: any, file: any, metadata: any, load: any, error: any, progress: any, abort: any) => {
                                                        try {
                                                            const url = await storageService.uploadFile(file);
                                                            if (uploadType === 'video') {
                                                                setCurrentSlide(prev => ({ ...prev, videoUrl: url, image: url })); // Use same for image if simple
                                                            } else {
                                                                setCurrentSlide(prev => ({ ...prev, image: url }));
                                                            }
                                                            load(url);
                                                        } catch (err) { error('Upload failed'); }
                                                    }
                                                }}
                                                labelIdle={`Sürükle bırak veya <span class="filepond--label-action">Gözat</span> (${uploadType})`}
                                                credits={false}
                                                className="filepond-dark"
                                            />
                                            {(uploadType === 'image' ? currentSlide.image : currentSlide.videoUrl) && !files.length && (
                                                <div className="mt-2 text-xs text-green-400 flex items-center gap-1">
                                                    <ArrowRight size={12} /> Mevcut dosya korunuyor
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-white/10">
                                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Görsel & Stil</h4>
                                        <div className="space-y-2">
                                            <label className="text-sm text-gray-400">Accent Color (Hex)</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="color"
                                                    value={currentSlide.accent}
                                                    onChange={e => setCurrentSlide({ ...currentSlide, accent: e.target.value })}
                                                    className="h-11 w-11 bg-transparent border-0 cursor-pointer"
                                                />
                                                <input
                                                    type="text"
                                                    value={currentSlide.accent}
                                                    onChange={e => setCurrentSlide({ ...currentSlide, accent: e.target.value })}
                                                    className="flex-1 bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-[#E2FF3B] font-mono"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">İçerik</h4>

                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400">Arka Plan Yazısı (Vibe Text)</label>
                                        <input
                                            type="text"
                                            value={currentSlide.vibeText}
                                            onChange={e => setCurrentSlide({ ...currentSlide, vibeText: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-[#E2FF3B] font-black uppercase tracking-widest"
                                            placeholder="ÖR: DOMINATE"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400">Başlık (Title)</label>
                                        <textarea
                                            value={currentSlide.title}
                                            onChange={e => setCurrentSlide({ ...currentSlide, title: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-[#E2FF3B] font-bold text-lg h-24 resize-none"
                                            placeholder="Şehrin Hakimi Ol"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400">Alt Başlık (Subtitle)</label>
                                        <textarea
                                            value={currentSlide.subtitle}
                                            onChange={e => setCurrentSlide({ ...currentSlide, subtitle: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-[#E2FF3B] h-20 resize-none"
                                            placeholder="Açıklama metni..."
                                        />
                                    </div>
                                </div>

                                {/* CTA */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Aksiyon</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm text-gray-400">Buton Yazısı</label>
                                            <input
                                                type="text"
                                                value={currentSlide.buttonText}
                                                onChange={e => setCurrentSlide({ ...currentSlide, buttonText: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-[#E2FF3B]"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm text-gray-400">Buton Linki</label>
                                            <input
                                                type="text"
                                                value={currentSlide.buttonLink}
                                                onChange={e => setCurrentSlide({ ...currentSlide, buttonLink: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-[#E2FF3B]"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Settings */}
                                <div className="flex gap-6 pt-4 border-t border-white/10">
                                    <div className="flex items-center gap-3">
                                        <label className="text-sm text-gray-400">Aktif</label>
                                        <input
                                            type="checkbox"
                                            checked={currentSlide.isActive}
                                            onChange={e => setCurrentSlide({ ...currentSlide, isActive: e.target.checked })}
                                            className="w-5 h-5 accent-[#E2FF3B]"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <label className="text-sm text-gray-400">Sıralama</label>
                                        <input
                                            type="number"
                                            value={currentSlide.order}
                                            onChange={e => setCurrentSlide({ ...currentSlide, order: Number(e.target.value) })}
                                            className="w-20 bg-white/5 border border-white/10 rounded-lg p-2 focus:outline-none focus:border-[#E2FF3B]"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4 mt-4 border-t border-white/10">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="flex-1 px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors font-medium"
                                    >
                                        İptal
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-3 rounded-lg bg-[#E2FF3B] hover:bg-white transition-colors text-black font-bold flex items-center justify-center gap-2"
                                    >
                                        <Save size={18} />
                                        <span>Kaydet</span>
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
