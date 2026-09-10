// src/hooks/useAuth.ts
// Custom hook for authentication logic
import { useState, useEffect, useCallback } from 'react';
import { auth, db } from '../services/firebase';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, signOut } from 'firebase/auth';
import { collection, query, where, getDocs, updateDoc, doc, addDoc, increment, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import safeLocalStorage from '../utils/safeLocalStorage';

import { UserProfile, TranslationFunction } from '../types';

export type Role = 'admin' | 'tech' | 'client' | 'new' | null;

interface HookResult {
    user: User | null;
    userRole: Role;
    loading: boolean;
    setUserRole: React.Dispatch<React.SetStateAction<Role>>;
    clientProfile: UserProfile | null;
    setClientProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
    handleGoogleLogin: (role?: string) => Promise<void>;
    handleEmailSignUp: (email: string, password: string, name: string) => Promise<boolean>;
    handleEmailLogin: (email: string, password: string) => Promise<boolean>;
    handleGuestLogin: (role?: "client" | "tech" | "admin") => void;
    checkUserRole: (email: string) => Promise<void>;
    registerAsClient: (referralCodeInput?: string) => Promise<boolean>;
    applyReferralCode: (code: string) => Promise<boolean>;
    logout: () => Promise<void>;
}

// Minimal shape for user data stored in Firestore
interface UserData extends DocumentData {
    lastLoginDate?: string;
    streak?: number;
    earnings?: number;
    role?: string;
    specialty?: string;
}


export const DEMO_USERS: Record<'client' | 'tech' | 'admin', { uid: string; email: string; displayName: string; photoURL: string }> = {
    client: {
        uid: 'demo-client-001',
        email: 'client.demo@fixsy.com',
        displayName: 'أحمد محمود (عميل تجريبي)',
        photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    },
    tech: {
        uid: 'demo-tech-001',
        email: 'tech.demo@fixsy.com',
        displayName: 'م. إبراهيم خليل (فني تجريبي)',
        photoURL: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=150',
    },
    admin: {
        uid: 'demo-admin-001',
        email: 'mhamed.saad.ibrahim@gmail.com',
        displayName: 'محمد سعد (مدير المنصة)',
        photoURL: 'https://avatars.githubusercontent.com/u/190820067?v=4',
    }
};

export function useAuth(t: TranslationFunction): HookResult {
    const [user, setUser] = useState<User | null>(null);
    const [userRole, setUserRole] = useState<Role>(null);
    const [clientProfile, setClientProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // Handle daily streak logic
    // Moved up to be accessible by checkUserRole if needed, 
    // but checkUserRole is defined BEFORE handleStreak in original code?
    // Wait, in JS hoisting works for function declarations but here they are const/arrow functions.
    // In original code, handleStreak was defined AFTER checkUserRole, but checkUserRole called it?
    // Let's check original: checkUserRole calls handleStreak (line 26 & 34).
    // And handleStreak is defined at line 43.
    // In JS, 'const' is NOT hoisted. So original code at line 26 calling handleStreak which is defined at line 43
    // would technically THROW ReferenceError if checkUserRole was called synchronously before handleStreak definition.
    // BUT checkUserRole is a callback, and it's async. It's safe if it's executed after the render cycle completes?
    // Actually, no. If checkUserRole is called, handleStreak must be in scope.
    // The original code relies on the fact that checkUserRole is only called *after* initial render or asynchronously.
    // To be safe in TS and logic, I should define handleStreak BEFORE checkUserRole. Or hoist it.

    const handleStreak = async (userDoc: QueryDocumentSnapshot<UserData>) => {
        const userData = userDoc.data();
        const today = new Date().toISOString().split('T')[0];
        const lastLogin = userData.lastLoginDate;
        let newStreak = userData.streak || 0;

        const calculateLevel = (streak: number, earnings: number = 0) => {
            if (streak >= 30 || earnings > 5000) return { name: 'Platinum', icon: '💎', color: '#E5E4E2' };
            if (streak >= 14 || earnings > 2000) return { name: 'Gold', icon: '🥇', color: '#FFD700' };
            if (streak >= 7 || earnings > 500) return { name: 'Silver', icon: '🥈', color: '#C0C0C0' };
            return { name: 'Bronze', icon: '🥉', color: '#CD7F32' };
        };

        if (lastLogin !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            let showToast = false;
            if (lastLogin === yesterdayStr) {
                newStreak += 1;
                showToast = true;
            } else {
                newStreak = 1;
                showToast = true;
            }

            const collectionName = userData.role === 'technician' || userData.specialty ? 'technicians' : 'clients';
            const currentLevel = calculateLevel(newStreak, userData.earnings);

            await updateDoc(doc(db, collectionName, userDoc.id), {
                lastLoginDate: today,
                streak: newStreak,
                level: currentLevel.name
            });

            if (showToast && newStreak > 0) {
                toast((tst) => (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '10px' }}>
                        <div style={{ background: '#FEF2F2', padding: '12px', borderRadius: '50%', border: '2px solid #FCA5A5' }}>
                            🔥
                        </div>
                        <div>
                            <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#991B1B' }}>Daily Streak: {newStreak} 🔥</div>
                            <div style={{ fontSize: '0.85rem', color: '#7F1D1D' }}>Keep the fire burning!</div>
                        </div>
                    </div>
                ), { duration: 5000, position: 'top-center', style: { borderRadius: '20px', background: '#FFF1F2', border: '1px solid #FECACA' } });

                if ([3, 7, 30].includes(newStreak)) {
                    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
                }
            }
        }
    };

    // ✅ FIXED: Check user role in database using Firestore collection
    const checkUserRole = useCallback(async (email: string) => {
        // 1. Check cached local role first for instant load and zero blocking
        const cachedRole = safeLocalStorage.getItem('fixsy_user_role');
        if (cachedRole === 'client' || cachedRole === 'tech' || cachedRole === 'admin') {
            setUserRole(cachedRole as Role);
            return;
        }

        // 2. Query Firestore collections
        try {
            if (auth.currentUser) {
                const adminDoc = await getDocs(query(collection(db, "admins"), where("uid", "==", auth.currentUser.uid)));
                if (!adminDoc.empty) {
                    setUserRole('admin');
                    safeLocalStorage.setItem('fixsy_user_role', 'admin');
                    return;
                }
            }

            const techQuery = query(collection(db, "technicians"), where("email", "==", email));
            const techSnapshot = await getDocs(techQuery);
            if (!techSnapshot.empty) {
                setUserRole('tech');
                safeLocalStorage.setItem('fixsy_user_role', 'tech');
                handleStreak(techSnapshot.docs[0]);
                return;
            }

            const clientQuery = query(collection(db, "clients"), where("email", "==", email));
            const clientSnapshot = await getDocs(clientQuery);
            if (!clientSnapshot.empty) {
                setUserRole('client');
                safeLocalStorage.setItem('fixsy_user_role', 'client');
                handleStreak(clientSnapshot.docs[0]);
                return;
            }
        } catch (err) {
            console.warn("Firestore role check warning, defaulting to client:", err);
            setUserRole('client');
            safeLocalStorage.setItem('fixsy_user_role', 'client');
            return;
        }

        setUserRole('new');
    }, []);

    // Google login handler
    
    const handleGuestLogin = useCallback((role: 'client' | 'tech' | 'admin' = 'client') => {
        const demo = DEMO_USERS[role];
        const mockUser = {
            ...demo,
            emailVerified: true,
            isAnonymous: false,
            metadata: {},
            providerData: [],
            refreshToken: '',
            tenantId: null,
            delete: async () => {},
            getIdToken: async () => 'demo-token',
            getIdTokenResult: async () => ({ token: 'demo-token' } as any),
            reload: async () => {},
            toJSON: () => ({}),
            phoneNumber: null,
            providerId: 'demo'
        } as unknown as User;

        safeLocalStorage.setItem('fixsy_demo_user', JSON.stringify(demo));
        safeLocalStorage.setItem('fixsy_demo_role', role);
        safeLocalStorage.setItem('skipLogin', 'true');
        setUser(mockUser);
        setUserRole(role);
        if (t) toast.success(t("demoNotice") || "تم تفعيل الوضع التجريبي بنجاح!");
    }, [t]);

    const handleGoogleLogin = useCallback(async (role: string = 'client') => {
        safeLocalStorage.setItem('preferredRole', role);
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        try {
            await signInWithPopup(auth, provider);
            if (t) toast.success(t("welcome"));
        } catch (error) {
            if (t) toast.error(t("errorOccurred"));
        }
    }, [t]);

    // Email/Password Sign Up
    const handleEmailSignUp = useCallback(async (email: string, password: string, name: string): Promise<boolean> => {
        try {
            const { createUserWithEmailAndPassword, updateProfile: updateFirebaseProfile } = await import('firebase/auth');
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateFirebaseProfile(userCredential.user, { displayName: name });
            if (t) toast.success(t("registrationSuccess") || "تم إنشاء الحساب بنجاح!");
            return true;
        } catch (error: unknown) {
            const isFirebaseError = (err: unknown): err is { code: string } => {
                return typeof err === 'object' && err !== null && 'code' in err;
            };

            if (isFirebaseError(error)) {
                if (error.code === 'auth/email-already-in-use') {
                    if (t) toast.error(t("emailExists") || "البريد الإلكتروني مستخدم بالفعل");
                } else if (error.code === 'auth/weak-password') {
                    if (t) toast.error(t("weakPassword") || "كلمة المرور ضعيفة (6 أحرف على الأقل)");
                } else {
                    if (t) toast.error(t("errorOccurred"));
                }
            } else {
                if (t) toast.error(t("registrationFailed") || "فشل التسجيل");
            }
            return false;
        }
    }, [t]);

    // Email/Password Sign In
    const handleEmailLogin = useCallback(async (email: string, password: string): Promise<boolean> => {
        try {
            const { signInWithEmailAndPassword } = await import('firebase/auth');
            await signInWithEmailAndPassword(auth, email, password);
            if (t) toast.success(t("welcome"));
            return true;
        } catch (error: unknown) {
            const isFirebaseError = (err: unknown): err is { code: string } => {
                return typeof err === 'object' && err !== null && 'code' in err;
            };

            if (isFirebaseError(error)) {
                if (error.code === 'auth/user-not-found') {
                    if (t) toast.error(t("userNotFound") || "لم يتم العثور على المستخدم");
                } else if (error.code === 'auth/wrong-password') {
                    if (t) toast.error(t("wrongPassword") || "كلمة المرور غير صحيحة");
                } else {
                    if (t) toast.error(t("errorOccurred"));
                }
            } else {
                if (t) toast.error(t("errorOccurred"));
            }
            return false;
        }
    }, [t]);

    // Auth state listener
    useEffect(() => {
        // ✅ FIXED: Debug Login Override - Development Only
        if (import.meta.env.DEV) {
            const debugUser = safeLocalStorage.getItem('debugUser');
            if (debugUser) {
                try {
                    const parsedUser = JSON.parse(debugUser);
                    setUser(parsedUser);
                    checkUserRole(parsedUser.email);
                    return;
                } catch (error) {
                    if (import.meta.env.DEV) {
                        console.error('Invalid debug user data:', error);
                    }
                    safeLocalStorage.removeItem('debugUser');
                }
            }
        }

        // Check for Demo User session or URL param ?demo=client|tech|admin
        const urlParams = new URLSearchParams(window.location.search);
        const demoParam = urlParams.get('demo');
        const savedDemo = safeLocalStorage.getItem('fixsy_demo_user');
        const savedRole = safeLocalStorage.getItem('fixsy_demo_role');

        const activeDemoRole = (demoParam && (demoParam === 'client' || demoParam === 'tech' || demoParam === 'admin'))
            ? demoParam
            : (savedDemo && savedRole ? savedRole : null);

        if (activeDemoRole && (activeDemoRole === 'client' || activeDemoRole === 'tech' || activeDemoRole === 'admin')) {
            const demo = DEMO_USERS[activeDemoRole as 'client' | 'tech' | 'admin'];
            const mockUser = {
                ...demo,
                emailVerified: true,
                isAnonymous: false,
                metadata: {},
                providerData: [],
                refreshToken: '',
                tenantId: null,
                delete: async () => {},
                getIdToken: async () => 'demo-token',
                getIdTokenResult: async () => ({ token: 'demo-token' } as any),
                reload: async () => {},
                toJSON: () => ({}),
                phoneNumber: null,
                providerId: 'demo'
            } as unknown as User;
            safeLocalStorage.setItem('fixsy_demo_user', JSON.stringify(demo));
            safeLocalStorage.setItem('fixsy_demo_role', activeDemoRole);
            safeLocalStorage.setItem('skipLogin', 'true');
            setUser(mockUser);
            setUserRole(activeDemoRole as Role);
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                if (currentUser.email) checkUserRole(currentUser.email);
            } else {
                setUser(null);
                setUserRole(null);
            }
            // Defer loading resolution to ensure initial render shows loading state
            setTimeout(() => setLoading(false), 0);
        });
        return () => unsubscribe();
    }, []);

    const logout = useCallback(async () => {
        try {
            await signOut(auth);
            setUser(null);
            setUserRole(null);
            setClientProfile(null);
            if (t) toast.success(t("loggedOut") || "Logged out successfully");
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error("Logout error:", error);
            }
            if (t) toast.error(t("errorOccurred"));
        }
    }, [t]);

    // Register as client
    const registerAsClient = useCallback(async (referralCodeInput: string = '') => {
        if (!user) return false;

        let startingBalance = 0;
        let referredBy: string | null = null;

        if (referralCodeInput) {
            const q = query(collection(db, "clients"), where("referralCode", "==", referralCodeInput.trim().toUpperCase()));
            const snap = await getDocs(q);

            const qTech = query(collection(db, "technicians"), where("referralCode", "==", referralCodeInput.trim().toUpperCase()));
            const snapTech = await getDocs(qTech);

            if (!snap.empty || !snapTech.empty) {
                startingBalance = 20;
                referredBy = referralCodeInput.trim().toUpperCase();

                const referrerDoc = !snap.empty ? snap.docs[0] : snapTech.docs[0];
                const collectionName = !snap.empty ? "clients" : "technicians";

                await updateDoc(doc(db, collectionName, referrerDoc.id), {
                    walletBalance: increment(50),
                    referralCount: increment(1)
                });
                if (t) toast.success(t("referralApplied"));
            } else {
                if (t) toast.error(t("invalidReferral"));
                return false;
            }
        }

        try {
            // ✅ FIXED: Input validation for displayName
            const sanitizedName = (user.displayName || "USER")
                .trim()
                .replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '') // Remove special characters, keep alphanumeric + Arabic
                .substring(0, 4)
                .toUpperCase();

            const finalName = sanitizedName || "USER";
            const myCode = (finalName + Math.floor(1000 + Math.random() * 9000)).toUpperCase();

            await addDoc(collection(db, "clients"), {
                email: user.email,
                name: user.displayName,
                role: 'client',
                walletBalance: startingBalance,
                referralCode: myCode,
                referredBy: referredBy
            });

            setUserRole('client');
            safeLocalStorage.setItem('fixsy_user_role', 'client');
            if (t) toast.success(t("registrationSuccess") || t("welcome"));
            return true;
        } catch (error) {
            console.warn("Could not sync client document to Firestore:", error);
            // Optimistically allow client to continue locally
            setUserRole('client');
            safeLocalStorage.setItem('fixsy_user_role', 'client');
            if (t) toast.success(t("welcome") || "مرحباً بك!");
            return true;
        }
    }, [user, t]);

    // Apply referral code for existing users
    const applyReferralCode = useCallback(async (referralCodeInput: string): Promise<boolean> => {
        if (!user || !user.email) return false;

        const trimmedCode = referralCodeInput.trim().toUpperCase();
        if (!trimmedCode) {
            if (t) toast.error(t("enterReferralCode") || "أدخل كود الإحالة");
            return false;
        }

        try {
            // Find the user's document
            const userCollection = userRole === 'tech' ? 'technicians' : 'clients';
            const userQuery = query(collection(db, userCollection), where("email", "==", user.email));
            const userSnapshot = await getDocs(userQuery);

            if (userSnapshot.empty) {
                if (t) toast.error(t("userNotFound") || "لم يتم العثور على المستخدم");
                return false;
            }

            const userDoc = userSnapshot.docs[0];
            const userData = userDoc.data();

            // Check if user already has a referral code applied
            if (userData.referredBy) {
                if (t) toast.error(t("referralAlreadyApplied") || "تم تطبيق كود إحالة بالفعل");
                return false;
            }

            // Search for the referrer in both collections
            const clientRefQuery = query(collection(db, "clients"), where("referralCode", "==", trimmedCode));
            const clientRefSnap = await getDocs(clientRefQuery);

            const techRefQuery = query(collection(db, "technicians"), where("referralCode", "==", trimmedCode));
            const techRefSnap = await getDocs(techRefQuery);

            if (clientRefSnap.empty && techRefSnap.empty) {
                if (t) toast.error(t("invalidReferral") || "كود إحالة غير صحيح");
                return false;
            }

            const referrerDoc = !clientRefSnap.empty ? clientRefSnap.docs[0] : techRefSnap.docs[0];
            const referrerCollection = !clientRefSnap.empty ? "clients" : "technicians";

            // Update referrer (give them 50 SAR bonus)
            await updateDoc(doc(db, referrerCollection, referrerDoc.id), {
                walletBalance: increment(50),
                referralCount: increment(1)
            });

            // Update current user (give them 20 SAR bonus)
            await updateDoc(doc(db, userCollection, userDoc.id), {
                walletBalance: increment(20),
                referredBy: trimmedCode
            });

            if (t) toast.success(t("referralApplied") || "تم تطبيق كود الإحالة بنجاح! 🎉");
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            return true;
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error("Apply referral error:", error);
            }
            if (t) toast.error(t("errorOccurred") || "حدث خطأ");
            return false;
        }
    }, [user, userRole, t]);

    return {
        user,
        userRole,
        setUserRole,
        clientProfile,
        setClientProfile,
        handleGoogleLogin,
        handleEmailSignUp,
        handleEmailLogin,
        handleGuestLogin,
        checkUserRole,
        registerAsClient,
        applyReferralCode,
        loading,
        logout
    };
}

export default useAuth;
