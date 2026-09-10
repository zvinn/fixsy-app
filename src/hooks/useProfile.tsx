// src/hooks/useProfile.tsx
// Custom hook for profile data management

import { useState, useEffect, useCallback } from 'react';
import { db, auth } from '../services/firebase';
import { collection, query, where, getDocs, updateDoc, doc, deleteDoc, arrayUnion, arrayRemove, DocumentData } from 'firebase/firestore';
import { deleteUser, signOut, updateProfile, User } from 'firebase/auth';
import toast from 'react-hot-toast';
import { Address, TranslationFunction, ConfettiFunction } from '../types';
import { env } from '../config/env';

interface UserProfile {
    name?: string;
    email?: string;
    phone?: string;
    role?: string;
    photoURL?: string;
    img?: string;
    addresses?: Address[];
    notificationsEnabled?: boolean;
    isPlus?: boolean;
    level?: string;
    plusSince?: string;
    walletBalance?: number;
    debt?: number;
    emergencyContact?: string;
    referralCode?: string;
    favorites?: string[];
    [key: string]: unknown; // Using unknown instead of any for better type safety
}

/**
 * Custom hook to manage user profile data and actions
 * @param {User | null} user - Firebase auth user
 * @param {string} userRole - User role (client, tech, admin)
 * @param {TranslationFunction} t - Translation function
 * @returns {object} Profile state and actions
 */
