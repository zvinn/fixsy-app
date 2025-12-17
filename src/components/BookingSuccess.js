import React, { useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { CheckCircle, MapPin, Calendar, CreditCard, ChevronRight, Home } from 'lucide-react';
import confetti from 'canvas-confetti';

const BookingSuccess = ({ details, onClose, onTrack }) => {
    const { t, language } = useLanguage();

    useEffect(() => {
        // Trigger confetti on mount
        const end = Date.now() + 1000;
        const colors = ['#0056D2', '#FACC15', '#10B981'];

        (function frame() {
            confetti({
                particleCount: 3,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: colors
            });
            confetti({
                particleCount: 3,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: colors
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
    }, []);

    if (!details) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
            zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px'
        }}>
            <div className="glass-panel" style={{
                background: 'white', borderRadius: '24px', padding: '30px',
                width: '100%', maxWidth: '400px', textAlign: 'center',
                boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
                border: '1px solid rgba(255,255,255,0.8)',
                animation: 'scaleIn 0.4s ease-out'
            }}>
                <div style={{
                    width: '80px', height: '80px', background: '#DCFCE7', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
                }}>
                    <CheckCircle size={40} color="#166534" />
                </div>

                <h2 style={{ margin: '0 0 10px 0', fontSize: '1.5rem', color: '#1E293B' }}>{t("bookingConfirmed")}</h2>
                <p style={{ color: '#64748B', margin: '0 0 25px 0' }}>{t("yourReceipt")}</p>

                {/* Receipt Card */}
                <div style={{
                    background: '#F8FAFC', borderRadius: '16px', padding: '20px',
                    border: '1px dashed #CBD5E1', marginBottom: '25px', textAlign: 'left'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', borderBottom: '1px solid #E2E8F0', paddingBottom: '15px' }}>
                        <span style={{ color: '#64748B', fontSize: '0.9rem' }}>{t("orderNumber")}</span>
                        <span style={{ fontWeight: 'bold', fontFamily: 'monospace', color: '#334155' }}>#{details.id.slice(0, 8).toUpperCase()}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                        <img src={details.technician_image || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                            alt="Tech"
                            style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover' }} />
                        <div>
                            <div style={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#1E293B' }}>{details.technician_name}</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{details.serviceType || t("serviceService")}</div>
                        </div>
                    </div>

                    <div style={{ fontSize: '0.9rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Calendar size={14} /> {new Date(details.scheduledDate).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MapPin size={14} /> {details.client_address.substring(0, 25)}...
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CreditCard size={14} /> {details.paymentMethod === 'wallet' ? t("wallet") : t("cash")}
                        </div>
                    </div>

                    <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px dashed #CBD5E1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 'bold', color: '#334155' }}>{t("totalAmount")}</span>
                        <span style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0056D2' }}>{details.price} {t("currency")}</span>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button onClick={onTrack} style={{
                        background: '#0056D2', color: 'white', padding: '14px', borderRadius: '12px',
                        border: 'none', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        boxShadow: '0 4px 15px rgba(0, 86, 210, 0.3)'
                    }}>
                        {t("trackOrder")} <ChevronRight size={18} />
                    </button>
                    <button onClick={onClose} style={{
                        background: 'transparent', color: '#64748B', padding: '12px', borderRadius: '12px',
                        border: '1px solid #E2E8F0', fontWeight: '600', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}>
                        <Home size={16} /> {t("backToHome")}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingSuccess;
