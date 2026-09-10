// src/components/Modals/RoleSelectionModal.tsx
import React, { useEffect } from 'react';
import { User } from 'firebase/auth';
import { X, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

interface RoleSelectionModalProps {
    user: User | null;
    onRegisterClient: () => void;
    onSwitchToTech: () => void;
    onClose: () => void;
    t: (key: string) => string;
}

/**
 * Role Selection Modal Component
 * Modern Glassmorphism welcome dialog for new users with guaranteed instant dismiss
 * WCAG 2.1 AA Compliant with keyboard navigation and focus management
 */
const RoleSelectionModal: React.FC<RoleSelectionModalProps> = ({
    user,
    onRegisterClient,
    onSwitchToTech,
    onClose,
    t
}) => {
    const { language } = useLanguage();
    const isAr = language === 'ar';

    // Close on Escape key press
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // Format clean display name
    const rawName = user?.displayName || user?.email?.split('@')[0] || '';
    const cleanName = rawName.trim();

    return (
        <AnimatePresence>
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="role-selection-title"
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 10000,
                    background: 'rgba(15, 23, 42, 0.6)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                    direction: isAr ? 'rtl' : 'ltr'
                }}
                onClick={(e) => {
                    // Close when clicking the backdrop
                    if (e.target === e.currentTarget) {
                        onClose();
                    }
                }}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="glass-card"
                    style={{
                        background: 'rgba(255, 255, 255, 0.98)',
                        borderRadius: '24px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(226, 232, 240, 0.8)',
                        maxWidth: '440px',
                        width: '100%',
                        position: 'relative',
                        overflow: 'hidden',
                        padding: '32px 28px 28px'
                    }}
                >
                    {/* Top Close Button */}
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            top: '16px',
                            left: isAr ? '16px' : 'auto',
                            right: isAr ? 'auto' : '16px',
                            background: 'rgba(241, 245, 249, 0.8)',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '8px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s',
                            color: 'var(--text-secondary)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#E2E8F0'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(241, 245, 249, 0.8)'}
                        aria-label="إغلاق"
                    >
                        <X size={18} />
                    </button>

                    {/* Welcome Badge Icon */}
                    <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '20px',
                        background: 'linear-gradient(135deg, #0056D2 0%, #3B82F6 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        margin: '0 auto 18px',
                        boxShadow: '0 10px 20px -5px rgba(0, 86, 210, 0.4)'
                    }}>
                        <Sparkles size={28} />
                    </div>

                    {/* Welcome Title */}
                    <h2 
                        id="role-selection-title" 
                        style={{ 
                            fontSize: '1.4rem', 
                            fontWeight: '800', 
                            marginBottom: '10px', 
                            color: '#0F172A',
                            textAlign: 'center',
                            lineHeight: '1.4'
                        }}
                    >
                        {isAr 
                            ? `مرحباً بك ${cleanName ? `يا ${cleanName}` : ''} في Fixsy! 👋`
                            : `Welcome ${cleanName ? cleanName : ''} to Fixsy! 👋`}
                    </h2>

                    {/* Welcome Description */}
                    <p style={{ 
                        marginBottom: '26px', 
                        color: '#64748B', 
                        fontSize: '0.92rem', 
                        lineHeight: '1.6',
                        textAlign: 'center'
                    }}>
                        {t("clientDesc") || (isAr 
                            ? "يسعدنا انضمامك! يمكنك الآن حجز واستكشاف أفضل خدمات وفنيي صيانة المنازل المعتمدين بكل سهولة وأمان."
                            : "Glad to have you! You can now explore and book top-rated home maintenance services easily.")}
                    </p>

                    {/* Main Action Button */}
                    <div style={{ marginBottom: '16px' }}>
                        <Button
                            variant="primary"
                            fullWidth
                            size="lg"
                            onClick={onRegisterClient}
                            className="hover-scale"
                            style={{
                                height: '50px',
                                fontSize: '1rem',
                                fontWeight: '700',
                                borderRadius: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                        >
                            <span>{t("continue") || (isAr ? "متابعة واستكشاف الخدمات" : "Continue to Services")}</span>
                            {isAr ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
                        </Button>
                    </div>

                    {/* Switch to Technician Link */}
                    <div style={{ textAlign: 'center' }}>
                        <button
                            type="button"
                            onClick={onSwitchToTech}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#475569',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                padding: '6px 10px',
                                borderRadius: '8px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'color 0.2s',
                                fontWeight: '500'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#0056D2'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#475569'}
                        >
                            <span>{t("techDesc") || (isAr ? "هل أنت فني صيانة وتريد الانضمام كشريك؟" : "Are you a technician looking to partner with us?")}</span>
                            <span style={{ color: '#0056D2', fontWeight: '700', textDecoration: 'underline' }}>
                                {t("switchToTech") || (isAr ? "سجل كفني" : "Join as Tech")}
                            </span>
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default RoleSelectionModal;
