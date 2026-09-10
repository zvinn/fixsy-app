// src/aiService.ts
// HYBRID AI: Groq (Text) + Gemini (Images) 🚀
// This provides the best of both worlds: Speed of Llama 3 and Vision of Gemini.

import { GoogleGenerativeAI } from "@google/generative-ai";
import aiRateLimiter from '../utils/rateLimiter';
import toast from 'react-hot-toast';
import { env } from '../config/env';
import type { AIAnalysisResult } from '../types';
import fallbackLogic from './fallbackLogic';
import safeLocalStorage from '../utils/safeLocalStorage';

// API Keys accessed via env service
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

// Configuration
const TEXT_MODEL = "llama-3.3-70b-versatile"; // Groq
const IMAGE_MODEL = "gemini-2.0-flash";       // Gemini (Experimental)

// --- CACHING LOGIC ---
const generateCacheKey = (text: string, hasImage: boolean, language: string) => {
    return `ai_cache_${language}_${hasImage ? 'img' : 'text'}_${text.trim().substring(0, 50)}_${text.length}`;
};

const getFromCache = (key: string): AIAnalysisResult | null => {
    try {
        const item = safeLocalStorage.getItem(key);
        if (!item) return null;
        const { value, timestamp } = JSON.parse(item);
        if (Date.now() - timestamp > 24 * 60 * 60 * 1000) { // 24h expiry
            safeLocalStorage.removeItem(key);
            return null;
        }
        return value;
    } catch { return null; }
};

const saveToCache = (key: string, value: AIAnalysisResult) => {
    try {
        safeLocalStorage.setItem(key, JSON.stringify({ value, timestamp: Date.now() }));
    } catch (e) { console.warn("Cache full"); }
};

export const analyzeHomeIssue = async (textDescription: string, imageFile: string | null = null, language: string = 'ar', userId: string = 'anonymous'): Promise<AIAnalysisResult> => {

    const limitCheck = aiRateLimiter.check(userId);
    if (!limitCheck.allowed) {
        const msg = language === 'ar'
            ? `عفواً، لقد تجاوزت حد الاستخدام (10 طلبات/دقيقة). حاول بعد ${limitCheck.remainingTime} ثانية.`
            : `Rate limit exceeded (10 req/min). Try again in ${limitCheck.remainingTime}s.`;
        toast.error(msg);
        throw new Error("RATE_LIMIT_EXCEEDED");
    }

    // Check Cache
    const cacheKey = generateCacheKey(textDescription, !!imageFile, language);
    const cachedResult = getFromCache(cacheKey);
    if (cachedResult) {
        // ✅ Serving from cache (removed console.log)
        return cachedResult;
    }

    let result: AIAnalysisResult | null = null;

    // DECISION ENGINE:
    if (imageFile) {
        // ✅ Image analysis route (removed console.log)
        result = await analyzeWithGemini(textDescription, imageFile, language);
    } else {
        // ✅ Text analysis route (removed console.log)
        result = await analyzeWithGroq(textDescription, language);
    }

    // Save to Cache if valid result
    if (result && result.type) {
        saveToCache(cacheKey, result);
    }

    // Since analyze functions might return fallback (which is valid), we return result directly.
    return result as AIAnalysisResult;
};

