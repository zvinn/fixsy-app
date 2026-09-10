// src/utils/inputSanitizer.test.ts
import { describe, it, expect } from 'vitest';
import {
    sanitizeString,
    sanitizeHTML,
    sanitizeEmail,
    sanitizePhone,
    sanitizeNumeric,
    sanitizeAddress
} from './inputSanitizer';

describe('inputSanitizer', () => {
    describe('sanitizeString', () => {
        it('should remove HTML tags', () => {
            expect(sanitizeString('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
            expect(sanitizeString('Hello <b>World</b>')).toBe('Hello bWorld/b');
        });

        it('should remove javascript: protocol', () => {
            expect(sanitizeString('javascript:alert(1)')).toBe('alert(1)');
        });

        it('should remove event handlers', () => {
            expect(sanitizeString('onclick=alert(1)')).toBe('alert(1)');
            expect(sanitizeString('onload=bad()')).toBe('bad()');
        });

        it('should trim whitespace', () => {
            expect(sanitizeString('  hello  ')).toBe('hello');
        });
    });

    describe('sanitizeHTML', () => {
        it('should encode HTML entities', () => {
            expect(sanitizeHTML('<img src=x onerror=alert(1)>')).toBe('&lt;img src=x onerror=alert(1)&gt;');
        });

        it('should handle empty string', () => {
            expect(sanitizeHTML('')).toBe('');
        });
    });

    describe('sanitizeEmail', () => {
        it('should convert to lowercase', () => {
            expect(sanitizeEmail('USER@EXAMPLE.COM')).toBe('user@example.com');
        });

        it('should validate email format', () => {
            expect(sanitizeEmail('valid@email.com')).toBe('valid@email.com');
            expect(sanitizeEmail('invalid-email')).toBe('');
        });
    });

    describe('sanitizePhone', () => {
        it('should remove non-numeric characters', () => {
            expect(sanitizePhone('+1 (555) 123-4567')).toBe('+15551234567');
            expect(sanitizePhone('555.123.4567')).toBe('5551234567');
        });

        it('should keep + symbol', () => {
            expect(sanitizePhone('+201234567890')).toBe('+201234567890');
        });
    });

    describe('sanitizeNumeric', () => {
        it('should remove non-numeric characters except decimal', () => {
            expect(sanitizeNumeric('$1,234.56')).toBe('1234.56');
            expect(sanitizeNumeric('100%')).toBe('100');
        });

        it('should keep decimal point', () => {
            expect(sanitizeNumeric('3.14')).toBe('3.14');
        });
    });

    describe('sanitizeAddress', () => {
        it('should allow alphanumeric and common punctuation', () => {
            expect(sanitizeAddress('123 Main St., Cairo')).toContain('123 Main St');
        });

        it('should remove HTML tags', () => {
            const result = sanitizeAddress('Address<script>alert(1)</script>');
            expect(result).not.toContain('<script>');
        });
    });
});
