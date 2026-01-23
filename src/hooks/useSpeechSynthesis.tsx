import { useState, useCallback, useRef, useEffect } from 'react';

interface UseSpeechSynthesisReturn {
  speak: (text: string) => void;
  stop: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
}

export function useSpeechSynthesis(): UseSpeechSynthesisReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (isSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSupported]);

  const speak = useCallback((text: string) => {
    if (!isSupported) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Clean markdown and special characters
    const cleanText = text
      .replace(/\[\[PRODUCT:[^\]]+\]\]/g, '') // Remove product tags
      .replace(/[#*_`~]/g, '') // Remove markdown symbols
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Replace links with text
      .replace(/\n+/g, '. ') // Replace newlines with pauses
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'fr-FR';
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Try to find a French voice
    const voices = window.speechSynthesis.getVoices();
    const frenchVoice = voices.find(voice => voice.lang.startsWith('fr'));
    if (frenchVoice) {
      utterance.voice = frenchVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isSupported]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  return { speak, stop, isSpeaking, isSupported };
}
