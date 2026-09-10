// src/hooks/__tests__/useFavorites.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFavorites } from '../useFavorites';

// Mock Firebase Firestore
vi.mock('firebase/firestore', () => ({
    collection: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    getDocs: vi.fn().mockResolvedValue({ empty: true, docs: [] }),
    addDoc: vi.fn().mockResolvedValue({ id: 'new-fav-id' }),
    deleteDoc: vi.fn().mockResolvedValue(undefined),
    doc: vi.fn(),
}));

vi.mock('../../services/firebase', () => ({
    db: {},
}));

vi.mock('react-hot-toast', () => ({
    default: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

// Mock useLanguage to avoid context issues
vi.mock('../../context/LanguageContext', () => ({
    useLanguage: () => ({
        t: (key: string) => key,
        language: 'en',
        toggleLanguage: vi.fn(),
    }),
}));

describe('useFavorites Hook', () => {
    const mockUser = {
        email: 'test@example.com',
        uid: 'user-123',
    } as any; // Mock user for testing - full User interface not needed

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Initial State', () => {
        it('should initialize with empty favorites array', () => {
            const { result } = renderHook(() => useFavorites(mockUser));

            expect(result.current.favorites).toEqual([]);
        });

        it('should provide toggleFavorite function', () => {
            const { result } = renderHook(() => useFavorites(mockUser));

            expect(typeof result.current.toggleFavorite).toBe('function');
        });
    });

    describe('Without User', () => {
        it('should return empty favorites when no user', () => {
            const { result } = renderHook(() => useFavorites(null));

            expect(result.current.favorites).toEqual([]);
        });
    });

    describe('toggleFavorite', () => {
        it('should be callable with tech ID', async () => {
            const { result } = renderHook(() => useFavorites(mockUser));

            // Should not throw
            await act(async () => {
                await result.current.toggleFavorite('tech-123');
            });
        });
    });
});
