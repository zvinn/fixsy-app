import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { analyzeHomeIssue } from '../aiService';
import aiRateLimiter from '../../utils/rateLimiter';

// Helper for hoisted mocks
const mocks = vi.hoisted(() => ({
    generateContent: vi.fn(),
}));

// Mock Config
vi.mock('../../config/env', () => ({
    env: {
        groq: 'test-groq-key',
        gemini: 'test-gemini-key'
    }
}));

// Mock Toast
vi.mock('react-hot-toast', () => ({
    default: {
        success: vi.fn(),
        error: vi.fn(),
    }
}));

// Mock GoogleGenerativeAI
vi.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
        getGenerativeModel: () => ({
            generateContent: mocks.generateContent
        })
    }))
}));

// Mock Global Fetch for Groq
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Manual LocalStorage Mock
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => { store[key] = value.toString(); }),
        removeItem: vi.fn((key: string) => { delete store[key]; }),
        clear: vi.fn(() => { store = {}; })
    };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('aiService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorageMock.clear();
        mocks.generateContent.mockReset(); // Reset hoisted mock
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should call Groq (fetch) when only text is provided', async () => {
        const mockResponse = {
            choices: [{
                message: {
                    content: JSON.stringify({
                        type: 'Plumbing',
                        advice: 'Check water',
                        tips: [],
                        estimatedPrice: { min: 10, max: 20, currency: 'EGP' },
                        action: { type: 'BOOK' }
                    })
                }
            }]
        };

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse
        });

        const result = await analyzeHomeIssue('Water leak', null, 'en', 'user1');

        expect(mockFetch).toHaveBeenCalledTimes(1);
        expect(result.type).toBe('Plumbing');
        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('api.groq.com'),
            expect.any(Object)
        );
    });

    it.skip('should call Gemini when image is provided', async () => {
        const mockGeminiResponse = {
            response: {
                text: () => JSON.stringify({
                    type: 'Electrical',
                    advice: 'Turn off power',
                    tips: [],
                    estimatedPrice: { min: 50, max: 100, currency: 'EGP' },
                    action: { type: 'BOOK' }
                })
            }
        };
        mocks.generateContent.mockResolvedValueOnce(mockGeminiResponse);

        const result = await analyzeHomeIssue('Sparks', 'data:image/png;base64,abc', 'en', 'user2');

        expect(mocks.generateContent).toHaveBeenCalledTimes(1);
        expect(result.type).toBe('Electrical');
    });

    it('should use fallback logic if API fails', async () => {
        // ... (unchanged)
        mockFetch.mockRejectedValueOnce(new Error('Network Error'));
        const result = await analyzeHomeIssue('Water leak in pipe', null, 'en', 'user3');
        expect(result.type).toBe('Plumbing');
        expect(result.advice).toContain('Turn off water');
    });

    it('should return cached result if available', async () => {
        // 1. Prime cache
        const mockResponse = {
            choices: [{
                message: {
                    content: JSON.stringify({
                        type: 'Carpentry',
                        advice: 'Wood',
                        tips: [],
                        estimatedPrice: { min: 30, max: 40, currency: 'EGP' },
                        action: { type: 'BOOK' }
                    })
                }
            }]
        };
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => mockResponse
        });

        await analyzeHomeIssue('Broken door', null, 'en', 'user4');
        expect(mockFetch).toHaveBeenCalledTimes(1);

        // Debug Cache
        const ls = localStorage.getItem('ai_cache_en_text_Broken door_11');
        console.warn('Cache Content:', ls);

        // 2. Call again with same text
        mockFetch.mockClear();
        const result2 = await analyzeHomeIssue('Broken door', null, 'en', 'user4');

        expect(mockFetch).not.toHaveBeenCalled();
        expect(result2.type).toBe('Carpentry');
    });
});
