import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MapPin, Camera, CheckCheck, Search, ArrowLeft, Phone, Video, MoreVertical, Paperclip } from 'lucide-react';
import { useSocket } from '../../context/SocketContext'; // Assuming context exists
import { UserAvatar } from '../ui/UserAvatar'; // Assuming component exists
import { CONFIG } from '../../services/config';

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

                                if (uData.data) {
                                    const newChat: Chat = {
                                        id: initData.data.id, // Valid DB ID
                                        partnerId: initialChatId,
                                        name: uData.data.name,
                                        avatar: uData.data.profileImage,
                                        username: uData.data.username,
                                        lastMessage: '',
                                        lastMessageTime: new Date().toISOString(),
                                        unreadCount: 0,
                                        isOnline: false
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

    // --- UI ---
    return (
        <div className="flex h-full w-full bg-[#0a0a0a] text-white font-sans overflow-hidden md:rounded-[32px] border border-white/5 relative">

            {/* CHAT LIST */}
            <AnimatePresence mode="wait">
                {(view === 'LIST') && (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="w-full h-full flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/5">
                            <h1 className="text-2xl font-black italic tracking-tighter mb-4 text-[#E2FF3B]">MESAJLAR</h1>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Ara..."
                                    className="w-full bg-white/5 border-none rounded-2xl py-3 pl-10 pr-4 text-sm focus:ring-1 focus:ring-[#E2FF3B]/50 transition-all placeholder:text-gray-600"
                                />
                            </div>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto p-3 space-y-2">
                            {chats.map(chat => (
                                <div
                                    key={chat.id}
                                    onClick={() => handleChatSelect(chat)}
                                    className="w-full p-4 rounded-2xl hover:bg-white/5 transition-all cursor-pointer flex items-center gap-4 group"
                                >
                                    <div className="relative">
                                        <UserAvatar src={chat.avatar} name={chat.name} size={48} className="rounded-full ring-2 ring-transparent group-hover:ring-[#E2FF3B]" />
                                        {/* Status Dot */}
                                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-black rounded-full flex items-center justify-center">
                                            {/* Cyan Pulse Dot Requirement */}
                                            <div className="w-2.5 h-2.5 bg-[#00F0FF] rounded-full animate-pulse shadow-[0_0_8px_#00F0FF]"></div>
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h3 className="font-bold text-white truncate group-hover:text-[#E2FF3B] transition-colors">{chat.name}</h3>
                                            <span className="text-[10px] text-gray-500 font-mono">
                                                {new Date(chat.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <p className={`text-xs truncate max-w-[180px] ${chat.unreadCount > 0 ? 'text-white font-medium' : 'text-gray-500'}`}>
                                                {chat.lastMessage || 'Sohbet Başlat'}
                                            </p>
                                            {chat.unreadCount > 0 && (
                                                <div className="bg-[#E2FF3B] text-black text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full">
                                                    {chat.unreadCount}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* CHAT WINDOW */}
            <AnimatePresence mode="wait">
                {(view === 'CHAT' && activeChat) && (
                    <motion.div
                        key="window"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="w-full h-full flex flex-col absolute inset-0 bg-[#0a0a0a] z-20"
                    >
                        {/* Header */}
                        <div className="h-20 border-b border-white/5 flex items-center justify-between px-6 bg-white/[0.02] backdrop-blur-xl">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setView('LIST')} className="p-2 hover:bg-white/10 rounded-full transition-colors md:hidden">
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                <div className="relative">
                                    <UserAvatar src={activeChat.avatar} name={activeChat.name} size={42} />
                                    {isTyping && (
                                        <div className="absolute -bottom-1 -right-1 bg-black px-2 py-0.5 rounded-full border border-white/10 text-[8px] font-bold text-[#E2FF3B] animate-pulse">
                                            YAZIYOR...
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h2 className="font-bold text-sm tracking-wide">Sürücü: {(activeChat.name || 'Misafir').split(' ')[0]} | Yamaha R6</h2>
                                    <span className="text-[10px] text-[#00F0FF] font-medium tracking-wider flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#00F0FF]"></div>
                                        ÇEVRİMİÇİ
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2 text-gray-400">
                                <button className="p-2 hover:text-white"><Phone className="w-5 h-5" /></button>
                                <button className="p-2 hover:text-white"><Video className="w-5 h-5" /></button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-5">
                            {messages.map((msg, i) => (
                                <motion.div
                                    key={msg._id || i}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className={`flex ${isMe(msg) ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`
                                        max-w-[75%] p-4 rounded-2xl relative group
                                        ${isMe(msg)
                                            ? 'bg-[#E2FF3B]/10 border-r-2 border-[#E2FF3B] text-white rounded-tr-none'
                                            : 'bg-white/5 backdrop-blur-xl rounded-tl-none border border-white/5'
                                        }
                                    `}>
                                        <p className="text-sm leading-relaxed font-medium">{msg.text}</p>
                                        <div className={`mt-1.5 flex items-center gap-1 text-[10px] opacity-50 ${isMe(msg) ? 'justify-end' : 'justify-start'}`}>
                                            {/* Convert timestamp to time - handling possible ISO string */}
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}

                                            {isMe(msg) && (
                                                <CheckCheck className={`w-3 h-3 ${msg.isRead ? 'text-[#00F0FF]' : ''}`} />
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 pb-6 px-6">
                            <div className="bg-[#1a1a1a] rounded-full p-2 pl-6 flex items-center gap-4 shadow-lg border border-white/5 focus-within:border-[#E2FF3B]/50 transition-colors">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={handleInput}
                                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                                    placeholder="Mesaj yaz..."
                                    className="flex-1 bg-transparent border-none focus:outline-none text-sm placeholder:text-gray-500 font-medium h-full"
                                />
                                <div className="flex items-center gap-1 pr-1">
                                    <button className="p-2.5 text-gray-400 hover:text-[#00F0FF] rounded-full hover:bg-white/5 transition-colors">
                                        <MapPin className="w-5 h-5" />
                                    </button>
                                    <button className="p-2.5 text-gray-400 hover:text-white rounded-full hover:bg-white/5 transition-colors">
                                        <Camera className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={handleSend}
                                        className="bg-[#E2FF3B] text-black p-2.5 rounded-full hover:scale-105 active:scale-95 transition-transform"
                                    >
                                        <Send className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
