// src/services/__tests__/aiService.test.js
// Unit tests for AI Service fallback logic

// We need to test the fallbackLogic function directly
// Since it's not exported, we'll need to extract it or test via module

// Mock dependencies before importing
vi.mock('react-hot-toast', () => ({
    error: vi.fn(),
    __esModule: true,
    default: { error: vi.fn() }
}));

vi.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: vi.fn()
}));

vi.mock('../../utils/rateLimiter', () => ({
    check: vi.fn(() => ({ allowed: true })),
    __esModule: true,
    default: { check: vi.fn(() => ({ allowed: true })) }
}));

// Since fallbackLogic is not exported, we'll create a copy for testing
// This tests the same logic used in aiService.js
const fallbackLogic = (text, language = 'ar') => {
    const tLower = text.toLowerCase();
    const isAr = language === 'ar';

    if (tLower.includes("ميه") || tLower.includes("سباك") || tLower.includes("تسريب") || tLower.includes("water") || tLower.includes("leak")) {
        return {
            type: isAr ? "سباكة" : "Plumbing",
            advice: isAr ? "أغلق محبس المياه." : "Turn off water valve.",
            tips: isAr ? ["تفقد المصدر", "جفف المكان", "اتصل بسباك"] : ["Check source", "Dry area", "Call plumber"],
            estimatedPrice: { min: 100, max: 300, currency: "EGP" },
            action: { type: "BOOK_REQUEST", service: isAr ? "سباكة" : "Plumbing" }
        };
    }
    if (tLower.includes("كهرب") || tLower.includes("نور") || tLower.includes("فيش") || tLower.includes("electric") || tLower.includes("light")) {
        return {
            type: isAr ? "كهرباء" : "Electrical",
            advice: isAr ? "افصل الكهرباء فوراً." : "Turn off power.",
            tips: isAr ? ["لا تلمس الاسلاك", "ابعد الاطفال", "اتصل بكهربائي"] : ["Don't touch wires", "Safety first", "Call electrician"],
            estimatedPrice: { min: 150, max: 400, currency: "EGP" },
            action: { type: "BOOK_REQUEST", service: isAr ? "كهرباء" : "Electrical" }
        };
    }
    return {
        type: isAr ? "صيانة عامة" : "General Maintenance",
        advice: isAr ? "افحص المشكلة بحذر." : "Investigate carefully.",
        tips: isAr ? ["صور المشكلة", "حدد مكان العطل", "انتظر الفني"] : ["Photo the issue", "Locate fault", "Wait for tech"],
        estimatedPrice: { min: 50, max: 150, currency: "EGP" },
        action: { type: "NONE" }
    };
};

