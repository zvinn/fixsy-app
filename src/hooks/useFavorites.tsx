// src/hooks/useFavorites.tsx
import { useState, useEffect, useCallback } from 'react';
import { db } from '../services/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';
import { User } from 'firebase/auth';

/**
 * Custom hook for managing user favorites
 * @param {User | null} user - Current authenticated user
 * @returns {object} favorites state and toggle function
 */
export const useFavorites = (user: User | null) => {
    const { t } = useLanguage();
    const [favorites, setFavorites] = useState<string[]>([]);

    // Load Favorites on User Load
    useEffect(() => {
        if (user && user.uid) {
            const fetchFavs = async () => {
                try {
                    const userDoc = await getDocs(
                        query(collection(db, "clients"), where("email", "==", user.email))
                    );
                    if (!userDoc.empty) {
                        setFavorites(userDoc.docs[0].data().favorites || []);
                    }
                } catch (error) {
                    console.error("Error fetching favorites:", error);
                }
            };
            fetchFavs();
        }
    }, [user]);

    /**
     * Toggle favorite status for a technician
     * @param {string} techId - Technician ID to toggle
     */
    const toggleFavorite = useCallback(async (techId: string) => {
        if (!user) return toast.error(t("loginFirst"));

        let newFavs: string[] = [];
        if (favorites.includes(techId)) {
            newFavs = favorites.filter(id => id !== techId);
            toast.success(t("removedFromFav"));
        } else {
            newFavs = [...favorites, techId];
            toast.success(t("addedToFav"));
        }
        setFavorites(newFavs);

        // Persist to Firestore
        try {
            const q = query(collection(db, "clients"), where("email", "==", user.email));
            const snap = await getDocs(q);
            if (!snap.empty) {
                await updateDoc(doc(db, "clients", snap.docs[0].id), { favorites: newFavs });
            }
        } catch (error) {
            console.error("Error updating favorites:", error);
            toast.error(t("errorOccurred"));
        }
    }, [user, favorites, t]);

    /**
     * Check if a technician is in favorites
     * @param {string} techId - Technician ID to check
     * @returns {boolean}
     */
    const isFavorite = useCallback((techId: string) => {
        return favorites.includes(techId);
    }, [favorites]);

    return { favorites, toggleFavorite, isFavorite };
};

export default useFavorites;
