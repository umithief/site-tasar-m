import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MapPin, Camera, CheckCheck, Search, ArrowLeft, Phone, Video, MoreVertical, Paperclip } from 'lucide-react';
import { useSocket } from '../../context/SocketContext'; // Assuming context exists
import { UserAvatar } from '../ui/UserAvatar'; // Assuming component exists
import { CONFIG } from '../../services/config';
import { useAppSounds } from '../../hooks/useAppSounds';

interface ChatSystemProps {
    isOpen?: boolean;
    onClose?: () => void;
    currentUserId: string; // From auth context usually
    initialChatId?: string; // Target User ID
}

interface Chat {
    id: string; // Conversation ID
    partnerId: string;
    name: string;
    avatar: string;
    username: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
    isOnline: boolean;
    primaryBike?: string;
}

interface Message {
    _id: string;
    senderId: { _id: string; name: string; avatar: string } | string;
    text: string;
    type: 'TEXT' | 'MAP_PIN' | 'IMAGE';
    createdAt: string;
    isRead: boolean;
}

export const ChatSystem: React.FC<ChatSystemProps> = ({ onClose, currentUserId, initialChatId }) => {
    const { socket, isConnected } = useSocket();
    const { playSuccess, playClick, playHover } = useAppSounds(); // Sound Hook

    // View State
    const [view, setView] = useState<'LIST' | 'CHAT'>('LIST');

    // Data State
    const [chats, setChats] = useState<Chat[]>([]);
    const [activeChat, setActiveChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isTyping, setIsTyping] = useState(false); // Partner typing

    // Refs
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<any>(null);

    // --- 1. Load Chats on Mount ---
    useEffect(() => {
        const init = async () => {
            await fetchChats();

            if (initialChatId) {
                // Try to find existing chat with this partner
                // We need to fetch chats first to check
                const res = await fetch(`${CONFIG.API_URL}/chats`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                const data = await res.json();

                if (data.status === 'success') {
                    const existing = data.data.find((c: Chat) => c.partnerId === initialChatId);
                    if (existing) {
                        handleChatSelect(existing);
                    } else {
                        // Create chat via API to ensure valid ID
                        try {
                            const initRes = await fetch(`${CONFIG.API_URL}/chats/init`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                                },
                                body: JSON.stringify({ partnerId: initialChatId })
                            });
                            const initData = await initRes.json();

                            if (initData.status === 'success') {
                                const uRes = await fetch(`${CONFIG.API_URL}/users/${initialChatId}`, {
                                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                                });
                                const uData = await uRes.json();

                                if (uData.data && uData.data.user) {
                                    const newChat: Chat = {
                                        id: initData.data.id, // Valid DB ID
                                        partnerId: initialChatId,
                                        name: uData.data.user.name,
                                        avatar: uData.data.user.profileImage || uData.data.user.avatar, // Handle possible field diff
                                        username: uData.data.user.username,
                                        lastMessage: '',
                                        lastMessageTime: new Date().toISOString(),
                                        unreadCount: 0,
                                        isOnline: false,
                                        primaryBike: uData.data.user.primaryBike
                                    };
                                    setActiveChat(newChat);
                                    setView('CHAT');
                                }
                            }
                        } catch (e) {
                            console.error("Chat init error", e);
                        }
                    }
                }
            }
        };
        init();

        if (socket) {
            socket.on('update_chat_list', fetchChats); // Simple re-fetch strategy for now
            socket.on('typing_indicator', handleTypingEvent);
        }

        return () => {
            if (socket) {
                socket.off('update_chat_list');
                socket.off('typing_indicator');
            }
        };
    }, [socket, initialChatId]);

    const fetchChats = async () => {
        try {
            const res = await fetch(`${CONFIG.API_URL}/chats`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } // Simple token retrieval
            });
            const data = await res.json();
            if (data.status === 'success') {
                setChats(data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    // --- 2. Enter Chat & Join Room ---
    const handleChatSelect = async (chat: Chat) => {
        playClick(); // Sound interaction
        setActiveChat(chat);
        setMessages([]); // Clear previous
        setView('CHAT');

        if (socket) {
            socket.emit('join_room', { conversationId: chat.id });
        }

        // Fetch History
        try {
            const res = await fetch(`${CONFIG.API_URL}/chats/${chat.id}/messages`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            if (data.status === 'success') {
                setMessages(data.data);
                scrollToBottom();
            }
        } catch (err) {
            console.error(err);
        }
    };

    // --- 3. Receive Messages (Real-time) ---
    useEffect(() => {
        if (!socket || !activeChat) return;

        const handleReceive = (msg: any) => {
            // Check if msg belongs to current conversation
            if (msg.conversationId === activeChat.id) {
                // Determine if it's sent by me (re-echo) or partner to avoid double sound/pop if strictly handled
                // But usually 'receive_message' implies incoming or synced.
                if (msg.senderId !== currentUserId) {
                    playHover(); // Use subtle sound for incoming
                }
                setMessages(prev => [...prev, msg]);
                scrollToBottom();
            }
        };

        socket.on('receive_message', handleReceive);
        return () => { socket.off('receive_message', handleReceive); };
    }, [socket, activeChat]);

    // --- 4. Send Message ---
    const handleSend = () => {
        if (!inputValue.trim() || !activeChat) return;

        playSuccess(); // Satisfying 'sent' sound

        const text = inputValue;
        setInputValue('');

        // Optimistic UI could go here, but socket is fast enough locally usually
        if (socket) {
            socket.emit('send_message', {
                conversationId: activeChat.id,
                text: text,
                type: 'TEXT'
            });
        }
    };

    // --- 5. Typing Logic ---
    const handleTypingEvent = (data: any) => {
        if (activeChat && data.conversationId === activeChat.id && data.userId !== currentUserId) {
            setIsTyping(data.isTyping);
        }
    };

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);

        if (socket && activeChat) {
            socket.emit('typing_indicator', { conversationId: activeChat.id, isTyping: true });

            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                socket.emit('typing_indicator', { conversationId: activeChat.id, isTyping: false });
            }, 1000);
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    // --- RENDER HELPERS ---
    const isMe = (msg: Message) => {
        const senderId = typeof msg.senderId === 'string' ? msg.senderId : msg.senderId._id;
        return senderId === currentUserId;
    };

    // --- ANIMATION VARIANTS ---
    const messageContainerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const messageVariants = {
        hidden: { opacity: 0, y: 10, scale: 0.95 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { type: 'spring', damping: 20, stiffness: 300 }
        }
    };

    // --- UI ---
    return (
        <div className="flex h-full w-full bg-[#0a0a0a] text-white font-sans overflow-hidden md:rounded-[32px] border border-white/5 relative shadow-2xl shadow-black/50">

            {/* BACKGROUND DECORATION */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#E2FF3B]/5 rounded-full blur-[120px] pointer-events-none" />

            {/* CHAT LIST */}
            <AnimatePresence mode="wait">
                {/* Desktop: Always show list if width permits, but for this component structure we toggle 'view' state for mobile responsiveness 
                    For better desktop UX, we usually split layout. Currently keeping simple view toggle for consistency with existing codebase.
                    But adding 'hidden md:flex' handling would require layout restructure.
                    Let's Stick to the existing logic but enhanced visuals.
                */}
                <motion.div
                    key="list"
                    initial={false}
                    animate={{
                        opacity: (view === 'LIST' || window.innerWidth >= 768) ? 1 : 0,
                        x: (view === 'LIST' || window.innerWidth >= 768) ? 0 : -20,
                        display: (view === 'LIST' || window.innerWidth >= 768) ? 'flex' : 'none'
                    }}
                    className={`w-full md:w-[320px] h-full flex-col border-r border-white/5 bg-[#0a0a0a]/50 backdrop-blur-xl ${view === 'CHAT' ? 'hidden md:flex' : 'flex'}`}
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                        <h1 className="text-2xl font-black italic tracking-tighter mb-4 text-white drop-shadow-[0_0_10px_rgba(226,255,59,0.3)]">
                            MESAJLAR <span className="text-[#E2FF3B]">.</span>
                        </h1>
                        <div className="relative group focus-within:ring-1 focus-within:ring-[#E2FF3B]/50 rounded-2xl transition-all">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#E2FF3B] transition-colors" />
                            <input
                                type="text"
                                placeholder="Sürücü ara..."
                                className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-10 pr-4 text-sm focus:outline-none text-gray-200 placeholder:text-gray-600 font-medium"
                            />
                        </div>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                        {chats.map(chat => (
                            <motion.div
                                key={chat.id}
                                layoutId={`chat-${chat.id}`}
                                onClick={() => handleChatSelect(chat)}
                                className={`w-full p-4 rounded-2xl transition-all cursor-pointer flex items-center gap-4 group border border-transparent
                                ${activeChat?.id === chat.id ? 'bg-white/10 border-white/5 shadow-lg' : 'hover:bg-white/5 hover:border-white/5'}
                                `}
                            >
                                <div className="relative">
                                    <UserAvatar src={chat.avatar} name={chat.name} size={48} className={`rounded-full ring-2 transition-all ${activeChat?.id === chat.id ? 'ring-[#E2FF3B]' : 'ring-transparent group-hover:ring-white/20'}`} />
                                    {/* Status Dot */}
                                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-black rounded-full flex items-center justify-center p-0.5">
                                        <div className="w-full h-full bg-[#00F0FF] rounded-full animate-pulse shadow-[0_0_8px_#00F0FF]"></div>
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className={`font-bold truncate transition-colors ${activeChat?.id === chat.id ? 'text-[#E2FF3B]' : 'text-white group-hover:text-gray-200'}`}>
                                            {chat.name}
                                        </h3>
                                        <span className="text-[10px] text-gray-500 font-mono">
                                            {new Date(chat.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className={`text-xs truncate max-w-[160px] ${chat.unreadCount > 0 ? 'text-white font-medium' : 'text-gray-500'}`}>
                                            {chat.lastMessage || 'Sohbet Başlat'}
                                        </p>
                                        {chat.unreadCount > 0 && (
                                            <div className="bg-[#E2FF3B] text-black text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-[0_0_10px_rgba(226,255,59,0.5)]">
                                                {chat.unreadCount}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* CHAT WINDOW */}
            <div className={`flex-1 flex flex-col h-full bg-[#0a0a0a] relative ${view === 'CHAT' ? 'flex' : 'hidden md:flex'}`}>
                {activeChat ? (
                    <>
                        {/* Header */}
                        <div className="h-20 border-b border-white/5 flex items-center justify-between px-6 bg-white/[0.02] backdrop-blur-xl z-10 shrink-0">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setView('LIST')} className="p-2 hover:bg-white/10 rounded-full transition-colors md:hidden text-white">
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                <div className="relative cursor-pointer" onClick={() => { /* Perhaps navigate to profile */ }}>
                                    <UserAvatar src={activeChat.avatar} name={activeChat.name} size={42} className="ring-2 ring-white/10" />
                                    {isTyping && (
                                        <div className="absolute -bottom-1 -right-8 bg-black px-2 py-0.5 rounded-full border border-white/10 text-[8px] font-bold text-[#E2FF3B] animate-pulse flex items-center gap-1">
                                            <span className="w-1 h-1 bg-[#E2FF3B] rounded-full animate-bounce" />
                                            YAZIYOR
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <h2 className="font-bold text-sm tracking-wide text-white flex items-center gap-2">
                                        {(activeChat.name || 'Misafir').split(' ')[0]}
                                        {activeChat.primaryBike && <span className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-gray-300 font-mono tracking-tight">{activeChat.primaryBike}</span>}
                                    </h2>
                                    <span className="text-[10px] text-[#00F0FF] font-black tracking-wider flex items-center gap-1.5 mt-0.5">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00F0FF] opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00F0FF]"></span>
                                        </span>
                                        ÇEVRİMİÇİ
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2 text-gray-400">
                                <motion.button whileHover={{ scale: 1.1, color: '#fff' }} whileTap={{ scale: 0.95 }} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"><Phone className="w-5 h-5" /></motion.button>
                                <motion.button whileHover={{ scale: 1.1, color: '#fff' }} whileTap={{ scale: 0.95 }} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"><Video className="w-5 h-5" /></motion.button>
                                <motion.button whileHover={{ scale: 1.1, color: '#fff' }} whileTap={{ scale: 0.95 }} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"><MoreVertical className="w-5 h-5" /></motion.button>
                            </div>
                        </div>

                        {/* Messages */}
                        <motion.div
                            variants={messageContainerVariants}
                            initial="hidden"
                            animate="visible"
                            className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-5 relative"
                        >
                            {/* Decorative Background Elements */}
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#E2FF3B]/[0.02] to-transparent pointer-events-none" />

                            {messages.map((msg, i) => (
                                <motion.div
                                    key={msg._id || i}
                                    variants={messageVariants}
                                    layout
                                    className={`flex ${isMe(msg) ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`
                                        max-w-[80%] md:max-w-[70%] p-4 rounded-2xl relative shadow-lg backdrop-blur-md border 
                                        ${isMe(msg)
                                            ? 'bg-[#E2FF3B]/10 border-[#E2FF3B]/20 text-white rounded-tr-sm'
                                            : 'bg-[#1a1a1a]/80 border-white/5 text-gray-100 rounded-tl-sm'
                                        }
                                    `}>
                                        <p className="text-sm leading-relaxed font-medium tracking-wide">{msg.text}</p>

                                        {/* Meta */}
                                        <div className={`mt-2 flex items-center gap-1.5 text-[10px] font-mono opacity-60 ${isMe(msg) ? 'justify-end' : 'justify-start'}`}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            {isMe(msg) && (
                                                <CheckCheck className={`w-3.5 h-3.5 ${msg.isRead ? 'text-[#00F0FF]' : ''}`} />
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            <div ref={messagesEndRef} />
                        </motion.div>

                        {/* Input Area */}
                        <div className="p-4 pb-6 px-6 bg-[#0a0a0a]/80 backdrop-blur-xl border-t border-white/5 z-10">
                            <div className="bg-[#111] rounded-2xl p-2 pl-4 flex items-center gap-2 shadow-xl border border-white/10 focus-within:border-[#E2FF3B]/50 transition-all duration-300 ring-4 focus-within:ring-[#E2FF3B]/5">
                                <button className="p-2 text-gray-500 hover:text-white transition-colors">
                                    <Paperclip className="w-5 h-5" />
                                </button>
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={handleInput}
                                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                                    placeholder="Mesaj yaz..."
                                    className="flex-1 bg-transparent border-none focus:outline-none text-sm text-white placeholder:text-gray-600 font-medium h-full py-2"
                                />
                                <div className="flex items-center gap-1 pr-1 border-l border-white/5 pl-1">
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={handleSend}
                                        disabled={!inputValue.trim()}
                                        className={`p-3 rounded-xl transition-all ${inputValue.trim() ? 'bg-[#E2FF3B] text-black shadow-[0_0_15px_rgba(226,255,59,0.4)]' : 'bg-white/5 text-gray-600'}`}
                                    >
                                        <Send className="w-5 h-5" />
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    // EMPTY STATE (Desktop)
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-5">
                        <div className="w-32 h-32 bg-[#111] rounded-full flex items-center justify-center mb-6 relative border border-white/5">
                            <div className="absolute inset-0 bg-[#E2FF3B]/20 blur-3xl rounded-full" />
                            <Send className="w-12 h-12 text-[#E2FF3B] relative z-10 ml-1 mt-1" />
                        </div>
                        <h2 className="text-3xl font-black italic tracking-tighter text-white mb-2">MOTOVIBE <span className="text-[#E2FF3B] not-italic">CHAT</span></h2>
                        <p className="text-gray-500 max-w-xs text-sm">
                            Sol taraftaki listeden bir sürücü seçin veya profillerden yeni bir mesaj başlatın.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
