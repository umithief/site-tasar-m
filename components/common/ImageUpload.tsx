import React, { useCallback, useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageUploadProps {
    label: string;
    value?: string;
    onChange: (url: string) => void;
    className?: string; // Additional classes
    aspectRatio?: 'square' | 'video' | 'cover';
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
    label,
    value,
    onChange,
    className = '',
    aspectRatio = 'square'
}) => {
    const [isDragActive, setIsDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const processFile = (file: File) => {
        // Validation
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            alert('File is too large! Max 10MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Resize logic
                const MAX_WIDTH = 1000;
                const MAX_HEIGHT = 1000;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                // Compress to JPEG with 0.7 quality
                // This significantly reduces size compared to raw PNG/base64
                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                onChange(compressedBase64);
            };
            if (event.target?.result) {
                img.src = event.target.result as string;
            }
        };
        reader.readAsDataURL(file);
    };

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragActive(true);
        } else if (e.type === 'dragleave') {
            setIsDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    }, [onChange]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    const onButtonClick = () => {
        inputRef.current?.click();
    };

    const getHeightClass = () => {
        switch (aspectRatio) {
            case 'video': return 'h-48';
            case 'cover': return 'h-40 md:h-64';
            case 'square': default: return 'h-32 w-32';
        }
    };

    return (
        <div className={`space-y-4 ${className}`}>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                {label}
            </label>

            <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={onButtonClick}
                className={`relative group cursor-pointer border-2 border-dashed rounded-xl overflow-hidden transition-all duration-300
                ${isDragActive ? 'border-moto-accent bg-moto-accent/10' : 'border-white/10 hover:border-white/20 hover:bg-white/5'}
                ${getHeightClass()} ${aspectRatio === 'square' ? 'rounded-full mx-auto' : ''}
                `}
            >
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleChange}
                />

                {value ? (
                    <div className="relative w-full h-full">
                        <img src={value} alt="Upload" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Upload className="w-6 h-6 text-white" />
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange('');
                            }}
                            className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-red-500/80 transition-colors"
                        >
                            <X className="w-4 h-4 text-white" />
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-2">
                        <ImageIcon className={`w-8 h-8 opacity-50 ${isDragActive ? 'animate-bounce text-moto-accent' : ''}`} />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-center px-4">
                            {isDragActive ? 'Drop it like it\'s hot' : 'Click or Drag Image'}
                        </p>
                    </div>
                )}
            </div>

            {/* Fallback URL Input just in case */}
            {!value && (
                <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg border border-white/5 focus-within:border-white/20 transition-colors">
                    <div className="text-gray-500 text-xs">URL:</div>
                    <input
                        type="text"
                        placeholder="https://..."
                        className="bg-transparent border-none outline-none text-xs text-white w-full placeholder-gray-700"
                        onBlur={(e) => {
                            if (e.target.value) onChange(e.target.value);
                        }}
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
};
