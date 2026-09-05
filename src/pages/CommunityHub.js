
/* src/CommunityHub.js - مجتمع فيكسي */
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Lightbulb, Share2, ThumbsUp, Sparkles, Wand2 } from 'lucide-react';
import toast from 'react-hot-toast';

// Mock tips for fallback
const FALLBACK_TIPS = [
    { title: "فلتر التكييف", body: "توفير الكهرباء رايق: نظافة فلتر التكييف مش بس رفاهية، دي بتحمي الموتور من الحمل الزائد وبتقلل استهلاك الطاقة بنسبة 15%. اعمل الصح يا برنس." },
    { title: "الحنفية البايظة", body: "إهدار الموارد مش كول: الحنفية اللي بتنقط دي بتضيع مئات اللترات شهرياً. غير الجلدة فوراً ولم الحوار قبل ما الفاتورة تصدمك." },
    { title: "الأكل السخن", body: "ثقافة التبريد: متحطش الأكل مولع في الثلاجة، استنى يهدى شوية عشان الكومبريسور ميعملش مجهود إضافي ويقصر عمره الافتراضي. ركز في التفاصيل." },
    { title: "فيشة الشاحن", body: "استهلاك الطاقة الشبح: شيل الشاحن لما تخلص، متبقاش lazy عشان الشاحن وهو في الفيشة بيسحب تيار بسيط جداً (Vampire Power) وبيسخن على الفاضي." },
    { title: "كاوتش الثلاجة", body: "العزل يا كبير: لو كاوتش باب الثلاجة مش محكم، الفريون هيهرب والكهرباء هتطير. اختبره بورقة، لو الورقة طلعت بسهولة يبقى لازم يتغير فوراً." },
    { title: "اللمبات الموفرة", body: "إضاءة رايقة: غير لمبات البيت لـ LED. بتعيش أطول وبتوفر أكتر من 80% من الطاقة. استثمر في التوفير يا وحش." },
    { title: "مواسير الصرف", body: "الوقاية خير من التسليك: بلاش ترمي بقايا الأكل في الحوض عشان الدهون بتجمد وبتسد المواسير. فكك من القصص دي وخليك منظم." },
    { title: "غسالة الملابس", body: "حمولة الغسيل: متكابسش الغسالة هدوم للآخر عشان الموتور ميتعبش والغسيل ينظف صح. الـ Balance هو سر الصنعة." },
    { title: "سخان المياه", body: "عمر أطول للسخان: افتح صمام الأمان (Safety Valve) كل شهرين عشان تنزل الرواسب وتمنع الصدأ. حركة بسيطة بس بتفرق جداً." },
    { title: "وصلات الدش", body: "إشارة برنس: لو الدش بيقطع، اتأكد إن الـ F-connector مربوط صح ومفيش تلامس بين السلك النحاس وشبكة العزل. ضبط الأداء هو الأساس." },
    { title: "رائحة الميكروويف", body: "نظافة شياكة: طبق مية بليمون وشغله دقيقتين، البخار هيسيح الدهون والريحة هتبقى فريش. نظافة من غير مجهود." },
    { title: "مفصلات الأبواب", body: "وداعاً للتزييق: نقطة زيت أو شحم على مفصلة الباب هتنهي الصداع ده تماماً. هدوء البيت نص السعادة." },
    { title: "المكواة", body: "كي محترف: ابدأ بالهدوم اللي محتاجة حرارة قليلة وبعدين زود، ده بيوفر في الكهرباء ويحافظ على المكواة. سيستم ذكي." },
    { title: "مفتاح الكهرباء", body: "أمانك أولاً: لو لاحظت صوت زنة أو شرارة في مفتاح الكهرباء، غيره فوراً لأنه مشروع حريق. متهزرش مع الكهرباء يا بطل." },
    { title: "ماتور المياه", body: "صيانة الماتور: بلاش تشغل الماتور والمية مقطوعة عشان ميسخنش ويتحرق. ركب فلوماك أضمن وأشيك." },
    { title: "شفاط المطبخ", body: "هواء نظيف: نظف مروحة الشفاط من الزيوت كل فترة عشان ميكنش حمل على الموتور ويشفط الروائح بكفاءة. المطبخ الرايق بيبان من نظافته." },
    { title: "غسالة الأطباق", body: "فلتر الغسالة: الفلتر اللي تحت ده لو اتسد المية مش هتنظف الأطباق كويس. فكه كل أسبوع واغسله تحت الحنفية. سهلة مش مستاهلة." },
    { title: "التواليت", body: "تسريب خفي: لو السيفون بيسرب نقط بسيطة، ده بيضيع مية كتير جداً. غير طقم السيفون وخليك حريص على المية." },
    { title: "الخشب", body: "تلميع أصلي: استخدم منظف خاص بالخشب بلاش المية عشان الخشب ميقشرش ولا ينفش. حافظ على العفش يعيش معاك." },
    { title: "القفل والمفتاح", body: "سلاسة في الفتح: لو المفتاح بيعلق في الكالون، رشة جرافيت (سن قلم رصاص) هتخلي الحركة حرير. فكك من الزيت في الكوالين." },
    { title: "خلاط المطبخ", body: "فلتر الخلاط: الفلتر الصغير اللي في طرف الحنفية لو اتسد المية هتضعف. فكه ونظفه من الرواسب وهتشوف الفرق." },
    { title: "الباركية", body: "عناية بالخشب: بلاش تجر الكراسي على الباركية عشان ميتجرحش، ركب لباد تحت الأرجل وخليك رايق." },
    { title: "روائح الثلاجة", body: "امتصاص الروائح: قطعة فحم صغيرة في الثلاجة هتمتص أي ريحة مش لطيفة وتخلي الروائح دايماً محايدة." },
    { title: "الستائر", body: "نظافة الهواء: الستائر بتجمع تراب كتير، اغسلها بانتظام عشان جودة الهواء في الأوضة تكون توب." },
    { title: "السجاد", body: "إزالة البقع: بقعة القهوة أو الشاي تتعامل معاها فوراً بمية وفوطة بيضاء، متبقاش lazy وتسيبها تنشف." },
    { title: "غلاية المياه (Kettle)", body: "إزالة الأملاح: شوية خل مية واغليهم في الغلاية، الأملاح البيضاء هتختفي وترجع جديدة لانج." },
    { title: "الأجهزة الكهربائية", body: "تهوية الأجهزة: سيب مسافة كافية ورا الثلاجة والفرن عشان التهوية، الحرارة الزيادة عدو الأداء." },
    { title: "مفتاح التكييف", body: "تحمل المفتاح: اتأكد إن مفتاح التكييف (تشينو/أوتوماتيك) أمبيره مناسب عشان ميسخنش ويتحرق منك في الصيف." },
    { title: "فلاتر المياه", body: "مية نظيفة: غير الشمعات في ميعادها بلاش تكسل، جودة المية هي صحتك وصحة أهلك." },
    { title: "النجف", body: "تلميع الكريستال: مسحة بسيطة بملمع زجاج وفوطة مايكروفايبر هتخلي النجفة تنور البيت وتفتح النفس." }
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

        // 2. Fetch New Tip (Improved Randomization)
        setLoading(true);
        setTimeout(() => {
            // Get last shown indices to prevent immediate repetition
            const lastIndices = JSON.parse(localStorage.getItem('lastTipIndices') || '[]');

            let randomIndex;
            let attempts = 0;
            do {
                randomIndex = Math.floor(Math.random() * FALLBACK_TIPS.length);
                attempts++;
            } while (lastIndices.includes(randomIndex) && attempts < 10);

            const randomTip = FALLBACK_TIPS[randomIndex];

            // Update last indices (keep last 5 to ensure variety)
            const updatedIndices = [...lastIndices, randomIndex].slice(-5);
            localStorage.setItem('lastTipIndices', JSON.stringify(updatedIndices));

            const newTip = {
                ...randomTip,
                date: today,
                likes: Math.floor(Math.random() * 50) + 10
            };

            setTip(newTip);
            localStorage.setItem('dailyTip', JSON.stringify(newTip));
            localStorage.setItem('dailyTipDate', today);
            setLoading(false);
        }, 1200);
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
