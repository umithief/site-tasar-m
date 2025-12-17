import React from 'react';
import { Slide } from '../../types';
import { Plus, Edit2, Trash2, Video } from 'lucide-react';
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
            <div className="flex justify-end">
                <Button onClick={handleAddNew} className="bg-[#F2A619] text-black shadow-lg">
                    <Plus className="w-4 h-4 mr-2" /> YENİ SLIDE
                </Button>
            </div>
            <div className="space-y-4">
                {slides.map(slide => (
                    <div key={slide._id} className="bg-[#1A1A17] border border-white/5 rounded-2xl overflow-hidden flex flex-col md:flex-row group">
                        <div className="w-full md:w-64 h-40 relative flex-shrink-0 bg-black">
                            {slide.type === 'video' ? (
                                <div className="w-full h-full flex items-center justify-center bg-gray-900">
                                    <Video className="w-8 h-8 text-gray-500" />
                                    <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded">VIDEO</span>
                                </div>
                            ) : (
                                <img src={slide.image} className="w-full h-full object-cover" />
                            )}
                        </div>
                        <div className="p-6 flex-1 flex flex-col justify-center">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold text-white">{slide.title}</h3>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEdit(slide)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-blue-500 transition-colors"><Edit2 className="w-4 h-4" /></button>
                                    <button onClick={() => handleDelete(slide._id)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                            <p className="text-sm text-gray-400 mb-4">{slide.subtitle}</p>
                            <div className="flex gap-3">
                                <span className="text-xs bg-white/10 px-2 py-1 rounded text-white font-mono">CTA: {slide.cta}</span>
                                <span className="text-xs bg-white/10 px-2 py-1 rounded text-white font-mono">Action: {slide.action}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
