
import { useCallback, useRef } from 'react';

export const useAppSounds = () => {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        audioCtxRef.current = new AudioContext();
      }
    }
    // Resume context if suspended (browser policy)
    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const playTone = useCallback((freq: number, type: OscillatorType, duration: number, startTime: number = 0, volume: number = 0.1) => {
    try {
        const ctx = initAudio();
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
        
        // Envelope for smooth sound
        gain.gain.setValueAtTime(0, ctx.currentTime + startTime);
        gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + startTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(ctx.currentTime + startTime);
        osc.stop(ctx.currentTime + startTime + duration);
    } catch (e) {
        // Silent fail for audio errors
        console.warn("Audio play failed", e);
    }
  }, [initAudio]);

  // Cyber-tech style short click (High pitched blip)
  const playClick = useCallback(() => {
      // 800Hz sine wave, very short
      playTone(800, 'sine', 0.1, 0, 0.05);
  }, [playTone]);

  // Success / Add to Cart (Futuristic ascending chime)
  const playSuccess = useCallback(() => {
      // Arpeggio: A5 -> C#6
      playTone(880, 'triangle', 0.15, 0, 0.05); 
      playTone(1108, 'triangle', 0.4, 0.1, 0.05);
  }, [playTone]);

  // Hover / Interaction (Subtle high tick)
  const playHover = useCallback(() => {
      playTone(1200, 'sine', 0.03, 0, 0.01);
  }, [playTone]);

  // Error / Alert (Low buzz)
  const playError = useCallback(() => {
      playTone(150, 'sawtooth', 0.2, 0, 0.05);
  }, [playTone]);

  return {
    playClick,
    playSuccess,
    playHover,
    playError
  };
};
