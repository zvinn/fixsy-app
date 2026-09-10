// src/pages/UserBookings.tsx
import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { db } from '../services/firebase';
import { collection, query, where, updateDoc, doc, onSnapshot, addDoc, getDoc, getDocs, increment } from 'firebase/firestore';
import ChatWindow from '../components/ChatWindow';
import { MessageCircle, Star, XCircle, MapPin, Clock, Calendar, AlertTriangle, CheckCircle, Truck, Wrench, User as UserIcon, ShieldAlert, PhoneCall, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import confetti from 'canvas-confetti';
import Tilt from 'react-parallax-tilt';
import safeLocalStorage from '../utils/safeLocalStorage';

import RequestSkeleton from '../components/RequestSkeleton';
import LiveMap from '../components/LiveMap';
import StarRating from '../components/Rating/StarRating';
import RatingModal from '../components/Rating/RatingModal';
import { User } from 'firebase/auth';
import { UserWithEmergencyContact } from '../types';
import { Button } from '../components/ui/Button';
import { DEMO_BOOKINGS } from '../constants/mockData';
import './UserBookings.css';

interface BookingRequest {
    id: string;
    technician_name?: string;
    technician_email?: string;
    technician_id?: string;
    client_name?: string;
    client_email?: string;

    service_type?: string;
    price?: number;
    discount?: number;

    date: string;
    scheduledDate?: string;
    status: 'pending' | 'accepted' | 'on_way' | 'arrived' | 'in_progress' | 'completed' | 'cancelled' | 'rejected';

    problem_desc?: string;
    client_address?: string;
    problem_image?: string;

    tech_location?: { lat: number; lng: number };
    location?: { lat: number; lng: number };

    client_rating?: number;
    client_comment?: string;
    reviewTimestamp?: string;

    [key: string]: unknown;
}

interface UserBookingsProps {
    user: User;
    goBack: () => void;
}

const UserBookings: React.FC<UserBookingsProps> = ({ user, goBack }) => {
    const { t, language } = useLanguage();
    const [myRequests, setMyRequests] = useState<BookingRequest[]>(() => {
        try {
            const cached = safeLocalStorage.getItem(`myRequests_${user.email}`);
            if (cached) return JSON.parse(cached);
        } catch {}
        return (DEMO_BOOKINGS as unknown as BookingRequest[]);
    });
    const [loading, setLoading] = useState(true);
    const [chatRequestId, setChatRequestId] = useState<string | null>(null);
    const [reviewModal, setReviewModal] = useState<{ show: boolean; req: BookingRequest | null }>({ show: false, req: null });
    const [reportModal, setReportModal] = useState<{ show: boolean; req: BookingRequest | null; reason: string }>({ show: false, req: null, reason: '' });
    const [mapRequest, setMapRequest] = useState<BookingRequest | null>(null);
    const [showSOS, setShowSOS] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const [visibleLimit, setVisibleLimit] = useState(5);

    // Pull to Refresh Motion Values
    const y = useMotionValue(0);
    const rotate = useTransform(y, [0, 100], [0, 360]);
    const opacity = useTransform(y, [0, 50], [0, 1]);

    const handleDragEnd = async () => {
        if (y.get() > 50) {
            setIsRefreshing(true);
            // Simulate Refresh - in real app, simply refetch
            // Here we just wait 1s as firestore is realtime
            setTimeout(() => {
                setIsRefreshing(false);
                toast.success(t("listRefreshed") || "List Updated");
            }, 1000);
        }
    };

    useEffect(() => {
        if (!user) return;

        // 1. Load from Cache
        const cached = safeLocalStorage.getItem(`myRequests_${user.email}`);
        if (cached) {
            setMyRequests(JSON.parse(cached));
            setLoading(false);
        }

        const q = query(collection(db, "requests"), where("client_email", "==", user.email));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as BookingRequest))
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setMyRequests(data);
            setLoading(false);
            // 2. Save to Cache
            safeLocalStorage.setItem(`myRequests_${user.email}`, JSON.stringify(data));
        });
        return () => unsubscribe();
    }, [user]);

    const openReviewModal = (req: BookingRequest) => {
        setReviewModal({ show: true, req });
    };

    const submitReview = async ({ req, rating, comment, tip }: { req: BookingRequest, rating: number, comment: string, tip: number }): Promise<void> => {
        if (!req) return;

        try {
            // Tipping Logic
            if (tip > 0) {
                const q = query(collection(db, "clients"), where("email", "==", user.email));
                const snap = await getDocs(q);
                if (!snap.empty) {
                    const clientDoc = snap.docs[0];
                    const currentBalance = clientDoc.data().walletBalance || 0;
                    if (currentBalance < tip) {
                        toast.error(t("insufficientBalanceForTip") || "Insufficient balance for tip");
                        return;
                    }
                    await updateDoc(doc(db, "clients", clientDoc.id), { walletBalance: currentBalance - Number(tip) });
                    if (req.technician_id) {
                        await updateDoc(doc(db, "technicians", req.technician_id), { debt: increment(-Number(tip)) });
                    }
                    toast.success(`${t("tipSent") || "Tip Sent"}: ${tip} ${t("currency")}`);
                }
            }

            // 1. Update Request
            await updateDoc(doc(db, "requests", req.id), {
                client_rating: rating,
                client_comment: comment,
                tipAmount: Number(tip) || 0,
                reviewTimestamp: new Date().toISOString()
            });

            // 2. Add Review to Tech
            if (req.technician_id) {
                await addDoc(collection(db, "technicians", req.technician_id, "reviews"), {
                    clientId: user.email,
                    clientName: user.displayName || t("client"),
                    rating: rating,
                    comment: comment,
                    tip: Number(tip) || 0,
                    date: new Date().toISOString()
                });

                // 3. Update Tech Aggregate
                const techRef = doc(db, "technicians", req.technician_id);
                const techSnap = await getDoc(techRef);

                if (techSnap.exists()) {
                    const techData = techSnap.data();
                    const currentCount = techData.reviewsCount || 0;
                    const currentRating = techData.rating || 0;
                    const newCount = currentCount + 1;
                    const newRating = ((currentRating * currentCount) + rating) / newCount;

                    await updateDoc(techRef, {
                        rating: Number(newRating.toFixed(1)),
                        reviewsCount: newCount
                    });
                }

                // Notify Tech
                const techEmail = (techSnap.exists() && techSnap.data().email) || req.technician_email;
                if (techEmail) {
                    await addDoc(collection(db, "notifications"), {
                        userId: techEmail,
                        message: `${t("newReviewFrom") || "New review from"} ${user.displayName}: ${rating} ★`,
                        type: 'review',
                        targetId: req.id,
                        read: false,
                        date: new Date().toISOString()
                    });
                }
            }

            // Celebration
            confetti({
                particleCount: 100, spread: 70, origin: { y: 0.6 },
                colors: ['#F59E0B', '#FDE047']
            });

            toast.success(t("reviewSubmitted"));
            setReviewModal({ show: false, req: null });
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error('Review submission error:', error);
            }
            toast.error(t("sendingError"));
        }
    };

    const submitReport = async () => {
        if (!reportModal.reason || !reportModal.req) return toast.error(t("enterReason") || "Please enter a reason");
        try {
            await addDoc(collection(db, "disputes"), {
                reqId: reportModal.req.id,
                clientEmail: user.email,
                techId: reportModal.req.technician_id,
                reason: reportModal.reason,
                status: 'open',
                date: new Date().toISOString()
            });
            toast.success(t("reportSubmitted") || "Report submitted to Admin");
            setReportModal({ show: false, req: null, reason: '' });
        } catch (e) { toast.error(t("errorOccurred")); }
    };

    const cancelOrder = async (req: BookingRequest) => {
        if (req.status === 'completed' || req.status === 'cancelled') return;
        if (req.status === 'in_progress') {
            toast.error(t("cannotCancelInProgress") || "لا يمكن إلغاء طلب قيد التنفيذ");
            return;
        }

        let penaltyMessage = t("confirmCancel");
        if (req.status === 'accepted' || req.status === 'on_way') {
            penaltyMessage = t("cancelWarning");
        }

        if (window.confirm(penaltyMessage)) {
            try {
                const reqRef = doc(db, "requests", req.id);
                await updateDoc(reqRef, { status: "cancelled", cancelledAt: new Date().toISOString() });

                // Refund wallet payment if applicable
                if (req.paymentMethod === 'wallet' && req.price && req.client_email) {
                    const clientQuery = query(collection(db, "clients"), where("email", "==", req.client_email));
                    const clientSnapshot = await getDocs(clientQuery);
                    if (!clientSnapshot.empty) {
                        const clientDoc = clientSnapshot.docs[0];
                        await updateDoc(doc(db, "clients", clientDoc.id), {
                            walletBalance: increment(req.price)
                        });
                        // Add refund transaction
                        await addDoc(collection(db, "transactions"), {
                            userId: req.client_email,
                            amount: req.price,
                            type: 'refund',
                            description: t("refundProcessed") || 'استرداد مبلغ طلب ملغي',
                            date: new Date().toISOString(),
                            relatedOrderId: req.id
                        });
                        toast.success(`${t("orderCancelled")} - ${t("refundProcessed") || 'تم استرداد المبلغ'} 💰`);
                    } else {
                        toast.success(t("orderCancelled"));
                    }
                } else {
                    toast.success(t("orderCancelled"));
                }
            } catch (error) {
                if (import.meta.env.DEV) {
                    console.error('Cancel order error:', error);
                }
                toast.error(t("cancelError"));
            }
        }
    };

    const renderTimeline = (status: string) => {
        if (status === 'cancelled') {
            return (
                <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '12px', borderRadius: '12px', textAlign: 'center', margin: '20px 0', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', border: '1px solid #FECACA' }}>
                    <XCircle size={20} /> {t("orderCancelledBadge")}
                </div>
            );
        }

        const steps = [
            { key: 'pending', label: t("pending"), icon: <Clock size={16} /> },
            { key: 'accepted', label: t("accepted"), icon: <CheckCircle size={16} /> },
            { key: 'on_way', label: t("onMyWay"), icon: <Truck size={16} /> },
            { key: 'arrived', label: t("arrivedLocation"), icon: <MapPin size={16} /> },
            { key: 'in_progress', label: t("in_progress"), icon: <Wrench size={16} /> },
            { key: 'completed', label: t("completed"), icon: <Star size={16} /> }
        ];

        const currentStepIndex = steps.findIndex(s => s.key === status);

        return (
            <div className="timeline-container">
                <div className="timeline-line-bg"></div>
                <div className="timeline-line-progress" style={{ width: `calc(${(currentStepIndex / (steps.length - 1)) * 100}% - 40px)` }}></div>

                <div className="timeline-steps">
                    {steps.map((step, index) => {
                        const active = index <= currentStepIndex;
                        const isCurrent = index === currentStepIndex;
                        return (
                            <div key={step.key} className="timeline-step">
                                <div className="step-circle" style={{
                                    background: active ? '#10B981' : 'var(--bg-secondary)',
                                    color: active ? 'var(--bg-secondary)' : '#CBD5E1',
                                    border: active ? '3px solid #D1FAE5' : '3px solid #F1F5F9',
                                    boxShadow: active ? '0 4px 10px rgba(16, 185, 129, 0.3)' : 'none',
                                    transform: isCurrent ? 'scale(1.2)' : 'scale(1)'
                                }}>
                                    {step.icon}
                                </div>
                                <span className="step-label" style={{ opacity: isCurrent ? 1 : 0 }}>
                                    {step.label}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="bookings-container">
            {chatRequestId && <ChatWindow requestId={chatRequestId} currentUser={user} closeChat={() => setChatRequestId(null)} />}

            {/* Pull to Refresh Indicator */}
            <div style={{ display: 'flex', justifyContent: 'center', height: '0px', overflow: 'visible' }}>
                <motion.div style={{ y: 20, rotate, opacity }}>
                    <RefreshCw color="var(--primary)" />
                </motion.div>
            </div>

            <motion.div
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                onDragEnd={handleDragEnd}
                style={{ y }}
                dragElastic={0.2}
            >

                {/* Review Modal */}
                <RatingModal
                    isOpen={reviewModal.show}
                    onClose={() => setReviewModal({ show: false, req: null })}
                    request={reviewModal.req}
                    onSubmit={submitReview}
                    t={t}
                />

                {/* Report Modal */}
                {reportModal.show && (
                    <div className="modal-overlay">
                        <div className="modal-content glass-panel" style={{ borderRadius: '24px', padding: '30px', textAlign: 'center', background: 'var(--bg-secondary)' }}>
                            <button className="close-btn" onClick={() => setReportModal({ ...reportModal, show: false })}>✕</button>
                            <h3 style={{ color: '#DC2626', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', marginBottom: '15px' }}><ShieldAlert size={24} /> {t("reportIssue") || "Report Issue"}</h3>
                            <textarea
                                value={reportModal.reason}
                                onChange={e => setReportModal({ ...reportModal, reason: e.target.value })}
                                placeholder={t("reportReason") || "Describe the issue..."}
                                style={{ width: '100%', height: '100px', padding: '12px', borderRadius: '12px', border: '1px solid #FECACA', background: '#FEF2F2', marginBottom: '15px', resize: 'none' }}
                            />
                            <button onClick={submitReport} style={{ width: '100%', background: '#DC2626', color: 'var(--bg-secondary)', padding: '12px', borderRadius: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>
                                {t("submitReport") || "Submit Report"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Live Map Modal */}
                {mapRequest && (
                    <div className="modal-overlay" style={{ zIndex: 3000 }}>
                        <div className="glass-panel" style={{ width: '90%', height: '80vh', maxWidth: '600px', padding: 0, borderRadius: '24px', overflow: 'hidden', position: 'relative', background: 'var(--bg-secondary)' }}>
                            <LiveMap
                                clientLocation={mapRequest.location}
                                techLocation={mapRequest.tech_location}
                                onClose={() => setMapRequest(null)}
                            />
                        </div>
                    </div>
                )}

                {/* SOS Modal */}
                {showSOS && user && (
                    <div className="modal-overlay sos-modal" style={{ zIndex: 4000 }}>
                        <div className="modal-content" style={{ textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '24px', padding: '30px', maxWidth: '400px' }}>
                            <div style={{ background: '#FEE2E2', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                                <ShieldAlert size={48} color="#DC2626" className="pulse-icon" />
                            </div>
                            <h2 style={{ color: '#991B1B', marginBottom: '10px' }}>{t("sosTitle") || "Emergency SOS"}</h2>
                            <p style={{ color: '#7F1D1D', marginBottom: '30px' }}>{t("sosDesc") || "Who do you want to call?"}</p>

                            <div style={{ display: 'grid', gap: '15px' }}>
                                <a href="tel:122" style={{ background: '#EF4444', color: 'var(--bg-secondary)', padding: '15px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                    <ShieldAlert size={24} /> {t("callPolice") || "Police (122)"}
                                </a>

                                {
                                    (user as UserWithEmergencyContact).emergencyContact && (
                                        <a href={`tel:${(user as UserWithEmergencyContact).emergencyContact}`} style={{ background: '#3B82F6', color: 'var(--bg-secondary)', padding: '15px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                            <PhoneCall size={24} /> {t("callTrusted") || "Trusted Contact"}
                                        </a>
                                    )}

                                <button onClick={() => setShowSOS(false)} style={{ background: '#F1F5F9', color: '#64748B', border: 'none', padding: '15px', borderRadius: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
                                    {t("cancel")}
                                </button>
                            </div>
                        </div>
                    </div>
                )
                }

                <div className="bookings-header">
                    <h2 className="bookings-title">
                        <div className="bookings-title-icon"><Calendar size={26} color="var(--primary)" /></div>
                        {t("myRequests")}
                    </h2>
                    {myRequests.length > visibleLimit && (
                        <button onClick={() => setVisibleLimit(prev => prev + 5)} className="load-more-btn">
                            {t("loadMore")} ⬇️
                        </button>
                    )}
                </div>

                {
                    loading ? (
                        <>
                            {[1, 2].map(i => <RequestSkeleton key={i} />)}
                        </>
                    ) : myRequests.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">📦</div>
                            <p style={{ fontSize: '1.2rem', marginBottom: '20px' }}>{t("noRequests")}</p>
                            <Button variant="primary" onClick={goBack}>
                                {t("startBooking")}
                            </Button>
                        </div>
                    ) : (
                        myRequests.slice(0, visibleLimit).map((req) => (
                            <Tilt key={req.id} tiltMaxAngleX={1} tiltMaxAngleY={1} scale={1.005} transitionSpeed={2500}>
                                <div className="request-card" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

                                    {/* Header Gradient Stripe */}
                                    <div className="status-stripe" style={{ background: req.status === 'completed' ? '#10B981' : req.status === 'cancelled' ? '#EF4444' : '#3B82F6' }}></div>

                                    {/* Head */}
                                    <div className="card-header">
                                        <div className="tech-info">
                                            <div className="tech-avatar">
                                                <UserIcon size={24} color="#64748B" />
                                            </div>
                                            <div className="tech-details">
                                                <h3>{req.technician_name || t("maintenanceTech")}</h3>
                                                <span className="service-type">
                                                    <Wrench size={12} /> {t("service")}: {req.service_type || t("maintenance")}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="price-tag">
                                            <div className="price-value">{req.price} <span style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>{t("currency")}</span></div>
                                            {req.discount && req.discount > 0 && <span className="discount-badge">{t("discount")} {req.discount}</span>}
                                        </div>
                                    </div>

                                    {/* Date */}
                                    <div className="date-badge">
                                        <Calendar size={18} color="#3B82F6" />
                                        <span>{new Date(req.scheduledDate || req.date).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long', hour: 'numeric', minute: 'numeric' })}</span>
                                    </div>

                                    {/* Timeline */}
                                    {renderTimeline(req.status)}

                                    {/* Details */}
                                    <div className="details-box">
                                        <p className="detail-row">
                                            <AlertTriangle size={18} color="#F59E0B" style={{ minWidth: '18px', marginTop: '2px' }} />
                                            <span>{req.problem_desc}</span>
                                        </p>
                                        <p className="address-row">
                                            <MapPin size={18} color="#94A3B8" style={{ minWidth: '18px' }} />
                                            <span>{req.client_address}</span>
                                        </p>
                                    </div>

                                    {/* Image */}
                                    {req.problem_image && (
                                        <div style={{ marginBottom: '20px' }}>
                                            <a href={req.problem_image} target="_blank" rel="noreferrer">
                                                <img src={req.problem_image} alt="Problem" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '12px', border: '2px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />
                                            </a>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="action-buttons">

                                        {/* Track Button */}
                                        {req.status === 'on_way' && req.tech_location && (
                                            <button onClick={() => setMapRequest(req)} style={{ flex: 2, background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: 'var(--bg-secondary)', border: 'none', padding: '14px', borderRadius: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold', animation: 'pulse 2s infinite', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)' }}>
                                                <MapPin size={20} /> {t("trackTech")}
                                            </button>
                                        )}

                                        {/* SOS Button */}
                                        {(req.status === 'on_way' || req.status === 'in_progress') && (
                                            <button onClick={() => setShowSOS(true)} style={{ flex: 0.5, background: '#FEE2E2', color: '#EF4444', border: '1px solid #FECACA', padding: '14px', borderRadius: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', minWidth: '50px' }}>
                                                <ShieldAlert size={22} />
                                            </button>
                                        )}

                                        {req.status !== 'pending' && req.status !== 'cancelled' && (
                                            <Button onClick={() => setChatRequestId(req.id)} variant="ghost" style={{ flex: 1, background: '#EFF6FF', color: '#2563EB', borderColor: '#BFDBFE' }}>
                                                <MessageCircle size={20} /> {t("chat")}
                                            </Button>
                                        )}

                                        {req.status !== 'completed' && req.status !== 'cancelled' && (
                                            <Button onClick={() => cancelOrder(req)} variant="danger" style={{ flex: 1, background: 'var(--bg-secondary)', color: '#EF4444', borderColor: '#FECACA' }} className="btn-secondary">
                                                <XCircle size={20} /> {t("cancel")}
                                            </Button>
                                        )}
                                        {/* Report Button */}
                                        {(req.status === 'completed' || req.status === 'cancelled') && (
                                            <Button onClick={() => setReportModal({ show: true, req, reason: '' })} variant="danger" style={{ flex: 1, background: '#FEF2F2', color: '#DC2626', borderColor: '#FECACA' }}>
                                                <ShieldAlert size={20} /> {t("report") || "Report"}
                                            </Button>
                                        )}
                                    </div>

                                    {/* Rating */}
                                    {req.status === 'completed' && (
                                        <div className="review-section">
                                            {req.client_rating ? (
                                                <div className="review-card">
                                                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '5px' }}>
                                                        <StarRating rating={req.client_rating} />
                                                    </div>
                                                    {req.client_comment && <p style={{ margin: '0 0 5px 0', fontSize: '1rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>&quot;{req.client_comment}&quot;</p>}

                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '10px' }}>
                                                        <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 'bold' }}>✓ {t("reviewSent")}</span>

                                                        {/* Edit Button */}
                                                        {req.reviewTimestamp && (Date.now() - new Date(req.reviewTimestamp).getTime() < 10 * 60 * 1000) && (
                                                            <button onClick={() => openReviewModal(req)} style={{ fontSize: '0.8rem', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                                                                {t("editReview") || "Edit"}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <button onClick={() => openReviewModal(req)} style={{
                                                    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', color: 'var(--bg-secondary)', border: 'none', padding: '12px 30px', borderRadius: '50px',
                                                    cursor: 'pointer', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '8px',
                                                    boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)', transition: 'transform 0.2s'
                                                }}>
                                                    <Star size={18} fill="var(--bg-secondary)" /> {t("rateTech")}
                                                </button>
                                            )}
                                        </div>
                                    )}

                                </div>
                            </Tilt>
                        )))}
            </motion.div>
        </div>
    );
}

export default UserBookings;
