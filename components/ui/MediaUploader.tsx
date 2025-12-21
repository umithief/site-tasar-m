import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, X, UploadCloud, Loader2 } from 'lucide-react';
import { useUpload } from '../../hooks/useUpload';

interface MediaUploaderProps {
    onUploadComplete: (url: string) => void;
    onUploadError?: (error: string) => void;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({ onUploadComplete, onUploadError }) => {
    const { uploadFile, uploadProgress, isUploading, error, reset } = useUpload();
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Preview
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);

        try {
            const result = await uploadFile(file);
            if (result?.url) {
                onUploadComplete(result.url);
            }
        } catch (err: any) {
            if (onUploadError) onUploadError(err.message);
        }
    };

    const handleRemove = () => {
        setPreview(null);
        reset();
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="w-full">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
            />

            <AnimatePresence>
                {!preview && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors group relative"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                    >
                        <ImageIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </motion.button>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {preview && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="relative mt-4 rounded-2xl overflow-hidden bg-black/50 border border-white/10 group"
                    >
                        <img src={preview} alt="Preview" className={`w-full max-h-[300px] object-cover ${isUploading ? 'opacity-50 blur-sm' : ''}`} />

                        {/* Remove Button */}
                        <button
                            onClick={handleRemove}
                            className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-red-500 rounded-full text-white transition-colors backdrop-blur-md"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        {/* Loading Overlay */}
                        {isUploading && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                >
                                    <Loader2 className="w-8 h-8 text-moto-accent mb-2" />
                                </motion.div>
                                <div className="w-1/2 h-1 bg-white/20 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-moto-accent"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                                <span className="text-xs font-mono text-white mt-2">{uploadProgress}%</span>
                            </div>
                        )}

                        {error && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-4 text-center">
                                <p className="text-red-500 text-sm font-bold">{error}</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
