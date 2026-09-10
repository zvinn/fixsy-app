// src/utils/__tests__/rateLimiter.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RateLimiter } from '../rateLimiter';

describe('RateLimiter', () => {
    let rateLimiter: RateLimiter;
    const userId = 'test-user-123';

    beforeEach(() => {
        vi.useFakeTimers();
        localStorage.clear();
        rateLimiter = new RateLimiter(5, 60000); // 5 requests per minute
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('check()', () => {
        it('should allow requests within limit', () => {
            const result1 = rateLimiter.check(userId);
            const result2 = rateLimiter.check(userId);
            const result3 = rateLimiter.check(userId);

            expect(result1.allowed).toBe(true);
            expect(result2.allowed).toBe(true);
            expect(result3.allowed).toBe(true);
        });

        it('should block requests exceeding limit', () => {
            // Use up all 5 requests
            for (let i = 0; i < 5; i++) {
                rateLimiter.check(userId);
            }

            // 6th request should be blocked
            const result = rateLimiter.check(userId);
            expect(result.allowed).toBe(false);
            expect(result.remainingTime).toBeGreaterThan(0);
        });

        it('should reset after time window expires', () => {
            // Use up all requests
            for (let i = 0; i < 5; i++) {
                rateLimiter.check(userId);
            }

            // Advance time by 61 seconds
            vi.advanceTimersByTime(61000);

            // Should be allowed again
            const result = rateLimiter.check(userId);
            expect(result.allowed).toBe(true);
        });

        it('should track different users separately', () => {
            const user1 = 'user-1';
            const user2 = 'user-2';

            // Use up user1's requests
            for (let i = 0; i < 5; i++) {
                rateLimiter.check(user1);
            }

            // user2 should still be allowed
            const result = rateLimiter.check(user2);
            expect(result.allowed).toBe(true);
        });

        it('should allow requests for null/undefined userId', () => {
            const result = rateLimiter.check(null);
            expect(result.allowed).toBe(true);
        });
    });

    describe('cleanup()', () => {
        it('should remove expired entries', () => {
            // Add some requests
            rateLimiter.check(userId);
            expect(rateLimiter.requests.size).toBe(1);

            // Advance time past the interval
            vi.advanceTimersByTime(61000);

            // Cleanup should remove expired entries
            rateLimiter.cleanup();
            expect(rateLimiter.requests.size).toBe(0);
        });
    });
});
