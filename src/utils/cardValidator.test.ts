// src/utils/cardValidator.test.ts
import { describe, it, expect } from 'vitest';
import {
    luhnCheck,
    getCardType,
    validateExpiry,
    validateCVC,
    formatCardNumber,
    maskCardNumber
} from './cardValidator';

describe('cardValidator', () => {
    describe('luhnCheck', () => {
        it('should validate correct card numbers', () => {
            expect(luhnCheck('4111111111111111')).toBe(true); // Valid Visa test card
            expect(luhnCheck('5500000000000004')).toBe(true); // Valid Mastercard test card
        });

        it('should reject invalid card numbers', () => {
            expect(luhnCheck('4111111111111112')).toBe(false); // Invalid checksum
            expect(luhnCheck('1234567890123456')).toBe(false); // Invalid
        });

        it('should reject too short/long numbers', () => {
            expect(luhnCheck('123')).toBe(false);
            expect(luhnCheck('12345678901234567890')).toBe(false);
        });
    });

    describe('getCardType', () => {
        it('should detect Visa', () => {
            expect(getCardType('4532148803436467')).toBe('Visa');
        });

        it('should detect Mastercard', () => {
            expect(getCardType('5425233430109903')).toBe('Mastercard');
        });

        it('should detect American Express', () => {
            expect(getCardType('378282246310005')).toBe('American Express');
        });

        it('should return Unknown for invalid cards', () => {
            expect(getCardType('1234567890123456')).toBe('Unknown');
        });
    });

    describe('validateExpiry', () => {
        it('should validate future dates', () => {
            expect(validateExpiry('12/30')).toBe(true); // Far future
        });

        it('should reject past dates', () => {
            expect(validateExpiry('01/20')).toBe(false);
        });

        it('should reject invalid months', () => {
            expect(validateExpiry('13/25')).toBe(false);
            expect(validateExpiry('00/25')).toBe(false);
        });

        it('should reject invalid format', () => {
            expect(validateExpiry('12/2025')).toBe(false);
            expect(validateExpiry('12-25')).toBe(false);
        });
    });

    describe('validateCVC', () => {
        it('should validate 3-digit CVC', () => {
            expect(validateCVC('123')).toBe(true);
            expect(validateCVC('999')).toBe(true);
        });

        it('should validate 4-digit for Amex', () => {
            expect(validateCVC('1234', 'American Express')).toBe(true);
            expect(validateCVC('123', 'American Express')).toBe(false);
        });

        it('should reject invalid CVCs', () => {
            expect(validateCVC('12')).toBe(false);
            expect(validateCVC('12345')).toBe(false);
            expect(validateCVC('')).toBe(false);
        });
    });

    describe('formatCardNumber', () => {
        it('should format with spaces', () => {
            expect(formatCardNumber('4532148803436467')).toBe('4532 1488 0343 6467');
        });
    });

    describe('maskCardNumber', () => {
        it('should mask all but last 4 digits', () => {
            expect(maskCardNumber('4532148803436467')).toBe('**** **** **** 6467');
        });
    });
});
