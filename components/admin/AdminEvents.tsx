
import React from 'react';
import { Edit2, Trash2, Calendar, MapPin, Users, Plus } from 'lucide-react';
import { MeetupEvent } from '../../types';
import { Button } from '../ui/Button';

interface AdminEventsProps {
    events: MeetupEvent[];
    handleAddNew: () => void;
    handleEdit: (event: MeetupEvent) => void;
    handleDelete: (id: string) => void;
}

export const AdminEvents: React.FC<AdminEventsProps> = ({ events, handleAddNew, handleEdit, handleDelete }) => {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white">Etkinlik Yönetimi</h2>
                    <p className="text-gray-400 text-sm">Topluluk etkinliklerini planla ve yönet</p>
                </div>
                <Button onClick={handleAddNew} className="bg-[#F2A619] text-black hover:bg-white transition-all shadow-[0_0_20px_rgba(242,166,25,0.3)]">
                    <Plus className="w-4 h-4 mr-2" />
                    YENİ ETKİNLİK
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {events.map((event) => (
                    <div key={event._id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden group hover:border-[#F2A619]/50 transition-all">
                        <div className="relative h-48">
                            <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                                <button onClick={() => handleEdit(event)} className="p-3 bg-white/10 rounded-full hover:bg-[#F2A619] hover:text-black hover:scale-110 transition-all text-white"><Edit2 className="w-5 h-5" /></button>
                                <button onClick={() => handleDelete(event._id)} className="p-3 bg-white/10 rounded-full hover:bg-red-500 hover:text-white hover:scale-110 transition-all text-white"><Trash2 className="w-5 h-5" /></button>
                            </div>
                            <div className="absolute top-3 right-3 px-3 py-1 bg-black/60 rounded-full text-xs font-bold text-white backdrop-blur-md border border-white/10">
                                {event.type.toUpperCase()}
                            </div>
                        </div>
                        <div className="p-5">
                            <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{event.title}</h3>
                            <p className="text-gray-400 text-xs mb-4 line-clamp-2 h-8">{event.description}</p>

                            <div className="space-y-2">
                                <div className="flex items-center text-sm text-gray-400">
                                    <Calendar className="w-4 h-4 mr-2 text-[#F2A619]" />
                                    {event.date} • {event.time}
                                </div>
                                <div className="flex items-center text-sm text-gray-400">
                                    <MapPin className="w-4 h-4 mr-2 text-[#F2A619]" />
                                    {event.location}
                                </div>
                                <div className="flex items-center text-sm text-gray-400">
                                    <Users className="w-4 h-4 mr-2 text-[#F2A619]" />
                                    {event.attendees} Katılımcı
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Add New Empty State Card */}
                <button onClick={handleAddNew} className="border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center h-[340px] hover:border-[#F2A619] hover:bg-white/5 transition-all group">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Plus className="w-8 h-8 text-gray-400 group-hover:text-[#F2A619]" />
                    </div>
                    <span className="text-gray-400 font-bold group-hover:text-white">Yeni Etkinlik Ekle</span>
                </button>
            </div>
        </div>
    );
};
