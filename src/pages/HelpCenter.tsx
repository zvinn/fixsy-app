// src/pages/HelpCenter.tsx
import { useState, FormEvent } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ChevronDown, ChevronUp, Send, MessageSquare, Phone } from 'lucide-react';
import { db, auth } from '../services/firebase';
import { collection, addDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

interface FAQ {
    q: string;
    a: string;
}

interface HelpCenterProps {
    goBack: () => void;
}

const HelpCenter: React.FC<HelpCenterProps> = ({ goBack }) => {
    const { t, language } = useLanguage();
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const [message, setMessage] = useState<string>("");
    const [email, setEmail] = useState<string>(auth.currentUser?.email || "");
    const [sending, setSending] = useState<boolean>(false);

    const faqs: FAQ[] = [
        { q: t("faq1_q") || "How do I book a service?", a: t("faq1_a") || "Choose a service -> Select a Technician -> Confirm Date & Location." },
        { q: t("faq2_q") || "How to pay?", a: t("faq2_a") || "You can pay via Cash or Wallet balance." },
        { q: t("faq3_q") || "Can I cancel?", a: t("faq3_a") || "Yes, you can cancel before the technician accepts the job." },
        { q: t("faq4_q") || "Is there a warranty?", a: t("faq4_a") || "Yes, all our verified technicians provide a 14-day warranty." }
    ];

    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        if (!message) {
            toast.error(t("writeMessage"));
            return;
        }
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
        } catch (error) {
            toast.error(t("errorOccurred"));
        }
        setSending(false);
    };

    return (
        <main style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', paddingTop: '80px', paddingBottom: '100px' }}>
            {/* Header */}
            <header style={{ display: 'flex', alignItems: 'center', marginBottom: '30px', gap: '15px' }}>
                <button
                    onClick={goBack}
                    aria-label={t("back") || "Go back"}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', transform: language === 'ar' ? 'rotate(180deg)' : 'none' }}
                >
                    <ChevronDown size={28} style={{ transform: 'rotate(90deg)' }} aria-hidden="true" />
                </button>
                <h1 style={{ fontSize: '1.8rem', color: '#1e293b', margin: 0 }}>{t("helpCenter")}</h1>
            </header>

            {/* Quick Actions */}
            <section aria-label={t("quickActions") || "Quick Actions"} style={{ display: 'flex', gap: '15px', marginBottom: '30px', flexWrap: 'wrap' }}>
                <button style={{ flex: 1, minWidth: '140px', background: '#EFF6FF', padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', color: '#2563EB', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
                    <div style={{ background: 'white', padding: '10px', borderRadius: '50%' }} aria-hidden="true"><MessageSquare size={24} /></div>
                    {t("liveChat")}
                </button>
                <button style={{ flex: 1, minWidth: '140px', background: '#F0FDF4', padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', color: '#166534', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
                    <div style={{ background: 'white', padding: '10px', borderRadius: '50%' }} aria-hidden="true"><Phone size={24} /></div>
                    {t("callSupport")}
                </button>
            </section>

            {/* FAQ Section */}
            <section aria-label={t("commonQuestions") || "FAQ"}>
                <h2 style={{ marginBottom: '20px', color: '#334155' }}>{t("commonQuestions")}</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '40px' }}>
                    {faqs.map((item, idx) => (
                        <div key={idx} style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                            <button
                                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                                aria-expanded={openIndex === idx}
                                aria-controls={`faq-answer-${idx}`}
                                style={{ width: '100%', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', fontSize: '1rem', fontWeight: 'bold', color: '#1e293b', cursor: 'pointer', textAlign: language === 'ar' ? 'right' : 'left' }}
                            >
                                {item.q}
                                {openIndex === idx ? <ChevronUp size={20} color="#64748B" aria-hidden="true" /> : <ChevronDown size={20} color="#64748B" aria-hidden="true" />}
                            </button>
                            {openIndex === idx && (
                                <div
                                    id={`faq-answer-${idx}`}
                                    style={{ padding: '0 20px 20px', fontSize: '0.95rem', color: '#475569', lineHeight: '1.6', background: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}
                                >
                                    {item.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* Contact Form */}
            <section className="glass-panel" style={{ padding: '25px', borderRadius: '24px', background: 'white', border: '1px solid #E2E8F0' }}>
                <h2 style={{ margin: '0 0 15px 0', color: '#334155' }}>{t("stillNeedHelp")}</h2>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="help-email" className="sr-only">{t("email")}</label>
                    <input
                        id="help-email"
                        type="email"
                        placeholder={t("email")}
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #CBD5E1', marginBottom: '15px', fontSize: '1rem' }}
                        required
                    />
                    <label htmlFor="help-message" className="sr-only">{t("describeIssue")}</label>
                    <textarea
                        id="help-message"
                        rows={4}
                        placeholder={t("describeIssue")}
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #CBD5E1', marginBottom: '15px', fontSize: '1rem', resize: 'none', fontFamily: 'inherit' }}
                        required
                    ></textarea>
                    <button type="submit" disabled={sending} className="submit-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: sending ? '#94A3B8' : '#2563EB', width: '100%' }}>
                        {sending ? t("sending") : <>{t("sendMessage")} <Send size={18} aria-hidden="true" /></>}
                    </button>
                </form>
            </section>
        </main>
    );
};

export default HelpCenter;
