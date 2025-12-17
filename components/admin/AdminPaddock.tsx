
import React from 'react';
import { Trash2, Heart, MessageCircle } from 'lucide-react';
import { SocialPost } from '../../types';

interface AdminPaddockProps {
    posts: SocialPost[];
    handleDelete: (id: string) => void;
}

export const AdminPaddock: React.FC<AdminPaddockProps> = ({ posts, handleDelete }) => {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white">Yarış Paddock (Sosyal Akış)</h2>
                    <p className="text-gray-400 text-sm">Üye paylaşımlarını yönet</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {posts.map((post) => (
                    <div key={post._id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden group hover:border-[#F2A619]/50 transition-all flex flex-col">
                        {post.image && (
                            <div className="relative h-48 flex-shrink-0">
                                <img src={post.image} alt="post" className="w-full h-full object-cover" />
                            </div>
                        )}
                        <div className="p-5 flex flex-col flex-1">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-[#F2A619]">
                                    {post.userName.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-white">{post.userName}</h4>
                                    <span className="text-[10px] text-gray-500">{post.timestamp}</span>
                                </div>
                            </div>

                            <p className="text-gray-300 text-sm mb-4 line-clamp-3">{post.content}</p>

                            <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                                <div className="flex gap-4 text-gray-500 text-xs font-bold">
                                    <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {post.likes}</span>
                                    <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {post.comments}</span>
                                </div>
                                <button
                                    onClick={() => handleDelete(post._id)}
                                    className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                    title="Sil"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {posts.length === 0 && (
                    <div className="col-span-full p-10 text-center text-gray-500 border border-white/10 rounded-2xl border-dashed">
                        Henüz hiç paylaşım yapılmamış.
                    </div>
                )}
            </div>
        </div>
    );
};
