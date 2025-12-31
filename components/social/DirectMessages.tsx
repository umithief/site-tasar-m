import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Image as ImageIcon, MapPin, MoreVertical, Search, Circle, Phone, Video } from 'lucide-react';
import { UserAvatar } from '../ui/UserAvatar';
import { ChatThread, SocialChatMessage } from '../../types';
import { useSocket } from '../../context/SocketContext';
import { messageService } from '../../services/messageService';
import { CONFIG } from '../../services/config';

interface DirectMessagesProps {
    isOpen: boolean; // Relevant only for modal mode
    onClose?: () => void;
    initialChatUserId?: string;
    isEmbedded?: boolean; // New prop for embedding
}

export const DirectMessages: React.FC<DirectMessagesProps> = ({ isOpen, onClose, initialChatUserId, isEmbedded = false }) => {
    const { socket, isConnected } = useSocket();

    const [threads, setThreads] = useState<ChatThread[]>([]);
    const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
    const [messages, setMessages] = useState<SocialChatMessage[]>([]);
    const [messageInput, setMessageInput] = useState('');
    const messagesEndRef = useRef<null | HTMLDivElement>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        const init = async () => {
            const userStr = localStorage.getItem('user');
            if (userStr) setCurrentUser(JSON.parse(userStr));

            const fetchedThreads = await messageService.getThreads();
            setThreads(fetchedThreads);

            if (initialChatUserId) {
                const existing = fetchedThreads.find(t => t.userId === initialChatUserId);
                if (existing) {
                    setActiveThreadId(existing.id);
                } else {
                    try {
                        const response = await fetch(`${CONFIG.API_URL}/users/${initialChatUserId}`, {
                            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                        });
                        const userData = await response.json();
                        if (userData && userData.data) {
                            const tempThread: ChatThread = {
                                id: 'temp_' + initialChatUserId, userId: initialChatUserId, userName: userData.data.name,
                                userAvatar: userData.data.profileImage, isOnline: false, lastMessage: '', lastMessageTime: '', unreadCount: 0
                            };
                            setThreads(prev => [tempThread, ...prev]);
                            setActiveThreadId(tempThread.id);
                        }
                    } catch (e) { console.error(e); }
                }
            }
        };
        init();
    }, [initialChatUserId]);

    const activeThread = threads.find(t => t.id === activeThreadId);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (!activeThreadId || !activeThread) return;
        messageService.getConversation(activeThread.userId).then(setMessages).catch(console.error);
    }, [activeThreadId, activeThread]);

    useEffect(() => {
        if (!socket || !isConnected) return;
        const handleReceiveMessage = (payload: any) => {
            const newMsg: SocialChatMessage = {
                id: payload.message._id, senderId: payload.sender._id, text: payload.message.content,
                timestamp: new Date(payload.message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isRead: false, type: payload.message.type || 'text'
            };
            if (activeThread && (payload.sender._id === activeThread.userId)) {
                setMessages(prev => [...prev, newMsg]);
            }
            setThreads(prev => {
                const existingIdx = prev.findIndex(t => t.userId === payload.sender._id);
                if (existingIdx > -1) {
                    const updated = { ...prev[existingIdx], lastMessage: newMsg.text, lastMessageTime: newMsg.timestamp, unreadCount: (activeThreadId === prev[existingIdx].id ? 0 : (prev[existingIdx].unreadCount + 1)) };
                    const newThreads = [...prev]; newThreads.splice(existingIdx, 1); return [updated, ...newThreads];
                } else {
                    const newThread: ChatThread = {
                        id: 'new_' + payload.sender._id, userId: payload.sender._id, userName: payload.sender.name, userAvatar: payload.sender.profileImage,
                        isOnline: true, lastMessage: newMsg.text, lastMessageTime: newMsg.timestamp, unreadCount: 1
                    };
                    return [newThread, ...prev];
                }
            });
        };
        socket.on('receive_message', handleReceiveMessage);
        return () => { socket.off('receive_message', handleReceiveMessage); };
    }, [socket, isConnected, activeThread, activeThreadId]);

    const handleSend = () => {
        if (!messageInput.trim() || !activeThread || !socket) return;
        const content = messageInput;
        const tempId = Date.now().toString();
        const optimisticMsg: SocialChatMessage = {
            id: tempId, senderId: currentUser?._id || 'me', text: content,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isRead: false, type: 'text'
        };
        setMessages(prev => [...prev, optimisticMsg]);
        setMessageInput('');
        socket.emit('send_message', { receiverId: activeThread.userId, content, type: 'text' });
        setThreads(prev => {
            const existingIdx = prev.findIndex(t => t.id === activeThreadId);
            if (existingIdx > -1) {
                const updated = { ...prev[existingIdx], lastMessage: content, lastMessageTime: optimisticMsg.timestamp };
                const newThreads = [...prev]; newThreads.splice(existingIdx, 1); return [updated, ...newThreads];
            }
            return prev;
        });
    };

    // --- Content Render logic ---
    const renderContent = () => (
        <div className={`flex w-full h-full bg-[#111] overflow-hidden ${isEmbedded ? 'rounded-[2.5rem] border border-white/5' : ''}`}>
            {/* Sidebar (Threads) */}
            <div className={`${activeThreadId ? 'hidden md:flex' : 'flex'} w-full md:w-[320px] border-r border-white/5 flex-col h-full bg-black/20`}>
                <div className="p-6 border-b border-white/5">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-black italic bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">MESAJLAR</h3>
                        <div className={`px-2 py-1 rounded-full border text-[10px] font-bold ${isConnected ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                            {isConnected ? 'ONLINE' : 'OFFLINE'}
                        </div>
                    </div>
                    <div className="relative group/search">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within/search:text-moto-accent transition-colors" />
                        <input type="text" placeholder="Sohbetlerde ara..." className="w-full bg-[#050505] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs font-bold focus:outline-none focus:border-moto-accent/50 transition-colors" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
                    {threads.length > 0 ? threads.map((thread) => (
                        <button key={thread.id} onClick={() => setActiveThreadId(thread.id)} className={`w-full p-3 flex items-center gap-3 rounded-xl transition-all border ${activeThreadId === thread.id ? 'bg-moto-accent/10 border-moto-accent/30' : 'bg-transparent border-transparent hover:bg-white/5'}`}>
                            <div className="relative">
                                <UserAvatar src={thread.userAvatar} name={thread.userName} size={48} className={`ring-2 ${activeThreadId === thread.id ? 'ring-moto-accent' : 'ring-transparent'}`} />
                                {thread.isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#111] rounded-full" />}
                            </div>
                            <div className="flex-1 text-left min-w-0">
                                <div className="flex justify-between items-start mb-0.5">
                                    <span className={`font-bold text-sm truncate ${activeThreadId === thread.id ? 'text-white' : 'text-gray-300'}`}>{thread.userName}</span>
                                    <span className="text-[10px] text-gray-600 font-mono">{thread.lastMessageTime}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className={`text-xs truncate max-w-[140px] ${thread.unreadCount > 0 ? 'text-white font-bold' : 'text-gray-500'}`}>{thread.lastMessage || 'Sohbeti başlat...'}</p>
                                    {thread.unreadCount > 0 && <span className="bg-moto-accent text-black text-[10px] font-bold h-5 min-w-[20px] flex items-center justify-center rounded-full px-1">{thread.unreadCount}</span>}
                                </div>
                            </div>
                        </button>
                    )) : (
                        <div className="p-8 text-center text-gray-600 text-xs font-bold uppercase tracking-widest">Henüz mesajın yok.</div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`${!activeThreadId ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-[#09090b] relative`}>
                {activeThread ? (
                    <>
                        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/20 backdrop-blur-sm z-10">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setActiveThreadId(null)} className="md:hidden p-2 hover:bg-white/5 rounded-full"><X className="w-5 h-5 text-gray-400" /></button>
                                <UserAvatar src={activeThread.userAvatar} name={activeThread.userName} size={40} />
                                <div>
                                    <h4 className="font-bold text-sm text-white">{activeThread.userName}</h4>
                                    <p className="text-[10px] font-bold text-gray-500">{activeThread.isOnline ? <span className="text-green-500">ÇEVRİMİÇİ</span> : 'SON GÖRÜLME YAKINDA'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors"><Phone className="w-5 h-5" /></button>
                                <button className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors"><Video className="w-5 h-5" /></button>
                                {!isEmbedded && onClose && <button onClick={onClose} className="ml-2 p-2 hover:bg-red-500/10 hover:text-red-500 rounded-full text-gray-400 transition-colors"><X className="w-5 h-5" /></button>}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-5">
                            {messages.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-30 space-y-4 select-none pointer-events-none">
                                    <MessageSquare className="w-16 h-16 text-moto-accent" />
                                    <p className="text-sm font-bold uppercase tracking-widest">Sohbet Başlangıcı</p>
                                </div>
                            )}
                            {messages.map((msg, index) => (
                                <div key={msg.id || index} className={`flex ${msg.senderId === currentUser?._id ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[75%] rounded-2xl p-3 px-4 shadow-lg ${msg.senderId === currentUser?._id ? 'bg-moto-accent text-black font-medium rounded-tr-none' : 'bg-[#1a1a1a] text-gray-200 border border-white/5 rounded-tl-none'}`}>
                                        <p className="text-sm leading-relaxed">{msg.text}</p>
                                        <span className={`text-[9px] block mt-1 font-bold ${msg.senderId === currentUser?._id ? 'text-black/50 text-right' : 'text-gray-600'}`}>{msg.timestamp}</span>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-4 bg-black/40 border-t border-white/5">
                            <div className="flex items-center gap-2 bg-[#1a1a1a] border border-white/5 rounded-2xl p-2 pr-2 focus-within:border-moto-accent/50 focus-within:ring-1 focus-within:ring-moto-accent/20 transition-all shadow-lg">
                                <div className="flex gap-1 pl-1">
                                    <button className="p-2 hover:bg-white/5 rounded-xl text-gray-500 hover:text-white transition-colors"><ImageIcon className="w-5 h-5" /></button>
                                    <button className="p-2 hover:bg-white/5 rounded-xl text-gray-500 hover:text-white transition-colors"><MapPin className="w-5 h-5" /></button>
                                </div>
                                <input
                                    value={messageInput} onChange={e => setMessageInput(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                                    type="text" placeholder="Mesaj..."
                                    className="flex-1 bg-transparent border-none focus:outline-none text-sm text-white px-2 placeholder-gray-600 font-medium"
                                />
                                <button onClick={handleSend} disabled={!messageInput.trim()} className="bg-moto-accent text-black p-2.5 rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 shadow-lg shadow-moto-accent/20">
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-6 select-none opacity-50">
                        <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center border border-white/10 animate-pulse">
                            <MessageSquare className="w-10 h-10 text-moto-accent" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black italic text-white mb-2">MESAJLAR</h3>
                            <p className="text-gray-500 text-sm max-w-xs mx-auto">Bir sohbet seçerek mesajlaşmaya başla.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    if (isEmbedded) {
        return renderContent();
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[1000]" />
                    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="fixed right-0 top-0 bottom-0 w-full md:w-[900px] z-[1001] shadow-2xl">
                        {renderContent()}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
