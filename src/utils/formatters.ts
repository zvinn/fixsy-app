// src/utils/formatters.ts
/**
 * Utility functions for text formatting
 */

/**
 * Capitalizes each word in a name string
 * @param name - The name string to capitalize
 * @returns The capitalized name (e.g., "Mohamed Saad" from "mohamed saad")
 */
export const capitalizeName = (name: string | undefined | null): string => {
    if (!name) return '';
    return name
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

/**
 * Formats a phone number for display
 * @param phone - Raw phone number
 * @returns Formatted phone number
 */
export const formatPhone = (phone: string | undefined | null): string => {
    if (!phone) return '';
    // Egyptian format: 01X XXXX XXXX
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('01')) {
        return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 7)} ${cleaned.slice(7)}`;
    }
    return phone;
};

/**
 * Formats currency for display
 * @param amount - The amount to format
 * @param currency - Currency code (default: EGP)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currency: string = 'ج.م'): string => {
    // Use western digits for consistent testability; UI can localize as needed
    return `${amount.toLocaleString('en-US')} ${currency}`;
};

/**
 * Formats a date string or object
 * @param date - Date to format
 * @returns Formatted date string
 */
export const formatDate = (date: string | Date | number): string => {
    if (!date) return '';
    const d = new Date(date);
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
    }).format(d);
};
