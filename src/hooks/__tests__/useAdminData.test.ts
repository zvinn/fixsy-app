// src/hooks/__tests__/useAdminData.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAdminData } from '../useAdminData';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

// Mock Firebase
vi.mock('../../services/firebase', () => ({
    db: {}
}));

vi.mock('firebase/firestore', () => ({
    collection: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    getDocs: vi.fn(),
    addDoc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    doc: vi.fn(),
    orderBy: vi.fn()
}));

vi.mock('react-hot-toast', () => ({
    default: {
        success: vi.fn(),
        error: vi.fn()
    }
}));

describe('useAdminData', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize with empty arrays', () => {
        const { result } = renderHook(() => useAdminData());

        expect(result.current.pendingTechs).toEqual([]);
        expect(result.current.debtors).toEqual([]);
        expect(result.current.admins).toEqual([]);
        expect(result.current.coupons).toEqual([]);
        expect(result.current.referralUsers).toEqual([]);
        expect(result.current.disputes).toEqual([]);
    });

    it('should fetch pending techs successfully', async () => {
        const mockTechs = [
            { id: '1', name: 'Tech 1', isVerified: 'pending' }
        ];

        vi.mocked(getDocs).mockResolvedValueOnce({
            docs: mockTechs.map(tech => ({
                data: () => tech,
                id: tech.id
            }))
        } as any);

        const { result } = renderHook(() => useAdminData());

        await waitFor(() => {
            result.current.fetchPendingTechs();
        });

        await waitFor(() => {
            expect(result.current.pendingTechs.length).toBeGreaterThan(0);
        });
    });

    it('should fetch coupons successfully', async () => {
        const mockCoupons = [
            { id: '1', code: 'SAVE10', discount: 10, isActive: true }
        ];

        vi.mocked(getDocs).mockResolvedValueOnce({
            docs: mockCoupons.map(coupon => ({
                data: () => coupon,
                id: coupon.id
            }))
        } as any);

        const { result } = renderHook(() => useAdminData());

        await waitFor(() => {
            result.current.fetchCoupons();
        });

        await waitFor(() => {
            expect(result.current.coupons.length).toBeGreaterThan(0);
        });
    });

    it('should provide all required functions', () => {
        const { result } = renderHook(() => useAdminData());

        expect(typeof result.current.fetchPendingTechs).toBe('function');
        expect(typeof result.current.fetchDebtors).toBe('function');
        expect(typeof result.current.fetchAdmins).toBe('function');
        expect(typeof result.current.fetchCoupons).toBe('function');
        expect(typeof result.current.approveTech).toBe('function');
        expect(typeof result.current.rejectTech).toBe('function');
        expect(typeof result.current.settleDebt).toBe('function');
        expect(typeof result.current.addCoupon).toBe('function');
        expect(typeof result.current.toggleCouponStatus).toBe('function');
        expect(typeof result.current.deleteCoupon).toBe('function');
        expect(typeof result.current.addNewAdmin).toBe('function');
        expect(typeof result.current.resolveDispute).toBe('function');
    });

    it('should handle errors gracefully', async () => {
        vi.mocked(getDocs).mockRejectedValueOnce(new Error('Firebase error'));

        const { result } = renderHook(() => useAdminData());

        await expect(result.current.fetchPendingTechs()).rejects.toThrow();
    });
});
