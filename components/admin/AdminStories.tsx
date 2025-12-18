import React, { useState } from 'react';
import { Story } from '../../types';
import { Plus, Edit2, Trash2, X, Save, Eye, Video, Clock } from 'lucide-react';
import { Button } from '../ui/Button';

interface AdminStoriesProps {
    stories: Story[];
    handleAddNew: () => void;
    handleEdit: (story: Story) => void; // Usually passed from parent handler which opens modal, but here we might need to handle saving internally or via parent
    handleDelete: (id: any) => void;
    handleSave: (story: Story) => Promise<void>; // Add save handler prop
}

// Inline Modal for Add/Edit
const StoryModal: React.FC<{ story: Partial<Story>, onClose: () => void, onSave: (s: Partial<Story>) => void }> = ({ story, onClose, onSave }) => {
    const [formData, setFormData] = useState(story);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#111] border border-white/10 p-6 rounded-2xl w-full max-w-lg shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">
                        {formData._id ? 'Hikayeyi Düzenle' : 'Yeni Hikaye'}
                    </h3>
                    <button onClick={onClose}><X className="text-gray-400 hover:text-white" /></button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs uppercase text-gray-500 mb-1">Başlık</label>
                        <input name="title" value={formData.title || ''} onChange={handleChange} className="w-full bg-[#222] border border-white/10 rounded p-2 text-white focus:border-orange-500 outline-none" placeholder="Örn: Track Day 2024" />
                    </div>
                    <div>
                        <label className="block text-xs uppercase text-gray-500 mb-1">Kategori</label>
                        <select name="category" value={formData.category || 'LIFESTYLE'} onChange={handleChange} className="w-full bg-[#222] border border-white/10 rounded p-2 text-white focus:border-orange-500 outline-none">
                            <option value="LIFESTYLE">Lifestyle</option>
                            <option value="EVENT">Event</option>
                            <option value="GEAR">Gear</option>
                            <option value="REVIEWS">Reviews</option>
                            <option value="COMMUNITY">Community</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs uppercase text-gray-500 mb-1">Duration</label>
                            <input name="duration" value={formData.duration || '0:30'} onChange={handleChange} className="w-full bg-[#222] border border-white/10 rounded p-2 text-white focus:border-orange-500 outline-none" placeholder="0:45" />
                        </div>
                        <div>
                            <label className="block text-xs uppercase text-gray-500 mb-1">Color Class</label>
                            <input name="color" value={formData.color || 'border-orange-500'} onChange={handleChange} className="w-full bg-[#222] border border-white/10 rounded p-2 text-white focus:border-orange-500 outline-none" placeholder="border-orange-500" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs uppercase text-gray-500 mb-1">Cover Image URL</label>
                        <input name="coverImg" value={formData.coverImg || ''} onChange={handleChange} className="w-full bg-[#222] border border-white/10 rounded p-2 text-white focus:border-orange-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs uppercase text-gray-500 mb-1">Video URL</label>
                        <input name="videoUrl" value={formData.videoUrl || ''} onChange={handleChange} className="w-full bg-[#222] border border-white/10 rounded p-2 text-white focus:border-orange-500 outline-none" />
                    </div>

                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <Button onClick={onClose} variant="secondary">İptal</Button>
                    <Button onClick={() => onSave(formData)} className="bg-orange-600 text-white">Kaydet</Button>
                </div>
            </div>
        </div>
    );
};

export const AdminStories: React.FC<AdminStoriesProps> = ({ stories, handleDelete, handleSave }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStory, setEditingStory] = useState<Partial<Story> | null>(null);

    const openNew = () => {
        setEditingStory({});
        setIsModalOpen(true);
    };

    const openEdit = (story: Story) => {
        setEditingStory(story);
        setIsModalOpen(true);
    };

    const saveStory = async (data: Partial<Story>) => {
        // Map data to match Story interface fully if needed
        const storyToSave = {
            ...data,
            label: data.title, // Sync label
            image: data.coverImg // Sync image
        } as Story;

        await handleSave(storyToSave);
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-white">Hikayeler (Velocity Reel)</h2>
                    <p className="text-gray-400 text-sm">Vitrin hikayelerini ve videolarını yönetin.</p>
                </div>
                <Button onClick={openNew} className="bg-[#F2A619] text-black shadow-lg hover:bg-[#d99516]">
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
                                <button onClick={() => openEdit(story)} className="p-2 hover:bg-blue-500/20 text-gray-400 hover:text-blue-500 rounded transition-colors"><Edit2 className="w-4 h-4" /></button>
                                <button onClick={() => handleDelete(story._id)} className="p-2 hover:bg-red-500/20 text-gray-400 hover:text-red-500 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && editingStory && (
                <StoryModal story={editingStory} onClose={() => setIsModalOpen(false)} onSave={saveStory} />
            )}
        </div>
    );
};
