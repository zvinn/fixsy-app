import React, { useState, useEffect, useRef } from 'react';
import { XCircle, Calendar, MapPin, Home, AlertTriangle, Camera, Tag, Banknote, CreditCard, Clock, Zap, Repeat } from 'lucide-react';
import toast from 'react-hot-toast';
import DateTimePicker from './Scheduling/DateTimePicker';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { sanitizeString, sanitizeAddress, sanitizeNumeric } from '../utils/inputSanitizer';
import { luhnCheck, validateExpiry, validateCVC, formatCardNumber as formatCard } from '../utils/cardValidator';

import { Technician, BookingFormData, ClientProfile, Address } from '../types';

// Improved type definitions
type PaymentMethod = 'cash' | 'wallet' | 'visa' | 'card';

interface BookingModalProps {
    selectedTech: Technician;
    onClose: () => void;
    formData: BookingFormData;
    setFormData: React.Dispatch<React.SetStateAction<BookingFormData>>;
    handleBookingSubmit: (e: React.FormEvent) => void;
    t: (key: string) => string;  // Improved from 'any'
    clientProfile: ClientProfile | null;  // ✅ FIXED: Proper type!
    paymentMethod: PaymentMethod;  // Type-safe!
    setPaymentMethod: (method: PaymentMethod) => void;
    couponCode: string;
    setCouponCode: (code: string) => void;
    applyCoupon: () => void;
    problemFile: File | null;
    setProblemFile: (file: File | null) => void;
    language: string;
}

