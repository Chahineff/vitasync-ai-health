import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Extend Window interface for Web Speech API
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface UseSpeechToTextReturn {
  startListening: () => Promise<void>;
  stopListening: () => void;
  isListening: boolean;
  isConnecting: boolean;
  transcript: string;
  partialTranscript: string;
  isSupported: boolean;
  error: string | null;
}

export function useSpeechToText(): UseSpeechToTextReturn {
  const [isListening, setIsListening] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [partialTranscript, setPartialTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Web Speech API refs
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  // ElevenLabs fallback refs
  const websocketRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  
  // Check Web Speech API support
  const webSpeechSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  
  // Check if browser supports required APIs for fallback
  const elevenLabsSupported = typeof navigator !== 'undefined' && 
    'mediaDevices' in navigator && 
    'getUserMedia' in navigator.mediaDevices;

  const isSupported = webSpeechSupported || elevenLabsSupported;

  const cleanup = useCallback(() => {
    // Stop Web Speech API
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore errors during cleanup
      }
      recognitionRef.current = null;
    }

    // Stop audio processing
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    
    // Close audio context
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    // Stop media stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    // Close WebSocket
    if (websocketRef.current) {
      if (websocketRef.current.readyState === WebSocket.OPEN) {
        websocketRef.current.close();
      }
      websocketRef.current = null;
    }
    
    setIsListening(false);
    setIsConnecting(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Start with Web Speech API (primary method - free)
  const startWebSpeechListening = useCallback(() => {
    setIsConnecting(true);
    setError(null);
    setTranscript('');
    setPartialTranscript('');

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'fr-FR';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        console.log('Web Speech API started');
        setIsListening(true);
        setIsConnecting(false);
        toast.success("Dictée vocale activée");
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        setPartialTranscript(interimTranscript);
        
        if (finalTranscript) {
          setTranscript(prev => prev + (prev ? ' ' : '') + finalTranscript.trim());
          setPartialTranscript('');
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Web Speech API error:', event.error);
        
        if (event.error === 'not-allowed') {
          setError('Accès au microphone refusé. Veuillez autoriser l\'accès.');
          toast.error('Accès au microphone refusé');
        } else if (event.error === 'no-speech') {
          // Restart on no-speech to keep listening
          try {
            recognition.start();
          } catch (e) {
            // Already started, ignore
          }
          return;
        } else if (event.error === 'network') {
          setError('Erreur réseau. Vérifiez votre connexion.');
          toast.error('Erreur réseau');
        } else {
          setError(`Erreur: ${event.error}`);
        }
        
        cleanup();
      };

      recognition.onend = () => {
        console.log('Web Speech API ended');
        if (isListening && recognitionRef.current) {
          // Auto-restart if still supposed to be listening
          try {
            recognition.start();
          } catch (e) {
            cleanup();
          }
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Error starting Web Speech API:', err);
      setError('Impossible de démarrer la dictée vocale');
      toast.error('Erreur de dictée vocale');
      setIsConnecting(false);
    }
  }, [cleanup, isListening]);

  // Start with ElevenLabs (fallback method)
  const startElevenLabsListening = useCallback(async () => {
    if (!elevenLabsSupported) {
      setError("La dictée vocale n'est pas supportée par votre navigateur.");
      toast.error("La dictée vocale n'est pas supportée par votre navigateur.");
      return;
    }

    setIsConnecting(true);
    setError(null);
    setTranscript('');
    setPartialTranscript('');

    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        } 
      });
      mediaStreamRef.current = stream;

      // Get token from edge function
      const { data, error: tokenError } = await supabase.functions.invoke('elevenlabs-scribe-token');
      
      if (tokenError || !data?.token) {
        throw new Error(tokenError?.message || "Impossible d'obtenir le token de transcription");
      }

      // Connect to ElevenLabs WebSocket
      const wsUrl = `wss://api.elevenlabs.io/v1/speech-to-text/stream?token=${data.token}&model_id=scribe_v2_realtime&language_code=fr`;
      
      const ws = new WebSocket(wsUrl);
      websocketRef.current = ws;

      ws.onopen = () => {
        console.log('ElevenLabs STT WebSocket connected');
        setIsListening(true);
        setIsConnecting(false);
        toast.success("Dictée vocale activée (ElevenLabs)");

        // Set up audio processing
        audioContextRef.current = new AudioContext({ sampleRate: 16000 });
        const source = audioContextRef.current.createMediaStreamSource(stream);
        
        // Use ScriptProcessorNode for audio processing
        const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        processor.onaudioprocess = (e) => {
          if (ws.readyState === WebSocket.OPEN) {
            const inputData = e.inputBuffer.getChannelData(0);
            // Convert Float32Array to Int16Array
            const int16Data = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
              const s = Math.max(-1, Math.min(1, inputData[i]));
              int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
            }
            // Send as base64
            const base64Audio = btoa(String.fromCharCode(...new Uint8Array(int16Data.buffer)));
            ws.send(JSON.stringify({ audio: base64Audio }));
          }
        };

        source.connect(processor);
        processor.connect(audioContextRef.current.destination);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'partial_transcript') {
            setPartialTranscript(data.text || '');
          } else if (data.type === 'committed_transcript' || data.type === 'final_transcript') {
            const text = data.text || '';
            if (text.trim()) {
              setTranscript(prev => prev + (prev ? ' ' : '') + text.trim());
              setPartialTranscript('');
            }
          }
        } catch (e) {
          console.error('Error parsing STT message:', e);
        }
      };

      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        setError('Erreur de connexion à la dictée vocale');
        cleanup();
      };

      ws.onclose = () => {
        console.log('ElevenLabs STT WebSocket closed');
        cleanup();
      };

    } catch (err) {
      console.error('Error starting ElevenLabs speech-to-text:', err);
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(message);
      toast.error(`Erreur dictée vocale: ${message}`);
      cleanup();
    }
  }, [elevenLabsSupported, cleanup]);

  const startListening = useCallback(async () => {
    if (!isSupported) {
      setError("La dictée vocale n'est pas supportée par votre navigateur.");
      toast.error("La dictée vocale n'est pas supportée par votre navigateur.");
      return;
    }

    // Priority 1: Use Web Speech API (free, low latency)
    if (webSpeechSupported) {
      startWebSpeechListening();
    } else {
      // Fallback: Use ElevenLabs
      await startElevenLabsListening();
    }
  }, [isSupported, webSpeechSupported, startWebSpeechListening, startElevenLabsListening]);

  const stopListening = useCallback(() => {
    cleanup();
    toast.info("Dictée vocale arrêtée");
  }, [cleanup]);

  return {
    startListening,
    stopListening,
    isListening,
    isConnecting,
    transcript,
    partialTranscript,
    isSupported,
    error,
  };
}
