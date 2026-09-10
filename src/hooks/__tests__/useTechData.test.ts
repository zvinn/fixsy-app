// src/hooks/__tests__/useTechData.test.ts
import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTechData } from '../useTechData';

// Mock Firebase
vi.mock('../../services/firebase', () => ({
    db: {}
}));

vi.mock('firebase/firestore', () => ({
    collection: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    getDocs: vi.fn(() => Promise.resolve({ docs: [] })),
    updateDoc: vi.fn(),
    setDoc: vi.fn(),
    doc: vi.fn(),
    addDoc: vi.fn()
}));

vi.mock('react-hot-toast', () => ({
    default: {
        success: vi.fn(),
        error: vi.fn()
    }
}));

describe('useTechData', () => {
    it('should initialize with default state', () => {
        const { result } = renderHook(() => useTechData('test@example.com'));

        expect(result.current.techData).toBeDefined();
        expect(result.current.requests).toEqual([]);
        expect(result.current.transactions).toEqual([]);
        expect(result.current.loading).toBe(true);
    });

    it('should provide all required functions', () => {
        const { result } = renderHook(() => useTechData('test@example.com'));

        expect(typeof result.current.toggleAvailability).toBe('function');
        expect(typeof result.current.updateStatus).toBe('function');
        expect(typeof result.current.saveSchedule).toBe('function');
        expect(typeof result.current.updateLocation).toBe('function');
        expect(typeof result.current.refreshData).toBe('function');
    });

    it('should not fetch data when userEmail is null', () => {
        const { result } = renderHook(() => useTechData(null));

        expect(result.current.techData).toBeDefined();
        expect(result.current.requests).toEqual([]);
    });
});
