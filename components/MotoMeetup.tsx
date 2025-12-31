import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Calendar, Clock, Users, Navigation, Plus, Filter, Coffee, Moon, Flag, Mountain, Check, X, ChevronDown, ChevronUp, MessageSquare, Send, Search, ArrowRight, User } from 'lucide-react';
import { MeetupEvent, User as UserType, ViewState, MeetupMessage } from '../types';
import { Button } from './ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { UserAvatar } from './ui/UserAvatar';
import { eventService } from '../services/eventService';
import { createPortal } from 'react-dom';
import { notify } from '../services/notificationService';
import { useSocket } from '../context/SocketContext';

declare const L: any;

interface MotoMeetupProps {
    user: UserType | null;
    onOpenAuth?: () => void;
    onNavigate?: (view: ViewState, data?: any) => void;
    isEmbedded?: boolean;
}

export const MotoMeetup: React.FC<MotoMeetupProps> = ({ user, onOpenAuth, onNavigate, isEmbedded = false }) => {
    const { socket, isConnected } = useSocket();
    const [events, setEvents] = useState<MeetupEvent[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<MeetupEvent[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<MeetupEvent | null>(null);
    const [filter, setFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [userJoined, setUserJoined] = useState<string[]>([]);
    const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

    // Community Chat State
    const [publicMessages, setPublicMessages] = useState<any[]>([]);
    const [publicChatInput, setPublicChatInput] = useState('');
    const publicChatEndRef = useRef<HTMLDivElement>(null);

    // Chat State for Specific Event
    const [chatInput, setChatInput] = useState('');

    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);

    useEffect(() => {
        eventService.getEvents().then(data => {
            setEvents(data || []);
            setFilteredEvents(data || []);
            // Check if user is joined in any event
            if (user) {
                const joined = data.filter(e => e.attendeeList?.some(a => a.userId === user._id)).map(e => e._id);
                setUserJoined(joined);
            }
        }).catch(err => {
            console.error(err);
            setEvents([]);
        });
    }, [user?._id]);

    useEffect(() => {
        let res = events;
        if (filter !== 'all') res = res.filter(e => e.type === filter);
        if (searchQuery) res = res.filter(e => e.title.toLowerCase().includes(searchQuery.toLowerCase()) || e.location.toLowerCase().includes(searchQuery.toLowerCase()));
        setFilteredEvents(res);
    }, [events, filter, searchQuery]);

    // Public Chat Socket Logic
    useEffect(() => {
        if (!socket || !isConnected) return;
        socket.emit('join_public_room', { room: 'meetup-general' });

        const handleMsg = (data: any) => {
            setPublicMessages(prev => [...prev, data]);
            if (publicChatEndRef.current) publicChatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        };

        socket.on('receive_public_message', handleMsg);
        return () => {
            socket.emit('leave_public_room', { room: 'meetup-general' });
            socket.off('receive_public_message', handleMsg);
        };
    }, [socket, isConnected]);

    const sendPublicMessage = () => {
        if (!publicChatInput.trim() || !user || !socket) return;
        socket.emit('send_public_message', { room: 'meetup-general', content: publicChatInput });
        setPublicChatInput('');
    };

    // Map Init
    useEffect(() => {
        if (viewMode === 'map' && mapContainerRef.current && !mapRef.current && typeof L !== 'undefined') {
            const map = L.map(mapContainerRef.current, { zoomControl: false, attributionControl: false }).setView([39.9, 32.8], 6);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
            if (mapContainerRef.current) {
                const tiles = mapContainerRef.current.querySelectorAll('.leaflet-tile-pane');
                tiles.forEach((t: any) => t.style.filter = 'grayscale(100%) invert(100%) brightness(0.7) contrast(1.2)');
            }
            mapRef.current = map;
        }
    }, [viewMode]);

    // Markers
    useEffect(() => {
        if (viewMode === 'map' && mapRef.current) {
            markersRef.current.forEach(m => m.remove());
            markersRef.current = [];
            filteredEvents.forEach((event, index) => {
                let color = '#F2A619';
                if (event.type === 'coffee') color = '#f59e0b';
                if (event.type === 'offroad') color = '#84cc16';
                const iconHtml = `
                    <div class="relative flex items-center justify-center w-8 h-8 group cursor-pointer transition-transform hover:scale-125">
                        <div class="absolute w-full h-full rounded-full animate-ping opacity-50" style="background-color: ${color}"></div>
                        <div class="relative w-4 h-4 rounded-full border-2 border-white shadow-lg" style="background-color: ${color}"></div>
                    </div>
                `;
                const icon = L.divIcon({ className: 'custom-pin', html: iconHtml, iconSize: [32, 32] });
                const marker = L.marker([event.coordinates.lat, event.coordinates.lng], { icon })
                    .addTo(mapRef.current)
                    .on('click', () => {
                        setSelectedEvent(event);
                        mapRef.current.flyTo([event.coordinates.lat, event.coordinates.lng], 14, { duration: 1 });
                    });
                markersRef.current.push(marker);
            });
        }
    }, [filteredEvents, viewMode]);

    // Event Chat Socket Logic
    useEffect(() => {
        if (!selectedEvent || !socket || !isConnected) return;

        socket.emit('join_event_room', { eventId: selectedEvent._id });

        const handleEventMsg = (data: any) => {
            setEvents(prev => prev.map(e => {
                if (e._id === selectedEvent._id) {
                    return { ...e, messages: [...(e.messages || []), { id: Date.now().toString(), userId: data.userId, userName: data.userName, text: data.text, time: data.time }] };
                }
                return e;
            }));
            setSelectedEvent(prev => {
                if (prev && prev._id === selectedEvent._id) {
                    return { ...prev, messages: [...(prev.messages || []), { id: Date.now().toString(), userId: data.userId, userName: data.userName, text: data.text, time: data.time }] };
                }
                return prev;
            });
        };

        socket.on('receive_event_message', handleEventMsg);

        return () => {
            socket.emit('leave_event_room', { eventId: selectedEvent._id });
            socket.off('receive_event_message', handleEventMsg);
        };
    }, [selectedEvent?._id, socket, isConnected]);


    // Handlers
    const handleJoin = async (e: React.MouseEvent, eventId: string) => {
        e.stopPropagation();
        if (!user) { if (onOpenAuth) onOpenAuth(); return; }

        try {
            if (userJoined.includes(eventId)) {
                await eventService.leaveEvent(eventId, user._id);
                setUserJoined(prev => prev.filter(id => id !== eventId));
                setEvents(prev => prev.map(ev => ev._id === eventId ? { ...ev, attendees: ev.attendees - 1, attendeeList: ev.attendeeList?.filter(a => a.userId !== user._id) } : ev));
                if (selectedEvent?._id === eventId) setSelectedEvent(prev => prev ? { ...prev, attendees: prev.attendees - 1, attendeeList: prev.attendeeList?.filter(a => a.userId !== user._id) } : null);
                notify.success("Katılım iptal edildi.");
            } else {
                await eventService.joinEvent(eventId, { userId: user._id, name: user.name, avatar: user.avatar || '' });
                setUserJoined(prev => [...prev, eventId]);
                setEvents(prev => prev.map(ev => ev._id === eventId ? { ...ev, attendees: ev.attendees + 1, attendeeList: [...(ev.attendeeList || []), { userId: user._id, name: user.name, avatar: user.avatar || '' }] } : ev));
                if (selectedEvent?._id === eventId) setSelectedEvent(prev => prev ? { ...prev, attendeeList: [...(prev.attendeeList || []), { userId: user._id, name: user.name, avatar: user.avatar || '' }], attendees: prev.attendees + 1 } : null);
                notify.success("Etkinliğe katıldın!");
            }
        } catch (error) {
            console.error(error);
            notify.error("İşlem başarısız oldu.");
        }
    };

    const handleSendMessage = () => {
        if (!chatInput.trim() || !selectedEvent || !user || !socket) return;

        // Emit socket event instead of local update only
        socket.emit('send_event_message', { eventId: selectedEvent._id, content: chatInput });
        setChatInput('');
    };

    return (
        <div className={`bg-[#09090b] min-h-screen text-white font-sans ${isEmbedded ? '' : 'pt-24'}`}>
            <div className={`grid grid-cols-1 ${isEmbedded ? 'lg:grid-cols-[320px_1fr] h-full gap-6' : 'lg:grid-cols-[360px_1fr] max-w-[1600px] mx-auto px-4 lg:px-8 gap-8'} items-start`}>

                {/* SIDEBAR */}
                <div className={`flex flex-col gap-6 ${isEmbedded ? 'h-full overflow-hidden' : 'sticky top-28'}`}>
                    <div className="bg-[#111] border border-white/5 rounded-[2rem] p-6 shadow-2xl backdrop-blur-xl flex flex-col h-full max-h-[calc(100vh-160px)]">
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-6 shrink-0">
                            <div className="w-10 h-10 rounded-full bg-moto-accent/10 flex items-center justify-center text-moto-accent"><Calendar className="w-5 h-5" /></div>
                            <h2 className="text-2xl font-black font-display italic tracking-tighter">MOTO<span className="text-moto-accent">MEETUP</span></h2>
                        </div>

                        {/* Event List Section */}
                        <div className="flex flex-col gap-4 flex-1 min-h-0">
                            {/* Search & Filters */}
                            <div className="shrink-0 space-y-4">
                                <div className="relative group/search">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within/search:text-moto-accent transition-colors" />
                                    <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Etkinlik ara..." className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs focus:outline-none focus:border-moto-accent/50 transition-all font-bold" />
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {[{ id: 'all', label: 'Tümü' }, { id: 'night-ride', label: 'Gece' }, { id: 'coffee', label: 'Kahve' }, { id: 'track-day', label: 'Pist' }].map(f => (
                                        <button key={f.id} onClick={() => setFilter(f.id)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all border ${filter === f.id ? 'bg-moto-accent text-black border-moto-accent' : 'bg-white/5 text-gray-400 border-transparent hover:border-white/20'}`}>{f.label}</button>
                                    ))}
                                </div>
                            </div>

                            {/* List */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                                {filteredEvents.map(event => (
                                    <div key={event._id} onClick={() => { setSelectedEvent(event); if (mapRef.current && viewMode === 'map') mapRef.current.flyTo([event.coordinates.lat, event.coordinates.lng], 14, { duration: 1 }); }}
                                        className={`p-3 rounded-xl border transition-all cursor-pointer group ${selectedEvent?._id === event._id ? 'bg-moto-accent/10 border-moto-accent/50' : 'bg-white/5 border-transparent hover:border-white/10'}`}>
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="text-[10px] font-black text-moto-accent uppercase">{event.date} • {event.time}</div>
                                            <div className={`w-2 h-2 rounded-full ${event.type === 'night-ride' ? 'bg-purple-500' : 'bg-green-500'}`} />
                                        </div>
                                        <h3 className="font-bold text-sm text-white mb-1 leading-tight group-hover:text-moto-accent transition-colors">{event.title}</h3>
                                        <div className="flex items-center gap-1 text-[10px] text-gray-500 rounded-lg bg-black/20 p-1.5 w-fit">
                                            <MapPin className="w-3 h-3" /> {event.location}
                                        </div>
                                    </div>
                                ))}
                                <Button onClick={() => user ? notify.info("Etkinlik oluşturma yakında!") : onOpenAuth && onOpenAuth()} className="w-full py-3 bg-white/10 text-white font-bold text-xs rounded-xl hover:bg-white/20 transition-colors border-2 border-dashed border-white/10">
                                    <Plus className="w-4 h-4 mr-2" /> ETKİNLİK OLUŞTUR
                                </Button>
                            </div>
                        </div>

                        {/* LIVE COMMUNITY CHAT */}
                        <div className="mt-4 pt-4 border-t border-white/10 shrink-0 h-[220px] flex flex-col">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                <h3 className="text-xs font-black italic text-gray-400 uppercase tracking-wider">CANLI SOHBET</h3>
                            </div>

                            <div className="flex-1 bg-black/40 rounded-xl border border-white/5 p-3 flex flex-col overflow-hidden">
                                <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar mb-2">
                                    {publicMessages.length === 0 && (
                                        <div className="text-[10px] text-gray-600 text-center py-4">Sohbet'e katıl!</div>
                                    )}
                                    {publicMessages.map((msg, idx) => (
                                        <div key={idx} className="text-[10px] animate-in slide-in-from-bottom-2 fade-in duration-300">
                                            <span className={`font-bold mr-1 ${msg.userId === user?._id ? 'text-moto-accent' : 'text-gray-300'}`}>{msg.userName}:</span>
                                            <span className="text-gray-400">{msg.text}</span>
                                        </div>
                                    ))}
                                    <div ref={publicChatEndRef}></div>
                                </div>
                                <div className="flex gap-2 bg-[#111] rounded-lg p-1 border border-white/10">
                                    <input
                                        type="text"
                                        value={publicChatInput}
                                        onChange={e => setPublicChatInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && sendPublicMessage()}
                                        placeholder={user ? "Mesaj yaz..." : "Giriş yap"}
                                        disabled={!user}
                                        className="flex-1 bg-transparent text-[10px] text-white px-2 outline-none placeholder-gray-600"
                                    />
                                    <button onClick={sendPublicMessage} disabled={!user} className="p-1.5 bg-white/5 hover:bg-moto-accent hover:text-black rounded text-gray-400 transition-colors disabled:opacity-50">
                                        <Send className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* MAIN CONTENT */}
                <div className="flex flex-col h-full bg-[#111] rounded-[2.5rem] border border-white/5 relative overflow-hidden shadow-2xl group/map">
                    <div ref={mapContainerRef} className="w-full h-full z-0" />

                    {/* Event Detail Overlay */}
                    <AnimatePresence>
                        {selectedEvent && (
                            <motion.div
                                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25 }}
                                className="absolute inset-y-0 right-0 w-full md:w-[450px] bg-[#09090b]/95 backdrop-blur-xl border-l border-white/10 z-[500] flex flex-col shadow-2xl"
                            >
                                <div className="h-56 relative shrink-0">
                                    <img src={selectedEvent.image} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] to-transparent" />
                                    <button onClick={() => setSelectedEvent(null)} className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-red-500 transition-colors"><X className="w-5 h-5" /></button>
                                    <div className="absolute bottom-4 left-6">
                                        <h2 className="text-2xl font-black italic text-white leading-none mb-1">{selectedEvent.title}</h2>
                                        <div className="flex items-center gap-2 text-xs font-bold text-moto-accent">
                                            <span>{selectedEvent.type.toUpperCase().replace('-', ' ')}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                            <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">Tarih</div>
                                            <div className="text-sm font-bold text-white flex items-center gap-2"><Calendar className="w-4 h-4 text-moto-accent" /> {selectedEvent.date}</div>
                                        </div>
                                        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                            <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">Saat</div>
                                            <div className="text-sm font-bold text-white flex items-center gap-2"><Clock className="w-4 h-4 text-moto-accent" /> {selectedEvent.time}</div>
                                        </div>
                                    </div>

                                    <p className="text-sm text-gray-400 leading-relaxed">{selectedEvent.description}</p>

                                    {/* Attendees */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Katılımcılar ({selectedEvent.attendees})</h4>
                                            {userJoined.includes(selectedEvent._id) && <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded">KATILIYORSUN</span>}
                                        </div>
                                        <div className="flex -space-x-2 overflow-hidden py-1">
                                            {selectedEvent.attendeeList?.map((att, i) => (
                                                <UserAvatar key={i} name={att.name} size={32} className="border-2 border-[#09090b]" />
                                            ))}
                                            {(selectedEvent.attendeeList?.length || 0) > 5 && (
                                                <div className="w-8 h-8 rounded-full bg-gray-800 border-2 border-[#09090b] flex items-center justify-center text-[10px] font-bold text-white">
                                                    +{(selectedEvent.attendeeList?.length || 0) - 5}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Chat Preview */}
                                    <div className="bg-black/40 rounded-xl border border-white/5 p-4 flex flex-col h-64">
                                        <div className="flex items-center gap-2 mb-3 text-xs font-bold text-gray-400 uppercase"><MessageSquare className="w-3 h-3" /> Etkinlik Sohbeti</div>
                                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar mb-3">
                                            {selectedEvent.messages?.map((msg, idx) => (
                                                <div key={idx} className={`flex flex-col ${user && msg.userId === user._id ? 'items-end' : 'items-start'}`}>
                                                    <div className={`p-2 rounded-lg text-[10px] max-w-[85%] ${user && msg.userId === user._id ? 'bg-moto-accent text-black' : 'bg-white/10 text-gray-300'}`}>
                                                        <span className="font-bold opacity-70 block mb-0.5">{msg.userName}</span>
                                                        {msg.text}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Mesaj..." className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-moto-accent outline-none" />
                                            <button onClick={handleSendMessage} className="p-2 bg-moto-accent rounded-lg text-black hover:bg-white transition-colors"><Send className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 border-t border-white/10 bg-black/20">
                                    <Button onClick={(e) => handleJoin(e, selectedEvent._id)} className={`w-full py-4 font-bold rounded-xl ${userJoined.includes(selectedEvent._id) ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-moto-accent text-black'}`}>
                                        {userJoined.includes(selectedEvent._id) ? 'KATILIMDAN AYRIL' : 'ETKİNLİĞE KATIL'}
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </div>
            </div>
        </div>
    );
};
