// src/pages/CommunityHub.tsx
import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Lightbulb, Share2, ThumbsUp, Sparkles, Wand2, MessageCircle, Send, HelpCircle, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { db } from '../services/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, updateDoc, doc, increment, limit, Timestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';
import safeLocalStorage from '../utils/safeLocalStorage';

interface Tip {
    title: string;
    body: string;
    date?: string;
    likes?: number;
    liked?: boolean;
}

interface Answer {
    text: string;
    authorName: string;
    authorPhoto?: string | null;
    date: string;
}

interface Question {
    id: string;
    question: string;
    authorName: string;
    authorEmail?: string | null;
    authorPhoto?: string | null;
    date: string | number | Date | Timestamp;
    answers?: Answer[];
    likes?: number;
}

// Mock tips for fallback
const FALLBACK_TIPS: Tip[] = [
    { title: "تنظيف الفلاتر", body: "قم بتنظيف فلاتر التكييف مرة كل شهر لتقليل استهلاك الكهرباء بنسبة 15%." },
    { title: "صنبور المياه", body: "تأكد من إغلاق صنابير المياه جيداً، فالتنقيط المستمر يهدر 300 لتر شهرياً." },
    { title: "الثلاجة", body: "لا تضع الطعام الساخن مباشرة في الثلاجة، انتظر حتى يبرد لتوفير الطاقة." }
];

interface CommunityHubProps {
    user: User | null;
}

