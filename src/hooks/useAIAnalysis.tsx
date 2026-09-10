// src/hooks/useAIAnalysis.tsx
import { useState, useCallback } from 'react';
import { db } from '../services/firebase';
import { collection, addDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';
import { User } from 'firebase/auth';
import { Technician, AIAnalysisResult, BookingFormData } from '../types';

// ✅ FIXED: Proper return type for useAIAnalysis
interface UseAIAnalysisReturn {
    aiResult: AIAnalysisResult | null;
    isAnalyzing: boolean;
    aiQuery: string;
    setAiQuery: (query: string) => void;
    aiImage: string | null;
    setAiImage: (image: string | null) => void;
    handleAIImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    analyzeProblem: () => Promise<void>;
    applyAISuggestion: (setSearchTerm: (term: string) => void, onClose: () => void) => void;
    handleSmartBook: (
        technicians: Technician[],
        serviceMap: Record<string, string[]>,
        setSelectedTech: (tech: Technician) => void,
        setFormData: (callback: (prev: BookingFormData) => BookingFormData) => void,
        onClose: () => void
    ) => void;
    clearAIResult: () => void;
}

/**
 * Custom hook for AI-powered problem analysis
 * @param {User | null} user - Current authenticated user
 * @returns {UseAIAnalysisReturn} AI analysis states and functions
 */
export const useAIAnalysis = (user: User | null): UseAIAnalysisReturn => {
    const { language, t } = useLanguage();

    const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
    const [aiQuery, setAiQuery] = useState<string>("");
    const [aiImage, setAiImage] = useState<string | null>(null);

    /**
     * Handle image selection for AI analysis
     * @param {React.ChangeEvent<HTMLInputElement>} e - File input change event
     */
    const handleAIImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAiImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }, []);

    /**
     * Analyze the problem using AI service
     */
    const analyzeProblem = useCallback(async (): Promise<void> => {
        if (!aiQuery) {
            toast.error(t("writeProblem"));
            return; // ✅ Explicit void return
        }
        setIsAnalyzing(true);

        try {
            // Dynamic import to avoid build errors if package is missing
            const { analyzeHomeIssue } = await import('../services/aiService');
            // Cast user.uid or use 'anonymous' safely
            const userId = user?.email || 'anonymous';

            const result = await analyzeHomeIssue(aiQuery, aiImage, language, userId);
            setAiResult(result as AIAnalysisResult);

            // Voice Response (TTS)
            if ('speechSynthesis' in window) {
                const textToSpeak = language === 'ar'
                    ? `${result?.advice || result?.recommendation || ''}`
                    : `Category: ${result?.type || result?.category}. ${result?.advice || result?.recommendation || ''}`;

                const utterance = new SpeechSynthesisUtterance(textToSpeak);
                utterance.lang = language === 'ar' ? 'ar-EG' : 'en-US';
                window.speechSynthesis.speak(utterance);
            }

            // Log for Admin Analytics
            try {
                await addDoc(collection(db, "ai_logs"), {
                    date: new Date().toISOString(),
                    query: aiQuery,
                    type: result.type,
                    hasImage: !!aiImage,
                    userEmail: user ? user.email : "anonymous"
                });
            } catch (err) {
                console.error("Log Error:", err);
            }
        } catch (e) {
            console.error(e);
            toast.error(t("aiError"));
        } finally {
            setIsAnalyzing(false);
        }
        // ✅ FIXED: Explicit void return at end
        return;
    }, [aiQuery, aiImage, language, user, t]);

    /**
     * Apply AI suggestion to filter technicians
     */
    const applyAISuggestion = useCallback((setSearchTerm: (term: string) => void, onClose: () => void) => {
        if (aiResult && aiResult.type !== 'عام') {
            setSearchTerm(aiResult.type || aiResult.category || '');
            toast.success(t("filteredByType", { type: aiResult.type || aiResult.category }));
            onClose();
            setAiResult(null);
            setAiQuery("");
            setAiImage(null);
        } else {
            toast(t("tryManualSearch"));
            onClose();
        }
    }, [aiResult, t]);

    /**
     * Handle smart booking based on AI recommendation
     */
    const handleSmartBook = useCallback((
        technicians: Technician[],
        serviceMap: Record<string, string[]>,
        setSelectedTech: (tech: Technician) => void,
        setFormData: (callback: (prev: BookingFormData) => BookingFormData) => void,
        onClose: () => void
    ) => {
        // Check if action is BOOK_REQUEST
        if (!aiResult || !aiResult.action || aiResult.action !== 'BOOK_REQUEST') return;

        const serviceType = aiResult.type || aiResult.category;
        if (!serviceType) return;

        // Filter techs matching service
        const matchingTechs = technicians.filter(tech => {
            return tech.specialty === serviceType || tech.role === serviceType;
            const tSpecialty = tech.specialty.toLowerCase();
            const sType = serviceType.toLowerCase();
            return tSpecialty.includes(sType) ||
                (serviceMap[sType] && serviceMap[sType].some(k => tSpecialty.includes(k)));
        });

        if (matchingTechs.length === 0) return toast.error(t("noTechsFound"));

        // Sort by Rating (Safe number conversion)
        matchingTechs.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
        const bestTech = matchingTechs[0];

        // Open Booking
        setSelectedTech(bestTech);
        setFormData((prev: BookingFormData) => ({ ...prev, problem: aiQuery }));
        onClose();
        toast.success(`⚡ ${t("smartMatch")}: ${bestTech.name}`);
    }, [aiResult, aiQuery, t]);

    /**
     * Clear AI result and reset state
     */
    const clearAIResult = useCallback(() => {
        setAiResult(null);
        setAiQuery("");
        setAiImage(null);
    }, []);

    // ✅ Properly typed return object
    return {
        aiResult,
        isAnalyzing,
        aiQuery,
        setAiQuery,
        aiImage,
        setAiImage,
        handleAIImageSelect,
        analyzeProblem,
        applyAISuggestion,
        handleSmartBook,
        clearAIResult
    };
};

export default useAIAnalysis;
