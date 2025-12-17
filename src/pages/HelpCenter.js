import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ChevronDown, ChevronUp, Send, CheckCircle, MessageSquare, Phone } from 'lucide-react';
import { db, auth } from '../services/firebase';
import { collection, addDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

const HelpCenter = ({ goBack }) => {
    const { t, language } = useLanguage();
    const [openIndex, setOpenIndex] = useState(null);
    const [message, setMessage] = useState("");
    const [email, setEmail] = useState(auth.currentUser?.email || "");
    const [sending, setSending] = useState(false);

    const faqs = [
        { q: t("faq1_q") || "How do I book a service?", a: t("faq1_a") || "Choose a service -> Select a Technician -> Confirm Date & Location." },
        { q: t("faq2_q") || "How to pay?", a: t("faq2_a") || "You can pay via Cash or Wallet balance." },
        { q: t("faq3_q") || "Can I cancel?", a: t("faq3_a") || "Yes, you can cancel before the technician accepts the job." },
        { q: t("faq4_q") || "Is there a warranty?", a: t("faq4_a") || "Yes, all our verified technicians provide a 14-day warranty." }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message) return toast.error(t("writeMessage"));
        setSending(true);
        try {
            await addDoc(collection(db, "support_tickets"), {
                email: email,
                message: message,
                date: new Date().toISOString(),
                status: "open",
                userId: auth.currentUser?.uid || "guest"
            });
            toast.success(t("messageSent"));
            setMessage("");
        } catch (error) { toast.error(t("errorOccurred")); }
        setSending(false);
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', paddingTop: '80px', paddingBottom: '100px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px', gap: '15px' }}>
                <button onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer', transform: language === 'ar' ? 'rotate(180deg)' : 'none' }}>
                    <ChevronDown size={28} style={{ transform: 'rotate(90deg)' }} />
                </button>
                <h2 style={{ fontSize: '1.8rem', color: '#1e293b', margin: 0 }}>{t("helpCenter")}</h2>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '140px', background: '#EFF6FF', padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', color: '#2563EB', fontWeight: 'bold' }}>
                    <div style={{ background: 'white', padding: '10px', borderRadius: '50%' }}><MessageSquare size={24} /></div>
                    {t("liveChat")}
                </div>
                <div style={{ flex: 1, minWidth: '140px', background: '#F0FDF4', padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', color: '#166534', fontWeight: 'bold' }}>
                    <div style={{ background: 'white', padding: '10px', borderRadius: '50%' }}><Phone size={24} /></div>
                    {t("callSupport")}
                </div>
            </div>

            {/* FAQ Section */}
            <h3 style={{ marginBottom: '20px', color: '#334155' }}>{t("commonQuestions")}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '40px' }}>
                {faqs.map((item, idx) => (
                    <div key={idx} style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                        <button
                            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                            style={{ width: '100%', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', fontSize: '1rem', fontWeight: 'bold', color: '#1e293b', cursor: 'pointer', textAlign: language === 'ar' ? 'right' : 'left' }}
                        >
                            {item.q}
                            {openIndex === idx ? <ChevronUp size={20} color="#64748B" /> : <ChevronDown size={20} color="#64748B" />}
                        </button>
                        {openIndex === idx && (
                            <div style={{ padding: '0 20px 20px', fontSize: '0.95rem', color: '#475569', lineHeight: '1.6', background: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
                                {item.a}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Contact Form */}
            <div className="glass-panel" style={{ padding: '25px', borderRadius: '24px', background: 'white', border: '1px solid #E2E8F0' }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#334155' }}>{t("stillNeedHelp")}</h3>
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder={t("email")}
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #CBD5E1', marginBottom: '15px', fontSize: '1rem' }}
                        required
                    />
                    <textarea
                        rows="4"
                        placeholder={t("describeIssue")}
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #CBD5E1', marginBottom: '15px', fontSize: '1rem', resize: 'none', fontFamily: 'inherit' }}
                        required
                    ></textarea>
                    <button type="submit" disabled={sending} className="submit-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: sending ? '#94A3B8' : '#2563EB' }}>
                        {sending ? t("sending") : <>{t("sendMessage")} <Send size={18} /></>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default HelpCenter;
