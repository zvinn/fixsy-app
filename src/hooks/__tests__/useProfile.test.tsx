// src/hooks/__tests__/useProfile.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useProfile } from '../useProfile';

// Mock Firebase
vi.mock('../../services/firebase', () => ({
    db: {},
    storage: {}
}));

vi.mock('firebase/firestore', () => ({
    collection: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    getDocs: vi.fn(() => Promise.resolve({
        empty: true,
        docs: []
    })),
    doc: vi.fn(),
    updateDoc: vi.fn(),
    setDoc: vi.fn()
}));

vi.mock('firebase/storage', () => ({
    ref: vi.fn(),
    uploadBytes: vi.fn(),
    getDownloadURL: vi.fn(() => Promise.resolve('https://example.com/image.jpg'))
}));

vi.mock('react-hot-toast', () => ({
    default: {
        success: vi.fn(),
        error: vi.fn(),
        loading: vi.fn()
    }
}));

const mockUser = {
    email: 'test@example.com',
    uid: '123'
} as any;

const mockT = (key: string) => key;
const mockUserRole = 'client';

describe('useProfile', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize with default state', () => {
        const { result } = renderHook(() => useProfile(mockUser, mockUserRole, mockT));

        expect(result.current.userData).toBeDefined();
        expect(result.current.isLoading).toBe(false);
    });

    it('should provide profile management functions', () => {
        const { result } = renderHook(() => useProfile(mockUser, mockUserRole, mockT));

        expect(typeof result.current.updateProfileImage).toBe('function');
        expect(typeof result.current.saveProfile).toBe('function');
        expect(typeof result.current.addAddress).toBe('function');
        expect(typeof result.current.deleteAddress).toBe('function');
    });

    it('should handle null user', () => {
        const { result } = renderHook(() => useProfile(null, mockUserRole, mockT));

        expect(result.current.userData).toBeDefined();
    });

    it('should expose required state', () => {
        const { result } = renderHook(() => useProfile(mockUser, mockUserRole, mockT));

        expect(result.current.userData).toBeDefined();
        expect(result.current.docId).toBeDefined();
    });
});
