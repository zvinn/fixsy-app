// src/utils/__tests__/validators.test.ts
import { describe, it, expect } from 'vitest';
import {
    validateEmail,
    validatePhone,
    validateAddress,
    validateName,
    validatePrice,
    validateCouponCode,
    validateProblemDescription,
    validateFileUpload
} from '../validators';

describe('validators', () => {
    describe('validateEmail', () => {
        it('should validate correct emails', () => {
            expect(validateEmail('test@example.com').isValid).toBe(true);
            expect(validateEmail('user.name+tag@domain.co.uk').isValid).toBe(true);
        });

        it('should reject invalid emails', () => {
            expect(validateEmail('').isValid).toBe(false);
            expect(validateEmail('not-an-email').isValid).toBe(false);
            expect(validateEmail('@example.com').isValid).toBe(false);
        });
    });

    describe('validatePhone', () => {
        it('should validate Egyptian phone numbers', () => {
            expect(validatePhone('01012345678').isValid).toBe(true);
            expect(validatePhone('+201012345678').isValid).toBe(true);
            expect(validatePhone('0111234567 8').isValid).toBe(true); // with space
        });

        it('should reject invalid phone numbers', () => {
            expect(validatePhone('123').isValid).toBe(false);
            expect(validatePhone('0612345678').isValid).toBe(false); // not Egyptian
        });
    });

    describe('validateAddress', () => {
        it('should validate correct addresses', () => {
            expect(validateAddress('123 Main Street, Cairo').isValid).toBe(true);
        });

        it('should reject short addresses', () => {
            expect(validateAddress('Short').isValid).toBe(false);
        });

        it('should reject SQL injection attempts', () => {
            expect(validateAddress('123 Main; DROP TABLE users').isValid).toBe(false);
        });

        it('should reject XSS attempts', () => {
            expect(validateAddress('<script>alert(1)</script>').isValid).toBe(false);
        });
    });

    describe('validateName', () => {
        it('should validate correct names', () => {
            expect(validateName('Ahmed Mohamed').isValid).toBe(true);
            expect(validateName('محمد أحمد').isValid).toBe(true); // Arabic
        });

        it('should reject invalid names', () => {
            expect(validateName('A').isValid).toBe(false); // too short
            expect(validateName('Name123').isValid).toBe(false); // contains numbers
        });
    });

    describe('validatePrice', () => {
        it('should validate correct prices', () => {
            expect(validatePrice(100).isValid).toBe(true);
            expect(validatePrice(0).isValid).toBe(true);
        });

        it('should reject invalid prices', () => {
            expect(validatePrice(-10).isValid).toBe(false); // negative
            expect(validatePrice(NaN).isValid).toBe(false);
            expect(validatePrice(200000).isValid).toBe(false); // too high
        });
    });

    describe('validateCouponCode', () => {
        it('should validate correct coupon codes', () => {
            expect(validateCouponCode('SAVE10').isValid).toBe(true);
            expect(validateCouponCode('DISC2024').isValid).toBe(true);
        });

        it('should reject invalid coupon codes', () => {
            expect(validateCouponCode('AB').isValid).toBe(false); // too short
            expect(validateCouponCode('SAVE@10').isValid).toBe(false); // special chars
        });
    });

    describe('validateProblemDescription', () => {
        it('should validate correct descriptions', () => {
            expect(validateProblemDescription('My water heater is broken and leaking').isValid).toBe(true);
        });

        it('should reject short descriptions', () => {
            expect(validateProblemDescription('Broken').isValid).toBe(false);
        });

        it('should reject SQL injection', () => {
            expect(validateProblemDescription('Problem; DROP TABLE').isValid).toBe(false);
        });
    });

    describe('validateFileUpload', () => {
        it('should validate correct files', () => {
            const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
            expect(validateFileUpload(file).isValid).toBe(true);
        });

        it('should reject wrong file types', () => {
            const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
            expect(validateFileUpload(file).isValid).toBe(false);
        });

        it('should reject files that are too large', () => {
            const largeFile = new File([new ArrayBuffer(10 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
            expect(validateFileUpload(largeFile, 5).isValid).toBe(false);
        });
    });
});
