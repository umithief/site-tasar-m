import React from 'react';
import { MeetupEvent, User } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, MapPin, Users, ArrowRight, Share2 } from 'lucide-react';

interface EventDetailModalProps {
    event: MeetupEvent | null;
    isOpen: boolean;
    onClose: () => void;
    onJoin: (event: MeetupEvent) => void;
    user: User | null;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({ event, isOpen, onClose, onJoin, user }) => {
    if (!isOpen || !event) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-[#121214] w-full max-w-3xl rounded-2xl border border-white/10 overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header Image */}
                    <div className="relative h-48 md:h-64 shrink-0">
                        <img
                            src={event.image}
                            alt={event.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#121214] to-transparent opacity-90" />

                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="absolute bottom-6 left-6 right-6">
                            <span className="px-3 py-1 bg-moto-accent text-black text-xs font-bold rounded-full uppercase tracking-wider mb-3 inline-block">
                                {event.type?.replace('-', ' ')}
                            </span>
                            <h2 className="text-2xl md:text-4xl font-bold text-white leading-tight">
                                {event.title}
                            </h2>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8">
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-white">Etkinlik Detayları</h3>

                                <div className="space-y-4">
                                    <div className="flex items-start gap-4 p-4 bg-[#1A1A1C] rounded-xl border border-white/5">
                                        <Calendar className="text-moto-accent w-6 h-6 shrink-0" />
                                        <div>
                                            <span className="block text-gray-400 text-xs uppercase font-bold">Tarih</span>
                                            <span className="text-white font-medium">{new Date(event.date).toLocaleDateString('tr-TR')}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 p-4 bg-[#1A1A1C] rounded-xl border border-white/5">
                                        <Clock className="text-moto-accent w-6 h-6 shrink-0" />
                                        <div>
                                            <span className="block text-gray-400 text-xs uppercase font-bold">Saat</span>
                                            <span className="text-white font-medium">{event.time}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 p-4 bg-[#1A1A1C] rounded-xl border border-white/5">
                                        <MapPin className="text-moto-accent w-6 h-6 shrink-0" />
                                        <div>
                                            <span className="block text-gray-400 text-xs uppercase font-bold">Konum</span>
                                            <span className="text-white font-medium">{event.location}</span>
                                            <button className="text-xs text-moto-accent hover:underline mt-1 block">Haritada Gör</button>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-white/10">
                                    <h4 className="text-sm font-bold text-white mb-2">Organizatör</h4>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                                            {event.organizer?.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-gray-300">{event.organizer}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-4">Açıklama</h3>
                                    <p className="text-gray-400 leading-relaxed whitespace-pre-wrap">
                                        {event.description}
                                    </p>
                                </div>

                                <div className="p-6 bg-[#1A1A1C] rounded-xl border border-white/5 text-center">
                                    <Users className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                                    <div className="text-3xl font-bold text-white mb-1">{event.attendees}</div>
                                    <div className="text-sm text-gray-500 mb-4">Sürücü Katılıyor</div>

                                    <div className="flex gap-2 justify-center mb-4">
                                        {[...Array(Math.min(5, event.attendees))].map((_, i) => (
                                            <div key={i} className="w-8 h-8 rounded-full bg-white/10 border-2 border-[#1A1A1C] -ml-2 first:ml-0" />
                                        ))}
                                        {event.attendees > 5 && (
                                            <div className="w-8 h-8 rounded-full bg-[#333] border-2 border-[#1A1A1C] -ml-2 flex items-center justify-center text-[10px] text-white font-bold">
                                                +{event.attendees - 5}
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => onJoin(event)}
                                        className="w-full py-3 bg-moto-accent text-black font-bold rounded-xl hover:bg-white transition-colors flex items-center justify-center gap-2"
                                    >
                                        Katıl
                                        <ArrowRight size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
