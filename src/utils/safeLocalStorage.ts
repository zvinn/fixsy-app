/**
 * Safe LocalStorage Wrapper
 * Handles errors gracefully for private browsing, quota exceeded, etc.
 * 
 * @module safeLocalStorage
 * @category Utils
 */

import logger from '../services/loggerService';

/**
 * Safely get item from localStorage
 * @param key - The storage key
 * @returns The stored value or null if not found/error
 */
export function getItem(key: string): string | null {
    try {
        return localStorage.getItem(key);
    } catch (error) {
        logger.warn('localStorage.getItem failed', { key, error });
        return null;
    }
}

/**
 * Safely set item in localStorage
 * @param key - The storage key
 * @param value - The value to store
 * @returns true if successful, false otherwise
 */
export function setItem(key: string, value: string): boolean {
    try {
        localStorage.setItem(key, value);
        return true;
    } catch (error) {
        logger.warn('localStorage.setItem failed', { key, error });
        return false;
    }
}

/**
 * Safely remove item from localStorage
 * @param key - The storage key
 * @returns true if successful, false otherwise
 */
export function removeItem(key: string): boolean {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        logger.warn('localStorage.removeItem failed', { key, error });
        return false;
    }
}

/**
 * Safely clear all localStorage
 * @returns true if successful, false otherwise
 */
export function clear(): boolean {
    try {
        localStorage.clear();
        return true;
    } catch (error) {
        logger.warn('localStorage.clear failed', { error });
        return false;
    }
}

/**
 * Get and parse JSON from localStorage
 * @param key - The storage key
 * @returns Parsed object or null if not found/error
 */
export function getJSON<T = unknown>(key: string): T | null {
    try {
        const item = localStorage.getItem(key);
        if (!item) return null;
        return JSON.parse(item) as T;
    } catch (error) {
        logger.warn('localStorage.getJSON failed', { key, error });
        return null;
    }
}

/**
 * Stringify and set JSON in localStorage
 * @param key - The storage key
 * @param value - The object to store
 * @returns true if successful, false otherwise
 */
export function setJSON<T = unknown>(key: string, value: T): boolean {
    try {
        const serialized = JSON.stringify(value);
        localStorage.setItem(key, serialized);
        return true;
    } catch (error) {
        logger.warn('localStorage.setJSON failed', { key, error });
        return false;
    }
}

/**
 * Check if localStorage is available
 * @returns true if localStorage is available and working
 */
export function isAvailable(): boolean {
    try {
        const testKey = '__ls_test__';
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
        return true;
    } catch {
        return false;
    }
}

/**
 * Default export with all methods
 */
const safeLocalStorage = {
    getItem,
    setItem,
    removeItem,
    clear,
    getJSON,
    setJSON,
    isAvailable
};

export default safeLocalStorage;
