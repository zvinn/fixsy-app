// src/hooks/__tests__/useBooking.test.ts
import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useBooking } from '../useBooking';

// Mock Firebase
vi.mock('../../services/firebase', () => ({
    db: {}
}));

vi.mock('firebase/firestore', () => ({
    collection: vi.fn(),
    addDoc: vi.fn(() => Promise.resolve({ id: 'booking_123' })),
    doc: vi.fn(),
    updateDoc: vi.fn(),
    setDoc: vi.fn(),
    increment: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    getDocs: vi.fn()
}));

vi.mock('react-hot-toast', () => ({
    default: {
        success: vi.fn(),
        error: vi.fn(),
        loading: vi.fn(),
        dismiss: vi.fn()
    }
}));

const mockUser = {
    email: 'client@example.com',
    uid: 'client_123',
    displayName: 'Test User'
} as any;

const mockT = (key: string) => key;

describe('useBooking', () => {
    it('should initialize with default state', () => {
        const { result } = renderHook(() => useBooking({ user: mockUser, t: mockT }));

        expect(result.current.formData).toBeDefined();
        expect(result.current.isSubmitting).toBe(false);
    });

    it('should provide booking functions', () => {
        const { result } = renderHook(() => useBooking({ user: mockUser, t: mockT }));

        expect(typeof result.current.submitBooking).toBe('function');
        expect(typeof result.current.applyCoupon).toBe('function');
        expect(typeof result.current.resetBooking).toBe('function');
    });

    it('should handle form state correctly', () => {
        const { result } = renderHook(() => useBooking({ user: mockUser, t: mockT }));

        expect(result.current.formData).toHaveProperty('problem');
        expect(result.current.formData).toHaveProperty('address');
    });

    it('should handle null user', () => {
        const { result } = renderHook(() => useBooking({ user: null, t: mockT }));

        expect(result.current.formData).toBeDefined();
    });
});
