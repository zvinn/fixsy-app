// src/services/aiService.v2.ts
// 🔒 Secure Version using Firebase Cloud Functions
// Switch to this service after deploying 'functions/'

import { getFunctions, httpsCallable } from "firebase/functions";
import aiRateLimiter from '../utils/rateLimiter';
import toast from 'react-hot-toast';
import { ChatMessage, UserAIProfile } from '../types';

const functions = getFunctions();

interface AIAnalysisResult {
    type: string;
    advice: string;
    tips: string[];
    estimatedPrice: { min: number; max: number; currency: string };
    action: { type: string; service?: string };
}

interface CloudFunctionResponse {
    success: boolean;
    analysis: AIAnalysisResult;
}

export const analyzeHomeIssue = async (textDescription: string, imageFile: string | null = null, language: string = 'ar', userId: string = 'anonymous'): Promise<AIAnalysisResult> => {

    try {
        // ✅ Cloud function call (removed console.log)

        // Call Cloud Function
        const analyzeProblemFn = httpsCallable<any, CloudFunctionResponse>(functions, 'analyzeProblem');

        // Prepare Payload
        const payload = {
            description: textDescription,
            imageBase64: imageFile || null,
            language
        };

        const response = await analyzeProblemFn(payload);
        const result = response.data;

        if (result.success) {
            return result.analysis;
        } else {
            throw new Error("AI Analysis Failed on Server");
        }

    } catch (error: unknown) {
        const isFirebaseError = (err: unknown): err is { code: string } => {
            return typeof err === 'object' && err !== null && 'code' in err;
        };

        if (isFirebaseError(error) && error.code === 'resource-exhausted') {
            toast.error(language === 'ar' ? "تجاوزت حد الاستخدام، حاول بعد قليل" : "Rate limit exceeded. Please wait a minute.");
            throw new Error("RATE_LIMIT_EXCEEDED");
        }
        console.error("Cloud Function Error:", error);
        toast.error(language === 'ar' ? "حدث خطأ في الاتصال بالخادم" : "Server connection failed");
        throw error;
    }
};

/**
 * Secure Chat Proxy
 */
export const chatWithIA = async (messages: ChatMessage[], userProfile: UserAIProfile = {}, language: string = 'ar'): Promise<string> => {
    try {
        const chatFn = httpsCallable<Record<string, unknown>, { success: boolean; response: string }>(functions, 'chatWithFixsy');
        const response = await chatFn({ messages, userProfile });

        if (response.data.success) {
            return response.data.response;
        } else {
            throw new Error("Chat failed");
        }
    } catch (error: unknown) {
        const isFirebaseError = (err: unknown): err is { code: string } => {
            return typeof err === 'object' && err !== null && 'code' in err;
        };

        if (isFirebaseError(error) && error.code === 'resource-exhausted') {
            toast.error(language === 'ar' ? "تجاوزت حد الاستخدام، حاول بعد قليل" : "Rate limit exceeded. Please wait a minute.");
        }
        throw error;
    }
};
