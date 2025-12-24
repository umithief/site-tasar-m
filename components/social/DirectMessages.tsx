import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Image as ImageIcon, MapPin, MoreVertical, Search, Circle } from 'lucide-react';
import { UserAvatar } from '../ui/UserAvatar';
import { ChatThread, SocialChatMessage } from '../../types';
import { useSocket } from '../../context/SocketContext';
import { messageService } from '../../services/messageService';
import { MOCK_THREADS_SERVICE } from '../../services/mockMessageService';
import { CONFIG } from '../../services/config';

interface DirectMessagesProps {
    isOpen: boolean;
    onClose: () => void;
    initialChatUserId?: string; // New prop to open specific chat
}

export const DirectMessages: React.FC<DirectMessagesProps> = ({ isOpen, onClose, initialChatUserId }) => {
    // New Hook Usage
    const { socket, isConnected } = useSocket();

    const [threads, setThreads] = useState<ChatThread[]>([]);
    const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
    const [messages, setMessages] = useState<SocialChatMessage[]>([]);
    const [messageInput, setMessageInput] = useState('');
    const messagesEndRef = useRef<null | HTMLDivElement>(null);
    const [currentUser, setCurrentUser] = useState<any>(null); // To know "me"

    // Load Threads & Current User
    useEffect(() => {
        const init = async () => {
            const userStr = localStorage.getItem('user');
            if (userStr) setCurrentUser(JSON.parse(userStr));

            const fetchedThreads = await messageService.getThreads();
            setThreads(fetchedThreads);

            // Handle initial chat request
            if (initialChatUserId) {
                const existing = fetchedThreads.find(t => t.userId === initialChatUserId);
                if (existing) {
                    setActiveThreadId(existing.id);
                } else {
                    // Fetch user info to create a temp thread object
                    try {
                        // We need a way to get basic user info by ID if not in threads
                        const response = await fetch(`${CONFIG.API_URL}/users/${initialChatUserId}`, {
                            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                        });
                        const userData = await response.json();
                        if (userData && userData.data) {
                            const tempThread: ChatThread = {
                                id: 'temp_' + initialChatUserId,
                                userId: initialChatUserId,
                                userName: userData.data.name,
                                userAvatar: userData.data.profileImage,
                                isOnline: false,
                                lastMessage: '',
                                lastMessageTime: '',
                                unreadCount: 0
                            };
                            setThreads(prev => [tempThread, ...prev]);
                            setActiveThreadId(tempThread.id);
                        }
                    } catch (e) {
                        console.error("Could not load initial chat user", e);
                    }
                }
            }
        };
        init();
    }, [initialChatUserId]);

    const activeThread = threads.find(t => t.id === activeThreadId);

    // Scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Load Conversation History
    useEffect(() => {
        if (!activeThreadId || !activeThread) return;
        const loadMessages = async () => {
            try {
                // Using userId from thread as target for conversation fetch
                const history = await messageService.getConversation(activeThread.userId);
                setMessages(history);
            } catch (err) {
                console.error("Failed to load messages", err);
            }
        };
        loadMessages();
    }, [activeThreadId, activeThread]);

    // Socket Listeners
    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleReceiveMessage = (payload: any) => {
            // Payload: { message: MessageObject, sender: UserObject }
            const newMsg: SocialChatMessage = {
                id: payload.message._id,
                senderId: payload.sender._id,
                text: payload.message.content,
                timestamp: new Date(payload.message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isRead: false,
                type: payload.message.type || 'text'
            };

            // If chat open with this user, add to list
            if (activeThread && (payload.sender._id === activeThread.userId)) {
                setMessages(prev => [...prev, newMsg]);
            }

            // Update threads list order and preview
            setThreads(prev => {
                const existingIdx = prev.findIndex(t => t.userId === payload.sender._id);
                if (existingIdx > -1) {
                    const updated = { ...prev[existingIdx], lastMessage: newMsg.text, lastMessageTime: newMsg.timestamp, unreadCount: (activeThreadId === prev[existingIdx].id ? 0 : (prev[existingIdx].unreadCount + 1)) };
                    const newThreads = [...prev];
                    newThreads.splice(existingIdx, 1);
                    return [updated, ...newThreads];
                } else {
                    // New thread from unknown sender (should ideally fetch user details or use payload sender info)
                    const newThread: ChatThread = {
                        id: 'new_' + payload.sender._id,
                        userId: payload.sender._id,
                        userName: payload.sender.name,
                        userAvatar: payload.sender.profileImage,
                        isOnline: true,
                        lastMessage: newMsg.text,
                        lastMessageTime: newMsg.timestamp,
                        unreadCount: 1
                    };
                    return [newThread, ...prev];
                }
            });
        };

        socket.on('receive_message', handleReceiveMessage);

        return () => {
            socket.off('receive_message', handleReceiveMessage);
        };
    }, [socket, isConnected, activeThread, activeThreadId]);

    const handleSend = () => {
        if (!messageInput.trim() || !activeThread || !socket) return;

        const content = messageInput;
        const tempId = Date.now().toString();

        // Optimistic UI
        const optimisticMsg: SocialChatMessage = {
            id: tempId,
            senderId: currentUser?._id || 'me',
            text: content,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isRead: false,
            type: 'text'
        };
        setMessages(prev => [...prev, optimisticMsg]);
        setMessageInput('');

        // Emit to Backend
        socket.emit('send_message', {
            receiverId: activeThread.userId,
            content,
            type: 'text'
        });

        // Update threads list immediately
        setThreads(prev => {
            const existingIdx = prev.findIndex(t => t.id === activeThreadId);
            if (existingIdx > -1) {
                const updated = { ...prev[existingIdx], lastMessage: content, lastMessageTime: optimisticMsg.timestamp };
                const newThreads = [...prev];
                newThreads.splice(existingIdx, 1);
                return [updated, ...newThreads];
            }
            return prev;
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    />

                    {/* Window */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed right-0 top-0 bottom-0 w-full md:w-[850px] bg-[#0A0A0A] border-l border-white/10 z-50 flex shadow-2xl"
                    >
                        {/* Sidebar (Threads) */}
                        <div className={`${activeThreadId ? 'hidden md:flex' : 'flex'} w-full md:w-80 border-r border-white/10 flex-col h-full bg-white/2`}>
                            <div className="p-4 border-b border-white/10">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">MESAJLAR</h3>
                                    <div className="px-2 py-1 bg-moto-accent/10 border border-moto-accent/20 rounded-md">
                                        <span className="text-[10px] text-moto-accent font-mono font-bold">{isConnected ? 'ÇEVRİMİÇİ' : 'ÇEVRİMDIŞI'}</span>
                                    </div>
                                </div>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="text"
                                        placeholder="Sohbetlerde ara..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-moto-accent/50 transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto no-scrollbar">
                                {threads.length > 0 ? threads.map((thread) => (
                                    <button
                                        key={thread.id}
                                        onClick={() => setActiveThreadId(thread.id)}
                                        className={`w-full p-4 flex items-center gap-3 hover:bg-white/5 transition-colors border-l-2 ${activeThreadId === thread.id ? 'bg-white/5 border-moto-accent' : 'border-transparent'}`}
                                    >
                                        <div className="relative">
                                            <UserAvatar src={thread.userAvatar} name={thread.userName} size={48} />
                                            {thread.isOnline && (
                                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#0a0a0a] rounded-full" />
                                            )}
                                        </div>
                                        <div className="flex-1 text-left">
                                            <div className="flex justify-between items-start">
                                                <span className="font-bold text-sm text-gray-200">{thread.userName}</span>
                                                <span className="text-[10px] text-gray-500">{thread.lastMessageTime}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <p className="text-xs text-gray-500 truncate max-w-[140px]">{thread.lastMessage || 'Sohbeti başlat...'}</p>
                                                {thread.unreadCount > 0 && (
                                                    <span className="bg-moto-accent text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                                        {thread.unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                )) : (
                                    <div className="p-8 text-center text-gray-500 text-sm">
                                        Henüz mesajın yok.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Chat Area */}
                        <div className={`${!activeThreadId ? 'hidden md:flex' : 'flex'} w-full md:w-2/3 flex-col bg-[#050505] relative`}>
                            {activeThread ? (
                                <>
                                    {/* Chat Header */}
                                    <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/20">
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => setActiveThreadId(null)} className="md:hidden text-gray-400"><X /></button>
                                            <UserAvatar src={activeThread.userAvatar} name={activeThread.userName} size={40} />
                                            <div>
                                                <h4 className="font-bold text-sm">{activeThread.userName}</h4>
                                                <p className="text-[10px] text-moto-accent font-mono">
                                                    {activeThread.isOnline ? 'ŞU AN AKTİF' : 'ÇEVRİMDIŞI'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 transition-colors">
                                                <MoreVertical className="w-5 h-5" />
                                            </button>
                                            <button onClick={onClose} className="hidden md:block p-2 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                                        </div>
                                    </div>

                                    {/* Messages List */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                                        {messages.length === 0 && (
                                            <div className="h-full flex flex-col items-center justify-center text-center opacity-50 space-y-4">
                                                <MessageSquare className="w-12 h-12 text-moto-accent/20" />
                                                <p className="text-sm">Henüz mesaj yok.<br />Merhaba diyerek sohbeti başlat!</p>
                                            </div>
                                        )}
                                        {messages.map((msg, index) => (
                                            <div
                                                key={msg.id || index}
                                                className={`flex ${msg.senderId === currentUser?._id ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div className={`max-w-[80%] rounded-2xl p-3 ${msg.senderId === currentUser?._id ? 'bg-moto-accent text-black font-medium rounded-tr-none' : 'bg-white/5 text-gray-200 border border-white/10 rounded-tl-none'}`}>
                                                    <p className="text-sm">{msg.text}</p>
                                                    <span className={`text-[9px] block mt-1 ${msg.senderId === currentUser?._id ? 'text-black/60' : 'text-gray-500'}`}>
                                                        {msg.timestamp}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* Message Input */}
                                    <div className="p-4 border-t border-white/10 bg-black/20">
                                        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl p-2 focus-within:border-moto-accent/50 transition-all">
                                            <button className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-gray-500 transition-colors">
                                                <ImageIcon className="w-5 h-5" />
                                            </button>
                                            <button className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-gray-500 transition-colors"><MapPin className="w-5 h-5" /></button>
                                            <input
                                                value={messageInput}
                                                onChange={(e) => setMessageInput(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        handleSend();
                                                    }
                                                }}
                                                type="text"
                                                placeholder="Mesaj yaz..."
                                                className="flex-1 bg-transparent border-none focus:outline-none text-sm px-2"
                                            />
                                            <button
                                                onClick={handleSend}
                                                disabled={!messageInput.trim()}
                                                className="bg-moto-accent text-black p-2 rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                                            >
                                                <Send className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-6">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-moto-accent blur-3xl opacity-10 rounded-full" />
                                        <div className="relative bg-white/5 border border-white/10 p-8 rounded-full">
                                            <MessageSquare className="w-16 h-16 text-moto-accent" />
                                        </div>
                                    </div>
                                    <div className="max-w-xs">
                                        <h3 className="text-xl font-bold mb-2">MESAJLARIN</h3>
                                        <p className="text-gray-500 text-sm">Arkadaşlarına mesaj gönder veya yeni bağlantılar kurmak için bir sohbet seç.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
