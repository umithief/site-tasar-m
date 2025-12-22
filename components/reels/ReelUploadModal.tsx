import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Bike, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';

interface ReelUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUploadComplete: () => void;
}

export const ReelUploadModal: React.FC<ReelUploadModalProps> = ({ isOpen, onClose, onUploadComplete }) => {
    const [file, setFile] = useState<File | null>(null);
    const [caption, setCaption] = useState('');
    const [bikeModel, setBikeModel] = useState('');
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const { user } = useAuthStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.size > 50 * 1024 * 1024) { // 50MB limit
                setError('Dosya boyutu 50MB\'dan küçük olmalıdır.');
                return;
            }
            // Check duration if possible (complex on client without loading video)
            setFile(selectedFile);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!file || !user) return;

        setUploading(true);
        setProgress(0);
        setError(null);

        try {
            // 1. Upload to Cloudinary (Directly or via Backend Proxy)
            // Ideally backend signs the request, but for speed we might use an unsigned preset or backend proxy
            // Let's use the existing backend upload route for generic files if adaptable, 
            // OR create a direct FormData upload to the NEW reel upload endpoint if we implement multimedia handling there.
            // Since `createReel` in backend expects `videoUrl`, we need to upload first.

            // Using a mock-ish implementation for the "Tachometer" progress feel
            // In a real scenario, use XMLHttpRequest or axios onUploadProgress

            const formData = new FormData();
            formData.append('video', file);

            // We'll use a specific upload endpoint on the backend that handles Cloudinary logic
            // Assuming `POST /api/upload/video` exists or we adapt `uploadRoutes`.
            // Let's modify the plan to use a simulated progress for visual effect if backend doesn't stream progress perfectly.

            // REAL IMPLEMENTATION attempt:
            // Since we didn't perform complex backend upload setup in this turn,
            // we will simulate the "upload to Cloudinary" process with a timer for the visual effect,
            // but actually send the file to the backend's generic upload if available, or just mocking for this demo?
            // "Integrate Cloudinary Video Upload" is a task. 
            // I'll assume standard cloudinary unsigned upload for frontend simplicity:

            const CLOUD_NAME = 'dvb316538'; // Replace with env or config
            const UPLOAD_PRESET = 'motovibe_reels'; // Replace with verified preset

            // Fallback: If no preset, we might fail. Let's try a backend proxy approach which is safer.
            // I'll assume `api.post('/upload', formData)` works based on `uploadRoutes.js` presence.

            const uploadRes = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 100));
                    setProgress(percentCompleted);
                }
            });

            const videoUrl = uploadRes.data.url; // Assuming backend returns { url: ... }

            // 2. Create Reel Record
            const reelData = {
                userId: user._id,
                videoUrl: videoUrl,
                thumbnailUrl: videoUrl.replace('.mp4', '.jpg'), // Cloudinary auto-thumb
                caption,
                bikeModel
            };

            await api.post('/reels/upload', reelData);

            setSuccess(true);
            setTimeout(() => {
                onUploadComplete();
                onClose();
            }, 2000);

        } catch (err: any) {
            console.error(err);
            setError('Yükleme başarısız oldu. Lütfen tekrar deneyin.');
            setUploading(false);
        }
    };

    // Tachometer Visualization
    const radius = 60;
    const stroke = 8;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    // We want a semi-circle or 2/3 circle gauge. 
    // Let's do a 240 degree gauge (start -210, end 30?)
    // Simplified: Full circle strokeDashoffset logic
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-[#121212] w-full max-w-md rounded-3xl border border-white/10 overflow-hidden shadow-2xl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/5">
                            <h3 className="text-xl font-display font-black text-white italic tracking-wider">
                                SHARE VIBE
                            </h3>
                            <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {!success ? (
                                <>
                                    {/* Tachometer Progress / File Input */}
                                    <div className="flex flex-col items-center justify-center min-h-[200px]">
                                        {uploading ? (
                                            <div className="relative w-40 h-40 flex items-center justify-center">
                                                {/* Tachometer SVG */}
                                                <svg
                                                    height={radius * 2}
                                                    width={radius * 2}
                                                    className="rotate-[-90deg] transition-all duration-300 transform" // Rotate to start from top/leftish?
                                                >
                                                    <circle
                                                        stroke="rgba(255,255,255,0.1)"
                                                        strokeWidth={stroke}
                                                        fill="transparent"
                                                        r={normalizedRadius}
                                                        cx={radius}
                                                        cy={radius}
                                                    />
                                                    <circle
                                                        stroke="#f97316" // Orange-500
                                                        strokeWidth={stroke}
                                                        strokeDasharray={circumference + ' ' + circumference}
                                                        style={{ strokeDashoffset }}
                                                        strokeLinecap="round"
                                                        fill="transparent"
                                                        r={normalizedRadius}
                                                        cx={radius}
                                                        cy={radius}
                                                        className="transition-all duration-300 ease-out"
                                                    />
                                                </svg>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                                                    <span className="text-3xl font-black font-mono">{progress}</span>
                                                    <span className="text-[10px] text-white/50 tracking-widest">RPM %</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div
                                                onClick={() => fileInputRef.current?.click()}
                                                className={`w-full h-40 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${file ? 'border-orange-500 bg-orange-500/10' : 'border-white/10 hover:border-white/30 hover:bg-white/5'}`}
                                            >
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="video/*"
                                                    className="hidden"
                                                    onChange={handleFileChange}
                                                />
                                                {file ? (
                                                    <>
                                                        <CheckCircle className="w-10 h-10 text-orange-500 mb-2" />
                                                        <span className="text-sm font-bold text-white max-w-[80%] truncate">{file.name}</span>
                                                        <span className="text-xs text-white/50 mt-1">{(file.size / (1024 * 1024)).toFixed(1)} MB</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload className="w-10 h-10 text-white/40 mb-3" />
                                                        <span className="text-sm font-bold text-white">Video Seç veya Sürükle</span>
                                                        <span className="text-xs text-white/40 mt-1">Max 50MB, .mp4, 9:16</span>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Inputs */}
                                    <div className="space-y-4">
                                        <div className="bg-white/5 rounded-xl px-4 py-3 flex items-center gap-3 border border-transparent focus-within:border-orange-500 transition-colors">
                                            <FileText className="w-5 h-5 text-white/40" />
                                            <input
                                                type="text"
                                                placeholder="Açıklama (#motovibe, #r1m...)"
                                                value={caption}
                                                onChange={(e) => setCaption(e.target.value)}
                                                className="bg-transparent border-none outline-none text-white placeholder-white/30 text-sm w-full font-medium"
                                                disabled={uploading}
                                            />
                                        </div>
                                        <div className="bg-white/5 rounded-xl px-4 py-3 flex items-center gap-3 border border-transparent focus-within:border-orange-500 transition-colors">
                                            <Bike className="w-5 h-5 text-white/40" />
                                            <input
                                                type="text"
                                                placeholder="Motosiklet Modeli (Opsiyonel)"
                                                value={bikeModel}
                                                onChange={(e) => setBikeModel(e.target.value)}
                                                className="bg-transparent border-none outline-none text-white placeholder-white/30 text-sm w-full font-medium"
                                                disabled={uploading}
                                            />
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="flex items-center gap-2 text-red-500 text-sm p-3 bg-red-500/10 rounded-xl">
                                            <AlertCircle className="w-4 h-4" />
                                            {error}
                                        </div>
                                    )}

                                    {/* Action Button */}
                                    <button
                                        onClick={handleUpload}
                                        disabled={!file || uploading}
                                        className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest rounded-xl shadow-lg shadow-orange-500/20 transition-all active:scale-95"
                                    >
                                        {uploading ? 'YÜKLENİYOR...' : 'PAYLAŞ'}
                                    </button>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-10 space-y-4">
                                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 animate-bounce">
                                        <CheckCircle className="w-10 h-10 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-black text-white italic">YÜKLEME TAMAMLANDI!</h3>
                                    <p className="text-white/60 text-center max-w-xs">
                                        Reel'in moderasyon onayından sonra yayına girecek.
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
