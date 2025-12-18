import React from 'react';
import { Story } from '../../types';
import { Plus, Edit2, Trash2, Video, Clock } from 'lucide-react';
import { Button } from '../ui/Button';

interface AdminStoriesProps {
    stories: Story[];
    handleAddNew: () => void;
    handleEdit: (story: Story) => void;
    handleDelete: (id: any) => void;
    handleSave: (story: Story) => Promise<void>; // Kept for interface compatibility but unused directly here
}

export const AdminStories: React.FC<AdminStoriesProps> = ({ stories, handleDelete, handleAddNew, handleEdit }) => {
    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-white">Hikayeler (Velocity Reel)</h2>
                    <p className="text-gray-400 text-sm">Vitrin hikayelerini ve videolarını yönetin.</p>
                </div>
                <Button onClick={handleAddNew} className="bg-[#F2A619] text-black shadow-lg hover:bg-[#d99516]">
                    <Plus className="w-4 h-4 mr-2" /> YENİ HİKAYE
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {stories.map(story => (
                    <div key={story._id} className="bg-[#1A1A17] border border-white/5 rounded-2xl overflow-hidden group hover:border-orange-500/50 transition-colors">
                        {/* Preview Area */}
                        <div className="relative aspect-[9/16] bg-black">
                            <img src={story.coverImg || story.image} className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" alt={story.title} />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Video className="w-8 h-8 text-white/50 group-hover:text-orange-500 transition-colors" />
                            </div>
                            <div className="absolute top-2 right-2 bg-black/50 backdrop-blur px-2 py-1 rounded text-[10px] font-mono text-white flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {story.duration}
                            </div>
                            <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black to-transparent">
                                <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest block mb-1">{story.category}</span>
                                <h3 className="text-lg font-bold text-white leading-tight">{story.title || story.label}</h3>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="p-4 border-t border-white/5 flex items-center justify-between bg-[#111]">
                            <span className="text-[10px] text-gray-500 font-mono">{story._id.substring(0, 8)}...</span>
                            <div className="flex gap-2">
                                <button onClick={() => handleEdit(story)} className="p-2 hover:bg-blue-500/20 text-gray-400 hover:text-blue-500 rounded transition-colors"><Edit2 className="w-4 h-4" /></button>
                                <button onClick={() => handleDelete(story._id)} className="p-2 hover:bg-red-500/20 text-gray-400 hover:text-red-500 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
