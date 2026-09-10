// src/hooks/useClientRating.tsx
import { useState, useCallback } from 'react';
import { doc, updateDoc, arrayUnion, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import type { PaymentReliability } from '../types';
import toast from 'react-hot-toast';

interface RateClientParams {
    clientId: string;
    requestId: string;
    techId: string;
    techName: string;
    rating: number;
    comment: string;
    paymentReliability: PaymentReliability;
    wouldWorkAgain: boolean;
}

export const useClientRating = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const rateClient = useCallback(async (params: RateClientParams) => {
        setIsSubmitting(true);
        try {
            const { clientId, techId, techName, rating, comment, paymentReliability } = params;

            // Update client document
            const clientRef = doc(db, 'clients', clientId);

            await updateDoc(clientRef, {
                // Add review to array
                reviewsFromTechs: arrayUnion({
                    techId,
                    techName,
                    rating,
                    comment,
                    date: serverTimestamp()
                }),
                // Increment counters
                totalRatings: increment(1),
                totalJobsCompleted: increment(1),
                // Update payment reliability (latest review takes precedence)
                paymentReliability
            });

            // Calculate new average rating
            // NOTE: This is a temporary client-side calculation.
            // For production accuracy, move to Cloud Function to ensure atomicity
            // and prevent race conditions with concurrent updates.

            toast.success('✅ تم تقييم العميل بنجاح');
            return true;
        } catch (error) {
            // Improved error handling - extract error message
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            toast.error(`❌ فشل تقييم العميل: ${errorMessage}`);

            // Log error for debugging (in production, use error logging service)
            if (process.env.NODE_ENV === 'development') {
                console.error('[useClientRating] Error:', error);
            }
            return false;
        } finally {
            setIsSubmitting(false);
        }
    }, []);

    return {
        rateClient,
        isSubmitting
    };
};