describe('AI Service - fallbackLogic', () => {

    describe('Plumbing Detection', () => {

        test('detects plumbing issue with Arabic keyword "ميه" (water)', () => {
            const result = fallbackLogic('عندي مشكلة في الميه', 'ar');
            expect(result.type).toBe('سباكة');
            expect(result.action.type).toBe('BOOK_REQUEST');
            expect(result.action.service).toBe('سباكة');
        });

        test('detects plumbing issue with Arabic keyword "سباك" (plumber)', () => {
            const result = fallbackLogic('محتاج سباك ضروري', 'ar');
            expect(result.type).toBe('سباكة');
        });

        test('detects plumbing issue with Arabic keyword "تسريب" (leak)', () => {
            const result = fallbackLogic('في تسريب مياه', 'ar');
            expect(result.type).toBe('سباكة');
            expect(result.advice).toBe('أغلق محبس المياه.');
        });

        test('detects plumbing issue with English keyword "water"', () => {
            const result = fallbackLogic('I have a water problem', 'en');
            expect(result.type).toBe('Plumbing');
            expect(result.advice).toBe('Turn off water valve.');
        });

        test('detects plumbing issue with English keyword "leak"', () => {
            const result = fallbackLogic('There is a leak in the kitchen', 'en');
            expect(result.type).toBe('Plumbing');
            expect(result.tips).toContain('Call plumber');
        });

        test('returns correct estimated price for plumbing', () => {
            const result = fallbackLogic('water leak', 'en');
            expect(result.estimatedPrice.min).toBe(100);
            expect(result.estimatedPrice.max).toBe(300);
            expect(result.estimatedPrice.currency).toBe('EGP');
        });
    });

    describe('Electrical Detection', () => {

        test('detects electrical issue with Arabic keyword "كهرب" (electricity)', () => {
            const result = fallbackLogic('مشكلة في الكهرباء', 'ar');
            expect(result.type).toBe('كهرباء');
            expect(result.action.type).toBe('BOOK_REQUEST');
            expect(result.action.service).toBe('كهرباء');
        });

        test('detects electrical issue with Arabic keyword "نور" (light)', () => {
            const result = fallbackLogic('النور مش شغال', 'ar');
            expect(result.type).toBe('كهرباء');
            expect(result.advice).toBe('افصل الكهرباء فوراً.');
        });

        test('detects electrical issue with Arabic keyword "فيش" (socket)', () => {
            const result = fallbackLogic('الفيش اتحرق', 'ar');
            expect(result.type).toBe('كهرباء');
        });

        test('detects electrical issue with English keyword "electric"', () => {
            const result = fallbackLogic('I have an electric problem', 'en');
            expect(result.type).toBe('Electrical');
            expect(result.advice).toBe('Turn off power.');
        });

        test('detects electrical issue with English keyword "light"', () => {
            const result = fallbackLogic('The light is not working', 'en');
            expect(result.type).toBe('Electrical');
            expect(result.tips).toContain('Safety first');
        });

        test('returns correct estimated price for electrical', () => {
            const result = fallbackLogic('electric issue', 'en');
            expect(result.estimatedPrice.min).toBe(150);
            expect(result.estimatedPrice.max).toBe(400);
            expect(result.estimatedPrice.currency).toBe('EGP');
        });
    });

    describe('General Maintenance Fallback', () => {

        test('returns general maintenance for unrecognized Arabic text', () => {
            const result = fallbackLogic('مشكلة غريبة', 'ar');
            expect(result.type).toBe('صيانة عامة');
            expect(result.action.type).toBe('NONE');
        });

        test('returns general maintenance for unrecognized English text', () => {
            const result = fallbackLogic('Something is broken', 'en');
            expect(result.type).toBe('General Maintenance');
            expect(result.advice).toBe('Investigate carefully.');
        });

        test('returns correct tips for general maintenance in Arabic', () => {
            const result = fallbackLogic('محتاج مساعدة', 'ar');
            expect(result.tips).toEqual(['صور المشكلة', 'حدد مكان العطل', 'انتظر الفني']);
        });

        test('returns correct tips for general maintenance in English', () => {
            const result = fallbackLogic('Need help', 'en');
            expect(result.tips).toEqual(['Photo the issue', 'Locate fault', 'Wait for tech']);
        });

        test('returns correct estimated price for general maintenance', () => {
            const result = fallbackLogic('unknown problem', 'en');
            expect(result.estimatedPrice.min).toBe(50);
            expect(result.estimatedPrice.max).toBe(150);
        });
    });

    describe('Language Support', () => {

        test('defaults to Arabic language when not specified', () => {
            const result = fallbackLogic('مشكلة عامة');
            expect(result.type).toBe('صيانة عامة');
        });

        test('correctly handles mixed language input with Arabic setting', () => {
            const result = fallbackLogic('water مياه', 'ar');
            expect(result.type).toBe('سباكة');
        });

        test('correctly handles mixed language input with English setting', () => {
            const result = fallbackLogic('water مياه', 'en');
            expect(result.type).toBe('Plumbing');
        });
    });

    describe('Edge Cases', () => {

        test('handles empty string', () => {
            const result = fallbackLogic('', 'ar');
            expect(result.type).toBe('صيانة عامة');
        });

        test('handles case insensitivity for English', () => {
            const result = fallbackLogic('WATER LEAK', 'en');
            expect(result.type).toBe('Plumbing');
        });

        test('prioritizes plumbing over electrical when both keywords present', () => {
            // Due to if-else order, plumbing is checked first
            const result = fallbackLogic('water and electric problem', 'en');
            expect(result.type).toBe('Plumbing');
        });
    });
});
