/**
 * Google Analytics Service
 * Tracks user behavior and page views
 * Uses react-ga4 library
 */

import ReactGA from 'react-ga4';

class AnalyticsService {
    private initialized = false;
    private readonly isDevelopment = import.meta.env.DEV;

    /**
     * Initialize Google Analytics
     * Call this once in App.tsx on mount
     */
    initialize() {
        const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

        if (!measurementId) {
            if (this.isDevelopment) {
                console.warn('⚠️ Google Analytics: Measurement ID not found in env');
            }
            return;
        }

        if (this.isDevelopment) {
            console.warn('📊 Analytics: Development mode - tracking disabled');
            return;
        }

        try {
            ReactGA.initialize(measurementId, {
                gaOptions: {
                    anonymizeIp: true, // GDPR compliance
                    cookieFlags: 'SameSite=None;Secure'
                },
                gtagOptions: {
                    send_page_view: false // Manual page view tracking
                }
            });

            this.initialized = true;
            if (import.meta.env.DEV) {
                console.warn('✅ Google Analytics initialized');
            }
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error('❌ Failed to initialize Google Analytics:', error);
            }
        }
    }

    /**
     * Track page views
     * @param path - Current page path
     * @param title - Page title (optional)
     */
    trackPageView(path: string, title?: string) {
        if (!this.initialized || this.isDevelopment) return;

        ReactGA.send({
            hitType: 'pageview',
            page: path,
            title: title || document.title
        });
    }

    /**
     * Track custom events
     * @param category - Event category (e.g., 'Booking', 'Search')
     * @param action - Event action (e.g., 'Submit', 'Query')
     * @param label - Event label (optional)
     * @param value - Event value (optional)
     */
    trackEvent(
        category: string,
        action: string,
        label?: string,
        value?: number
    ) {
        if (!this.initialized || this.isDevelopment) return;

        ReactGA.event({
            category,
            action,
            label,
            value
        });
    }

    // ==================== Business Events ====================

    /**
     * Track booking submission
     */
    trackBooking(technicianId: string, service: string, price?: number) {
        this.trackEvent('Booking', 'Submit', service, price);

        // Also send as conversion for Google Ads
        if (!this.isDevelopment) {
            ReactGA.gtag('event', 'conversion', {
                send_to: 'AW-CONVERSION_ID', // Replace with actual conversion ID
                value: price || 0,
                currency: 'EGP',
                transaction_id: `booking_${Date.now()}`
            });
        }
    }

    /**
     * Track search queries
     */
    trackSearch(query: string, resultsCount?: number) {
        this.trackEvent('Search', 'Query', query, resultsCount);
    }

    /**
     * Track AI usage
     */
    trackAIUsage(type: 'text' | 'image', success: boolean) {
        this.trackEvent('AI', 'Analyze', type, success ? 1 : 0);
    }

    /**
     * Track user authentication
     */
    trackAuth(action: 'login' | 'signup' | 'logout', method: string) {
        this.trackEvent('Auth', action, method);
    }

    /**
     * Track payment
     */
    trackPayment(method: string, amount: number, success: boolean) {
        this.trackEvent('Payment', success ? 'Success' : 'Failed', method, amount);
    }

    /**
     * Track technician rating
     */
    trackRating(rating: number, technicianId: string) {
        this.trackEvent('Rating', 'Submit', technicianId, rating);
    }

    /**
     * Track errors (user-facing errors)
     */
    trackError(errorMessage: string, errorContext?: string) {
        this.trackEvent('Error', errorMessage, errorContext);
    }

    /**
     * Set user ID for tracking
     * Call after successful login
     */
    setUserId(userId: string) {
        if (!this.initialized || this.isDevelopment) return;

        ReactGA.set({ userId });
    }

    /**
     * Set user properties
     */
    setUserProperties(properties: {
        role?: 'client' | 'tech' | 'admin';
        tier?: 'basic' | 'premium' | 'vip';
        language?: string;
    }) {
        if (!this.initialized || this.isDevelopment) return;

        ReactGA.set(properties);
    }

    /**
     * Clear user data (on logout)
     */
    clearUser() {
        if (!this.initialized || this.isDevelopment) return;

        ReactGA.set({ userId: undefined });
    }
}

// Export singleton instance
export const analytics = new AnalyticsService();
export default analytics;
