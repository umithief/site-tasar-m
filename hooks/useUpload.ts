import { useState } from 'react';
import { api } from '../services/api';

interface UploadResult {
    url: string;
    publicId?: string; // Optional for backend uploads
}

export const useUpload = () => {
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const uploadFile = async (file: File): Promise<UploadResult | null> => {
        setIsUploading(true);
        setUploadProgress(0);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const progress = progressEvent.total
                        ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
                        : 0;
                    setUploadProgress(progress);
                },
            });

            if (response.data.success && response.data.url) {
                setUploadProgress(100);
                return {
                    url: response.data.url,
                    publicId: response.data.url.split('/').pop() // Fake publicID from filename
                };
            } else {
                throw new Error('Upload failed');
            }

        } catch (err: any) {
            console.error('Upload Error:', err);
            setError(err.message || 'Resim yüklenirken bir hata oluştu');
            return null;
        } finally {
            setIsUploading(false);
        }
    };

    const reset = () => {
        setUploadProgress(0);
        setError(null);
        setIsUploading(false);
    };

    return { uploadFile, uploadProgress, isUploading, error, reset };
};
