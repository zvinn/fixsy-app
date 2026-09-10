// src/components/Rating/RatingModal.tsx
/**
 * Rating modal component shown after service completion
 * Allows clients to rate technicians with stars and comments
 */
import { useState } from 'react';
import { Star, X, Send, ThumbsUp, Gift } from 'lucide-react';
import { Button } from '../ui/Button';

// Use the BookingRequest from UserBookings types
interface BookingRequest {
    id: string;
    date: string;
    status: 'pending' | 'accepted' | 'on_way' | 'arrived' | 'in_progress' | 'completed' | 'cancelled' | 'rejected';
    technician_name?: string;
    technician_email?: string;
    technician_id?: string;
    client_email?: string;
    price?: number;
    [key: string]: unknown;
}

interface RatingModalProps {
    isOpen: boolean;
    onClose: () => void;
    request: BookingRequest | null;
    onSubmit: (data: { req: BookingRequest; rating: number; comment: string; tip: number }) => Promise<void>;
    t: (key: string, params?: Record<string, any>) => string;
}

const RatingModal: React.FC<RatingModalProps> = ({
    isOpen,
    onClose,
    request,
    onSubmit,
    t
}) => {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState('');
    const [tip, setTip] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async () => {
        if (!request) return;

        if (rating === 0) {
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit({ req: request, rating, comment: comment.trim(), tip });
            setIsSubmitted(true);
            setTimeout(() => {
                onClose();
                // Reset state
                setRating(0);
                setComment('');
                setTip(0);
                setIsSubmitted(false);
            }, 2000);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen || !request) return null;

    const tipOptions = [0, 10, 20, 50];

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div style={{
                background: 'var(--bg-secondary)',
                borderRadius: '24px',
                padding: '30px',
                width: '100%',
                maxWidth: '400px',
                textAlign: 'center',
                boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
                animation: 'scaleIn 0.3s ease-out',
                position: 'relative'
            }}>
                {/* Close button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '15px',
                        right: '15px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '5px'
                    }}
                >
                    <X size={24} color="#94A3B8" />
                </button>

                {isSubmitted ? (
                    // Success State
                    <div style={{ padding: '20px 0' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            background: '#DCFCE7',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px'
                        }}>
                            <ThumbsUp size={40} color="#166534" />
                        </div>
                        <h2 style={{ margin: '0 0 10px', color: '#166534' }}>
                            {t("thankYou") || "شكراً لك!"}
                        </h2>
                        <p style={{ color: '#64748B' }}>
                            {t("ratingHelpsUs") || "تقييمك يساعدنا على التحسين"}
                        </p>
                    </div>
                ) : (
                    // Rating Form
                    <>
                        <div style={{
                            width: '60px',
                            height: '60px',
                            background: '#FEF3C7',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px'
                        }}>
                            <Star size={30} color="#F59E0B" fill="#F59E0B" />
                        </div>

                        <h2 style={{ margin: '0 0 10px', color: '#1E293B', fontSize: '1.3rem' }}>
                            {t("rateService") || "قيّم الخدمة"}
                        </h2>
                        <p style={{ color: '#64748B', margin: '0 0 25px', fontSize: '0.95rem' }}>
                            {t("howWasService") || "كيف كانت تجربتك مع"} <strong>{request.technician_name}</strong>?
                        </p>

                        {/* Star Rating */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '10px',
                            marginBottom: '20px'
                        }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '5px',
                                        transition: 'transform 0.2s'
                                    }}
                                >
                                    <Star
                                        size={36}
                                        color="#F59E0B"
                                        fill={(hoveredRating || rating) >= star ? "#F59E0B" : "transparent"}
                                        style={{
                                            transition: 'all 0.2s',
                                            transform: (hoveredRating || rating) >= star ? 'scale(1.1)' : 'scale(1)'
                                        }}
                                    />
                                </button>
                            ))}
                        </div>

                        {/* Rating Label */}
                        <p style={{
                            color: rating >= 4 ? '#166534' : rating >= 3 ? '#F59E0B' : rating >= 1 ? '#EF4444' : '#94A3B8',
                            fontWeight: 'bold',
                            marginBottom: '15px',
                            fontSize: '1rem'
                        }}>
                            {rating === 5 && (t("excellent") || "ممتاز! 🌟")}
                            {rating === 4 && (t("veryGood") || "جيد جداً 👍")}
                            {rating === 3 && (t("good") || "جيد 👌")}
                            {rating === 2 && (t("fair") || "مقبول 😐")}
                            {rating === 1 && (t("poor") || "ضعيف 😞")}
                            {rating === 0 && (t("tapToRate") || "اضغط للتقييم")}
                        </p>

                        {/* Tip Section */}
                        <div style={{
                            background: '#F0FDF4',
                            borderRadius: '12px',
                            padding: '15px',
                            marginBottom: '15px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '10px' }}>
                                <Gift size={18} color="#166534" />
                                <span style={{ fontWeight: 'bold', color: '#166534' }}>{t("addTip") || "إكرامية للفني"}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                {tipOptions.map((amount) => (
                                    <button
                                        key={amount}
                                        onClick={() => setTip(amount)}
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: '20px',
                                            border: tip === amount ? '2px solid #166534' : '1px solid #D1FAE5',
                                            background: tip === amount ? '#166534' : 'var(--bg-primary)',
                                            color: tip === amount ? 'white' : '#166534',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {amount === 0 ? (t("noTip") || "لا") : `${amount} ${t("currency") || "ج.م"}`}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Comment */}
                        <textarea
                            placeholder={t("addComment") || "أضف تعليق (اختياري)..."}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '12px',
                                border: '1px solid #E2E8F0',
                                resize: 'none',
                                fontSize: '0.95rem',
                                marginBottom: '15px',
                                boxSizing: 'border-box'
                            }}
                            rows={2}
                        />

                        {/* Submit Button */}
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting || rating === 0}
                            fullWidth
                            style={{
                                background: rating > 0 ? '#0056D2' : '#CBD5E1',
                                cursor: rating > 0 ? 'pointer' : 'not-allowed'
                            }}
                        >
                            {isSubmitting ? (
                                <span>{t("submitting") || "جاري الإرسال..."}</span>
                            ) : (
                                <>
                                    <Send size={18} />
                                    <span style={{ marginRight: '8px' }}>{t("submitRating") || "إرسال التقييم"}</span>
                                </>
                            )}
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
};

export default RatingModal;
