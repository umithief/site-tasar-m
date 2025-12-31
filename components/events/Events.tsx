import React, { useState, useEffect } from 'react';
import { MeetupEvent, User } from '../../types';
import { EventCard } from './EventCard';
import { CreateEventModal } from './CreateEventModal';
import { EventDetailModal } from './EventDetailModal';
import { eventService } from '../../services/eventService';
import { useLanguage } from '../../contexts/LanguageProvider';
import { Plus, Calendar, MapPin } from 'lucide-react';

interface EventsProps {
    onNavigate: (view: any) => void;
    user: User | null;
    onOpenAuth: () => void;
}

export const Events: React.FC<EventsProps> = ({ onNavigate, user, onOpenAuth }) => {
    const { t } = useLanguage();
    const [events, setEvents] = useState<MeetupEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<MeetupEvent | null>(null);

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        setLoading(true);
        try {
            const data = await eventService.getEvents();
            setEvents(data);
        } catch (error) {
            console.error('Failed to load events:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateEvent = async (eventData: Omit<MeetupEvent, '_id'>) => {
        if (!user) return;
        try {
            const newEvent = await eventService.addEvent(eventData);
            setEvents(prev => [newEvent, ...prev]);
        } catch (error) {
            console.error('Failed to create event:', error);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
                <div className="text-center md:text-left">
                    <h2 className="text-3xl font-bold font-display text-white mb-2">Etkinlikler & Sürüşler</h2>
                    <p className="text-gray-400">Şehrindeki diğer sürücülerle tanış ve sürüşlere katıl.</p>
                </div>

                <button
                    onClick={() => user ? setIsCreateModalOpen(true) : onOpenAuth()}
                    className="flex items-center gap-2 bg-moto-accent text-black px-6 py-3 rounded-xl font-bold hover:bg-white transition-colors shadow-lg shadow-moto-accent/20"
                >
                    <Plus size={20} />
                    Sürüş Planla
                </button>
            </div>

            {/* Quick Stats or Featured (Optional) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-[#1A1A1C] p-4 rounded-xl border border-white/5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center">
                        <Calendar size={20} />
                    </div>
                    <div>
                        <div className="text-lg font-bold text-white">{events.length}</div>
                        <div className="text-xs text-gray-500">Aktif Etkinlik</div>
                    </div>
                </div>
                <div className="bg-[#1A1A1C] p-4 rounded-xl border border-white/5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
                        <MapPin size={20} />
                    </div>
                    <div>
                        <div className="text-lg font-bold text-white">İstanbul</div>
                        <div className="text-xs text-gray-500">Bölgeniz</div>
                    </div>
                </div>
            </div>

            {/* Event Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-[#121214] h-80 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : events.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-gray-400">Henüz planlanmış bir etkinlik yok.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map(event => (
                        <EventCard
                            key={event._id}
                            event={event}
                            onJoin={(e) => console.log('Join event:', e)}
                        />
                    ))}
                </div>
            )}

            <CreateEventModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateEvent}
                user={user}
            />
        </div>
    );
};
