// src/utils/validators.ts
/**
 * Comprehensive input validation utilities
 * Prevents injection attacks and ensures data integrity
 */

export interface ValidationResult {
    isValid: boolean;
    error?: string;
}

/**
 * Validate email address
 */
export const validateEmail = (email: string): ValidationResult => {
    if (!email || typeof email !== 'string') {
        return { isValid: false, error: 'Email is required' };
    }

    const trimmed = email.trim();

    if (trimmed.length === 0) {
        return { isValid: false, error: 'Email cannot be empty' };
    }

    if (trimmed.length > 254) {
        return { isValid: false, error: 'Email is too long' };
    }

    // RFC 5322 compliant regex
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    if (!emailRegex.test(trimmed)) {
        return { isValid: false, error: 'Invalid email format' };
    }

    return { isValid: true };
};

/**
 * Validate Egyptian phone number
 */
export const validatePhone = (phone: string): ValidationResult => {
    if (!phone || typeof phone !== 'string') {
        return { isValid: false, error: 'Phone is required' };
    }

    const cleaned = phone.replace(/[\s-()]/g, '');

    // Egyptian phone: 01xxxxxxxxx (11 digits) or +2010xxxxxxxx
    const egyptianPhoneRegex = /^(\+?20)?0?1[0125]\d{8}$/;

    if (!egyptianPhoneRegex.test(cleaned)) {
        return { isValid: false, error: 'Invalid Egyptian phone number' };
    }

    return { isValid: true };
};

/**
 * Validate address
 */
export const validateAddress = (address: string): ValidationResult => {
    if (!address || typeof address !== 'string') {
        return { isValid: false, error: 'Address is required' };
    }

    const trimmed = address.trim();

    if (trimmed.length < 10) {
        return { isValid: false, error: 'Address too short (min 10 chars)' };
    }

    if (trimmed.length > 500) {
        return { isValid: false, error: 'Address too long (max 500 chars)' };
    }

    // Check for suspicious patterns (SQL injection attempts)
    const suspiciousPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER)\b)/i,
        /<script[^>]*>.*?<\/script>/gi,
        /javascript:/gi
    ];

    for (const pattern of suspiciousPatterns) {
        if (pattern.test(trimmed)) {
            return { isValid: false, error: 'حروف غير مسموح بها' };
        }
    }

    return { isValid: true };
};

/**
 * Validate name (client/technician)
 */
export const validateName = (name: string): ValidationResult => {
    if (!name || typeof name !== 'string') {
        return { isValid: false, error: 'Name is required' };
    }

    const trimmed = name.trim();

    if (trimmed.length < 2) {
        return { isValid: false, error: 'Name too short (min 2 chars)' };
    }

    if (trimmed.length > 100) {
        return { isValid: false, error: 'Name too long (max 100 chars)' };
    }

    // Only letters, spaces, Arabic characters
    const nameRegex = /^[\u0600-\u06FFa-zA-Z\s'-]+$/;

    if (!nameRegex.test(trimmed)) {
        return { isValid: false, error: 'حروف غير مسموح بها' };
    }

    return { isValid: true };
};

/**
 * Validate price/amount
 */
export const validatePrice = (price: number): ValidationResult => {
    if (typeof price !== 'number' || isNaN(price)) {
        return { isValid: false, error: 'Price must be a number' };
    }

    if (price < 0) {
        return { isValid: false, error: 'Price cannot be negative' };
    }

    if (price > 100000) {
        return { isValid: false, error: 'Price exceeds maximum (100,000)' };
    }

    return { isValid: true };
};

/**
 * Validate coupon code
 */
export const validateCouponCode = (code: string): ValidationResult => {
    if (!code || typeof code !== 'string') {
        return { isValid: false, error: 'Coupon code is required' };
    }

    const trimmed = code.trim().toUpperCase();

    if (trimmed.length < 3) {
        return { isValid: false, error: 'Coupon code too short' };
    }

    if (trimmed.length > 20) {
        return { isValid: false, error: 'Coupon code too long' };
    }

    // Only alphanumeric
    const codeRegex = /^[A-Z0-9]+$/;

    if (!codeRegex.test(trimmed)) {
        return { isValid: false, error: 'Coupon code must be alphanumeric' };
    }

    return { isValid: true };
};

/**
 * Validate problem description
 */
export const validateProblemDescription = (description: string): ValidationResult => {
    if (!description || typeof description !== 'string') {
        return { isValid: false, error: 'Description is required' };
    }

    const trimmed = description.trim();

    if (trimmed.length < 10) {
        return { isValid: false, error: 'Description too short (min 10 chars)' };
    }

    if (trimmed.length > 1000) {
        return { isValid: false, error: 'Description too long (max 1000 chars)' };
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER)\b)/i,
        /<script[^>]*>.*?<\/script>/gi
    ];

    for (const pattern of suspiciousPatterns) {
        if (pattern.test(trimmed)) {
            return { isValid: false, error: 'Invalid characters in description' };
        }
    }

    return { isValid: true };
};

/**
 * Validate URL
 */
export const validateUrl = (url: string): ValidationResult => {
    if (!url || typeof url !== 'string') {
        return { isValid: false, error: 'URL is required' };
    }

    try {
        const parsed = new URL(url);

        // Only allow http/https
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            return { isValid: false, error: 'Invalid URL protocol' };
        }

        return { isValid: true };
    } catch {
        return { isValid: false, error: 'Invalid URL format' };
    }
};

/**
 * Validate file upload
 */
export const validateFileUpload = (file: File, maxSizeMB: number = 5): ValidationResult => {
    if (!file) {
        return { isValid: false, error: 'File is required' };
    }

    // Check file size
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
        return { isValid: false, error: `File too large (max ${maxSizeMB}MB)` };
    }

    // Check file type (images only)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        return { isValid: false, error: 'Only images allowed (JPEG, PNG, WebP)' };
    }

    return { isValid: true };
};
