// src/utils/sanitizers.ts
/**
 * Input sanitization utilities
 * Prevents XSS and injection attacks
 */

/**
 * Sanitize HTML to prevent XSS attacks
 */
export const sanitizeHtml = (input: string): string => {
    if (!input || typeof input !== 'string') return '';

    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
};

/**
 * Sanitize user input (remove dangerous characters)
 */
export const sanitizeInput = (input: string): string => {
    if (!input || typeof input !== 'string') return '';

    return input
        .trim()
        .replace(/[<>]/g, '') // Remove angle brackets
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, ''); // Remove event handlers
};

/**
 * Sanitize SQL input (prevent SQL injection)
 */
export const sanitizeSql = (input: string): string => {
    if (!input || typeof input !== 'string') return '';

    return input
        .replace(/--/g, '')
        .replace(/;/g, '')
        .replace(/'/g, "''")
        .replace(/"/g, '""');

};

/**
 * Sanitize filename
 */
export const sanitizeFilename = (filename: string): string => {
    if (!filename || typeof filename !== 'string') return 'file';

    return filename
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .replace(/\.{2,}/g, '.')
        .substring(0, 255);
};

/**
 * Sanitize URL
 */
export const sanitizeUrl = (url: string): string => {
    if (!url || typeof url !== 'string') return '';

    try {
        const parsed = new URL(url);

        // Only allow http/https
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            return '';
        }

        return parsed.toString();
    } catch {
        return '';
    }
};

/**
 * Strip HTML tags completely
 */
export const stripHtmlTags = (input: string): string => {
    if (!input || typeof input !== 'string') return '';

    return input.replace(/<[^>]*>/g, '');
};

/**
 * Sanitize for display in HTML context
 */
export const sanitizeForDisplay = (input: string): string => {
    return stripHtmlTags(sanitizeHtml(input));
};

/**
 * Sanitize phone number (keep only digits and +)
 */
export const sanitizePhone = (phone: string): string => {
    if (!phone || typeof phone !== 'string') return '';

    return phone.replace(/[^\d+]/g, '');
};

/**
 * Sanitize email (lowercase and trim)
 */
export const sanitizeEmail = (email: string): string => {
    if (!email || typeof email !== 'string') return '';

    return email.trim().toLowerCase();
};