const BookingModal: React.FC<BookingModalProps> = ({
    selectedTech,
    onClose,
    formData,
    setFormData,
    handleBookingSubmit,
    t,
    clientProfile,
    paymentMethod,
    setPaymentMethod,
    couponCode,
    setCouponCode,
    applyCoupon,
    problemFile,
    setProblemFile,
    language
}) => {
    const [bookingType, setBookingType] = useState<'now' | 'schedule'>('now');
    const [recurringType, setRecurringType] = useState<string>('none');
    const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvc: '', name: '' });

    // Reset scheduledTime when switching to 'now'
    useEffect(() => {
        if (bookingType === 'now') {
            setFormData(prev => ({ ...prev, scheduledTime: '' }));
        }
    }, [bookingType, setFormData]);

    const formatCardNumber = (value: string) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = (matches && matches[0]) || '';
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        return parts.length ? parts.join(' ') : value;
    };

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                setFormData(prev => ({
                    ...prev,
                    address: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`
                }));
            }, (error) => {
                // Development-only error logging
                if (process.env.NODE_ENV === 'development') {
                    console.error('[BookingModal] Location error:', error);
                }
                toast.error(t('locationError') || 'فشل الحصول على الموقع');
            });
        }
    };

    const validateAppointmentTime = (dateString: string) => {
        if (!dateString) return true;
        const date = new Date(dateString);
        const hour = date.getHours();
        const now = new Date();

        if (date < now) {
            toast.error(t("pastDateError") || "Cannot book in the past!");
            return false;
        }

        if (hour < 9 || hour >= 21) {
            toast.error(t("outsideWorkingHours") || "Working hours are 9 AM - 9 PM");
            return false;
        }

        return true;
    };

    const onLocalSubmit = (e: React.FormEvent) => {
        e.preventDefault();


        // Sanitize all inputs before validation
        const sanitizedFormData = {
            ...formData,
            address: sanitizeAddress(formData.address || '')
        };

        // Update formData with sanitized values
        setFormData(sanitizedFormData);


        // Validate card payment if selected
        if (paymentMethod === 'visa' || paymentMethod === 'card') {
            if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvc) {
                toast.error(t("cardDetailsRequired") || "الرجاء إدخال بيانات البطاقة");
                return;
            }

            // Luhn Algorithm validation
            if (!luhnCheck(cardDetails.number)) {
                toast.error(t("invalidCardNumber") || "رقم البطاقة غير صحيح");
                return;
            }

            if (!validateExpiry(cardDetails.expiry)) {
                toast.error(t("invalidExpiry") || "تاريخ انتهاء البطاقة غير صحيح");
                return;
            }

            if (!validateCVC(cardDetails.cvc)) {
                toast.error(t("invalidCVC") || "رمز الأمان غير صحيح");
                return;
            }
        }

        // Validate scheduled time
        if (bookingType === 'schedule') {
            if (!formData.scheduledTime) {
                toast.error(t("selectDateError") || "Please select a date and time");
                return;
            }
            if (!validateAppointmentTime(formData.scheduledTime)) {
                return;
            }
        }

        handleBookingSubmit(e);
    };

    const modalRef = useRef<HTMLDivElement>(null);
    useFocusTrap(modalRef, true);

    return (
        <div className="modal-overlay" onClick={onClose} style={{ backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.4)', zIndex: 2000 }} role="dialog" aria-modal="true">
            <div ref={modalRef} className="glass-panel" onClick={(e) => e.stopPropagation()} style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                borderTopLeftRadius: '24px', borderTopRightRadius: '24px',
                padding: '25px', paddingBottom: '100px', maxHeight: '85vh', overflowY: 'auto',
                animation: 'slideUp 0.4s ease-out'
            }}>

                {/* Header: Tech Info */}
                <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 10px', overflow: 'hidden', border: '4px solid white', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}>
                        <img src={selectedTech.img || selectedTech.image || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} alt={selectedTech.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.4rem' }}>{selectedTech.name}</h3>
                    <p style={{ margin: '5px 0 0', color: '#64748b' }}>{selectedTech.specialty}</p>
                    <button onClick={onClose} aria-label={t("close") || "Close"} style={{ position: 'absolute', top: '20px', left: '20px', background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <XCircle size={20} color="#64748b" />
                    </button>
                </div>

                {selectedTech.role === 'tech' ? (
                    <form onSubmit={onLocalSubmit}>

                        {/* 1. Booking Type Toggle & Time */}
                        <div style={{ marginBottom: '25px', background: 'var(--bg-tertiary)', padding: '5px', borderRadius: '16px', display: 'flex' }}>
                            <button
                                type="button"
                                onClick={() => setBookingType('now')}
                                style={{ flex: 1, padding: '12px', border: 'none', background: bookingType === 'now' ? 'white' : 'transparent', borderRadius: '12px', boxShadow: bookingType === 'now' ? '0 2px 5px rgba(0,0,0,0.1)' : 'none', color: bookingType === 'now' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: 'bold', transition: '0.3s', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            >
                                <Zap size={18} fill={bookingType === 'now' ? "currentColor" : "none"} /> {t("bookNow") || "Book Now"}
                            </button>
                            <button
                                type="button"
                                onClick={() => setBookingType('schedule')}
                                style={{ flex: 1, padding: '12px', border: 'none', background: bookingType === 'schedule' ? 'white' : 'transparent', borderRadius: '12px', boxShadow: bookingType === 'schedule' ? '0 2px 5px rgba(0,0,0,0.1)' : 'none', color: bookingType === 'schedule' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: 'bold', transition: '0.3s', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            >
                                <Calendar size={18} /> {t("schedule") || "Schedule"}
                            </button>
                        </div>

                        {bookingType === 'schedule' && (
                            <>
                                <DateTimePicker
                                    value={formData.scheduledTime || ''}
                                    onChange={(val: string) => setFormData({ ...formData, scheduledTime: val })}
                                    label={t("visitDate")}
                                />

                                {/* 🔄 Recurring Booking Options */}
                                <div style={{ marginTop: '15px', marginBottom: '20px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontWeight: 'bold', color: 'var(--text-primary, #334155)', fontSize: '0.9rem' }}>
                                        <Repeat size={16} color="var(--primary, #0056D2)" /> {t("recurringBooking") || "Recurring Booking"}
                                    </label>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {['none', 'weekly', 'monthly', 'yearly'].map(type => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setRecurringType(type)}
                                                style={{
                                                    padding: '8px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer',
                                                    background: recurringType === type ? 'var(--primary, #0056D2)' : 'var(--bg-secondary, #F1F5F9)',
                                                    color: recurringType === type ? 'white' : 'var(--text-secondary, #64748B)',
                                                    border: recurringType === type ? 'none' : '1px solid var(--border, #E2E8F0)',
                                                    transition: '0.2s'
                                                }}
                                            >
                                                {type === 'none' ? (t("oneTime") || "مرة واحدة") :
                                                    type === 'weekly' ? (t("weekly") || "أسبوعياً") :
                                                        type === 'monthly' ? (t("monthly") || "شهرياً") :
                                                            (t("yearly") || "سنوياً")}
                                            </button>
                                        ))}
                                    </div>
                                    {recurringType !== 'none' && (
                                        <div style={{ marginTop: '10px', padding: '10px 15px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '10px', color: 'var(--success, #10B981)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Repeat size={14} />
                                            {recurringType === 'weekly' ? 'سيتم تكرار هذا الحجز كل أسبوع' : recurringType === 'monthly' ? 'سيتم تكرار هذا الحجز كل شهر' : 'سيتم تكرار هذا الحجز كل سنة'}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {bookingType === 'now' && (
                            <div style={{ padding: '15px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Clock size={20} /> <span style={{ fontWeight: '500' }}>{t("arrivingSoon") || "Technician will arrive within 30-60 mins"}</span>
                            </div>
                        )}

                        {/* 2. Location Section */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontWeight: 'bold', color: '#334155' }}>
                                <MapPin size={18} color="#0056D2" /> {t("yourAddress")}
                            </label>

                            {/* Saved Addresses Chips */}
                            {clientProfile?.addresses?.length && clientProfile.addresses.length > 0 && (
                                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '5px' }}>
                                    {clientProfile.addresses.map((addr: Address, idx: number) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, address: addr.detail }))}
                                            style={{
                                                background: formData.address === addr.detail ? '#EFF6FF' : '#F8FAFC',
                                                border: formData.address === addr.detail ? '1px solid #2563EB' : '1px solid #E2E8F0',
                                                borderRadius: '20px', padding: '6px 12px', fontSize: '0.8rem', whiteSpace: 'nowrap', cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center', gap: '5px'
                                            }}
                                        >
                                            <Home size={12} /> {addr.title}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <button type="button" onClick={getCurrentLocation} style={{ background: '#EFF6FF', color: '#0056D2', border: '1px dashed #3B82F6', padding: '12px', borderRadius: '12px', width: '100%', marginBottom: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold' }}>
                                <MapPin size={16} /> {t("useCurrentLocation")}
                            </button>
                            <input
                                type="text"
                                placeholder={t("addressPlaceholder")}
                                className="form-input"
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                style={{ width: '100%', height: '50px', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '0 15px', fontSize: '1rem' }}
                            />
                        </div>

                        {/* 3. Problem Details */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontWeight: 'bold', color: '#334155' }}>
                                <AlertTriangle size={18} color="#0056D2" /> {t("problemDetails")}
                            </label>
                            <textarea
                                placeholder={t("problemDescPlaceholder")}
                                className="form-input"
                                rows={3}
                                value={formData.problem}
                                onChange={e => setFormData({ ...formData, problem: e.target.value })}
                                style={{ width: '100%', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '15px', fontSize: '1rem', resize: 'none' }}
                            ></textarea>

                            <div style={{ marginTop: '10px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', borderRadius: '12px', border: '2px dashed #CBD5E1', cursor: 'pointer', background: '#F8FAFC', justifyContent: 'center' }}>
                                    <Camera size={20} color="#64748b" />
                                    <span style={{ color: '#64748b' }}>{problemFile ? `تم: ${problemFile.name}` : "إضافة صورة للمشكلة (اختياري)"}</span>
                                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => setProblemFile(e.target.files ? e.target.files[0] : null)} />
                                </label>
                            </div>
                        </div>

                        {/* 4. Payment & Promo */}
                        <div style={{ marginBottom: '25px', background: '#F8FAFC', padding: '15px', borderRadius: '16px' }}>
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                                <div style={{ position: 'relative', flex: 1 }}>
                                    <Tag size={16} style={{ position: 'absolute', top: '16px', right: language === 'ar' ? '12px' : 'auto', left: language === 'ar' ? 'auto' : '12px', color: '#94a3b8' }} />
                                    <input type="text" placeholder="كود خصم؟" className="form-input" style={{ width: '100%', height: '48px', margin: 0, paddingRight: language === 'ar' ? '40px' : '15px', paddingLeft: language === 'ar' ? '15px' : '40px', borderRadius: '12px', border: '1px solid #E2E8F0' }} value={couponCode} onChange={e => setCouponCode(e.target.value)} />
                                </div>
                                <button type="button" onClick={applyCoupon} style={{ background: '#0056D2', color: 'white', border: 'none', padding: '0 20px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}>تطبيق</button>
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div onClick={() => setPaymentMethod('cash')} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: paymentMethod === 'cash' ? '2px solid #10B981' : '1px solid #cbd5e1', background: paymentMethod === 'cash' ? '#ECFDF5' : 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', transition: '0.2s' }}>
                                    <Banknote size={20} color={paymentMethod === 'cash' ? '#10B981' : '#64748B'} />
                                    <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: paymentMethod === 'cash' ? '#065F46' : '#64748B' }}>كاش</span>
                                </div>
                                <div onClick={() => setPaymentMethod('visa')} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: (paymentMethod === 'visa' || paymentMethod === 'card') ? '2px solid #3B82F6' : '1px solid #cbd5e1', background: (paymentMethod === 'visa' || paymentMethod === 'card') ? '#EFF6FF' : 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', transition: '0.2s' }}>
                                    <CreditCard size={20} color={(paymentMethod === 'visa' || paymentMethod === 'card') ? '#3B82F6' : '#64748B'} />
                                    <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: (paymentMethod === 'visa' || paymentMethod === 'card') ? '#1E40AF' : '#64748B' }}>فيزا</span>
                                </div>
                            </div>


                            {/* 💳 Visual Visa Simulation */}
                            {(paymentMethod === 'card' || paymentMethod === 'visa') && (
                                <div className="fade-in" style={{ marginTop: '15px', padding: '15px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px' }}>
                                    <div style={{ marginBottom: '10px' }}>
                                        <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#64748B', display: 'block', marginBottom: '5px' }}>{t("cardNumber") || "Card Number"}</label>
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                type="text"
                                                placeholder="0000 0000 0000 0000"
                                                maxLength={19}
                                                value={cardDetails.number}
                                                onChange={(e) => setCardDetails({ ...cardDetails, number: formatCardNumber(e.target.value) })}
                                                style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '1rem', fontFamily: 'monospace' }}
                                            />
                                            <CreditCard size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                                            {cardDetails.number.startsWith('4') && <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" style={{ position: 'absolute', right: '10px', top: '10px', height: '16px' }} />}
                                            {cardDetails.number.startsWith('5') && <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" style={{ position: 'absolute', right: '10px', top: '10px', height: '24px' }} />}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#64748B', display: 'block', marginBottom: '5px' }}>{t("expiryDate") || "Expiry"}</label>
                                            <input
                                                type="text"
                                                placeholder="MM/YY"
                                                maxLength={5}
                                                value={cardDetails.expiry}
                                                onChange={(e) => {
                                                    let v = e.target.value.replace(/[^0-9]/g, '');
                                                    if (v.length >= 2) v = v.substring(0, 2) + '/' + v.substring(2, 4);
                                                    setCardDetails({ ...cardDetails, expiry: v });
                                                }}
                                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '1rem', textAlign: 'center' }}
                                            />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#64748B', display: 'block', marginBottom: '5px' }}>CVC</label>
                                            <input
                                                type="text"
                                                placeholder="123"
                                                maxLength={3}
                                                value={cardDetails.cvc}
                                                onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value.replace(/[^0-9]/g, '') })}
                                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '1rem', textAlign: 'center' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>

                        <button type="submit" className="submit-btn hover-scale" style={{ width: '100%', height: '56px', background: 'linear-gradient(135deg, #0056D2 0%, #0044A5 100%)', color: 'white', border: 'none', borderRadius: '16px', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 10px 25px rgba(0, 86, 210, 0.4)' }}>
                            تأكيد الحجز الآن 🚀
                        </button>
                    </form>
                ) : <div style={{ textAlign: 'center', padding: '40px', color: '#EF4444', background: '#FEF2F2', borderRadius: '16px' }}><p style={{ fontWeight: 'bold' }}>⛔ هذا الحساب لا يستقبل طلبات</p></div>}
            </div>
        </div >
    );
};

// Export with React.memo for performance optimization
export default React.memo(BookingModal);
