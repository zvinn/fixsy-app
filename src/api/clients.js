// src/api/clients.js
// API layer for client-related Firestore operations

import { db } from '../services/firebase';
import {
    collection,
    query,
    where,
    getDocs,
    doc,
    updateDoc,
    addDoc,
    onSnapshot,
    arrayUnion,
    arrayRemove
} from 'firebase/firestore';

/**
 * Get client by email
 * @param {string} email - Client email
 * @returns {Promise<object|null>} Client data or null
 */
export const getClientByEmail = async (email) => {
    try {
        const q = query(collection(db, "clients"), where("email", "==", email));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) return null;
        const docSnap = querySnapshot.docs[0];
        return { id: docSnap.id, ...docSnap.data() };
    } catch (error) {
        console.error("Error fetching client by email:", error);
        throw error;
    }
};

/**
 * Create new client profile
 * @param {object} clientData - Client profile data
 * @returns {Promise<string>} Created client ID
 */
export const createClient = async (clientData) => {
    try {
        const docRef = await addDoc(collection(db, "clients"), {
            ...clientData,
            createdAt: new Date().toISOString(),
            favorites: [],
            addresses: []
        });
        return docRef.id;
    } catch (error) {
        console.error("Error creating client:", error);
        throw error;
    }
};

/**
 * Update client profile
 * @param {string} clientId - Client document ID
 * @param {object} updates - Fields to update
 * @returns {Promise<void>}
 */
export const updateClient = async (clientId, updates) => {
    try {
        await updateDoc(doc(db, "clients", clientId), {
            ...updates,
            updatedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error("Error updating client:", error);
        throw error;
    }
};

/**
 * Add address to client profile
 * @param {string} clientId - Client document ID
 * @param {string} address - New address
 * @returns {Promise<void>}
 */
export const addClientAddress = async (clientId, address) => {
    try {
        await updateDoc(doc(db, "clients", clientId), {
            addresses: arrayUnion(address)
        });
    } catch (error) {
        console.error("Error adding address:", error);
        throw error;
    }
};

/**
 * Remove address from client profile
 * @param {string} clientId - Client document ID
 * @param {string} address - Address to remove
 * @returns {Promise<void>}
 */
export const removeClientAddress = async (clientId, address) => {
    try {
        await updateDoc(doc(db, "clients", clientId), {
            addresses: arrayRemove(address)
        });
    } catch (error) {
        console.error("Error removing address:", error);
        throw error;
    }
};

/**
 * Toggle favorite technician
 * @param {string} clientId - Client document ID
 * @param {string} techId - Technician ID
 * @param {boolean} isFavorite - Add or remove from favorites
 * @returns {Promise<void>}
 */
export const toggleFavoriteTechnician = async (clientId, techId, isFavorite) => {
    try {
        if (isFavorite) {
            await updateDoc(doc(db, "clients", clientId), {
                favorites: arrayUnion(techId)
            });
        } else {
            await updateDoc(doc(db, "clients", clientId), {
                favorites: arrayRemove(techId)
            });
        }
    } catch (error) {
        console.error("Error toggling favorite:", error);
        throw error;
    }
};

/**
 * Subscribe to client profile updates (real-time)
 * @param {string} email - Client email
 * @param {function} callback - Callback function for updates
 * @returns {function} Unsubscribe function
 */
export const subscribeToClientProfile = (email, callback) => {
    const q = query(collection(db, "clients"), where("email", "==", email));
    return onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
            const docSnap = snapshot.docs[0];
            callback({ id: docSnap.id, ...docSnap.data() });
        }
    });
};

/**
 * Update client FCM token
 * @param {string} clientId - Client document ID
 * @param {string} token - FCM token
 * @returns {Promise<void>}
 */
export const updateClientFCMToken = async (clientId, token) => {
    try {
        await updateDoc(doc(db, "clients", clientId), { fcmToken: token });
    } catch (error) {
        console.error("Error updating FCM token:", error);
        throw error;
    }
};

export default {
    getClientByEmail,
    createClient,
    updateClient,
    addClientAddress,
    removeClientAddress,
    toggleFavoriteTechnician,
    subscribeToClientProfile,
    updateClientFCMToken
};
