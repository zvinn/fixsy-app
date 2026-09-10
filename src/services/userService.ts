import { db, auth } from './firebase';
import { collection, query, where, getDocs, updateDoc, doc, deleteDoc, arrayUnion, arrayRemove, DocumentData } from 'firebase/firestore';
import { deleteUser, updateProfile, User } from 'firebase/auth';

export interface Address {
    id: number;
    title: string;
    detail: string;
}

export interface UserProfileData {
    name?: string;
    email?: string;
    phone?: string;
    photoURL?: string;
    img?: string;
    role?: 'admin' | 'tech' | 'client';
    isVerified?: boolean | 'pending' | 'approved';
    rejectionReason?: string;
    nationalId?: string;
    idCardImage?: string;
    debt?: number;
    walletBalance?: number;
    loyaltyPoints?: number;
    streak?: number;
    referralCode?: string;
    referralCount?: number;
    level?: 'Platinum' | 'Gold' | 'Silver' | 'Bronze';
    isPlus?: boolean;
    plusSince?: string;
    notificationsEnabled?: boolean;
    favorites?: string[];
    portfolio?: string[];
    addresses?: Address[];
    emergencyContact?: string;
    [key: string]: any;
}

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const userService = {
    async fetchUserProfile(user: User, userRole: string): Promise<{ data: UserProfileData, id: string | null }> {
        if (!user.email) throw new Error("User email is missing");

        if (userRole === 'admin') {
            return {
                data: {
                    name: user.displayName || 'Admin',
                    email: user.email,
                    phone: '',
                    role: 'admin',
                    photoURL: user.photoURL || undefined
                },
                id: null
            };
        }

        const collectionName = userRole === 'tech' ? 'technicians' : 'clients';
        const q = query(collection(db, collectionName), where("email", "==", user.email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const docData = querySnapshot.docs[0];
            const data = docData.data() as UserProfileData;
            return {
                data: { ...data, photoURL: data.img || user.photoURL || undefined },
                id: docData.id
            };
        } else {
            return {
                data: {
                    name: user.displayName || '',
                    email: user.email,
                    phone: '',
                    photoURL: user.photoURL || undefined
                },
                id: null
            };
        }
    },

    async updateProfileImage(user: User, file: File, docId: string | null, userRole: string): Promise<string | null> {
        const formData = new FormData();
        formData.append("file", file);
        if (UPLOAD_PRESET) formData.append("upload_preset", UPLOAD_PRESET);

        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: "POST", body: formData });
            const data = await res.json();
            const imageUrl = data.secure_url;

            if (imageUrl) {
                await updateProfile(user, { photoURL: imageUrl });
                if (docId) {
                    const collectionName = userRole === 'tech' ? 'technicians' : 'clients';
                    await updateDoc(doc(db, collectionName, docId), { img: imageUrl });
                }
                return imageUrl;
            }
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error(error);
            }
            throw error;
        }
        return null;
    },

    async uploadImage(file: File): Promise<string | null> {
        const formData = new FormData();
        formData.append("file", file);
        if (UPLOAD_PRESET) formData.append("upload_preset", UPLOAD_PRESET);

        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: "POST", body: formData });
            const data = await res.json();
            return data.secure_url;
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error(error);
            }
            return null;
        }
    },

    async updateProfileData(docId: string, userRole: string, data: Partial<UserProfileData>) {
        const collectionName = userRole === 'tech' ? 'technicians' : 'clients';
        await updateDoc(doc(db, collectionName, docId), data);
    },

    async submitVerification(docId: string, nationalId: string, idCardImage: string, portfolioUrls: string[]) {
        const userRef = doc(db, "technicians", docId);
        await updateDoc(userRef, {
            nationalId,
            idCardImage,
            isVerified: "pending",
            rejectionReason: "",
            portfolio: portfolioUrls.length > 0 ? arrayUnion(...portfolioUrls) : undefined
        });
    },

    async addAddress(docId: string, address: Address) {
        await updateDoc(doc(db, "clients", docId), { addresses: arrayUnion(address) });
    },

    async deleteAddress(docId: string, address: Address) {
        await updateDoc(doc(db, "clients", docId), { addresses: arrayRemove(address) });
    },

    async deleteAccount(docId: string, userRole: string, user: User) {
        const collectionName = userRole === 'tech' ? 'technicians' : 'clients';
        await deleteDoc(doc(db, collectionName, docId));
        await deleteUser(user);
    },

    async toggleNotifications(docId: string, userRole: string, enabled: boolean) {
        const collectionName = userRole === 'tech' ? 'technicians' : 'clients';
        await updateDoc(doc(db, collectionName, docId), { notificationsEnabled: enabled });
    }
};