export const useProfile = (user: User | null, userRole: string, t: TranslationFunction) => {
    const [userData, setUserData] = useState<UserProfile | null>(null);
    const [docId, setDocId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editForm, setEditForm] = useState<UserProfile>({});

    // Fetch user data on mount
    useEffect(() => {
        const fetchData = async () => {
            if (!user) {
                setIsLoading(false);
                return;
            }

            if (userRole === 'admin') {
                setUserData({
                    name: user.displayName || t("adminRole"),
                    email: user.email ?? undefined,
                    phone: t("notRegistered"),
                    role: 'admin',
                    photoURL: user.photoURL ?? undefined
                });
                setIsLoading(false);
                return;
            }

            const collectionName = userRole === 'tech' ? 'technicians' : 'clients';
            try {
                const q = query(collection(db, collectionName), where("email", "==", user.email));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    const docData = querySnapshot.docs[0];
                    setUserData({ ...docData.data(), photoURL: docData.data().img || user.photoURL } as UserProfile);
                    setDocId(docData.id);
                    setEditForm(docData.data() as UserProfile);
                } else {
                    setUserData({ name: user.displayName ?? undefined, email: user.email ?? undefined, phone: '', photoURL: user.photoURL ?? undefined });
                }
            } catch (error) {
                if (import.meta.env.DEV) {
                    console.error("Error fetching profile:", error);
                }
                setUserData({ name: user.displayName ?? undefined, email: user.email ?? undefined, photoURL: user.photoURL ?? undefined });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [user, userRole, t]);

    // Upload image to Cloudinary
    const uploadToCloudinary = useCallback(async (fileToUpload: File) => {
        const formData = new FormData();
        formData.append("file", fileToUpload);
        formData.append("upload_preset", env.cloudinary.uploadPreset || "fixsy_preset");
        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/${env.cloudinary.cloudName}/image/upload`, {
                method: "POST",
                body: formData
            });
            const data = await res.json();
            return data.secure_url;
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error("Cloudinary upload error:", error);
            }
            return null;
        }
    }, []);

    // Update profile image
    const updateProfileImage = useCallback(async (file: File) => {
        if (!file) return false;

        const imageUrl = await uploadToCloudinary(file);
        if (imageUrl && auth.currentUser) {
            try {
                await updateProfile(auth.currentUser, { photoURL: imageUrl });
                if (docId) {
                    const collectionName = userRole === 'tech' ? 'technicians' : 'clients';
                    await updateDoc(doc(db, collectionName, docId), { img: imageUrl });
                }
                setUserData(prev => prev ? ({ ...prev, photoURL: imageUrl }) : null);
                toast.success(t("photoChanged"));
                return true;
            } catch (err) {
                toast.error(t("updateFailed"));
                return false;
            }
        }
        return false;
    }, [docId, userRole, uploadToCloudinary, t]);

    // Save profile changes
    const saveProfile = useCallback(async () => {
        if (userRole === 'admin') {
            toast.error(t("adminNoEdit"));
            return false;
        }
        if (!docId) {
            toast.error(t("noRecord"));
            return false;
        }

        try {
            const collectionName = userRole === 'tech' ? 'technicians' : 'clients';
            await updateDoc(doc(db, collectionName, docId), {
                name: editForm.name,
                phone: editForm.phone || '',
                emergencyContact: editForm.emergencyContact || ''
            });
            setUserData(prev => ({ ...prev, ...editForm }));
            setIsEditing(false);
            toast.success(t("updateSuccess"));
            return true;
        } catch (error) {
            toast.error(t("genericError"));
            return false;
        }
    }, [docId, userRole, editForm, t]);

    // Add address (for clients)
    const addAddress = useCallback(async (address: string) => {
        if (!address.trim() || !docId) return false;

        try {
            const newAddr = { id: Date.now(), title: t("other"), detail: address };
            await updateDoc(doc(db, "clients", docId), {
                addresses: arrayUnion(newAddr)
            });
            setUserData(prev => prev ? ({
                ...prev,
                addresses: [...(prev.addresses || []), newAddr]
            }) : null);
            toast.success(t("save"));
            return true;
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error(error);
            }
            toast.error(t("errorOccurred"));
            return false;
        }
    }, [docId, t]);

    // Delete address (for clients)
    const deleteAddress = useCallback(async (addr: Address) => {
        if (!window.confirm(t("deleteAddressConfirm"))) return false;

        try {
            await updateDoc(doc(db, "clients", docId!), {
                addresses: arrayRemove(addr)
            });
            setUserData(prev => prev ? ({
                ...prev,
                addresses: (prev.addresses || []).filter(a => a.id !== addr.id)
            }) : null);
            toast.success(t("deleteSuccess"));
            return true;
        } catch (error) {
            toast.error(t("errorOccurred"));
            return false;
        }
    }, [docId, t]);

    // Delete account
    const deleteAccount = useCallback(async () => {
        if (userRole === 'admin') {
            toast.error(t("adminNoDelete"));
            return false;
        }
        if (userRole === 'tech' && (userData?.debt || 0) > 0) {
            toast.error(`⛔ ${t("debtWarning")} ${userData?.debt} ${t("currency")}`);
            return false;
        }
        if (!window.confirm(t("confirmDeleteConfig"))) return false;

        try {
            const collectionName = userRole === 'tech' ? 'technicians' : 'clients';
            if (docId) await deleteDoc(doc(db, collectionName, docId));
            if (auth.currentUser) await deleteUser(auth.currentUser);
            toast.success(t("deleteSuccess"));
            window.location.reload();
            return true;
        } catch (error) {
            toast.error(t("logoutAndRetry"));
            return false;
        }
    }, [userRole, userData, docId, t]);

    // Logout
    const logout = useCallback(() => {
        signOut(auth);
        window.location.reload();
    }, []);

    // Toggle notifications
    const toggleNotifications = useCallback(async () => {
        try {
            const newVal = !userData?.notificationsEnabled;
            setUserData(prev => prev ? ({ ...prev, notificationsEnabled: newVal }) : null);

            if (docId) {
                const collectionName = userRole === 'tech' ? 'technicians' : 'clients';
                await updateDoc(doc(db, collectionName, docId), { notificationsEnabled: newVal });
            }
            toast.success(newVal ? t("notificationsEnabled") || "Notifications Enabled" : t("notificationsDisabled") || "Notifications Disabled");
            return true;
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error(error);
            }
            toast.error(t("errorOccurred"));
            setUserData(prev => prev ? ({ ...prev, notificationsEnabled: !prev?.notificationsEnabled }) : null);
            return false;
        }
    }, [userData, userRole, docId, t]);

    // Upgrade to Plus
    const upgradeToPLus = useCallback(async () => {
        if (userData?.isPlus) {
            toast.success(t("alreadyPlus") || "You are already a Plus member!");
            return false;
        }

        const PRICE = 100;
        if (!window.confirm(`${t("confirmUpgrade") || "Upgrade to Fixsy Plus for"} ${PRICE} ${t("currency")}?`)) {
            return false;
        }

        if ((userData?.walletBalance || 0) < PRICE) {
            toast.error(t("insufficientBalance"));
            return false;
        }

        try {
            if (docId) {
                await updateDoc(doc(db, "clients", docId), {
                    walletBalance: (userData?.walletBalance || 0) - PRICE,
                    isPlus: true,
                    level: 'Gold',
                    plusSince: new Date().toISOString()
                });
            }

            setUserData(prev => prev ? ({
                ...prev,
                walletBalance: (prev.walletBalance || 0) - PRICE,
                isPlus: true,
                level: 'Gold'
            }) : null);

            // Celebration
            import('canvas-confetti').then((confetti: any) => {
                confetti.default({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            });

            toast.success(t("welcomePlus") || "Welcome to Fixsy Plus! 💎");
            return true;
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error(error);
            }
            toast.error(t("errorOccurred"));
            return false;
        }
    }, [userData, docId, t]);

    // Share referral code
    const shareReferral = useCallback(async () => {
        const referralCode = userData?.referralCode ||
            ((userData?.name?.substring(0, 4) || "USER") + (userData?.phone?.substring((userData.phone?.length || 0) - 4) || "2024"))
                .toUpperCase().replace(/\s/g, '');

        const shareData = {
            title: t("referralTitle"),
            text: `${t("referralText")} ${referralCode} ${t("gift50").split('!')[0]}`,
            url: 'https://fixsy-app-1d3b7.web.app',
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                if (import.meta.env.DEV) {
                    console.error(err);
                }
            }
        } else {
            navigator.clipboard.writeText(shareData.text);
            toast.success(t("codeCopied"));
        }
    }, [userData, t]);

    return {
        // State
        userData,
        setUserData,
        docId,
        isLoading,
        isEditing,
        setIsEditing,
        editForm,
        setEditForm,

        // Actions
        uploadToCloudinary,
        updateProfileImage,
        saveProfile,
        addAddress,
        deleteAddress,
        deleteAccount,
        logout,
        toggleNotifications,
        upgradeToPLus,
        shareReferral
    };
};

export default useProfile;
