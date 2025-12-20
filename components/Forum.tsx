
import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Heart, Eye, Calendar, ArrowLeft, Send, Lock, Search, ShieldAlert, Trophy, Flame, ChevronRight, X, Crown, PenTool, CheckCircle2 } from 'lucide-react';
import { ForumTopic, ForumComment, User as UserType } from '../types';
import { Button } from './ui/Button';
import { forumService } from '../services/forumService';
import { authService } from '../services/auth';
import { UserAvatar } from './ui/UserAvatar';
import { Highlighter } from './Highlighter';
// storageService removed
import { motion, AnimatePresence } from 'framer-motion';
import { notify } from '../services/notificationService';
import { useLanguage } from '../contexts/LanguageProvider';

interface ForumProps {
    user: UserType | null;
    onOpenAuth: () => void;
    onViewProfile?: (userId: string) => void;
    onOpenPro?: () => void;
}

// Paddock removed

export const Forum: React.FC<ForumProps> = ({ user, onOpenAuth, onViewProfile, onOpenPro }) => {
    const { t } = useLanguage();
    // const [activeTab, setActiveTab] = useState<'feed' | 'forum'>('feed'); // Removed

    const [view, setView] = useState<'list' | 'detail'>('list');
    const [isCreating, setIsCreating] = useState(false);
    const [topics, setTopics] = useState<ForumTopic[]>([]);
    const [selectedTopic, setSelectedTopic] = useState<ForumTopic | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Paddock states removed

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [newCategory, setNewCategory] = useState<ForumTopic['category']>('Genel');
    const [commentText, setCommentText] = useState('');

    const topRiders = [
        { name: 'Canberk Hız', rank: 'Yol Kaptanı', points: 1250, bike: 'Yamaha R1' },
        { name: 'Zeynep Yılmaz', rank: 'Viraj Ustası', points: 980, bike: 'Honda CBR650R' },
        { name: 'Mehmet Demir', rank: 'Viraj Ustası', points: 850, bike: 'Ducati Monster' }
    ];

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const data = await forumService.getTopics();
            setTopics(data);
        } catch (error) {
            console.error("Veri yüklenemedi", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Paddock handlers removed

    const handleCreateTopic = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        try {
            await forumService.createTopic(user, newTitle, newContent, newCategory, ['Yeni']);
            setNewTitle('');
            setNewContent('');
            setIsCreating(false);
            loadData();
            notify.success("Konu başarıyla açıldı.");
        } catch (error) {
            console.error("Konu açılamadı", error);
        }
    };

    const handleTopicClick = (topic: ForumTopic) => {
        setSelectedTopic(topic);
        setView('detail');
        window.scrollTo({ top: 0, left: 0 });
    };

    const handleAddComment = async () => {
        if (!user || !selectedTopic || !commentText.trim()) return;
        try {
            const newComment = await forumService.addComment(selectedTopic.id, user, commentText);
            const updatedTopic = { ...selectedTopic, comments: [...selectedTopic.comments, newComment] };
            setSelectedTopic(updatedTopic);
            setCommentText('');
            const updatedTopics = topics.map(t => t.id === selectedTopic.id ? updatedTopic : t);
            setTopics(updatedTopics);
            notify.success("Yorum eklendi.");
        } catch (error) {
            console.error("Yorum yapılamadı", error);
        }
    };

    const handleLike = async (e: React.MouseEvent, topicId: string) => {
        e.stopPropagation();
        if (!user) { onOpenAuth(); return; }
        await forumService.toggleLike(topicId);
        setTopics(prev => prev.map(t => t.id === topicId ? { ...t, likes: t.likes + 1 } : t));
        if (selectedTopic && selectedTopic.id === topicId) {
            setSelectedTopic(prev => prev ? { ...prev, likes: prev.likes + 1 } : null);
        }
    };

    const renderSidebar = () => (
        <div className="hidden lg:block space-y-6 sticky top-24 h-fit">
            <div
                onClick={() => { if (user) onOpenPro && onOpenPro(); else onOpenAuth(); }}
                className="group relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-gray-900 to-black border border-gray-200 cursor-pointer transition-all duration-300 shadow-xl"
            >
                <div className="absolute top-0 right-0 w-24 h-24 bg-moto-accent/20 rounded-full blur-3xl group-hover:bg-moto-accent/30 transition-colors"></div>

                <div className="relative z-10 flex flex-col items-start">
                    <div className="flex items-center gap-2 mb-2">
                        <Crown className="w-5 h-5 text-moto-accent" fill="currentColor" />
                        <span className="text-moto-accent font-bold text-xs uppercase tracking-widest">Premium</span>
                    </div>
                    <h3 className="font-display font-black text-2xl text-white mb-2 leading-none">MOTOVIBE<br />ELITE CLUB</h3>
                    <p className="text-gray-400 text-xs font-medium mb-4 leading-relaxed">
                        Sınırsız ayrıcalıklar, özel rozetler ve %5 daimi indirim seni bekliyor.
                    </p>
                    <button className="w-full py-2 bg-moto-accent text-black rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors shadow-lg">
                        Yükselt
                    </button>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                        Liderlik Tablosu
                    </h3>
                    <span className="text-[10px] text-gray-500 uppercase font-bold">Bu Hafta</span>
                </div>
                <div className="space-y-4">
                    {topRiders.map((rider, i) => (
                        <div key={i} className="flex items-center gap-3 group cursor-pointer p-2 rounded-xl hover:bg-gray-50 transition-colors">
                            <div className="relative">
                                <UserAvatar name={rider.name} size={40} />
                                <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-white ${i === 0 ? 'bg-yellow-400' : i === 1 ? 'bg-gray-400' : 'bg-orange-600'}`}>
                                    {i + 1}
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1">
                                    <h4 className="text-sm font-bold text-gray-900 truncate">{rider.name}</h4>
                                    {i === 0 && <Crown className="w-3 h-3 text-yellow-500" fill="currentColor" />}
                                </div>
                                <p className="text-[10px] text-gray-500 truncate">{rider.bike}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-mono font-bold text-moto-accent">{rider.points}</div>
                                <div className="text-[9px] text-gray-400">XP</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    // renderSocialFeed Removed

    const renderTopicList = () => {
        const filteredTopics = topics.filter(t => {
            const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.content.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'ALL' || t.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });

        return (
            <div className="space-y-6">

                <div className="bg-white border border-gray-200 rounded-2xl p-2 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-24 z-20 shadow-lg">
                    <div className="flex gap-1 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar px-2">
                        {['ALL', 'Genel', 'Teknik', 'Gezi', 'Ekipman', 'Etkinlik'].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${selectedCategory === cat
                                    ? 'bg-moto-accent text-black shadow-lg shadow-moto-accent/20'
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                {cat === 'ALL' ? t('shop.all') : cat.toUpperCase()}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto px-2 md:px-0">
                        <div className="relative flex-1 md:w-56">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder={t('forum.search_placeholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-xs text-gray-900 focus:border-moto-accent outline-none transition-all focus:bg-white"
                            />
                        </div>
                        {user && (
                            <Button size="sm" onClick={() => setIsCreating(!isCreating)} className="whitespace-nowrap h-9 px-4 text-xs bg-black text-white hover:bg-gray-800">
                                {isCreating ? <X className="w-3 h-3" /> : <PenTool className="w-3 h-3 mr-2" />}
                                {isCreating ? t('common.cancel') : t('forum.create_topic')}
                            </Button>
                        )}
                    </div>
                </div>

                <AnimatePresence>
                    {isCreating && user && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="bg-white border-l-4 border-moto-accent rounded-r-2xl p-6 relative my-6 shadow-md border-y border-r border-gray-200">
                                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <PenTool className="w-5 h-5 text-moto-accent" /> Yeni Konu Başlat
                                </h3>
                                <form onSubmit={handleCreateTopic} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Başlık</label>
                                            <input type="text" required value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:border-moto-accent outline-none text-gray-900 font-bold focus:bg-white" placeholder="Konu başlığı..." />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Kategori</label>
                                            <select className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:border-moto-accent outline-none text-gray-900 focus:bg-white" value={newCategory} onChange={(e) => setNewCategory(e.target.value as any)}>{['Genel', 'Teknik', 'Gezi', 'Ekipman', 'Etkinlik'].map(c => <option key={c} value={c}>{c}</option>)}</select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">İçerik</label>
                                        <textarea required value={newContent} onChange={(e) => setNewContent(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:border-moto-accent outline-none text-gray-900 min-h-[120px] focus:bg-white" placeholder="Detayları buraya yaz..." />
                                    </div>
                                    <div className="flex justify-end"><Button type="submit" variant="primary" className="px-8 shadow-lg shadow-moto-accent/20">YAYINLA</Button></div>
                                </form>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="space-y-3">
                    {filteredTopics.length === 0 ? (
                        <div className="text-center py-20 text-gray-500 bg-white rounded-3xl border border-dashed border-gray-200">
                            <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            {t('shop.no_results')}
                        </div>
                    ) : (
                        filteredTopics.map((topic) => (
                            <motion.div
                                key={topic.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                onClick={() => handleTopicClick(topic)}
                                className="group bg-white border border-gray-200 p-5 rounded-2xl hover:border-moto-accent/40 transition-all cursor-pointer relative overflow-hidden flex flex-col md:flex-row gap-6 md:items-center shadow-sm hover:shadow-md"
                            >
                                <div className="flex md:flex-col items-center gap-4 md:gap-1 text-gray-400 text-xs md:border-r md:border-gray-100 md:pr-6 md:w-20 flex-shrink-0 md:justify-center">
                                    <div className="flex flex-col items-center group-hover:text-moto-accent transition-colors">
                                        <span className="text-lg font-bold text-gray-900">{topic.likes}</span>
                                        <span>{t('forum.likes')}</span>
                                    </div>
                                    <div className="hidden md:block w-full h-[1px] bg-gray-100 my-2"></div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-lg font-bold text-gray-600">{topic.comments.length}</span>
                                        <span>{t('forum.comments')}</span>
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0 relative z-10">
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <span className={`px-2.5 py-0.5 text-[9px] font-bold uppercase rounded border ${topic.category === 'Teknik' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                            topic.category === 'Gezi' ? 'bg-green-50 text-green-600 border-green-200' :
                                                topic.category === 'Ekipman' ? 'bg-purple-50 text-purple-600 border-purple-200' :
                                                    'bg-gray-100 text-gray-500 border-gray-200'
                                            }`}>
                                            {topic.category}
                                        </span>
                                        {topic.tags.includes('Yeni') && (
                                            <span className="flex items-center gap-1 text-[9px] text-orange-500 font-bold animate-pulse">
                                                <Flame className="w-3 h-3 fill-current" /> YENİ
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-moto-accent transition-colors line-clamp-1">
                                        <Highlighter text={topic.title} highlight={searchQuery} />
                                    </h3>
                                    <p className="text-gray-500 text-sm line-clamp-2 mb-3 leading-relaxed">
                                        <Highlighter text={topic.content} highlight={searchQuery} />
                                    </p>

                                    <div className="flex items-center gap-4 text-xs text-gray-400">
                                        <span className="flex items-center gap-2 hover:text-gray-900 transition-colors">
                                            <UserAvatar name={topic.authorName} size={18} />
                                            <span className="font-medium text-gray-600">{topic.authorName}</span>
                                        </span>
                                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {topic.date}</span>
                                        <span className="flex items-center gap-1 ml-auto md:ml-0"><Eye className="w-3 h-3" /> {topic.views}</span>
                                    </div>
                                </div>

                                <div className="hidden md:flex opacity-0 group-hover:opacity-100 transition-opacity text-moto-accent">
                                    <ChevronRight className="w-6 h-6" />
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        );
    };

    const renderDetail = () => {
        if (!selectedTopic) return null;
        return (
            <div className="animate-in slide-in-from-right duration-500">
                <Button variant="ghost" onClick={() => setView('list')} className="mb-6 pl-0 hover:text-moto-accent text-gray-500 group">
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> TARTIŞMALARA DÖN
                </Button>

                <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden mb-8 shadow-xl">
                    <div className="p-8 border-b border-gray-100 bg-gray-50">
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-moto-accent text-black text-xs font-bold uppercase rounded-md shadow-lg shadow-moto-accent/20">{selectedTopic.category}</span>
                            <span className="text-xs text-gray-500 font-mono">{selectedTopic.date}</span>
                            {selectedTopic.category === 'Teknik' && (
                                <span className="flex items-center gap-1 text-green-600 text-xs font-bold px-2 py-1 bg-green-50 rounded border border-green-200">
                                    <CheckCircle2 className="w-3 h-3" /> ÇÖZÜLDÜ
                                </span>
                            )}
                        </div>

                        <h1 className="text-2xl md:text-4xl font-display font-black text-gray-900 mb-6 leading-tight">{selectedTopic.title}</h1>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                            <div
                                className="flex items-center gap-4 cursor-pointer group"
                                onClick={() => { if (onViewProfile) onViewProfile(selectedTopic.authorId); }}
                            >
                                <div className="rounded-xl shadow-md border border-gray-200 overflow-hidden group-hover:scale-105 transition-transform p-0.5 bg-white">
                                    <UserAvatar name={selectedTopic.authorName} size={48} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className={`font-bold group-hover:text-moto-accent text-gray-900 transition-colors`}>{selectedTopic.authorName}</span>
                                        {selectedTopic.authorId.includes('admin') && <ShieldAlert className="w-4 h-4 text-moto-accent" />}
                                    </div>
                                    <div className="text-xs text-gray-500">Konu Sahibi</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={(e) => handleLike(e, selectedTopic.id)}
                                    className="bg-white border border-gray-200 hover:border-moto-accent hover:text-moto-accent px-4 py-2 rounded-xl flex items-center gap-2 text-gray-700 text-sm font-bold transition-all shadow-sm"
                                >
                                    <Heart className="w-4 h-4" /> {selectedTopic.likes}
                                </button>
                                <div className="bg-white border border-gray-200 px-4 py-2 rounded-xl flex items-center gap-2 text-gray-500 text-sm font-bold shadow-sm">
                                    <Eye className="w-4 h-4" /> {selectedTopic.views}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 md:p-12 text-gray-700 leading-loose text-lg min-h-[200px] whitespace-pre-wrap">
                        {selectedTopic.content}
                    </div>

                    <div className="p-8 bg-gray-50 border-t border-gray-200">
                        <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                            <MessageSquare className="w-5 h-5 text-moto-accent" /> {t('forum.comments')} ({selectedTopic.comments.length})
                        </h3>

                        <div className="space-y-6 mb-12">
                            {selectedTopic.comments.map((comment, i) => (
                                <div key={comment.id} className="flex gap-4 group">
                                    <div
                                        className="flex-shrink-0 cursor-pointer hover:scale-105 transition-transform pt-2"
                                        onClick={() => { if (onViewProfile) onViewProfile(comment.authorId); }}
                                    >
                                        <UserAvatar name={comment.authorName} size={40} />
                                    </div>
                                    <div className="flex-1">
                                        <div className={`bg-white border border-gray-200 p-5 rounded-2xl rounded-tl-none relative shadow-sm group-hover:shadow-md transition-all ${i === 0 && selectedTopic.category === 'Teknik' ? 'border-green-200 bg-green-50' : ''}`}>
                                            <div className="flex justify-between items-center mb-2">
                                                <span
                                                    className={`font-bold text-sm cursor-pointer hover:text-moto-accent text-gray-900`}
                                                    onClick={() => { if (onViewProfile) onViewProfile(comment.authorId); }}
                                                >
                                                    {comment.authorName}
                                                </span>
                                                <span className="text-[10px] text-gray-400 font-mono">{comment.date}</span>
                                            </div>
                                            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>

                                            {i === 0 && selectedTopic.category === 'Teknik' && (
                                                <div className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-100 px-2 py-1 rounded border border-green-200">
                                                    <CheckCircle2 className="w-3 h-3" /> EN İYİ CEVAP
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {user ? (
                            <div className="sticky bottom-6 z-30">
                                <div className="relative flex gap-4 items-start bg-white/90 backdrop-blur-xl border border-gray-200 p-4 rounded-2xl shadow-xl ring-1 ring-black/5">
                                    <div className="flex-shrink-0 pt-1">
                                        <UserAvatar name={user.name} size={36} />
                                    </div>
                                    <div className="flex-1 relative">
                                        <textarea
                                            value={commentText}
                                            onChange={(e) => setCommentText(e.target.value)}
                                            placeholder="Bu konuya katkıda bulun..."
                                            className="w-full bg-transparent border-none focus:ring-0 text-gray-900 placeholder-gray-400 min-h-[40px] max-h-[150px] resize-none py-2"
                                        />
                                        <div className="flex justify-between items-center mt-2 border-t border-gray-100 pt-2">
                                            <span className="text-[10px] text-gray-400">Markdown desteklenir</span>
                                            <button
                                                onClick={handleAddComment}
                                                disabled={!commentText.trim()}
                                                className="bg-moto-accent text-black px-4 py-1.5 rounded-lg hover:bg-black hover:text-white disabled:opacity-50 transition-all text-xs font-bold flex items-center gap-2"
                                            >
                                                {t('common.send')} <Send className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white border border-gray-200 p-8 rounded-2xl text-center shadow-sm">
                                <Lock className="w-8 h-8 text-gray-400 mx-auto mb-4" />
                                <h4 className="text-gray-900 font-bold mb-2">{t('forum.login_to_post')}</h4>
                                <p className="text-gray-500 text-sm mb-6">{t('forum.login_desc')}</p>
                                <Button variant="outline" onClick={onOpenAuth} className="border-gray-300 text-gray-700 hover:bg-gray-50">{t('nav.login')}</Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">

            {view === 'list' && (
                <div className="flex flex-col items-center mb-10">
                    <h1 className="text-4xl font-display font-black text-gray-900 leading-none mb-4 flex items-center gap-3">
                        GARAGE<span className="text-moto-accent">TALK</span>
                        <MessageSquare className="w-8 h-8 text-moto-accent" />
                    </h1>
                    <p className="text-gray-500 max-w-lg text-center text-sm md:text-base">
                        Teknik sorular, rota önerileri ve ekipman sohbetleri için buluşma noktası.
                    </p>
                </div>
            )}

            {view === 'list' ? (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-3">
                        {renderTopicList()}
                    </div>
                    <div className="lg:col-span-1">
                        {renderSidebar()}
                    </div>
                </div>
            ) : (
                renderDetail()
            )}
        </div>
    );
};
