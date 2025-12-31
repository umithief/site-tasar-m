import React, { useState, useEffect } from 'react';
import { ForumTopic, User } from '../../types';
import { TopicCard } from './TopicCard';
import { NewTopicModal } from './NewTopicModal';
import { TopicDetailModal } from './TopicDetailModal';
import { forumService } from '../../services/forumService';
import { useLanguage } from '../../contexts/LanguageProvider';
import { Plus, Search, MessageSquare } from 'lucide-react';

interface ForumProps {
    onNavigate: (view: any) => void;
    user: User | null;
    onOpenAuth: () => void;
}

export const Forum: React.FC<ForumProps> = ({ onNavigate, user, onOpenAuth }) => {
    const { t } = useLanguage();
    const [topics, setTopics] = useState<ForumTopic[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('Tümü');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState<ForumTopic | null>(null);

    const categories = ['Tümü', 'Genel', 'Teknik', 'Gezi', 'Ekipman', 'Etkinlik'];

    useEffect(() => {
        loadTopics();
    }, []);

    const loadTopics = async () => {
        setLoading(true);
        try {
            const data = await forumService.getTopics();
            setTopics(data);
        } catch (error) {
            console.error('Failed to load topics:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTopic = async (title: string, content: string, category: any) => {
        if (!user) return;
        try {
            const newTopic = await forumService.createTopic(user, title, content, category, []);
            setTopics(prev => [newTopic, ...prev]);
        } catch (error) {
            console.error('Failed to create topic:', error);
        }
    };

    const handleTopicClick = (topic: ForumTopic) => {
        setSelectedTopic(topic);
    };

    const filteredTopics = topics.filter(topic => {
        const matchesSearch = topic.title.toLowerCase().includes(search.toLowerCase()) ||
            topic.content.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = activeCategory === 'Tümü' || topic.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-bold font-display text-white mb-2">MotoVibe Forum</h2>
                    <p className="text-gray-400">Toplulukla etkileşime geç, sorular sor ve deneyimlerini paylaş.</p>
                </div>

                <div className="flex w-full md:w-auto gap-3">
                    <div className="relative flex-1 md:w-64">
                        <input
                            type="text"
                            placeholder={t('forum.search_placeholder')}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-[#1A1A1C] border border-white/10 rounded-lg px-4 py-2.5 pl-10 text-white focus:border-moto-accent focus:outline-none"
                        />
                        <Search size={18} className="absolute left-3 top-3 text-gray-500" />
                    </div>

                    <button
                        onClick={() => user ? setIsCreateModalOpen(true) : onOpenAuth()}
                        className="flex items-center gap-2 bg-moto-accent text-black px-6 py-2.5 rounded-lg font-bold hover:bg-white transition-colors whitespace-nowrap"
                    >
                        <Plus size={20} />
                        {t('forum.create_topic')}
                    </button>
                </div>
            </div>

            {/* Categories */}
            <div className="flex overflow-x-auto pb-4 mb-6 gap-2 no-scrollbar">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${activeCategory === cat
                            ? 'bg-white text-black'
                            : 'bg-[#1A1A1C] text-gray-400 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-[#121214] h-48 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : filteredTopics.length === 0 ? (
                <div className="text-center py-20 bg-[#121214] rounded-2xl border border-dashed border-white/10">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageSquare size={32} className="text-gray-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Henüz konu yok</h3>
                    <p className="text-gray-400">İlk konuyu açan sen ol!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTopics.map(topic => (
                        <TopicCard
                            key={topic._id}
                            topic={topic}
                            onClick={handleTopicClick}
                        />
                    ))}
                </div>
            )}

            <NewTopicModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateTopic}
            />

            <TopicDetailModal
                isOpen={!!selectedTopic}
                onClose={() => setSelectedTopic(null)}
                topic={selectedTopic}
                user={user}
            />
        </div>
    );
};
