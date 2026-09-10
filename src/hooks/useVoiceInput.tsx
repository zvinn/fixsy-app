// src/hooks/useVoiceInput.tsx
import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';

// Web Speech API Types
interface SpeechRecognitionEvent {
    results: SpeechRecognitionResultList;
    resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
    error: string;
    message: string;
}

interface SpeechRecognitionResultList {
    length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
    length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
    isFinal: boolean;
}

interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
}

interface SpeechRecognition extends EventTarget {
    lang: string;
    interimResults: boolean;
    maxAlternatives: number;
    start(): void;
    stop(): void;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onend: (() => void) | null;
}

interface WindowWithSpeechRecognition extends Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
}

export interface VoiceCommand {
    intent: 'book' | 'search';
    service: string | null;
    rawText: string;
}

/**
 * Custom hook for voice input using Web Speech API
 * @returns {object} isListening state and handleVoiceInput function
 */
export const useVoiceInput = () => {
    const { language, t } = useLanguage();
    const [isListening, setIsListening] = useState<boolean>(false);

    /**
     * Start/stop voice recognition
     * @param {function} onResult - Callback with transcript text
     */
    const handleVoiceInput = useCallback((onResult?: (transcript: string, command: VoiceCommand) => void) => {
        const windowWithSR = window as WindowWithSpeechRecognition;
        const SpeechRecognition = windowWithSR.SpeechRecognition || windowWithSR.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            toast.error(t("voiceNotSupported"));
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = language === 'ar' ? 'ar-EG' : 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        if (isListening) {
            recognition.stop();
            setIsListening(false);
            return;
        }

        setIsListening(true);
        recognition.start();

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            const transcript = event.results[0][0].transcript;

            // 🧠 Smart Command Parsing
            const parsedCommand = parseVoiceCommand(transcript, language);

            if (onResult) {
                onResult(transcript, parsedCommand);
            }
            setIsListening(false);
            toast.success(t("voiceRecorded"));
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            // Using logger instead of console
            if (import.meta.env.DEV) {
                console.error("Voice recognition error:", event.error);
            }
            setIsListening(false);
            toast.error(t("voiceError"));
        };

        recognition.onend = () => {
            setIsListening(false);
        };
    }, [language, isListening, t]);

    return { isListening, handleVoiceInput };
};

/**
 * Parse voice transcript to extract booking commands
 * @param {string} transcript - Voice input text
 * @param {string} lang - Current language
 * @returns {object} Parsed command with intent and entities
 */
const parseVoiceCommand = (transcript: string, lang: string): VoiceCommand => {
    const lowerText = transcript.toLowerCase();

    // Define keywords for different intents
    const bookingKeywords = {
        en: ['book', 'need', 'want', 'find', 'get', 'hire', 'call'],
        ar: ['احجز', 'محتاج', 'عايز', 'ابحث', 'جيب', 'اتصل']
    };

    const serviceKeywords: Record<string, { en: string[], ar: string[] }> = {
        plumbing: { en: ['plumber', 'plumbing', 'water', 'pipe', 'leak'], ar: ['سباك', 'سباكة', 'مياه', 'ماسورة', 'تسريب'] },
        electricity: { en: ['electrician', 'electric', 'power', 'wire', 'socket'], ar: ['كهربائي', 'كهرباء', 'سلك', 'بريزة'] },
        ac: { en: ['ac', 'air conditioner', 'cooling', 'hvac'], ar: ['تكييف', 'مكيف', 'تبريد'] },
        carpentry: { en: ['carpenter', 'wood', 'furniture', 'door'], ar: ['نجار', 'خشب', 'أثاث', 'باب'] },
        painting: { en: ['painter', 'paint', 'wall'], ar: ['نقاش', 'دهان', 'حيطة'] }
    };

    const keywords = lang === 'ar' ? bookingKeywords.ar : bookingKeywords.en;
    const isBookingIntent = keywords.some(kw => lowerText.includes(kw));

    // Detect service type
    let detectedService: string | null = null;
    for (const [service, kws] of Object.entries(serviceKeywords)) {
        const langKws = lang === 'ar' ? kws.ar : kws.en;
        if (langKws.some(kw => lowerText.includes(kw))) {
            detectedService = service;
            break;
        }
    }

    return {
        intent: isBookingIntent ? 'book' : 'search',
        service: detectedService,
        rawText: transcript
    };
};

export default useVoiceInput;
