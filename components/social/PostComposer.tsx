import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, MapPin, Gauge, X, Loader2 } from 'lucide-react';
import { UserAvatar } from '../ui/UserAvatar';
import { socialService } from '../../services/socialService';
import { MediaUploader } from '../ui/MediaUploader';

interface PostComposerProps {
    currentUser: any;
    onPostCreate: (content: string, mediaUrl: string | null, rideStats?: any, location?: string) => Promise<void>;
}

export const PostComposer: React.FC<PostComposerProps> = ({ currentUser, onPostCreate }) => {
    const [content, setContent] = useState('');
    const [mediaUrl, setMediaUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [stats, setStats] = useState<any>(null);
    const [location, setLocation] = useState<string | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [content]);

    // Handle toggle stats
    const toggleStats = async () => {
        if (stats) {
            setStats(null);
        } else {
            // Simulate fetching ride stats
            const rideData = await socialService.getLatestRideActivity();
            if (rideData) setStats(rideData);
        }
    };

    // Handle toggle location
    const toggleLocation = () => {
        if (location) {
            setLocation(null);
        } else {
            // Mock location for demo
            setLocation("İstanbul, Türkiye");
        }
    };

    const handleSubmit = async () => {
        if (!content.trim() && !mediaUrl) return;
        setIsSubmitting(true);
        try {
            await onPostCreate(content, mediaUrl, stats, location || undefined);
            setContent('');
            setMediaUrl(null);
            setStats(null);
            setLocation(null);
        } catch (error) {
            console.error("Post failed", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl mx-auto bg-[#0F0F0F] border border-[#27272A] rounded-[2rem] p-6 mb-8 shadow-2xl relative overflow-hidden group"
        >
            {/* Top Section */}
            <div className="flex gap-4 items-start">
                <UserAvatar src={currentUser?.avatar} name={currentUser?.name} size={48} className="ring-2 ring-white/5" />
                <div className="flex-1">
                    <textarea
                        ref={textareaRef}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Sürüş hislerini paylaş..."
                        className="w-full bg-transparent text-lg text-white placeholder-zinc-500 outline-none resize-none min-h-[60px] leading-relaxed max-h-[300px] overflow-y-auto custom-scrollbar"
                    />
                </div>
            </div>

            {/* Media Preview Grid */}
            <AnimatePresence>
                {mediaUrl && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pl-[64px]"
                    >
                        <div className="relative rounded-2xl overflow-hidden border border-white/10 group/media">
                            <img src={mediaUrl} alt="Preview" className="w-full h-auto max-h-[400px] object-cover" />
                            <button
                                onClick={() => setMediaUrl(null)}
                                className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors opacity-0 group-hover/media:opacity-100"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Dynamic Badges */}
            <div className="flex flex-wrap gap-2 mt-4 pl-[64px] min-h-[28px]">
                <AnimatePresence>
                    {location && (
                        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="bg-zinc-800 border border-white/5 text-zinc-300 px-3 py-1 rounded-full text-xs flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-[#E2FF3B]" />
                            {location}
                            <button onClick={() => setLocation(null)} className="ml-1 hover:text-white"><X className="w-3 h-3" /></button>
                        </motion.div>
                    )}
                    {stats && (
                        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="bg-zinc-800 border border-white/5 text-zinc-300 px-3 py-1 rounded-full text-xs flex items-center gap-1.5">
                            <Gauge className="w-3 h-3 text-[#E2FF3B]" />
                            <span>{stats.distance}km • {stats.maxSpeed}km/h</span>
                            <button onClick={() => setStats(null)} className="ml-1 hover:text-white"><X className="w-3 h-3" /></button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>


            {/* Toolbar & Action */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/5 pl-[64px]">
                <div className="flex items-center gap-1">
                    {/* Media Upload */}
                    <div className="relative group/icon">
                        <MediaUploader
                            onUploadComplete={setMediaUrl}
                            onUploadError={(e) => alert(e)}
                            showPreview={false}
                            trigger={
                                <button
                                    className={`p-2 rounded-full transition-colors ${mediaUrl ? 'text-[#E2FF3B] bg-[#E2FF3B]/10' : 'text-zinc-500 hover:text-[#E2FF3B] hover:bg-white/5'}`}
                                    title="Fotoğraf Ekle"
                                >
                                    <ImageIcon className="w-5 h-5" />
                                </button>
                            }
                        />
                    </div>

                    <button
                        onClick={toggleLocation}
                        className={`p-2 rounded-full transition-colors ${location ? 'text-[#E2FF3B] bg-[#E2FF3B]/10' : 'text-zinc-500 hover:text-[#E2FF3B] hover:bg-white/5'}`}
                        title="Konum Ekle"
                    >
                        <MapPin className="w-5 h-5" />
                    </button>

                    <button
                        onClick={toggleStats}
                        className={`p-2 rounded-full transition-colors ${stats ? 'text-[#E2FF3B] bg-[#E2FF3B]/10' : 'text-zinc-500 hover:text-[#E2FF3B] hover:bg-white/5'}`}
                        title="Sürüş Verisi Ekle"
                    >
                        <Gauge className="w-5 h-5" />
                    </button>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSubmit}
                    disabled={(!content && !mediaUrl) || isSubmitting}
                    className="bg-[#E2FF3B] text-black font-bold px-6 py-2 rounded-full text-sm shadow-lg shadow-[#E2FF3B]/10 hover:shadow-[0_0_20px_rgba(226,255,59,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    PAYLAŞ
                </motion.button>
            </div>


        </motion.div>
    );
};
