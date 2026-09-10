/**
 * Card Validation Utility
 * Implements Luhn Algorithm for credit card validation
 * @module cardValidator
 */

/**
 * Validates credit card number using Luhn Algorithm
 * Checks if the card number is mathematically valid
 * 
 * @param {string} cardNumber - Card number string (digits only or with spaces)
 * @returns {boolean} true if valid, false otherwise
 * 
 * @example
 * ```ts
 * luhnCheck('4532 1488 0343 6467');  // Visa
 * // Returns: true
 * 
 * luhnCheck('1234 5678 9012 3456');  // Invalid
 * // Returns: false
 * ```
 */
export const luhnCheck = (cardNumber: string): boolean => {
    if (!cardNumber || cardNumber.length < 13 || cardNumber.length > 19) {
        return false;
    }

    // Remove spaces and non-digits
    const digits = cardNumber.replace(/\D/g, '');

    let sum = 0;
    let isEven = false;

    // Loop through values starting from the rightmost digit
    for (let i = digits.length - 1; i >= 0; i--) {
        let digit = parseInt(digits[i], 10);

        if (isEven) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }

        sum += digit;
        isEven = !isEven;
    }

    return sum % 10 === 0;
};

/**
 * Detects card type based on number pattern
 * Uses first few digits to identify card brand
 * 
 * @param {string} cardNumber - Card number to identify
 * @returns {string} Card type ('Visa', 'Mastercard', 'American Express', 'Discover', or 'Unknown')
 * 
 * @example
 * ```ts
 * getCardType('4532...');  // Returns: 'Visa'
 * getCardType('5412...');  // Returns: 'Mastercard'
 * getCardType('3782...');  // Returns: 'American Express'
 * ```
 */
export const getCardType = (cardNumber: string): string => {
    const digits = cardNumber.replace(/\D/g, '');

    if (/^4/.test(digits)) return 'Visa';
    if (/^5[1-5]/.test(digits)) return 'Mastercard';
    if (/^3[47]/.test(digits)) return 'American Express';
    if (/^6(?:011|5)/.test(digits)) return 'Discover';

    return 'Unknown';
};

/**
 * Validates card expiry date (MM/YY format)
 * Checks if card is not expired
 * 
 * @param {string} expiry - Expiry date in MM/YY format
 * @returns {boolean} true if valid and not expired, false otherwise
 * 
 * @example
 * ```ts
 * validateExpiry('12/25');  // Returns: true (if current date is before Dec 2025)
 * validateExpiry('01/20');  // Returns: false (expired)
 * validateExpiry('13/25');  // Returns: false (invalid month)
 * ```
 */
export const validateExpiry = (expiry: string): boolean => {
    if (!expiry || !/^\d{2}\/\d{2}$/.test(expiry)) {
        return false;
    }

    const [month, year] = expiry.split('/').map(Number);
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100; // Last 2 digits
    const currentMonth = currentDate.getMonth() + 1;

    if (month < 1 || month > 12) {
        return false;
    }

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
        return false;
    }

    return true;
};

/**
 * Validates CVV/CVC security code
 * Checks if CVV length matches card type (3 or 4 digits)
 * 
 * @param {string} cvc - CVV/CVC code
 * @param {string} [cardType] - Optional card type for specific validation
 * @returns {boolean} true if valid length, false otherwise
 * 
 * @example
 * ```ts
 * validateCVC('123');  // Returns: true
 * validateCVC('1234', 'American Express');  // Returns: true
 * validateCVC('12');   // Returns: false (too short)
 * ```
 */
export const validateCVC = (cvc: string, cardType?: string): boolean => {
    if (!cvc) return false;

    const digits = cvc.replace(/\D/g, '');

    // American Express uses 4 digits, others use 3
    if (cardType === 'American Express') {
        return digits.length === 4;
    }

    return digits.length === 3;
};

/**
 * Format card number with spaces
 */
export const formatCardNumber = (cardNumber: string): string => {
    const digits = cardNumber.replace(/\D/g, '');
    const parts = [];

    for (let i = 0; i < digits.length; i += 4) {
        parts.push(digits.substring(i, i + 4));
    }

    return parts.join(' ');
};

/**
 * Mask card number (show only last 4 digits)
 */
export const maskCardNumber = (cardNumber: string): string => {
    const digits = cardNumber.replace(/\D/g, '');
    if (digits.length < 4) return cardNumber;

    return '**** **** **** ' + digits.slice(-4);
};

export default {
    luhnCheck,
    getCardType,
    validateExpiry,
    validateCVC,
    formatCardNumber,
    maskCardNumber
};
