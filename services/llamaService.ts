
// This service has been deprecated/removed per user request.
// Keeping file as placeholder to avoid import errors if any refs remain.

export const llamaService = {
    async loadModel(onProgress: (progress: number, text: string) => void) {
        console.warn("Llama service is disabled.");
    },
    
    async sendMessage(text: string, history: any[]) {
        return "Llama 3 is currently disabled.";
    },

    isLoaded: () => false
};
