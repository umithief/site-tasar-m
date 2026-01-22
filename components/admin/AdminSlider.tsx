import React from 'react';
import { Slide } from '../../types';
import { Plus, Edit2, Trash2, Video, Image as ImageIcon, Play, Link, ExternalLink } from 'lucide-react';
import { Button } from '../ui/Button';

interface AdminSliderProps {
    slides: Slide[];
    handleAddNew: () => void;
    handleEdit: (slide: Slide) => void;
    handleDelete: (id: any) => void;
}

export const AdminSlider: React.FC<AdminSliderProps> = ({ slides, handleAddNew, handleEdit, handleDelete }) => {
    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center bg-[#1A1A17] p-4 rounded-xl border border-white/5">
                <div>
                    <h2 className="text-xl font-bold text-white">Ana Sayfa Vitrin (Slider)</h2>
                    <p className="text-sm text-gray-400">Ana sayfadaki büyük kayar görselleri ve videoları yönetin.</p>
                </div>
                <Button onClick={handleAddNew} className="bg-[#E2FF3B] text-black shadow-lg hover:bg-[#d4f030]">
                    <Plus className="w-5 h-5 mr-2" /> YENİ SLIDE EKLE
                </Button>
            </div>

            <div className="space-y-4">
                {slides.map((slide, index) => (
                    <div key={slide._id} className="bg-[#1A1A17] hover:bg-[#202020] border border-white/5 rounded-xl overflow-hidden flex flex-col md:flex-row group transition-all duration-300 shadow-sm hover:shadow-md hover:border-white/10">

                        {/* 1. MEDIA PREVIEW */}
                        <div className="w-full md:w-72 h-48 md:h-auto relative flex-shrink-0 bg-black group-hover:opacity-90 transition-opacity">
                            {/* Background Image / Poster */}
                            {slide.image ? (
                                <img src={slide.image} className="w-full h-full object-cover" />
                            ) : slide.videoUrl ? (
                                <video src={slide.videoUrl} className="w-full h-full object-cover" muted />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-zinc-900 border-r border-white/5">
                                    <ImageIcon className="w-12 h-12 text-zinc-700" />
                                </div>
                            )}

                            {/* Video Overlay Indicator */}
                            {slide.type === 'video' && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
                                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white shadow-xl">
                                        <Play className="w-5 h-5 fill-current ml-1" />
                                    </div>
                                    <span className="absolute bottom-2 right-2 bg-black/80 text-[#E2FF3B] text-[10px] font-bold px-2 py-1 rounded border border-white/10 flex items-center gap-1">
                                        <Video className="w-3 h-3" /> VIDEO
                                    </span>
                                </div>
                            )}

                            {/* Order Badge */}
                            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur text-white text-xs font-mono font-bold w-6 h-6 flex items-center justify-center rounded-md border border-white/10">
                                {index + 1}
                            </div>
                        </div>

                        {/* 2. DETAILS */}
                        <div className="p-6 flex-1 flex flex-col justify-center border-t md:border-t-0 md:border-l border-white/5">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="text-xl font-bold text-white leading-tight mb-1">{slide.title}</h3>
                                    {slide.subtitle && (
                                        <p className="text-sm text-gray-400 font-light">{slide.subtitle}</p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEdit(slide)} className="p-2 bg-white/5 hover:bg-blue-500/10 hover:text-blue-400 rounded-lg text-gray-400 border border-transparent hover:border-blue-500/30 transition-all">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(slide._id)} className="p-2 bg-white/5 hover:bg-red-500/10 hover:text-red-400 rounded-lg text-gray-400 border border-transparent hover:border-red-500/30 transition-all">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="h-px bg-white/5 w-full my-3" />

                            <div className="flex gap-4 items-center flex-wrap">
                                <div className="flex items-center gap-2 text-xs text-gray-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                    <span className="opacity-50 font-bold uppercase tracking-wider text-[10px]">Buton</span>
                                    <span className="text-white font-medium">{slide.cta}</span>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-gray-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                    <Link className="w-3 h-3 text-[#E2FF3B]" />
                                    <span className="opacity-50 font-bold uppercase tracking-wider text-[10px]">Link</span>
                                    <span className="text-white font-medium font-mono">{slide.action}</span>
                                </div>

                                {slide.videoUrl && (
                                    <a href={slide.videoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 hover:underline px-2 transition-colors ml-auto">
                                        <ExternalLink className="w-3 h-3" />
                                        Video Kaynağını Aç
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {slides.length === 0 && (
                    <div className="text-center py-20 bg-[#1A1A17] rounded-xl border border-white/5 border-dashed">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ImageIcon className="w-8 h-8 text-gray-600" />
                        </div>
                        <h3 className="text-white font-bold text-lg mb-2">Henüz Slide Eklenmemiş</h3>
                        <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">Ana sayfanızın vitrin alanında görünecek görsel veya videoları buradan ekleyebilirsiniz.</p>
                        <Button onClick={handleAddNew} variant="outline" className="border-white/20 hover:bg-white/5">
                            İlk Slide'ı Ekle
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