// --- STRATEGY 1: GROQ (Text) ---
async function analyzeWithGroq(textDescription: string, language: string): Promise<AIAnalysisResult> {
    const apiKey = env.groq;
    if (!apiKey) return fallbackLogic(textDescription, language);

    // ✅ Setup AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
        const isAr = language === 'ar';
        const systemMessage = isAr ?
            `أنت مساعد خبير في صيانة المنازل.
             يجب أن يكون ردك عبارة عن JSON فقط.
             الشكل المطلوب:
             {
               "type": "التخصص (سباكة/كهرباء/نجارة/تكييف/نقاشة/أجهزة/دش/صيانة عامة)",
               "advice": "نصيحة أمان فورية",
               "tips": ["خطوة 1", "خطوة 2", "خطوة 3"],
               "estimatedPrice": { "min": 50, "max": 150, "currency": "EGP" },
               "action": { "type": "BOOK_REQUEST", "service": "أجهزة منزلية" }
             }`
            :
            `You are an expert home maintenance assistant. Reply ONLY in JSON format.
             Required Format:
             {
               "type": "Category (Plumbing/Electricity/Carpentry/AC/Painting/Appliance/Dish/General)",
               "advice": "Immediate safety advice",
               "tips": ["Step 1", "Step 2", "Step 3"],
               "estimatedPrice": { "min": 50, "max": 150, "currency": "EGP" },
               "action": { "type": "BOOK_REQUEST", "service": "Plumbing" } 
             }`;

        const payload = {
            model: TEXT_MODEL,
            messages: [
                { role: "system", content: systemMessage },
                { role: "user", content: textDescription }
            ],
            temperature: 0.5,
            response_format: { type: "json_object" }
        };

        const response = await fetch(GROQ_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
            body: JSON.stringify(payload),
            signal: controller.signal // ✅ Add abort signal
        });

        clearTimeout(timeoutId); // ✅ Clear timeout on success

        if (!response.ok) throw new Error(`Groq Error: ${response.statusText}`);

        const data = await response.json();
        const content = data.choices[0].message.content;
        return JSON.parse(content);

    } catch (error) {
        clearTimeout(timeoutId); // ✅ Clear timeout on error

        // ✅ Handle timeout specifically
        if (error instanceof Error && error.name === 'AbortError') {
            const { errorLogger } = await import('../services/errorLogger');
            errorLogger.logError(new Error('Groq AI request timeout (30s)'), {
                context: 'Groq AI Service - Timeout',
                severity: 'high'
            });
            return fallbackLogic(textDescription, language);
        }

        // ✅ Use centralized error logging for other errors
        const { errorLogger } = await import('../services/errorLogger');
        errorLogger.logError(error instanceof Error ? error : new Error(String(error)), {
            context: 'Groq AI Service',
            severity: 'high'
        });
        return fallbackLogic(textDescription, language);
    }
}

// --- STRATEGY 2: GEMINI (Vision) ---
async function analyzeWithGemini(textDescription: string, imageFile: string, language: string): Promise<AIAnalysisResult> {
    const apiKey = env.gemini;
    if (!apiKey) return fallbackLogic(textDescription, language);

    // *Graceful Fallback* if Gemini hits limit -> user must retry later
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: IMAGE_MODEL });

        const isAr = language === 'ar';
        const prompt = isAr ?
            `حلل هذه الصورة وهذا الوصف: "${textDescription}".
             حدد نوع المشكلة بدقة.
             الرد JSON فقط: {"type": "...", "advice": "...", "tips": ["..."], "estimatedPrice": {"min": 50, "max": 150, "currency": "EGP"}, "action": {"type":"BOOK...","service":"..."}}`
            :
            `Analyze this image and description: "${textDescription}".
             Identify the trade category.
             Reply JSON only: {"type": "...", "advice": "...", "tips": ["..."], "estimatedPrice": {"min": 50, "max": 150, "currency": "EGP"}, "action": {"type":"BOOK...","service":"..."}}`;

        // Convert base64 data URL to Part object
        const matches = imageFile.match(/^data:(.+);base64,(.+)$/);
        if (!matches) throw new Error("Invalid Image Format");

        const imagePart = {
            inlineData: {
                data: matches[2],
                mimeType: matches[1]
            }
        };

        // ✅ Add timeout using Promise.race
        const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Gemini AI request timeout (30s)')), 30000)
        );

        const result = await Promise.race([
            model.generateContent([prompt, imagePart]),
            timeoutPromise
        ]);

        const response = await result.response;
        const text = response.text();

        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned);

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        // ✅ Handle timeout specifically
        if (errorMessage.includes('timeout')) {
            const { errorLogger } = await import('../services/errorLogger');
            errorLogger.logError(new Error('Gemini AI request timeout (30s)'), {
                context: 'Gemini Vision Analysis - Timeout',
                severity: 'high'
            });
            return fallbackLogic(textDescription, language);
        }

        // ✅ Use centralized error logging
        const { errorLogger } = await import('../services/errorLogger');
        errorLogger.logError(error instanceof Error ? error : new Error(String(error)), {
            severity: 'medium',
            context: 'Gemini Vision Analysis'
        });

        // If Quota exceeded, fallback to text-only analysis via Groq!
        if (errorMessage.includes("429") || errorMessage.includes("Quota")) {
            if (import.meta.env.DEV) {
                console.warn("⚠️ Gemini Quota Exceeded. Falling back to Groq (Text Only mode).");
            }
            return analyzeWithGroq(textDescription + " [Image analysis failed]", language);
        }

        return fallbackLogic(textDescription, language);
    }
}


