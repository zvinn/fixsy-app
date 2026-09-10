// BookingContext.tsx - Centralized booking state management
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { db } from '../services/firebase';
import { collection, addDoc, doc, updateDoc, increment } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { User } from 'firebase/auth';
import { Technician, BookingFormData, AIAnalysisResult } from '../types';
import { analytics } from '../services/analyticsService';
import { env } from '../config/env';

// Payment method type
type PaymentMethod = 'cash' | 'wallet' | 'visa' | 'card';

// Coupon state
interface CouponState {
    code: string;
    discount: number;
}

// Booking result
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

// Context value interface
interface BookingContextValue {
    // State
    selectedTech: Technician | null;
    formData: BookingFormData;
    problemFile: File | null;
    paymentMethod: PaymentMethod;
    coupon: CouponState;
    lastBookingDetails: BookingResult | null;
    isSubmitting: boolean;

    // Actions
    setSelectedTech: (tech: Technician | null) => void;
    setFormData: React.Dispatch<React.SetStateAction<BookingFormData>>;
    setProblemFile: (file: File | null) => void;
    setPaymentMethod: (method: PaymentMethod) => void;
    setCouponCode: (code: string) => void;
    applyCoupon: () => void;
    submitBooking: (e: React.FormEvent, aiResult?: AIAnalysisResult) => Promise<void>;
    resetBooking: () => void;
}

// Create context
const BookingContext = createContext<BookingContextValue | undefined>(undefined);

// Provider props
interface BookingProviderProps {
    children: ReactNode;
    user: User | null;
    t: (key: string, params?: Record<string, any>) => string;
}

// Provider component
export const BookingProvider: React.FC<BookingProviderProps> = ({ children, user, t }) => {
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
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
    const [lastBookingDetails, setLastBookingDetails] = useState<BookingResult | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const setCouponCode = useCallback((code: string) => {
        setCoupon(prev => ({ ...prev, code }));
    }, []);

    const applyCoupon = useCallback(() => {
        const validCoupons: Record<string, number> = {
            'FIXSY10': 10,
            'SAVE20': 20,
            'FIRST50': 50
        };

        const discount = validCoupons[coupon.code.toUpperCase()];
        if (discount) {
            setCoupon(prev => ({ ...prev, discount }));
            toast.success(t('couponApplied', { discount: `${discount}%` }));
        } else {
            toast.error(t('invalidCoupon'));
        }
    }, [coupon.code, t]);

    const submitBooking = useCallback(async (e: React.FormEvent, aiResult?: AIAnalysisResult) => {
        e.preventDefault();

        if (!selectedTech || !user) {
            toast.error(t('loginRequired'));
            return;
        }

        setIsSubmitting(true);

        try {
            let problemImageUrl = '';

            // Upload image if exists
            if (problemFile) {
                const formDataUpload = new FormData();
                formDataUpload.append('file', problemFile);
                formDataUpload.append('upload_preset', env.cloudinary.uploadPreset || 'fixsy');

                const response = await fetch(
                    `https://api.cloudinary.com/v1_1/${env.cloudinary.cloudName}/image/upload`,
                    { method: 'POST', body: formDataUpload }
                );

                if (response.ok) {
                    const data = await response.json();
                    problemImageUrl = data.secure_url;
                }
            }

            // Calculate price
            const basePrice = (selectedTech as any).hourlyRate || 100;
            const finalPrice = coupon.discount
                ? basePrice * (1 - coupon.discount / 100)
                : basePrice;

            // Create booking
            const bookingData = {
                client_id: user.uid,
                client_name: user.displayName || 'Client',
                client_email: user.email,
                technician_id: selectedTech.id,
                technician_name: selectedTech.name,
                technician_image: selectedTech.image,
                service_type: formData.category || (selectedTech as any).category || 'general',
                problem_description: formData.problem,
                client_location: formData.location,
                client_address: formData.address,
                client_phone: formData.phone,
                scheduled_time: formData.scheduledTime || new Date().toISOString(),
                status: 'pending',
                payment_method: paymentMethod,
                price: finalPrice,
                discount: coupon.discount,
                coupon_code: coupon.code,
                problem_image: problemImageUrl,
                ai_analysis: aiResult || null,
                created_at: new Date().toISOString()
            };

            const docRef = await addDoc(collection(db, 'bookings'), bookingData);

            // Update technician stats
            const techRef = doc(db, 'technicians', selectedTech.id);
            await updateDoc(techRef, {
                totalJobs: increment(1),
                pendingRequests: increment(1)
            });

            // Set success details
            setLastBookingDetails({
                id: docRef.id,
                technician_name: selectedTech.name,
                technician_image: selectedTech.image,
                serviceType: formData.category || (selectedTech as any).category || 'general',
                client_address: formData.address || '',
                scheduledDate: formData.scheduledTime || new Date().toISOString(),
                paymentMethod,
                price: finalPrice
            });

            toast.success(t('bookingSuccess'));

            // Track successful booking
            analytics.trackBooking(
                selectedTech.id,
                formData.category || 'general',
                finalPrice
            );

        } catch (error) {
            console.error('Booking error:', error);
            toast.error(t('bookingError'));
        } finally {
            setIsSubmitting(false);
        }
    }, [selectedTech, user, formData, problemFile, paymentMethod, coupon, t]);

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

    const value: BookingContextValue = {
        selectedTech,
        formData,
        problemFile,
        paymentMethod,
        coupon,
        lastBookingDetails,
        isSubmitting,
        setSelectedTech,
        setFormData,
        setProblemFile,
        setPaymentMethod,
        setCouponCode,
        applyCoupon,
        submitBooking,
        resetBooking
    };

    return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};

// Custom hook to use booking context
export const useBookingContext = (): BookingContextValue => {
    const context = useContext(BookingContext);
    if (!context) {
        throw new Error('useBookingContext must be used within BookingProvider');
    }
    return context;
};

export default BookingContext;
