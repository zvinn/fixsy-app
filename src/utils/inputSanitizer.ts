// src/utils/inputSanitizer.ts
/**
 * Input Sanitization Utility
 * Prevents XSS attacks by sanitizing user inputs
 * @module inputSanitizer
 */

/**
 * Sanitizes string input by removing dangerous characters
 * Removes HTML tags, javascript: protocol, and event handlers
 * 
 * @param {string} input - The string to sanitize
 * @returns {string} Sanitized string safe for display
 * 
 * @example
 * ```ts
 * sanitizeString('<script>alert("xss")</script>');
 * // Returns: 'scriptalert("xss")/script'
 * 
 * sanitizeString('Hello <b>World</b>');
 * // Returns: 'Hello bWorld/b'
 * ```
 */
export const sanitizeString = (input: string): string => {
    if (!input) return '';

    return input
        .replace(/[<>]/g, '') // Remove < and >
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, '') // Remove event handlers like onclick=
        .trim();
};

/**
 * Sanitizes HTML to prevent XSS attacks
 * Converts HTML to plain text by encoding entities
 * 
 * @param {string} html - HTML string to sanitize
 * @returns {string} Sanitized HTML safe for rendering
 * 
 * @example
 * ```ts
 * sanitizeHTML('<img src=x onerror=alert(1)>');
 * // Returns: '&lt;img src=x onerror=alert(1)&gt;'
 * ```
 */
export const sanitizeHTML = (html: string): string => {
    if (!html) return '';

    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
};

/**
 * Validates and sanitizes email addresses
 * Converts to lowercase and checks against regex pattern
 * 
 * @param {string} email - Email address to sanitize
 * @returns {string} Sanitized email or empty string if invalid
 * 
 * @example
 * ```ts
 * sanitizeEmail('USER@EXAMPLE.COM');
 * // Returns: 'user@example.com'
 * 
 * sanitizeEmail('invalid-email');
 * // Returns: ''
 * ```
 */
export const sanitizeEmail = (email: string): string => {
    if (!email) return '';

    const sanitized = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(sanitized) ? sanitized : '';
};

/**
 * Validates and sanitizes phone numbers
 * Removes all non-numeric characters except +
 * 
 * @param {string} phone - Phone number to sanitize
 * @returns {string} Sanitized phone number (digits and + only)
 * 
 * @example
 * ```ts
 * sanitizePhone('+1 (555) 123-4567');
 * // Returns: '+15551234567'
 * ```
 */
export const sanitizePhone = (phone: string): string => {
    if (!phone) return '';

    // Remove all non-numeric characters except +
    return phone.replace(/[^\d+]/g, '');
};

/**
 * Sanitizes numeric input
 * Removes all non-numeric characters except decimal point
 * 
 * @param {string} input - Numeric string to sanitize
 * @returns {string} Sanitized numeric string
 * 
 * @example
 * ```ts
 * sanitizeNumeric('$1,234.56');
 * // Returns: '1234.56'
 * ```
 */
export const sanitizeNumeric = (input: string): string => {
    if (!input) return '';

    return input.replace(/[^\d.]/g, '');
};

/**
 * Validates and sanitizes address strings
 * Allows alphanumeric, spaces, common punctuation, and Arabic characters
 * 
 * @param {string} address - Address to sanitize
 * @returns {string} Sanitized address
 * 
 * @example
 * ```ts
 * sanitizeAddress('123 Main St., Cairo مصر');
 * // Returns: '123 Main St., Cairo مصر'
 * 
 * sanitizeAddress('Address<script>alert(1)</script>');
 * // Returns: 'Addressscriptalert1/script'
 * ```
 */
export const sanitizeAddress = (address: string): string => {
    if (!address) return '';

    // Allow alphanumeric, spaces, commas, periods, hyphens
    return address.replace(/[^a-zA-Z0-9\s,.\-\u0600-\u06FF]/g, '').trim();
};

export default {
    sanitizeString,
    sanitizeHTML,
    sanitizeEmail,
    sanitizePhone,
    sanitizeNumeric,
    sanitizeAddress
};
