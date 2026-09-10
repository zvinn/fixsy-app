// src/api/bookings.js
// API layer for booking-related Firestore operations

import { db } from '../services/firebase';
import {
    collection,
    query,
    where,
    getDocs,
    doc,
    updateDoc,
    addDoc,
    deleteDoc,
    orderBy,
    onSnapshot
} from 'firebase/firestore';

/**
 * Create a new booking
 * @param {object} bookingData - Booking details
 * @returns {Promise<string>} Created booking ID
 */
export const createBooking = async (bookingData) => {
    try {
        const docRef = await addDoc(collection(db, "requests"), {
            ...bookingData,
            status: "pending",
            date: new Date().toISOString()
        });
        return docRef.id;
    } catch (error) {
        console.error("Error creating booking:", error);
        throw error;
    }
};

/**
 * Fetch bookings for a client
 * @param {string} clientEmail - Client email
 * @returns {Promise<Array>} Client's bookings
 */
export const fetchClientBookings = async (clientEmail) => {
    try {
        const q = query(
            collection(db, "requests"),
            where("client_email", "==", clientEmail),
            orderBy("date", "desc")
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching client bookings:", error);
        throw error;
    }
};

/**
 * Fetch bookings for a technician
 * @param {string} techEmail - Technician email
 * @returns {Promise<Array>} Technician's bookings
 */
export const fetchTechnicianBookings = async (techEmail) => {
    try {
        const q = query(
            collection(db, "requests"),
            where("technician_email", "==", techEmail),
            orderBy("date", "desc")
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching technician bookings:", error);
        throw error;
    }
};

/**
 * Update booking status
 * @param {string} bookingId - Booking document ID
 * @param {string} status - New status
 * @param {object} additionalData - Additional fields to update
 * @returns {Promise<void>}
 */
export const updateBookingStatus = async (bookingId, status, additionalData = {}) => {
    try {
        await updateDoc(doc(db, "requests", bookingId), {
            status,
            ...additionalData,
            updatedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error("Error updating booking status:", error);
        throw error;
    }
};

/**
 * Cancel a booking
 * @param {string} bookingId - Booking document ID
 * @param {string} reason - Cancellation reason
 * @returns {Promise<void>}
 */
export const cancelBooking = async (bookingId, reason = '') => {
    try {
        await updateDoc(doc(db, "requests", bookingId), {
            status: "cancelled",
            cancelledReason: reason,
            cancelledAt: new Date().toISOString()
        });
    } catch (error) {
        console.error("Error cancelling booking:", error);
        throw error;
    }
};

/**
 * Add review to a booking
 * @param {string} bookingId - Booking document ID
 * @param {object} reviewData - Review details (rating, comment, tip)
 * @returns {Promise<void>}
 */
export const addBookingReview = async (bookingId, reviewData) => {
    try {
        await updateDoc(doc(db, "requests", bookingId), {
            rating: reviewData.rating,
            review: reviewData.comment,
            tip: reviewData.tip || 0,
            reviewedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error("Error adding booking review:", error);
        throw error;
    }
};

/**
 * Subscribe to booking updates (real-time)
 * @param {string} bookingId - Booking document ID
 * @param {function} callback - Callback function for updates
 * @returns {function} Unsubscribe function
 */
export const subscribeToBooking = (bookingId, callback) => {
    return onSnapshot(doc(db, "requests", bookingId), (docSnap) => {
        if (docSnap.exists()) {
            callback({ id: docSnap.id, ...docSnap.data() });
        }
    });
};

/**
 * Fetch all pending bookings (for admin)
 * @returns {Promise<Array>} Pending bookings
 */
export const fetchPendingBookings = async () => {
    try {
        const q = query(
            collection(db, "requests"),
            where("status", "==", "pending"),
            orderBy("date", "desc")
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching pending bookings:", error);
        throw error;
    }
};

export default {
    createBooking,
    fetchClientBookings,
    fetchTechnicianBookings,
    updateBookingStatus,
    cancelBooking,
    addBookingReview,
    subscribeToBooking,
    fetchPendingBookings
};
