// src/test/setup.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Firebase
vi.mock('../services/firebase', () => ({
    db: {},
    auth: {
        currentUser: null,
        onAuthStateChanged: vi.fn()
    },
    messaging: {},
    storage: {}
}));

// Mock matchMedia for components that use media queries
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock IntersectionObserver
class IntersectionObserverMock {
    observe = vi.fn();
    disconnect = vi.fn();
    unobserve = vi.fn();
}
Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    value: IntersectionObserverMock,
});

// Mock SpeechRecognition
Object.defineProperty(window, 'SpeechRecognition', {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
        start: vi.fn(),
        stop: vi.fn(),
        addEventListener: vi.fn(),
    })),
});

Object.defineProperty(window, 'webkitSpeechRecognition', {
    writable: true,
    value: (window as any).SpeechRecognition,
});

// Suppress console errors during tests
vi.spyOn(console, 'error').mockImplementation(() => { });
