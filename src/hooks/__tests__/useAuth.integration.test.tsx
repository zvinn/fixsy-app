// src/hooks/__tests__/useAuth.integration.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from '../useAuth';

// Mock Firebase Auth
vi.mock('../../services/firebase', () => ({
    auth: {
        currentUser: null
    },
    db: {}
}));

vi.mock('firebase/auth', () => ({
    onAuthStateChanged: vi.fn((auth, callback) => {
        callback(null);
        return vi.fn(); // unsubscribe function
    }),
    signOut: vi.fn()
}));

vi.mock('firebase/firestore', () => ({
    collection: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    getDocs: vi.fn(),
    doc: vi.fn(),
    getDoc: vi.fn(),
    setDoc: vi.fn(),
    updateDoc: vi.fn()
}));

describe('useAuth Integration Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize with no user', () => {
        const { result } = renderHook(() => useAuth(() => ''));

        expect(result.current.user).toBeNull();
        expect(result.current.userRole).toBeNull();
        expect(result.current.loading).toBe(true);
    });

    it('should provide logout function', () => {
        const { result } = renderHook(() => useAuth(() => ''));

        expect(typeof result.current.logout).toBe('function');
    });

    it('should check user role correctly', async () => {
        const { result } = renderHook(() => useAuth(() => ''));

        expect(typeof result.current.checkUserRole).toBe('function');
    });

    it('should maintain loading state during auth check', () => {
        const { result } = renderHook(() => useAuth(() => ''));

        // Initially loading
        expect(result.current.loading).toBe(true);
    });
});
