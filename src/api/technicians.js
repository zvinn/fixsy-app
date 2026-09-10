// src/api/technicians.js
// API layer for technician-related Firestore operations

import { db } from '../services/firebase';
import {
    collection,
    query,
    where,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    addDoc,
    orderBy,
    limit
} from 'firebase/firestore';

/**
 * Fetch all active technicians
 * @returns {Promise<Array>} List of technicians
 */
export const fetchTechnicians = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "technicians"));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching technicians:", error);
        throw error;
    }
};

/**
 * Fetch technicians by service type
 * @param {string} serviceType - Service type to filter by
 * @returns {Promise<Array>} Filtered technicians
 */
export const fetchTechniciansByService = async (serviceType) => {
    try {
        const q = query(
            collection(db, "technicians"),
            where("specialty", "==", serviceType),
            where("role", "==", "tech")
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching technicians by service:", error);
        throw error;
    }
};

/**
 * Fetch pending technician applications
 * @returns {Promise<Array>} Pending technicians
 */
export const fetchPendingTechnicians = async () => {
    try {
        const q = query(collection(db, "technicians"), where("role", "==", "pending"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching pending technicians:", error);
        throw error;
    }
};

/**
 * Approve a technician application
 * @param {string} techId - Technician document ID
 * @returns {Promise<void>}
 */
export const approveTechnician = async (techId) => {
    try {
        await updateDoc(doc(db, "technicians", techId), { role: "tech" });
    } catch (error) {
        console.error("Error approving technician:", error);
        throw error;
    }
};

/**
 * Reject a technician application
 * @param {string} techId - Technician document ID
 * @param {string} reason - Rejection reason
 * @returns {Promise<void>}
 */
export const rejectTechnician = async (techId, reason = '') => {
    try {
        await updateDoc(doc(db, "technicians", techId), {
            role: "rejected",
            rejectionReason: reason,
            rejectedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error("Error rejecting technician:", error);
        throw error;
    }
};

/**
 * Update technician profile
 * @param {string} techId - Technician document ID
 * @param {object} updates - Fields to update
 * @returns {Promise<void>}
 */
export const updateTechnician = async (techId, updates) => {
    try {
        await updateDoc(doc(db, "technicians", techId), updates);
    } catch (error) {
        console.error("Error updating technician:", error);
        throw error;
    }
};

/**
 * Fetch top-rated technicians
 * @param {number} count - Number of technicians to fetch
 * @returns {Promise<Array>} Top-rated technicians
 */
export const fetchTopTechnicians = async (count = 5) => {
    try {
        const q = query(
            collection(db, "technicians"),
            where("role", "==", "tech"),
            orderBy("rating", "desc"),
            limit(count)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching top technicians:", error);
        throw error;
    }
};

/**
 * Get technician by email
 * @param {string} email - Technician email
 * @returns {Promise<object|null>} Technician data or null
 */
export const getTechnicianByEmail = async (email) => {
    try {
        const q = query(collection(db, "technicians"), where("email", "==", email));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) return null;
        const docSnap = querySnapshot.docs[0];
        return { id: docSnap.id, ...docSnap.data() };
    } catch (error) {
        console.error("Error fetching technician by email:", error);
        throw error;
    }
};

export default {
    fetchTechnicians,
    fetchTechniciansByService,
    fetchPendingTechnicians,
    approveTechnician,
    rejectTechnician,
    updateTechnician,
    fetchTopTechnicians,
    getTechnicianByEmail
};
