import React from 'react';
import { Story } from '../../types';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';

interface AdminStoriesProps {
    stories: Story[];
    handleAddNew: () => void;
    handleEdit: (story: Story) => void;
    handleDelete: (id: any) => void;
}

export const AdminStories: React.FC<AdminStoriesProps> = ({ stories, handleAddNew, handleEdit, handleDelete }) => {
    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="flex justify-end">
                <Button onClick={handleAddNew} className="bg-[#F2A619] text-black shadow-lg">
                    <Plus className="w-4 h-4 mr-2" /> YENİ HİKAYE
                </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {stories.map(story => (
                    <div key={story.id} className="flex flex-col items-center group relative">
                        <div className={`w-24 h-24 rounded-full p-[2px] bg-gradient-to-tr ${story.color.includes('orange') ? 'from-orange-500 to-yellow-500' : 'from-gray-500 to-gray-300'} mb-3 relative`}>
                            <div className="w-full h-full rounded-full border-2 border-black overflow-hidden relative">
                                <img src={story.image} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button onClick={() => handleEdit(story)} className="p-1.5 bg-white rounded-full text-black hover:scale-110 transition-transform"><Edit2 className="w-3 h-3" /></button>
                                    <button onClick={() => handleDelete(story.id)} className="p-1.5 bg-red-600 rounded-full text-white hover:scale-110 transition-transform"><Trash2 className="w-3 h-3" /></button>
                                </div>
                            </div>
                        </div>
                        <span className="text-sm font-bold text-white text-center">{story.label}</span>
                        <span className="text-[10px] text-gray-500">{story.id}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
