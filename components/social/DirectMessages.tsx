import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Image as ImageIcon, MapPin, MoreVertical, Search, Circle } from 'lucide-react';
import { UserAvatar } from '../ui/UserAvatar';
import { ChatThread, SocialChatMessage } from '../../types';
import { useSocket } from '../../context/SocketContext';
import { messageService } from '../../services/messageService';
import { MOCK_THREADS_SERVICE } from '../../services/mockMessageService';

interface DirectMessagesProps {
    isOpen: boolean;
    onClose: () => void;
}

export const DirectMessages: React.FC<DirectMessagesProps> = ({ isOpen, onClose }) => {
    const { socket, isConnected } = useSocket();
    const [threads, setThreads] = useState<ChatThread[]>(MOCK_THREADS_SERVICE);
    const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
    const [messages, setMessages] = useState<SocialChatMessage[]>([]);
    const [messageInput, setMessageInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const activeThread = threads.find(t => t.id === activeThreadId);

    // Scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Load Conversation History
    useEffect(() => {
        if (!activeThreadId || !activeThread) return;
        const loadMessages = async () => {
            // In real app, thread.id might be threadId, but here we treat thread.userId as target
            // Assuming MOCK_THREADS uses userId as 'id' or has userId field. MOCK_THREADS has 'userId'.
            const history = await messageService.getConversation(activeThread.userId);
            setMessages(history);
        };
        loadMessages();
    }, [activeThreadId]);

    // Socket Listeners
    useEffect(() => {
        if (!socket) return;

        socket.on('receive_message', (payload: any) => {
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

            // TODO: Update thread list last message/unread count
        });

        socket.on('message_sent', (msg: any) => {
            // Confirm sent (optional, since we optimistically add or wait)
            // For now we optimistically add in handleSend, so maybe just status update
        });

        return () => {
            socket.off('receive_message');
            socket.off('message_sent');
        }
    }, [socket, activeThread]);

    const handleSend = () => {
        if (!messageInput.trim() || !activeThread || !socket) return;

        const content = messageInput;
        const tempId = Date.now().toString();

        // Optimistic UI
        const optimisticMsg: SocialChatMessage = {
            id: tempId,
            senderId: 'me',
            text: content,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isRead: false,
            type: 'text'
        };
        setMessages(prev => [...prev, optimisticMsg]);
        setMessageInput('');

        // Emit to Backend
        // Backend expects: { receiverId, content, type }
        socket.emit('send_message', {
            receiverId: activeThread.userId,
            content,
            type: 'text'
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
                        {/* Sidebar (List) */}
                        <div className={`${activeThreadId ? 'hidden md:flex' : 'flex'} w-full md:w-1/3 flex-col border-r border-white/10 bg-white/5`}>
                            <div className="p-6 border-b border-white/10 flex justify-between items-center">
                                <h2 className="text-xl font-display font-black text-white">MESSAGES</h2>
                                <button onClick={onClose} className="md:hidden text-gray-400"><X /></button>
                            </div>

                            <div className="p-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="text"
                                        placeholder="Search riders..."
                                        className="w-full bg-[#050505] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-moto-accent focus:ring-0 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto no-scrollbar">
                                {threads.map(thread => (
                                    <div
                                        key={thread.id}
                                        onClick={() => setActiveThreadId(thread.id)}
                                        className={`p-4 hover:bg-white/5 transition-colors cursor-pointer flex gap-3 border-b border-white/5 ${activeThreadId === thread.id ? 'bg-white/5' : ''}`}
                                    >
                                        <div className="relative">
                                            <UserAvatar name={thread.userName} src={thread.userAvatar} size={48} />
                                            {thread.isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0A0A0A] shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <h4 className={`font-bold text-sm truncate ${thread.unreadCount > 0 ? 'text-white' : 'text-gray-400'}`}>{thread.userName}</h4>
                                                <span className="text-[10px] text-gray-600 font-mono">{thread.lastMessageTime}</span>
                                            </div>
                                            <p className={`text-xs truncate ${thread.unreadCount > 0 ? 'text-white font-bold' : 'text-gray-500'}`}>{thread.lastMessage}</p>
                                        </div>
                                        {thread.unreadCount > 0 && (
                                            <div className="flex flex-col justify-center">
                                                <span className="w-5 h-5 flex items-center justify-center bg-moto-accent text-black text-[10px] font-bold rounded-full">{thread.unreadCount}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Chat Area */}
                        <div className={`${!activeThreadId ? 'hidden md:flex' : 'flex'} w-full md:w-2/3 flex-col bg-[#050505] relative`}>
                            {activeThread ? (
                                <>
                                    {/* Chat Header */}
                                    <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5 backdrop-blur-md">
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => setActiveThreadId(null)} className="md:hidden text-gray-400"><X /></button>
                                            <div className="relative">
                                                <UserAvatar name={activeThread.userName} size={40} />
                                                {activeThread.isOnline && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#0A0A0A]"></div>}
                                            </div>
                                            <div>
                                                <h3 className="text-white font-bold text-sm">{activeThread.userName}</h3>
                                                <span className="text-xs text-green-500 font-mono flex items-center gap-1">
                                                    {activeThread.isOnline ? (
                                                        <>
                                                            <Circle className="w-2 h-2 fill-current" />
                                                            Online
                                                        </>
                                                    ) : (
                                                        <span className="text-gray-500">Offline</span>
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"><MoreVertical className="w-5 h-5" /></button>
                                            <button onClick={onClose} className="hidden md:block p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                                        </div>
                                    </div>

                                    {/* Messages List */}
                                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                        {messages.length > 0 ? messages.map((msg, index) => {
                                            const isMe = msg.senderId === 'me' || msg.senderId === socket?.id || (msg.senderId && msg.senderId.length > 10 && msg.senderId !== activeThread.userId);
                                            // Better logic: if msg.senderId !== activeThread.userId then it's me. 
                                            // Assuming conversation is just 1-on-1.
                                            const actuallyMe = msg.senderId !== activeThread.userId;

                                            return (
                                                <motion.div
                                                    key={msg.id || index}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className={`flex ${actuallyMe ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div className={`max-w-[70%] rounded-2xl p-4 text-sm leading-relaxed shadow-lg ${actuallyMe ? 'bg-moto-accent text-black rounded-tr-none' : 'bg-white/10 text-white rounded-tl-none border border-white/5'}`}>
                                                        {msg.text}
                                                        <div className={`text-[9px] mt-1 text-right font-mono opacity-60 ${actuallyMe ? 'text-black' : 'text-gray-400'}`}>
                                                            {msg.timestamp}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        }) : (
                                            <div className="flex h-full items-center justify-center text-gray-500 text-sm">
                                                Conversation is empty. Say hello! 👋
                                            </div>
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* Input Area */}
                                    <div className="p-4 border-t border-white/10 bg-[#0A0A0A]">
                                        <div className="flex items-end gap-3 bg-white/5 border border-white/10 p-2 rounded-2xl">
                                            <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"><ImageIcon className="w-5 h-5" /></button>
                                            <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"><MapPin className="w-5 h-5" /></button>
                                            <textarea
                                                value={messageInput}
                                                onChange={(e) => setMessageInput(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        handleSend();
                                                    }
                                                }}
                                                placeholder="Type a message..."
                                                className="flex-1 bg-transparent border-none text-white placeholder-gray-500 focus:ring-0 resize-none max-h-32 text-sm py-2.5"
                                                rows={1}
                                            />
                                            <button
                                                onClick={handleSend}
                                                disabled={!messageInput.trim()}
                                                className="p-2 bg-moto-accent text-black rounded-xl hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <Send className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                                    <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
                                    <p>Select a chat to start messaging</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
