// src/components/Modals/TechProfileModal.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Star, MapPin, Phone, Clock, Award, Briefcase,
    CheckCircle, Calendar, MessageCircle, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../ui/Button';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';

interface Review {
    id: string;
    clientName: string;
    rating: number;
    comment: string;
    date: string;
}

interface TechProfileModalProps {
    tech: {
        id: string;
        name: string;
        image?: string;
        rating?: number | string;
        specialty?: string;
        area?: string;
        phone?: string;
        completedJobs?: number;
        experience?: string;
        portfolio?: string[];
        joinDate?: string;
        badges?: string[];
        verified?: boolean;
    };
    isOpen: boolean;
    onClose: () => void;
    onBook: () => void;
    t: (key: string) => string;
}

const TechProfileModal: React.FC<TechProfileModalProps> = ({ tech, isOpen, onClose, onBook, t }) => {
    const { language } = useLanguage();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [activeTab, setActiveTab] = useState<'info' | 'portfolio' | 'reviews'>('info');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch reviews
    useEffect(() => {
        if (isOpen && tech.id) {
            fetchReviews();
        }
    }, [isOpen, tech.id]);

    const fetchReviews = async () => {
        setIsLoading(true);
        try {
            const q = query(collection(db, "reviews"), where("techId", "==", tech.id));
            const snapshot = await getDocs(q);
            const reviewsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Review[];
            setReviews(reviewsData);
        } catch (error) {
            console.error("Error fetching reviews:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const averageRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : tech.rating || 5;

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                size={16}
                fill={i < Math.round(rating) ? '#FBBF24' : 'transparent'}
                color={i < Math.round(rating) ? '#FBBF24' : 'var(--text-tertiary)'}
            />
        ));
    };

    // Sample portfolio for demo
    const portfolio = tech.portfolio || [
        'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
        'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400',
    ];

    // ✅ Lock body scroll when modal is open
    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = 'unset';
            };
        }
    }, [isOpen]);

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
                    background: 'rgba(0,0,0,0.4)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    padding: '20px'
                }}
            >
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="glass-card"
                    style={{
                        background: 'var(--bg-primary)',
                        borderRadius: '32px 32px 0 0',
                        width: '100%',
                        maxWidth: '500px',
                        maxHeight: '90vh',
                        overflow: 'hidden',
                        direction: language === 'ar' ? 'rtl' : 'ltr',
                        boxShadow: '0 -10px 40px rgba(0,0,0,0.1)'
                    }}
                >
                    {/* Header with Image using CSS variables */}
                    <div style={{
                        position: 'relative',
                        height: '160px',
                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)'
                    }}>
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            style={{
                                position: 'absolute',
                                top: '20px',
                                right: '20px',
                                background: 'rgba(255,255,255,0.2)',
                                backdropFilter: 'blur(4px)',
                                border: 'none',
                                borderRadius: '50%',
                                width: '40px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                zIndex: 10,
                                transition: 'background 0.2s'
                            }}
                        >
                            <X size={20} color="white" />
                        </button>

                        {/* Tech Image */}
                        <div style={{
                            position: 'absolute',
                            bottom: '-50px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '110px',
                            height: '110px',
                            borderRadius: '50%',
                            border: '4px solid var(--bg-primary)',
                            overflow: 'hidden',
                            background: 'var(--bg-secondary)',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                        }}>
                            {tech.image ? (
                                <img src={tech.image} alt={tech.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', background: 'var(--primary)', color: 'white' }}>
                                    {tech.name?.charAt(0)}
                                </div>
                            )}
                            {tech.verified && (
                                <div style={{ position: 'absolute', bottom: '2px', right: '2px', background: 'var(--success)', borderRadius: '50%', padding: '4px', border: '2px solid var(--bg-primary)' }}>
                                    <CheckCircle size={16} color="white" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div style={{
                        padding: '60px 24px 100px',  // Added bottom padding for button
                        overflowY: 'auto',
                        maxHeight: 'calc(90vh - 160px)',
                        WebkitOverflowScrolling: 'touch' // Smooth scrolling on iOS
                    }}>
                        {/* Name & Rating */}
                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                            <h2 style={{ margin: '0 0 4px', fontSize: '1.5rem', fontWeight: '700', color: 'var(--text)' }}>
                                {tech.name}
                            </h2>
                            <p style={{ margin: '0 0 12px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                {t(tech.specialty || "technician") || "فني"}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'var(--bg-secondary)', width: 'fit-content', margin: '0 auto', padding: '6px 16px', borderRadius: '20px' }}>
                                {renderStars(Number(averageRating))}
                                <span style={{ marginRight: '6px', fontWeight: '700', color: 'var(--text)' }}>{averageRating}</span>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>({reviews.length})</span>
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '20px',
                            background: 'var(--bg-secondary)',
                            borderRadius: '20px',
                            marginBottom: '24px'
                        }}>
                            <div style={{ textAlign: 'center', flex: 1 }}>
                                <div style={{ background: 'rgba(0, 86, 210, 0.1)', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                                    <Briefcase size={20} color="var(--primary)" />
                                </div>
                                <p style={{ margin: '0', fontWeight: '700', color: 'var(--text)', fontSize: '1.1rem' }}>{tech.completedJobs || 0}</p>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t("completedJobs") || "طلب"}</p>
                            </div>
                            <div style={{ width: '1px', background: 'var(--border)' }}></div>
                            <div style={{ textAlign: 'center', flex: 1 }}>
                                <div style={{ background: 'rgba(16, 185, 129, 0.1)', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                                    <Award size={20} color="var(--success)" />
                                </div>
                                <p style={{ margin: '0', fontWeight: '700', color: 'var(--text)', fontSize: '1.1rem' }}>{tech.experience || "1+"}</p>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t("years") || "سنة"}</p>
                            </div>
                            <div style={{ width: '1px', background: 'var(--border)' }}></div>
                            <div style={{ textAlign: 'center', flex: 1 }}>
                                <div style={{ background: 'rgba(139, 92, 246, 0.1)', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                                    <Calendar size={20} color="#8B5CF6" />
                                </div>
                                <p style={{ margin: '0', fontWeight: '700', color: 'var(--text)', fontSize: '1.1rem' }}>{tech.joinDate || "2024"}</p>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t("joined") || "انضم"}</p>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div style={{ display: 'flex', padding: '4px', background: 'var(--bg-secondary)', borderRadius: '14px', marginBottom: '24px' }}>
                            {['info', 'portfolio', 'reviews'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab as any)}
                                    style={{
                                        flex: 1,
                                        padding: '10px',
                                        border: 'none',
                                        borderRadius: '10px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        background: activeTab === tab ? 'var(--bg-primary)' : 'transparent',
                                        color: activeTab === tab ? 'var(--primary)' : 'var(--text-secondary)',
                                        boxShadow: activeTab === tab ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {t(tab) || tab}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {activeTab === 'info' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        {tech.area && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '16px' }}>
                                                <div style={{ padding: '8px', background: 'rgba(0, 86, 210, 0.1)', borderRadius: '10px' }}>
                                                    <MapPin size={20} color="var(--primary)" />
                                                </div>
                                                <div>
                                                    <p style={{ margin: '0 0 2px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t("area") || "المنطقة"}</p>
                                                    <span style={{ color: 'var(--text)', fontWeight: '600' }}>{tech.area}</span>
                                                </div>
                                            </div>
                                        )}
                                        {tech.phone && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '16px' }}>
                                                <div style={{ padding: '8px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '10px' }}>
                                                    <Phone size={20} color="var(--success)" />
                                                </div>
                                                <div>
                                                    <p style={{ margin: '0 0 2px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t("phone") || "رقم الهاتف"}</p>
                                                    <span style={{ color: 'var(--text)', fontWeight: '600' }}>{tech.phone}</span>
                                                </div>
                                            </div>
                                        )}
                                        {tech.badges && tech.badges.length > 0 && (
                                            <div>
                                                <p style={{ margin: '0 0 10px', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text)' }}>{t("badges") || "الشارات"}</p>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                    {tech.badges.map((badge, i) => (
                                                        <span key={i} style={{ padding: '8px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--primary)', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600' }}>
                                                            {badge}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'portfolio' && (
                                    <div>
                                        {portfolio.length > 0 ? (
                                            <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                                                <img
                                                    src={portfolio[currentImageIndex]}
                                                    alt={`Portfolio ${currentImageIndex + 1}`}
                                                    style={{ width: '100%', height: '240px', objectFit: 'cover' }}
                                                />
                                                {/* Overlay Gradient */}
                                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)' }} />

                                                {portfolio.length > 1 && (
                                                    <>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : portfolio.length - 1)); }}
                                                            style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', border: 'none', borderRadius: '50%', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                        >
                                                            <ChevronLeft size={24} color="white" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev < portfolio.length - 1 ? prev + 1 : 0)); }}
                                                            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', border: 'none', borderRadius: '50%', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                        >
                                                            <ChevronRight size={24} color="white" />
                                                        </button>
                                                    </>
                                                )}
                                                <div style={{ position: 'absolute', bottom: '15px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px' }}>
                                                    {portfolio.map((_, i) => (
                                                        <div key={i} style={{ width: i === currentImageIndex ? '20px' : '6px', height: '6px', borderRadius: '3px', background: i === currentImageIndex ? 'white' : 'rgba(255,255,255,0.5)', transition: 'all 0.3s' }} />
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', borderRadius: '16px', border: '2px dashed var(--border)' }}>
                                                <Briefcase size={32} style={{ marginBottom: '10px', opacity: 0.5 }} />
                                                <p>{t("noPortfolio") || "لا توجد صور في سابقة الأعمال"}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'reviews' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        {reviews.length > 0 ? reviews.map((review) => (
                                            <div key={review.id} style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                    <span style={{ fontWeight: '700', color: 'var(--text)' }}>{review.clientName}</span>
                                                    <div style={{ display: 'flex', gap: '2px' }}>{renderStars(review.rating)}</div>
                                                </div>
                                                <p style={{ margin: '0 0 8px', color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>{review.comment}</p>
                                                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{review.date}</p>
                                            </div>
                                        )) : (
                                            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                                                <MessageCircle size={40} color="var(--border)" style={{ marginBottom: '10px' }} />
                                                <p>{t("noReviews") || "لا توجد تقييمات بعد"}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        {/* Book Button */}
                        <div style={{ marginTop: '24px', position: 'sticky', bottom: '0', background: 'var(--bg-primary)', paddingTop: '10px' }}>
                            <Button fullWidth onClick={onBook} style={{ padding: '16px', fontSize: '1.1rem', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0, 86, 210, 0.25)' }}>
                                {t("bookNow") || "احجز الآن"} 🔧
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default TechProfileModal;
