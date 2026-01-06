import React from 'react';
import { MeetupEvent } from '../../types';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Clock, Users, ArrowRight } from 'lucide-react';

interface EventCardProps {
    event: MeetupEvent;
    onJoin: (event: MeetupEvent) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onJoin }) => {
    return (
        <motion.div
            layoutId={`event-${event._id}`}
            className="group relative bg-[#121214] rounded-xl overflow-hidden border border-white/5 hover:border-moto-accent/30 transition-all"
            whileHover={{ y: -5 }}
        >
            {/* Image */}
            <div className="h-48 overflow-hidden relative">
                <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121214] to-transparent opacity-80" />

                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-medium text-white flex items-center gap-1">
                    <Users size={12} className="text-moto-accent" />
                    {event.attendees} Katılımcı
                </div>
            </div>

            {/* Content */}
            <div className="p-5 relative -mt-10">
                <div className="bg-[#1A1A1C] p-4 rounded-xl border border-white/5 shadow-2xl">
                    <span className="text-xs font-bold text-moto-accent uppercase tracking-wider mb-1 block">
                        {event.type.replace('-', ' ')}
                    </span>
                    <h3 className="text-lg font-bold text-white mb-3 line-clamp-1">
                        {event.title}
                    </h3>

                    <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Calendar size={14} className="text-moto-accent/70" />
                            <span>{new Date(event.date).toLocaleDateString('tr-TR')}</span>
                            <Clock size={14} className="ml-2 text-moto-accent/70" />
                            <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <MapPin size={14} className="text-moto-accent/70" />
                            <span className="line-clamp-1">{event.location}</span>
                        </div>
                    </div>

                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                        {event.description}
                    </p>

                    <button
                        onClick={() => onJoin(event)}
                        className="w-full py-2.5 bg-white/5 hover:bg-[#E2FF3B] hover:text-black rounded-xl text-white text-sm font-bold transition-all flex items-center justify-center gap-2 group/btn active:scale-95"
                    >
                        Katıl
                        <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};
