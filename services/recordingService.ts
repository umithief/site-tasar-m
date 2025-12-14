import { record } from 'rrweb';
import { SessionRecording, User } from '../types';
import { DB, getStorage, setStorage } from './db';
import { authService } from './auth';

// Store events in memory before saving to avoid heavy IO
let eventsBuffer: any[] = [];
let stopRecording: undefined | (() => void) = undefined;
let startTime = 0;

export const recordingService = {
    start: async () => {
        // Prevent multiple recordings
        if (stopRecording) return;

        // Reset buffer
        eventsBuffer = [];
        startTime = Date.now();

        // Admin panelindeyken kaydetme (loop oluşmasın)
        if (window.location.search.includes('admin')) return;

        try {
            stopRecording = record({
                emit(event) {
                    // Push event to buffer
                    eventsBuffer.push(event);
                    
                    // Save periodically every 50 events to prevent data loss
                    if (eventsBuffer.length % 50 === 0) {
                        // Optional: trigger partial save here if needed
                    }
                },
                // Ignore sensitive inputs
                maskAllInputs: true, 
                sampling: {
                    // Throttle mouse move events to save space
                    mousemove: true,
                    mouseInteraction: true, 
                    scroll: 150, 
                    input: 'last' 
                }
            });
            console.log("🎥 RRWeb Session Recording Started");
        } catch (e) {
            console.error("Recording start failed:", e);
        }
    },

    stop: async () => {
        if (stopRecording) {
            stopRecording();
            stopRecording = undefined;
            
            if (eventsBuffer.length > 10) {
                await recordingService.saveSession();
            }
            console.log("🎥 RRWeb Session Recording Stopped");
        }
    },

    saveSession: async () => {
        const user = await authService.getCurrentUser();
        const endTime = Date.now();
        const durationMs = endTime - startTime;
        
        // Format duration
        const minutes = Math.floor(durationMs / 60000);
        const seconds = ((durationMs % 60000) / 1000).toFixed(0);
        const durationStr = `${minutes}:${Number(seconds) < 10 ? '0' : ''}${seconds}`;

        // OPTIMIZATION: Limit event count to prevent LocalStorage overflow
        const MAX_EVENTS = 500;
        let optimizedEvents = eventsBuffer;
        
        // If buffer is too large, keep initial setup events (often at start) and latest interactions
        if (eventsBuffer.length > MAX_EVENTS) {
             const start = eventsBuffer.slice(0, 50);
             const end = eventsBuffer.slice(eventsBuffer.length - (MAX_EVENTS - 50));
             optimizedEvents = [...start, ...end];
        }

        const newRecording: SessionRecording = {
            id: `REC-${Date.now()}`,
            userId: user ? user.id : 'guest',
            userName: user ? user.name : 'Ziyaretçi',
            startTime,
            endTime,
            duration: durationStr,
            events: optimizedEvents,
            device: /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop'
        };

        // Get existing recordings
        let recordings: SessionRecording[] = [];
        try {
            recordings = getStorage<SessionRecording[]>(DB.RECORDINGS, []);
        } catch (e) {
            recordings = [];
        }
        
        // Add new recording to start
        recordings.unshift(newRecording);
        
        // AGGRESSIVE TRIMMING: Keep only latest 2 recordings in LocalStorage environment
        // rrweb data is very heavy
        const trimmedRecordings = recordings.slice(0, 2);
        
        setStorage(DB.RECORDINGS, trimmedRecordings);
        eventsBuffer = []; // Clear buffer
    },

    getRecordings: (): SessionRecording[] => {
        return getStorage<SessionRecording[]>(DB.RECORDINGS, []);
    },

    deleteRecording: (id: string) => {
        const recordings = getStorage<SessionRecording[]>(DB.RECORDINGS, []);
        const filtered = recordings.filter(r => r.id !== id);
        setStorage(DB.RECORDINGS, filtered);
    }
};