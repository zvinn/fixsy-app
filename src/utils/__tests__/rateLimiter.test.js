import aiRateLimiter from '../rateLimiter';

describe('RateLimiter Utility', () => {
    beforeEach(() => {
        // Clear storage and memory before each test
        localStorage.clear();
        aiRateLimiter.requests = new Map();
        aiRateLimiter.limit = 5; // Set lower limit for testing
        aiRateLimiter.interval = 1000; // 1 second interval
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    test('should allow requests under the limit', () => {
        const userId = 'user_123';

        // Make 4 requests (limit is 5)
        expect(aiRateLimiter.check(userId).allowed).toBe(true);
        expect(aiRateLimiter.check(userId).allowed).toBe(true);
        expect(aiRateLimiter.check(userId).allowed).toBe(true);
        expect(aiRateLimiter.check(userId).allowed).toBe(true);
    });

    test('should block requests exceeding the limit', () => {
        const userId = 'user_456';

        // 5 allowed requests
        for (let i = 0; i < 5; i++) {
            aiRateLimiter.check(userId);
        }

        // 6th request should be blocked
        const result = aiRateLimiter.check(userId);
        expect(result.allowed).toBe(false);
        expect(result.remainingTime).toBeGreaterThan(0);
    });

    test('should reset limit after interval expires', () => {
        const userId = 'user_789';

        // Exhaust limit
        for (let i = 0; i < 5; i++) {
            aiRateLimiter.check(userId);
        }
        expect(aiRateLimiter.check(userId).allowed).toBe(false);

        // Fast-forward time past interval (1000ms + buffer)
        vi.advanceTimersByTime(1100);

        // Should be allowed again
        expect(aiRateLimiter.check(userId).allowed).toBe(true);
    });

    test('should persist state to localStorage', () => {
        const userId = 'user_storage';
        aiRateLimiter.check(userId);

        const stored = localStorage.getItem('fixsy_rate_limit');
        expect(stored).toBeTruthy();
        expect(JSON.parse(stored)[userId]).toHaveLength(1);
    });
});
