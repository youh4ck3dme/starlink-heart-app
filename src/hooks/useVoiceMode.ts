import { useState, useEffect, useRef, useCallback } from 'react';

// Extend Window interface for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const useVoiceMode = () => {
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isEnabled, setIsEnabled] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        // Check support
        const hasRecognition = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
        const hasSynthesis = 'speechSynthesis' in window;
        setIsSupported(!!(hasRecognition && hasSynthesis));

        // Load setting
        const savedSetting = localStorage.getItem('enableVoiceMode') === 'true';
        setIsEnabled(savedSetting);
    }, []);

    const startListening = useCallback((onResult: (text: string) => void) => {
        if (!isSupported) return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.lang = 'sk-SK';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => setIsListening(true);
        
        recognition.onresult = (event: any) => {
            const text = event.results[0][0].transcript;
            onResult(text);
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
        };

        recognition.onend = () => setIsListening(false);

        recognitionRef.current = recognition;
        recognition.start();
    }, [isSupported]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    }, []);

    const speak = useCallback((text: string) => {
        if (!isSupported) return;
        
        // Strip markdown/formatting for cleaner speech
        const cleanText = text.replace(/[*_#\[\]]/g, '');

        // Cancel current speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'sk-SK';
        utterance.rate = 1.0;
        utterance.pitch = 1.0; // Slightly higher pitch for "Starry" feel?

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    }, [isSupported]);

    const stopSpeaking = useCallback(() => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    }, []);

    const toggleVoiceMode = (value: boolean) => {
        setIsEnabled(value);
        localStorage.setItem('enableVoiceMode', String(value));
    };

    return {
        isListening,
        isSpeaking,
        isEnabled,
        isSupported,
        startListening,
        stopListening,
        speak,
        stopSpeaking,
        toggleVoiceMode
    };
};
