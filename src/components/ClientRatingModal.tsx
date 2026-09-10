// src/components/ClientRatingModal.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, ThumbsUp, ThumbsDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';
import { Button } from './ui/Button';
import type { PaymentReliability } from '../types';

interface ClientRatingModalProps {
    isOpen: boolean;
    onClose: () => void;
    clientName: string;
    clientId: string;
    requestId: string;
    onSubmit: (data: {
        rating: number;
        comment: string;
        paymentReliability: PaymentReliability;
        wouldWorkAgain: boolean;
    }) => Promise<void>;
}

const ClientRatingModal: React.FC<ClientRatingModalProps> = ({
    isOpen,
    onClose,
    clientName,
    onSubmit
}) => {
    const { t } = useLanguage();
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [paymentReliability, setPaymentReliability] = useState<PaymentReliability>('good');
    const [wouldWorkAgain, setWouldWorkAgain] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error('⚠️ الرجاء اختيار تقييم');
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit({
                rating,
                comment,
                paymentReliability,
                wouldWorkAgain
            });
            onClose();
        } catch (error) {
            // Use toast instead of console.error for production
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            toast.error(`❌ فشل إرسال التقييم: ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        background: 'var(--bg-primary)',
                        borderRadius: '24px',
                        padding: '32px',
                        maxWidth: '500px',
                        width: '100%',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                        position: 'relative'
                    }}
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        aria-label="Close rating modal"
                        style={{
                            position: 'absolute',
                            top: '16px',
                            right: '16px',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '8px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                        <X size={20} color="var(--text-secondary)" />
                    </button>

                    {/* Header */}
                    <h2 style={{
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        color: 'var(--text)',
                        marginBottom: '8px',
                        textAlign: 'center'
                    }}>
                        {t('rateClient') || 'تقييم العميل'}
                    </h2>
                    <p style={{
                        color: 'var(--text-secondary)',
                        textAlign: 'center',
                        marginBottom: '24px'
                    }}>
                        {clientName}
                    </p>

                    {/* Star Rating */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '8px',
                        marginBottom: '32px'
                    }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    transition: 'transform 0.2s'
                                }}
                                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.9)'}
                                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                            >
                                <Star
                                    size={40}
                                    fill={(hoverRating || rating) >= star ? '#FBBF24' : 'transparent'}
                                    color={(hoverRating || rating) >= star ? '#FBBF24' : '#D1D5DB'}
                                />
                            </button>
                        ))}
                    </div>

                    {/* Payment Reliability */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontWeight: '600',
                            color: 'var(--text)'
                        }}>
                            {t('paymentReliability') || 'مدى الالتزام بالدفع'}
                        </label>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {(['excellent', 'good', 'average', 'poor'] as PaymentReliability[]).map((level) => (
                                <button
                                    key={level}
                                    onClick={() => setPaymentReliability(level)}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '12px',
                                        border: paymentReliability === level ? '2px solid var(--primary)' : '1px solid var(--border)',
                                        background: paymentReliability === level ? 'rgba(0, 86, 210, 0.1)' : 'transparent',
                                        color: paymentReliability === level ? 'var(--primary)' : 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {level === 'excellent' && '🌟 ممتاز'}
                                    {level === 'good' && '👍 جيد'}
                                    {level === 'average' && '😐 متوسط'}
                                    {level === 'poor' && '👎 سيء'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Would Work Again */}
                    <div style={{
                        marginBottom: '24px',
                        padding: '16px',
                        background: 'var(--bg-secondary)',
                        borderRadius: '16px'
                    }}>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            cursor: 'pointer'
                        }}>
                            <input
                                type="checkbox"
                                checked={wouldWorkAgain}
                                onChange={(e) => setWouldWorkAgain(e.target.checked)}
                                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                            />
                            <span style={{ fontWeight: '600', color: 'var(--text)' }}>
                                {wouldWorkAgain ? '✅' : '❌'} {t('wouldWorkAgain') || 'سأعمل معه مرة أخرى'}
                            </span>
                        </label>
                    </div>

                    {/* Comment */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontWeight: '600',
                            color: 'var(--text)'
                        }}>
                            {t('comment') || 'تعليق (اختياري)'}
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder={t('addComment') || 'أضف تعليقك هنا...'}
                            rows={4}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '12px',
                                border: '1px solid var(--border)',
                                background: 'var(--bg-secondary)',
                                color: 'var(--text)',
                                fontSize: '1rem',
                                fontFamily: 'inherit',
                                resize: 'vertical'
                            }}
                        />
                    </div>

                    {/* Submit Button */}
                    <Button
                        fullWidth
                        onClick={handleSubmit}
                        disabled={rating === 0 || isSubmitting}
                        style={{
                            padding: '16px',
                            fontSize: '1.1rem',
                            opacity: rating === 0 ? 0.5 : 1
                        }}
                    >
                        {isSubmitting ? '⏳ جاري الإرسال...' : '📤 إرسال التقييم'}
                    </Button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// Export with React.memo for performance optimization
export default React.memo(ClientRatingModal);
