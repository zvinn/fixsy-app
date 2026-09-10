// src/utils/rateLimiter.ts
import safeLocalStorage from './safeLocalStorage';

interface RateLimitResult {
    allowed: boolean;
    remainingTime?: number;
}

class RateLimiter {
    public limit: number;
    public interval: number;
    public requests: Map<string, number[]>;

    constructor(limit: number = 10, interval: number = 60000) {
        this.limit = limit; // Max requests
        this.interval = interval; // Time window in ms (1 minute)
        this.requests = new Map<string, number[]>(); // Store user requests: userId -> [timestamp1, timestamp2, ...]
        this.loadFromStorage();
    }

    // Load state from localStorage on init
    private loadFromStorage(): void {
        try {
            const stored = safeLocalStorage.getItem('fixsy_rate_limit');
            if (stored) {
                const parsed: Record<string, number[]> = JSON.parse(stored);
                const now = Date.now();
                // Rehydrate Map but filter out old entries immediately
                for (const [userId, timestamps] of Object.entries(parsed)) {
                    const valid = timestamps.filter((t: number) => now - t < this.interval);
                    if (valid.length > 0) {
                        this.requests.set(userId, valid);
                    }
                }
            }
        } catch (e) {
            if (import.meta.env.DEV) {
                console.warn('Failed to load rate limit state', e);
            }
        }
    }

    // Save state to localStorage
    private saveToStorage(): void {
        try {
            const obj = Object.fromEntries(this.requests);
            safeLocalStorage.setItem('fixsy_rate_limit', JSON.stringify(obj));
        } catch (e) {
            // Ignore storage errors
        }
    }

    public check(userId: string | null | undefined): RateLimitResult {
        if (!userId) return { allowed: true }; // Skip if no user ID provided (or handle globally)

        const now = Date.now();
        const userRequests = this.requests.get(userId) || [];

        // Filter out requests older than the interval
        const recentRequests = userRequests.filter((timestamp: number) => now - timestamp < this.interval);

        if (recentRequests.length >= this.limit) {
            return {
                allowed: false,
                remainingTime: Math.ceil((this.interval - (now - recentRequests[0])) / 1000)
            };
        }

        // Add current request
        recentRequests.push(now);
        this.requests.set(userId, recentRequests);

        // Persist update
        this.saveToStorage();

        return { allowed: true };
    }

    // Optional: Clean up old entries periodically to prevent memory leaks
    public cleanup(): void {
        const now = Date.now();
        this.requests.forEach((timestamps: number[], userId: string) => {
            const valid = timestamps.filter((t: number) => now - t < this.interval);
            if (valid.length === 0) {
                this.requests.delete(userId);
            } else {
                this.requests.set(userId, valid);
            }
        });
    }
}

// Singleton instance
const aiRateLimiter = new RateLimiter(10, 60000); // 10 requests per minute

export { RateLimiter };
export default aiRateLimiter;
