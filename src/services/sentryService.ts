/**
 * Sentry Error Tracking Service
 * Real-time error monitoring and performance tracking
 * Uses @sentry/react library
 */

import * as Sentry from '@sentry/react';

/**
 * Initialize Sentry error tracking
 * Call this once in index.tsx before ReactDOM.render
 */
export function initializeSentry() {
    const dsn = import.meta.env.VITE_SENTRY_DSN;

    if (!dsn) {
        if (import.meta.env.DEV) {
            console.warn('⚠️ Sentry: DSN not found in environment variables');
        }
        return;
    }

    if (import.meta.env.DEV) {
        console.warn('🐛 Sentry: Development mode - disabled');
        return;
    }

    try {
        Sentry.init({
            dsn,

            // Performance Monitoring
            tracesSampleRate: 0.1, // 10% of transactions for performance

            // Release tracking
            release: import.meta.env.VITE_APP_VERSION || 'development',
            environment: import.meta.env.MODE || 'production',

            // Privacy & Security
            beforeSend(event) {
                // Remove sensitive user data
                if (event.user) {
                    delete event.user.email;
                    delete event.user.ip_address;
                    delete event.user.username;
                }

                // Remove sensitive request data
                if (event.request) {
                    delete event.request.cookies;
                    delete event.request.headers;
                }

                return event;
            },

            // Filter out noise
            ignoreErrors: [
                // Browser extensions
                'top.GLOBALS',
                'originalCreateNotification',
                'canvas.contentDocument',
                'MyApp_RemoveAllHighlights',

                // Random plugins/extensions
                'Can\'t find variable: ZiteReader',
                'jigsaw is not defined',
                'ComboSearch is not defined',

                // Common browser errors
                'ResizeObserver loop limit exceeded',
                'ResizeObserver loop completed with undelivered notifications',
                'Non-Error promise rejection captured',

                // Network errors (handled by app)
                'Network request failed',
                'Failed to fetch',
                'NetworkError',
            ],

            // Ignore specific URLs
            denyUrls: [
                // Browser extensions
                /extensions\//i,
                /^chrome:\/\//i,
                /^moz-extension:\/\//i,
            ],
        });

        console.warn('✅ Sentry initialized');
    } catch (error) {
        console.error('❌ Failed to initialize Sentry:', error);
    }
}

/**
 * Manually capture an exception
 * @param error - Error object
 * @param context - Additional context
 */
export function captureError(
    error: Error,
    context?: Record<string, any>
) {
    if (import.meta.env.DEV) {
        console.error('[Sentry Dev] Error:', error, context);
        return;
    }

    Sentry.captureException(error, {
        extra: context,
        level: 'error'
    });
}

/**
 * Capture a message (non-error)
 * @param message - Message to log
 * @param level - Severity level
 * @param context - Additional context
 */
export function captureMessage(
    message: string,
    level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info',
    context?: Record<string, any>
) {
    if (import.meta.env.DEV) {
        console.warn(`[Sentry Dev] ${level.toUpperCase()}:`, message, context);
        return;
    }

    Sentry.captureMessage(message, {
        level,
        extra: context
    });
}

/**
 * Set user context
 * Call after successful login
 * @param userId - User ID
 * @param metadata - Additional user data (non-PII)
 */
export function setUserContext(
    userId: string,
    metadata?: {
        role?: string;
        tier?: string;
        language?: string;
    }
) {
    if (import.meta.env.DEV) return;

    Sentry.setUser({
        id: userId,
        ...metadata
    });
}

/**
 * Clear user context
 * Call on logout
 */
export function clearUserContext() {
    if (import.meta.env.DEV) return;

    Sentry.setUser(null);
}

/**
 * Add breadcrumb for debugging
 * @param message - Breadcrumb message
 * @param data - Additional data
 */
export function addBreadcrumb(
    message: string,
    category: string = 'custom',
    data?: Record<string, any>
) {
    if (import.meta.env.DEV) return;

    Sentry.addBreadcrumb({
        message,
        category,
        data,
        level: 'info'
    });
}

export default {
    initializeSentry,
    captureError,
    captureMessage,
    setUserContext,
    clearUserContext,
    addBreadcrumb
};
