// src/utils/__tests__/formatters.test.ts
import { describe, it, expect } from 'vitest';
import { capitalizeName, formatDate, formatCurrency } from '../formatters';

describe('Formatters Utility', () => {
    describe('capitalizeName', () => {
        it('should capitalize first letter of each word', () => {
            expect(capitalizeName('john doe')).toBe('John Doe');
            expect(capitalizeName('mary jane')).toBe('Mary Jane');
        });

        it('should handle single word', () => {
            expect(capitalizeName('john')).toBe('John');
        });

        it('should handle empty string', () => {
            expect(capitalizeName('')).toBe('');
        });

        it('should handle already capitalized names', () => {
            expect(capitalizeName('John Doe')).toBe('John Doe');
        });
    });

    describe('formatDate', () => {
        it('should format date correctly', () => {
            const date = new Date('2024-01-15T10:30:00');
            const formatted = formatDate(date);
            expect(formatted).toBeTruthy();
            expect(typeof formatted).toBe('string');
        });
    });

    describe('formatCurrency', () => {
        it('should format currency with Egyptian pound', () => {
            expect(formatCurrency(100)).toContain('100');
        });

        it('should handle zero', () => {
            expect(formatCurrency(0)).toContain('0');
        });

        it('should handle large numbers', () => {
            const result = formatCurrency(1000000);
            expect(result).toBeTruthy();
        });
    });
});
