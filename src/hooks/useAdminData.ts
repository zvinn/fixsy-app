// src/hooks/useAdminData.ts
import { useState, useCallback } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, deleteDoc, addDoc, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import toast from 'react-hot-toast';

interface Technician {
    id: string;
    name?: string;
    email?: string;
    nationalId?: string;
    idCardImage?: string;
    isVerified: boolean | 'pending' | 'approved';
    debt: number;
    unpaidOrdersCount?: number;
    referralCount?: number;
    referralCode?: string;
    role?: 'tech';
    [key: string]: unknown;
}

interface Client {
    id: string;
    name?: string;
    email?: string;
    referralCount?: number;
    referralCode?: string;
    role?: 'client';
    [key: string]: unknown;
}

interface Admin {
    id: string;
    email: string;
}

interface Coupon {
    id: string;
    code: string;
    discount: number;
    isActive: boolean;
}

interface Dispute {
    id: string;
    reqId?: string;
    clientEmail?: string;
    techId?: string;
    reason?: string;
    date: string;
    status: string;
}

type ReferralUserType = (Technician | Client) & { role: 'client' | 'tech' };

export function useAdminData() {
    const [pendingTechs, setPendingTechs] = useState<Technician[]>([]);
    const [debtors, setDebtors] = useState<Technician[]>([]);
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [referralUsers, setReferralUsers] = useState<ReferralUserType[]>([]);
    const [disputes, setDisputes] = useState<Dispute[]>([]);

    // Fetch Functions
    const fetchPendingTechs = useCallback(async () => {
        const q = query(collection(db, "technicians"), where("isVerified", "==", "pending"));
        const snap = await getDocs(q);
        setPendingTechs(snap.docs.map(d => ({ ...d.data(), id: d.id } as Technician)));
    }, []);

    const fetchDebtors = useCallback(async () => {
        const q = query(collection(db, "technicians"), where("debt", ">", 0), orderBy("debt", "desc"));
        const snap = await getDocs(q);
        setDebtors(snap.docs.map(d => ({ ...d.data(), id: d.id } as Technician)));
    }, []);

    const fetchAdmins = useCallback(async () => {
        const snap = await getDocs(collection(db, "admins"));
        setAdmins(snap.docs.map(d => ({ ...d.data(), id: d.id } as Admin)));
    }, []);

    const fetchCoupons = useCallback(async () => {
        const snap = await getDocs(collection(db, "coupons"));
        setCoupons(snap.docs.map(d => ({ ...d.data(), id: d.id } as Coupon)));
    }, []);

    const fetchReferrals = useCallback(async () => {
        const clientsSnap = await getDocs(collection(db, "clients"));
        const techsSnap = await getDocs(collection(db, "technicians"));

        const allUsers: ReferralUserType[] = [
            ...clientsSnap.docs.map(d => ({ ...d.data(), id: d.id, role: 'client' } as ReferralUserType)),
            ...techsSnap.docs.map(d => ({ ...d.data(), id: d.id, role: 'tech' } as ReferralUserType))
        ];

        const referrers = allUsers
            .filter(u => (u.referralCount || 0) > 0)
            .sort((a, b) => (b.referralCount || 0) - (a.referralCount || 0));

        setReferralUsers(referrers);
    }, []);

    const fetchDisputes = useCallback(async () => {
        const snap = await getDocs(collection(db, "disputes"));
        setDisputes(snap.docs.map(d => ({ ...d.data(), id: d.id } as Dispute)));
    }, []);

    // Action Functions
    const approveTech = useCallback(async (id: string, t: (key: string) => string) => {
        try {
            await updateDoc(doc(db, "technicians", id), { isVerified: true });
            const techDoc = pendingTechs.find(tech => tech.id === id);
            if (techDoc && techDoc.email) {
                await addDoc(collection(db, "notifications"), {
                    userId: techDoc.email,
                    message: t("verifySuccessMsg"),
                    icon: "✅",
                    type: 'system',
                    date: new Date().toISOString(),
                    read: false
                });
            }
            toast.success(t("verifySuccessToast"));
            await fetchPendingTechs();
        } catch (error) {
            toast.error(t("errorOccurred"));
        }
    }, [pendingTechs, fetchPendingTechs]);

    const rejectTech = useCallback(async (id: string, reason: string, t: (key: string) => string) => {
        if (!reason) return toast.error(t("rejectReasonToast"));
        try {
            await updateDoc(doc(db, "technicians", id), { isVerified: false, rejectionReason: reason });
            const techDoc = pendingTechs.find(tech => tech.id === id);
            if (techDoc && techDoc.email) {
                await addDoc(collection(db, "notifications"), {
                    userId: techDoc.email,
                    message: `${t("rejectMsgPrefix")} ${reason}`,
                    icon: "❌",
                    type: 'system',
                    date: new Date().toISOString(),
                    read: false
                });
            }
            toast.success(t("rejectToast"));
            await fetchPendingTechs();
        } catch (error) {
            toast.error(t("errorOccurred"));
        }
    }, [pendingTechs, fetchPendingTechs]);

    const settleDebt = useCallback(async (tech: Technician, t: (key: string) => string) => {
        if (!window.confirm(`${t("confirmReceipt")} ${tech.debt} ${t("currency")}?`)) return;
        await updateDoc(doc(db, "technicians", tech.id), { debt: 0, unpaidOrdersCount: 0 });
        toast.success(t("accountSettled"));
        await fetchDebtors();
    }, [fetchDebtors]);

    const addCoupon = useCallback(async (code: string, discount: number, t: (key: string) => string) => {
        await addDoc(collection(db, "coupons"), { code: code.toUpperCase(), discount, isActive: true });
        toast.success(t("couponCreated"));
        await fetchCoupons();
    }, [fetchCoupons]);

    const toggleCouponStatus = useCallback(async (id: string, currentStatus: boolean, t: (key: string) => string) => {
        await updateDoc(doc(db, "coupons", id), { isActive: !currentStatus });
        await fetchCoupons();
        toast.success(currentStatus ? t("couponStopped") : t("couponActivated"));
    }, [fetchCoupons]);

    const deleteCoupon = useCallback(async (id: string, t: (key: string) => string) => {
        if (!window.confirm(t("deleteCouponConfirm"))) return;
        await deleteDoc(doc(db, "coupons", id));
        await fetchCoupons();
    }, [fetchCoupons]);

    const addNewAdmin = useCallback(async (email: string, t: (key: string) => string) => {
        await addDoc(collection(db, "admins"), { email });
        toast.success(t("adminAdded"));
        await fetchAdmins();
    }, [fetchAdmins]);

    const resolveDispute = useCallback(async (id: string, t: (key: string) => string) => {
        if (!window.confirm(t("confirmResolve") || "Mark as resolved?")) return;
        await deleteDoc(doc(db, "disputes", id));
        toast.success(t("resolved"));
        await fetchDisputes();
    }, [fetchDisputes]);

    return {
        // State
        pendingTechs,
        debtors,
        admins,
        coupons,
        referralUsers,
        disputes,

        // Fetch Functions
        fetchPendingTechs,
        fetchDebtors,
        fetchAdmins,
        fetchCoupons,
        fetchReferrals,
        fetchDisputes,

        // Action Functions
        approveTech,
        rejectTech,
        settleDebt,
        addCoupon,
        toggleCouponStatus,
        deleteCoupon,
        addNewAdmin,
        resolveDispute
    };
}