const CommunityHub: React.FC<CommunityHubProps> = ({ user }) => {
    const { t, language } = useLanguage();
    const [tip, setTip] = useState<Tip | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [activeTab, setActiveTab] = useState<'tips' | 'qa'>('tips');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [showAskModal, setShowAskModal] = useState<boolean>(false);
    const [newQuestion, setNewQuestion] = useState<string>('');
    const [newAnswer, setNewAnswer] = useState<Record<string, string>>({});

    useEffect(() => {
        loadDailyTip();
        loadQuestions();
    }, []);

    const loadDailyTip = async (): Promise<void> => {
        const cachedTip = safeLocalStorage.getItem('dailyTip');
        const cachedDate = safeLocalStorage.getItem('dailyTipDate');
        const today = new Date().toDateString();

        if (cachedTip && cachedDate === today) {
            setTip(JSON.parse(cachedTip));
            setLoading(false);
            return;
        }

        setLoading(true);
        setTimeout(() => {
            const randomTip = FALLBACK_TIPS[Math.floor(Math.random() * FALLBACK_TIPS.length)];
            const newTip: Tip = {
                ...randomTip,
                date: today,
                likes: Math.floor(Math.random() * 50) + 10
            };
            setTip(newTip);
            safeLocalStorage.setItem('dailyTip', JSON.stringify(newTip));
            safeLocalStorage.setItem('dailyTipDate', today);
            setLoading(false);
        }, 1000);
    };

    const loadQuestions = (): void => {
        const q = query(collection(db, "community_questions"), orderBy("date", "desc"), limit(20));
        onSnapshot(q, (snapshot) => {
            const fetchedQuestions = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Question));
            setQuestions(fetchedQuestions);
        });
    };

    const handleLike = (): void => {
        if (!tip) return;
        const updatedTip = { ...tip, likes: (tip.likes || 0) + 1, liked: true };
        setTip(updatedTip);
        safeLocalStorage.setItem('dailyTip', JSON.stringify(updatedTip));
        toast.success(t("thanksForLike") || "شكراً لتفاعلك! ❤️");
    };

    const handleShare = async (): Promise<void> => {
        if (!tip) return;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'نصيحة اليوم من Fixsy',
                    text: `${tip.title}: ${tip.body}\n#Fixsy #Tips`,
                    url: window.location.href
                });
            } catch (err) {
                // ✅ Error handled (removed console.log)
            }
        } else {
            toast(t("tipCopied") || 'تم نسخ النصيحة!');
            navigator.clipboard.writeText(`${tip.title}: ${tip.body}`);
        }
    };

    const submitQuestion = async (): Promise<void> => {
        if (!newQuestion.trim() || !user) {
            toast.error(t("pleaseLogin") || "يرجى تسجيل الدخول");
            return;
        }
        try {
            await addDoc(collection(db, "community_questions"), {
                question: newQuestion,
                authorName: user.displayName || t("anonymous"),
                authorEmail: user.email,
                authorPhoto: user.photoURL,
                date: new Date().toISOString(),
                answers: [],
                likes: 0
            });
            setNewQuestion('');
            setShowAskModal(false);
            toast.success(t("questionPosted") || "تم نشر سؤالك!");
        } catch (e) {
            toast.error(t("errorOccurred"));
        }
    };

    const submitAnswer = async (questionId: string): Promise<void> => {
        if (!newAnswer[questionId]?.trim() || !user) return;
        try {
            const qRef = doc(db, "community_questions", questionId);
            const questionData = questions.find(q => q.id === questionId);
            if (!questionData) return;

            const updatedAnswers = [...(questionData.answers || []), {
                text: newAnswer[questionId],
                authorName: user.displayName || t("anonymous"),
                authorPhoto: user.photoURL,
                date: new Date().toISOString()
            }];
            await updateDoc(qRef, { answers: updatedAnswers });
            setNewAnswer({ ...newAnswer, [questionId]: '' });
            toast.success(t("answerPosted") || "تم نشر إجابتك!");
        } catch (e) {
            toast.error(t("errorOccurred"));
        }
    };

    const likeQuestion = async (questionId: string): Promise<void> => {
        try {
            await updateDoc(doc(db, "community_questions", questionId), { likes: increment(1) });
        } catch (e) { console.error(e); }
    };

    return (
        <div style={{ padding: '20px', paddingBottom: '100px', maxWidth: '800px', margin: '0 auto' }}>
            {/* Header */}
            <header style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: 'var(--primary-light, #FEF3C7)', padding: '10px', borderRadius: '12px' }} aria-hidden="true">
                    <Lightbulb size={24} color="var(--primary, #D97706)" />
                </div>
                <h2 style={{ margin: 0, color: 'var(--text-primary, #1E293B)' }}>{t("community") || "مجتمع فيكسي"}</h2>
            </header>

            {/* Tabs */}
            <div role="tablist" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button
                    role="tab"
                    aria-selected={activeTab === 'tips'}
                    onClick={() => setActiveTab('tips')}
                    style={{
                        flex: 1, padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 'bold',
                        background: activeTab === 'tips' ? 'var(--primary, #F59E0B)' : 'var(--bg-secondary, #F1F5F9)',
                        color: activeTab === 'tips' ? 'white' : 'var(--text-secondary, #64748B)'
                    }}
                >
                    <Sparkles size={16} style={{ marginLeft: language === 'ar' ? '8px' : '0', marginRight: language === 'ar' ? '0' : '8px' }} aria-hidden="true" />
                    {t("dailyTips") || "نصائح اليوم"}
                </button>
                <button
                    role="tab"
                    aria-selected={activeTab === 'qa'}
                    onClick={() => setActiveTab('qa')}
                    style={{
                        flex: 1, padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 'bold',
                        background: activeTab === 'qa' ? 'var(--primary, #F59E0B)' : 'var(--bg-secondary, #F1F5F9)',
                        color: activeTab === 'qa' ? 'white' : 'var(--text-secondary, #64748B)'
                    }}
                >
                    <HelpCircle size={16} style={{ marginLeft: language === 'ar' ? '8px' : '0', marginRight: language === 'ar' ? '0' : '8px' }} aria-hidden="true" />
                    {t("qaForum") || "أسئلة وأجوبة"}
                </button>
            </div>

            {/* Tips Tab */}
            {activeTab === 'tips' && (
                <section role="tabpanel" aria-label={t("dailyTips")}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-muted, #94a3b8)' }}>
                            <Wand2 className="spin-slow" size={40} aria-hidden="true" />
                            <p>{t("generatingTip") || "جاري التحميل..."}</p>
                        </div>
                    ) : (
                        <div className="fade-in" style={{
                            background: 'linear-gradient(135deg, var(--warning-light, #FFFBEB) 0%, var(--warning-lighter, #FEF3C7) 100%)',
                            borderRadius: '24px', padding: '30px', position: 'relative',
                            border: '1px solid var(--warning-border, #FDE68A)',
                            boxShadow: '0 10px 30px -5px rgba(245, 158, 11, 0.2)'
                        }}>
                            <div style={{ position: 'absolute', top: '20px', left: language === 'ar' ? '20px' : 'auto', right: language === 'ar' ? 'auto' : '20px', opacity: 0.2 }} aria-hidden="true">
                                <Sparkles size={80} color="#F59E0B" />
                            </div>

                            <span style={{ background: '#F59E0B', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                ✨ {t("tipOfTheDay") || "نصيحة اليوم"}
                            </span>

                            <h3 style={{ fontSize: '1.5rem', margin: '15px 0', color: '#78350F' }}>{tip?.title}</h3>
                            <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#92400E', margin: '0 0 25px' }}>{tip?.body}</p>

                            <div style={{ display: 'flex', gap: '15px' }}>
                                <button onClick={handleLike} disabled={tip?.liked} style={{
                                    flex: 1, background: tip?.liked ? '#FDE68A' : 'white', color: '#D97706',
                                    border: 'none', padding: '12px', borderRadius: '12px', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    fontWeight: 'bold', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', transition: '0.2s'
                                }}>
                                    <ThumbsUp size={20} fill={tip?.liked ? "currentColor" : "none"} aria-hidden="true" /> {tip?.likes}
                                </button>
                                <button onClick={handleShare} style={{
                                    flex: 1, background: 'rgba(255,255,255,0.5)', color: '#D97706',
                                    border: '1px solid #FDE68A', padding: '12px', borderRadius: '12px', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold'
                                }}>
                                    <Share2 size={20} aria-hidden="true" /> {t("share") || "مشاركة"}
                                </button>
                            </div>
                        </div>
                    )}
                </section>
            )}

            {/* Q&A Tab */}
            {activeTab === 'qa' && (
                <section role="tabpanel" aria-label={t("qaForum")}>
                    {/* Ask Question Button */}
                    <button onClick={() => setShowAskModal(true)} style={{
                        width: '100%', padding: '15px', borderRadius: '16px', border: '2px dashed var(--border, #CBD5E1)',
                        background: 'var(--bg-secondary, #F8FAFC)', cursor: 'pointer', marginBottom: '20px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                        color: 'var(--primary, #0056D2)', fontWeight: 'bold', fontSize: '1rem'
                    }}>
                        <Plus size={20} aria-hidden="true" /> {t("askQuestion") || "اطرح سؤالك"}
                    </button>

                    {/* Questions List */}
                    {questions.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted, #94a3b8)' }}>
                            <HelpCircle size={50} style={{ opacity: 0.3, marginBottom: '15px' }} aria-hidden="true" />
                            <p>{t("noQuestions") || "لا توجد أسئلة بعد. كُن أول من يسأل!"}</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }} role="list">
                            {questions.map(q => (
                                <article key={q.id} role="listitem" style={{
                                    background: 'var(--bg-primary, white)', borderRadius: '16px', padding: '20px',
                                    border: '1px solid var(--border, #E2E8F0)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                                }}>
                                    {/* Question Header */}
                                    <header style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                        <img src={q.authorPhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${q.authorName}`}
                                            alt={q.authorName} style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                                        <div>
                                            <div style={{ fontWeight: 'bold', color: 'var(--text-primary, #1E293B)' }}>{q.authorName}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #94A3B8)' }}>
                                                {q.date instanceof Timestamp
                                                    ? q.date.toDate().toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')
                                                    : new Date(q.date as string | number | Date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                                            </div>
                                        </div>
                                    </header>

                                    {/* Question Text */}
                                    <p style={{ margin: '0 0 15px', color: 'var(--text-primary, #334155)', fontSize: '1rem', lineHeight: '1.6' }}>
                                        {q.question}
                                    </p>

                                    {/* Actions */}
                                    <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                                        <button onClick={() => likeQuestion(q.id)} style={{
                                            background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted, #64748B)',
                                            display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem'
                                        }} aria-label={`${q.likes || 0} likes`}>
                                            <ThumbsUp size={16} aria-hidden="true" /> {q.likes || 0}
                                        </button>
                                        <span style={{ color: 'var(--text-muted, #64748B)', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem' }}>
                                            <MessageCircle size={16} aria-hidden="true" /> {q.answers?.length || 0} {t("answers") || "إجابة"}
                                        </span>
                                    </div>

                                    {/* Answers */}
                                    {q.answers && q.answers.length > 0 && (
                                        <section style={{ borderTop: '1px solid var(--border, #E2E8F0)', paddingTop: '15px', marginBottom: '15px' }} aria-label="Answers">
                                            {q.answers.slice(0, 3).map((a, idx) => (
                                                <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '10px', paddingRight: language === 'ar' ? '15px' : '0', paddingLeft: language === 'ar' ? '0' : '15px', borderRight: language === 'ar' ? '3px solid var(--primary, #0056D2)' : 'none', borderLeft: language === 'ar' ? 'none' : '3px solid var(--primary, #0056D2)' }}>
                                                    <img src={a.authorPhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${a.authorName}`}
                                                        alt={a.authorName} style={{ width: '30px', height: '30px', borderRadius: '50%' }} />
                                                    <div>
                                                        <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--text-primary, #1E293B)' }}>{a.authorName}</div>
                                                        <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: 'var(--text-secondary, #475569)' }}>{a.text}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </section>
                                    )}

                                    {/* Add Answer */}
                                    {user && (
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <input
                                                type="text"
                                                placeholder={t("writeAnswer") || "اكتب إجابتك..."}
                                                value={newAnswer[q.id] || ''}
                                                onChange={(e) => setNewAnswer({ ...newAnswer, [q.id]: e.target.value })}
                                                aria-label={t("writeAnswer") || "Write an answer"}
                                                style={{
                                                    flex: 1, padding: '10px 15px', borderRadius: '10px',
                                                    border: '1px solid var(--border, #E2E8F0)', background: 'var(--bg-secondary, #F8FAFC)',
                                                    fontSize: '0.9rem'
                                                }}
                                            />
                                            <button onClick={() => submitAnswer(q.id)} aria-label="Submit answer" style={{
                                                background: 'var(--primary, #0056D2)', color: 'white', border: 'none',
                                                padding: '10px 15px', borderRadius: '10px', cursor: 'pointer'
                                            }}>
                                                <Send size={18} aria-hidden="true" />
                                            </button>
                                        </div>
                                    )}
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            )}

            {/* Ask Question Modal */}
            {showAskModal && (
                <div role="dialog" aria-modal="true" aria-labelledby="ask-question-title" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div style={{ background: 'var(--bg-primary, white)', borderRadius: '24px', padding: '25px', width: '100%', maxWidth: '400px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 id="ask-question-title" style={{ margin: 0, color: 'var(--text-primary, #1E293B)' }}>{t("askQuestion") || "اطرح سؤالك"}</h3>
                            <button onClick={() => setShowAskModal(false)} aria-label="Close modal" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                <X size={24} color="var(--text-muted, #94A3B8)" aria-hidden="true" />
                            </button>
                        </div>
                        <textarea
                            placeholder={t("questionPlaceholder") || "اكتب سؤالك هنا... مثال: كيف أصلح تسريب المياه؟"}
                            value={newQuestion}
                            onChange={(e) => setNewQuestion(e.target.value)}
                            aria-label="Your question"
                            style={{
                                width: '100%', height: '120px', padding: '15px', borderRadius: '12px',
                                border: '1px solid var(--border, #E2E8F0)', resize: 'none', fontSize: '1rem', marginBottom: '15px'
                            }}
                        />
                        <button onClick={submitQuestion} style={{
                            width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                            background: 'var(--primary, #0056D2)', color: 'white', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer'
                        }}>
                            {t("postQuestion") || "نشر السؤال"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CommunityHub;
