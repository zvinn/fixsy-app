
/* src/CommunityHub.js - مجتمع فيكسي */
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Lightbulb, Share2, ThumbsUp, Sparkles, Wand2 } from 'lucide-react';
import toast from 'react-hot-toast';

// Mock tips for fallback
const FALLBACK_TIPS = [
    { title: "تنظيف الفلاتر", body: "قم بتنظيف فلاتر التكييف مرة كل شهر لتقليل استهلاك الكهرباء بنسبة 15%." },
    { title: "صنبور المياه", body: "تأكد من إغلاق صنابير المياه جيداً، فالتنقيط المستمر يهدر 300 لتر شهرياً." },
    { title: "الثلاجة", body: "لا تضع الطعام الساخن مباشرة في الثلاجة، انتظر حتى يبرد لتوفير الطاقة." }
];

function CommunityHub() {
    const { t, language } = useLanguage();
    const [tip, setTip] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDailyTip();
    }, []);

    const loadDailyTip = async () => {
        // 1. Check LocalStorage Cache (24 hours)
        const cachedTip = localStorage.getItem('dailyTip');
        const cachedDate = localStorage.getItem('dailyTipDate');
        const today = new Date().toDateString();

        if (cachedTip && cachedDate === today) {
            setTip(JSON.parse(cachedTip));
            setLoading(false);
            return;
        }

        // 2. Fetch New Tip (Mock for now, can be connected to AI later)
        setLoading(true);
        // Simulate API delay
        setTimeout(() => {
            const randomTip = FALLBACK_TIPS[Math.floor(Math.random() * FALLBACK_TIPS.length)];
            const newTip = {
                ...randomTip, // In real app, fetch from AI here
                date: today,
                likes: Math.floor(Math.random() * 50) + 10
            };

            setTip(newTip);
            localStorage.setItem('dailyTip', JSON.stringify(newTip));
            localStorage.setItem('dailyTipDate', today);
            setLoading(false);
        }, 1500);
    };

    const handleLike = () => {
        if (!tip) return;
        const updatedTip = { ...tip, likes: tip.likes + 1, liked: true };
        setTip(updatedTip);
        localStorage.setItem('dailyTip', JSON.stringify(updatedTip));
        toast.success("شكراً لتفاعلك! ❤️");
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'نصيحة اليوم من Fixsy',
                    text: `${tip.title}: ${tip.body}\n#Fixsy #Tips`,
                    url: window.location.href
                });
            } catch (err) { console.log(err); }
        } else {
            toast('تم نسخ النصيحة!');
            navigator.clipboard.writeText(`${tip.title}: ${tip.body}`);
        }
    };

    return (
        <div style={{ padding: '20px', paddingBottom: '100px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: '#FEF3C7', padding: '10px', borderRadius: '12px' }}><Lightbulb size={24} color="#D97706" /></div>
                <h2 style={{ margin: 0, color: '#1E293B' }}>{t("dailyTips") || "Daily Tips"}</h2>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '50px', color: '#94a3b8' }}>
                    <Wand2 className="spin-slow" size={40} />
                    <p>{t("generatingTip") || "Generating AI Tip..."}</p>
                </div>
            ) : (
                <div className="fade-in" style={{
                    background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
                    borderRadius: '24px',
                    padding: '30px',
                    position: 'relative',
                    border: '1px solid #FDE68A',
                    boxShadow: '0 10px 30px -5px rgba(245, 158, 11, 0.2)'
                }}>
                    <div style={{ position: 'absolute', top: '20px', left: language === 'ar' ? '20px' : 'auto', right: language === 'ar' ? 'auto' : '20px', opacity: 0.2 }}>
                        <Sparkles size={80} color="#F59E0B" />
                    </div>

                    <span style={{ background: '#F59E0B', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                        ✨ {t("tipOfTheDay") || "Tip of the Day"}
                    </span>

                    <h3 style={{ fontSize: '1.5rem', margin: '15px 0', color: '#78350F' }}>{tip.title}</h3>
                    <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#92400E', margin: '0 0 25px' }}>{tip.body}</p>

                    <div style={{ display: 'flex', gap: '15px' }}>
                        <button onClick={handleLike} disabled={tip.liked} style={{
                            flex: 1,
                            background: tip.liked ? '#FDE68A' : 'white',
                            color: '#D97706',
                            border: 'none',
                            padding: '12px',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                            transition: '0.2s'
                        }}>
                            <ThumbsUp size={20} fill={tip.liked ? "currentColor" : "none"} /> {tip.likes}
                        </button>
                        <button onClick={handleShare} style={{
                            flex: 1,
                            background: 'rgba(255,255,255,0.5)',
                            color: '#D97706',
                            border: '1px solid #FDE68A',
                            padding: '12px',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            fontWeight: 'bold'
                        }}>
                            <Share2 size={20} /> {t("share") || "Share"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CommunityHub;
