// src/hooks/useBooking.ts
// Booking logic hook - extracted from App.tsx for better architecture

import { useState, useCallback } from 'react';
import { db } from '../services/firebase';
import { collection, query, where, getDocs, updateDoc, doc, addDoc, increment } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { User } from 'firebase/auth';
import { Technician, BookingFormData, AIAnalysisResult } from '../types';
import { env } from '../config/env';

interface UseBookingProps {
    user: User | null;
    t: (key: string, params?: Record<string, any>) => string;
}

interface BookingResult {
    id: string;
    technician_name: string;
    technician_image?: string;
    serviceType?: string;
    client_address: string;
    scheduledDate: string;
    paymentMethod: string;
    price: number;
}

interface CouponState {
    code: string;
    discount: number;
}

export const useBooking = ({ user, t }: UseBookingProps) => {
    const [selectedTech, setSelectedTech] = useState<Technician | null>(null);
    const [formData, setFormData] = useState<BookingFormData>({
        problem: '',
        category: '',
        location: '',
        phone: '',
        address: ''
    });
    const [problemFile, setProblemFile] = useState<File | null>(null);
    const [coupon, setCoupon] = useState<CouponState>({ code: '', discount: 0 });
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'wallet' | 'visa' | 'card'>('cash');
    const [lastBookingDetails, setLastBookingDetails] = useState<BookingResult | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    /**
     * Upload image to Cloudinary
     */
    const uploadImage = async (file: File): Promise<string | null> => {
        const formData = new FormData();
        formData.append("file", file);
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
                console.error("Image upload error:", error);
            }
            return null;
        }
    };

    /**
     * Apply coupon code
     */
    const applyCoupon = useCallback(async () => {
        if (!coupon.code) return toast.error(t("enterCode"));

        const loadingToast = toast.loading(t("verifying"));
        try {
            const q = query(collection(db, "coupons"), where("code", "==", coupon.code.toUpperCase()));
            const snapshot = await getDocs(q);
            toast.dismiss(loadingToast);

            if (snapshot.empty) {
                setCoupon(prev => ({ ...prev, discount: 0 }));
                return toast.error(t("invalidCode"));
            }

            const couponData = snapshot.docs[0].data();
            if (!couponData.isActive) return toast.error(t("inactive"));

            setCoupon(prev => ({ ...prev, discount: couponData.discount }));
            toast.success(t("discountApplied", { discount: couponData.discount }));
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error(t("errorOccurred"));
        }
    }, [coupon.code, t]);

    /**
     * Validate technician schedule
     */
    const validateSchedule = (tech: Technician, appointmentTime: string): boolean => {
        if (!tech.workingHours) return true;

        const date = new Date(appointmentTime);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        const time = date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

        if (tech.workingHours.offDays?.includes(dayName)) {
            toast.error(t("techOffDay", { day: dayName }));
            return false;
        }

        if (time < tech.workingHours.start || time > tech.workingHours.end) {
            toast.error(t("techOutsideHours", { start: tech.workingHours.start, end: tech.workingHours.end }));
            return false;
        }

        return true;
    };

    /**
     * Process wallet payment
     */
    const processWalletPayment = async (email: string, amount: number): Promise<boolean> => {
        const clientQuery = query(collection(db, "clients"), where("email", "==", email));
        const clientSnap = await getDocs(clientQuery);

        if (clientSnap.empty) {
            toast.error(t("errorOccurred"));
            return false;
        }

        const clientDoc = clientSnap.docs[0];
        const currentBalance = clientDoc.data().walletBalance || 0;

        if (currentBalance < amount) {
            toast.error(t("insufficientBalance"));
            return false;
        }

        // Deduct Balance
        await updateDoc(doc(db, "clients", clientDoc.id), {
            walletBalance: increment(-amount)
        });

        // Log Transaction
        await addDoc(collection(db, "transactions"), {
            userId: email,
            amount: amount,
            type: 'payment',
            date: new Date().toISOString(),
            description: `Booking payment`
        });

        return true;
    };

    /**
     * Submit booking
     */
    const submitBooking = useCallback(async (aiResult: AIAnalysisResult | null): Promise<BookingResult | null> => {
        if (!user) {
            toast.error(t("loginFirst"));
            return null;
        }
        if (!selectedTech) return null;

        const appointmentTime = formData.scheduledTime || new Date().toISOString();

        // Validate schedule
        if (!validateSchedule(selectedTech, appointmentTime)) {
            return null;
        }

        setIsSubmitting(true);
        const finalPrice = Math.max(0, (selectedTech.price || 0) - coupon.discount);
        const loadingToast = toast.loading(t("bookingInProgress"));

        try {
            let imageUrl: string | null = null;
            if (problemFile) imageUrl = await uploadImage(problemFile);

            // Wallet payment
            if (paymentMethod === 'wallet' && user.email) {
                const paymentSuccess = await processWalletPayment(user.email, finalPrice);
                if (!paymentSuccess) {
                    toast.dismiss(loadingToast);
                    setIsSubmitting(false);
                    return null;
                }
            }

            // Create booking
            const docRef = await addDoc(collection(db, "requests"), {
                technician_name: selectedTech.name,
                technician_email: selectedTech.email,
                client_name: user.displayName,
                client_email: user.email,
                client_address: formData.address || '',
                location: formData.location || '',
                problem_desc: formData.problem,
                problem_image: imageUrl,
                ai_diagnosis: aiResult ? {
                    type: aiResult.type,
                    advice: aiResult.advice,
                    estimatedPrice: aiResult.estimatedPrice
                } : null,
                original_price: selectedTech.price,
                discount: coupon.discount,
                price: finalPrice,
                coupon_used: coupon.discount > 0 ? coupon.code : null,
                paymentMethod: paymentMethod,
                status: "pending",
                scheduledDate: appointmentTime,
                date: new Date().toISOString()
            });

            // Send notification to technician
            if (selectedTech.email) {
                await addDoc(collection(db, "notifications"), {
                    userId: selectedTech.email,
                    message: `New Request from ${user.displayName || 'Client'}: ${selectedTech.specialty}`,
                    type: 'request',
                    targetId: docRef.id,
                    date: new Date().toISOString(),
                    read: false
                });
            }

            toast.dismiss(loadingToast);

            const bookingData: BookingResult = {
                id: docRef.id,
                technician_name: selectedTech.name,
                technician_image: selectedTech.img || selectedTech.image,
                serviceType: selectedTech.specialty,
                client_address: formData.address || '',
                scheduledDate: appointmentTime,
                paymentMethod: paymentMethod,
                price: finalPrice
            };

            setLastBookingDetails(bookingData);
            return bookingData;

        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error(t("errorOccurred"));
            if (import.meta.env.DEV) {
                console.error("Booking error:", error);
            }
            return null;
        } finally {
            setIsSubmitting(false);
        }
    }, [user, selectedTech, formData, problemFile, coupon, paymentMethod, t]);

    /**
     * Reset booking form
     */
    const resetBooking = useCallback(() => {
        setSelectedTech(null);
        setFormData({
            problem: '',
            category: '',
            location: '',
            phone: '',
            address: ''
        });
        setProblemFile(null);
        setCoupon({ code: '', discount: 0 });
        setPaymentMethod('cash');
        setLastBookingDetails(null);
    }, []);

    return {
        // State
        selectedTech,
        setSelectedTech,
        formData,
        setFormData,
        problemFile,
        setProblemFile,
        coupon,
        setCouponCode: (code: string) => setCoupon(prev => ({ ...prev, code })),
        paymentMethod,
        setPaymentMethod,
        lastBookingDetails,
        isSubmitting,

        // Actions
        applyCoupon,
        submitBooking,
        resetBooking,
        clearBookingDetails: () => setLastBookingDetails(null)
    };
};

export default useBooking;
