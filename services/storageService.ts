
import { CONFIG } from './config';
import { delay } from './db';

export const storageService = {
    /**
     * Uploads a file to MinIO backend or returns Base64/Blob for Mock mode.
     * @param file The File object to upload
     * @returns Promise resolving to the file URL
     */
    async uploadFile(file: File): Promise<string> {
        if (CONFIG.USE_MOCK_API) {
            // MOCK MODE
            await delay(1000); // Simulate upload time

            return new Promise((resolve, reject) => {
                // If it is a video, strictly return a Blob URL for local preview (Base64 is too heavy)
                if (file.type.startsWith('video/')) {
                    const videoUrl = URL.createObjectURL(file);
                    resolve(videoUrl);
                    return;
                }

                // If it is an image, compress and resize
                if (file.type.startsWith('image/')) {
                    const img = new Image();
                    img.src = URL.createObjectURL(file);
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        
                        // Resize logic: Max 1000px width/height
                        const MAX_SIZE = 1000;
                        let width = img.width;
                        let height = img.height;

                        if (width > height) {
                            if (width > MAX_SIZE) {
                                height *= MAX_SIZE / width;
                                width = MAX_SIZE;
                            }
                        } else {
                            if (height > MAX_SIZE) {
                                width *= MAX_SIZE / height;
                                height = MAX_SIZE;
                            }
                        }

                        canvas.width = width;
                        canvas.height = height;
                        
                        if (ctx) {
                            ctx.drawImage(img, 0, 0, width, height);
                            // Compress to JPEG with 0.7 quality to save space
                            const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                            resolve(dataUrl);
                        } else {
                            reject(new Error("Canvas context creation failed"));
                        }
                    };
                    img.onerror = (error) => reject(error);
                } else {
                    // Fallback for other types
                    resolve(URL.createObjectURL(file));
                }
            });
        } else {
            // REAL BACKEND MODE: Upload to MinIO
            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await fetch(`${CONFIG.API_URL}/upload`, {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error('Dosya yükleme başarısız.');
                }

                const data = await response.json();
                return data.url; // Returns the public URL from MinIO
            } catch (error) {
                console.error("Storage Upload Error:", error);
                throw error;
            }
        }
    }
};
