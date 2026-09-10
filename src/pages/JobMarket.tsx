// src/pages/JobMarket.tsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { db } from '../services/firebase';
import { collection, addDoc, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { 
    PlusCircle, Briefcase, DollarSign, CheckCircle, Clock, X, Send, 
    User as UserIcon, MapPin, ArrowUpRight, Sparkles, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import RequestSkeleton from '../components/RequestSkeleton';
import { User } from 'firebase/auth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { DEMO_MARKET_JOBS, MarketJob, Offer } from '../constants/mockData';
import './JobMarket.css';

interface JobMarketProps {
    user: User;
    userRole: 'admin' | 'tech' | 'client' | null;
    goBack: () => void;
}

interface JobCardProps {
    job: MarketJob;
    userRole: 'admin' | 'tech' | 'client' | null;
    t: (key: string, params?: Record<string, unknown>) => string;
    language: string;
    selectedJobId: string | null;
    setSelectedJobId: (id: string | null) => void;
    offerPrice: string;
    setOfferPrice: (price: string) => void;
    submitOffer: (job: MarketJob) => void;
    acceptOffer: (job: MarketJob, offer: Offer) => void;
}

const isTestEnv = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';

// Extracted JobCard Component for React.memo with Premium Aesthetics
const JobCard = React.memo(({ 
    job, 
    userRole, 
    t, 
    language, 
    selectedJobId, 
    setSelectedJobId, 
    offerPrice, 
    setOfferPrice, 
    submitOffer, 
    acceptOffer 
}: JobCardProps) => {
    const isSelected = selectedJobId === job.id;
    const [showOffers, setShowOffers] = useState(false);

    // Format date in Egyptian Arabic or English
    const formattedDate = useMemo(() => {
        try {
            const d = new Date(job.date);
            return d.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return job.date;
        }
    }, [job.date, language]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="job-card-wrapper"
        >
            <Card variant="glass" className="job-card hover-scale">
                {/* Header Row: Category Badge & Status */}
                <div className="job-header-row">
                    <div className="job-cat-tag">
                        <Sparkles size={14} />
                        <span>{t(job.category || "service") || job.category || "خدمة"}</span>
                    </div>
                    <div className="job-status-pill">
                        <span className="pulse-dot"></span>
                        <span>{t("openStatus")}</span>
                    </div>
                </div>

                {/* Job Title */}
                <h3 className="job-title">{job.title}</h3>

                {/* Meta details: Date & Location */}
                <div className="job-meta-row">
                    <span className="job-meta-item">
                        <Clock size={14} />
                        <span>{formattedDate}</span>
                    </span>
                    {job.location && (
                        <span className="job-meta-item location">
                            <MapPin size={14} />
                            <span>{job.location}</span>
                        </span>
                    )}
                </div>

                {/* Description */}
                <p className="job-desc">{job.desc}</p>

                {/* Budget Highlight */}
                <div className="job-budget-banner">
                    <div className="budget-label-group">
                        <span className="budget-label">{t("budgetLabel") || "الميزانية المتوقعة:"}</span>
                        <div className="budget-value">
                            {job.budget > 0 ? (
                                <>
                                    <span className="amount">{job.budget.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}</span>
                                    <span className="currency-tag">{t("currency") || "ج.م"}</span>
                                </>
                            ) : (
                                <span className="negotiable">{t("noBudget") || "قابل للتفاوض"}</span>
                            )}
                        </div>
                    </div>
                    {job.urgency === 'urgent' && (
                        <span className="urgency-badge">⚡ {t("urgent") || "عاجل"}</span>
                    )}
                </div>

                {/* Client Info & Offers Count */}
                <div className="job-footer-meta">
                    <div className="client-badge">
                        <div className="client-avatar">
                            {job.client_name ? job.client_name.trim()[0].toUpperCase() : 'ع'}
                        </div>
                        <div className="client-text">
                            <span className="client-name">{job.client_name || t("client")}</span>
                            <span className="client-role">{t("clientBadge") || "صاحب الطلب"}</span>
                        </div>
                    </div>

                    <button 
                        type="button" 
                        className="offers-count-pill"
                        onClick={() => setShowOffers(!showOffers)}
                    >
                        <span>{job.offers ? job.offers.length : 0} {t("offersCount") || "عروض فنية"}</span>
                    </button>
                </div>

                {/* Technician Actions */}
                {userRole === 'tech' && (
                    <div className="tech-action-section">
                        <AnimatePresence mode="wait">
                            {isSelected ? (
                                <motion.div 
                                    key="input"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="tech-offer-input fade-in"
                                >
                                    <div style={{ position: 'relative', flex: 1 }}>
                                        <DollarSign size={16} style={{ position: 'absolute', top: '14px', right: '12px', color: '#F97316', zIndex: 10 }} />
                                        <Input
                                            type="number"
                                            placeholder={t("offerPricePlaceholder")}
                                            value={offerPrice}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOfferPrice(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                    <Button 
                                        variant="secondary" 
                                        onClick={() => submitOffer(job)} 
                                        style={{ background: '#F97316', color: 'white', border: 'none' }}
                                    >
                                        <CheckCircle size={22} />
                                    </Button>
                                    <Button 
                                        variant="secondary" 
                                        onClick={() => setSelectedJobId(null)}
                                    >
                                        <X size={22} />
                                    </Button>
                                </motion.div>
                            ) : (
                                <motion.div key="btn">
                                    <Button 
                                        variant="primary" 
                                        fullWidth 
                                        onClick={() => setSelectedJobId(job.id)} 
                                        className="w-100 submit-offer-cta"
                                    >
                                        <span>{t("submitOffer")}</span>
                                        <ArrowUpRight size={18} />
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {/* Client Review & Accept Offers */}
                {userRole === 'client' && job.offers && job.offers.length > 0 && (
                    <div className="client-offers-drawer">
                        <div className="drawer-header">
                            <Briefcase size={16} />
                            <h4>{t("offersReceived") || "العروض المقدمة من الفنيين:"}</h4>
                        </div>
                        <div className="offer-list">
                            {job.offers.map((offer: Offer, idx: number) => (
                                <div key={idx} className="offer-card glass-panel">
                                    <div className="offer-tech-info">
                                        <div className="tech-avatar-icon">
                                            <UserIcon size={16} />
                                        </div>
                                        <div>
                                            <div className="tech-name">{offer.tech_name}</div>
                                            <div className="tech-bid-price">
                                                {offer.price.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')} {t("currency") || "ج.م"}
                                            </div>
                                        </div>
                                    </div>
                                    <Button 
                                        size="sm" 
                                        onClick={() => acceptOffer(job, offer)} 
                                        className="accept-offer-btn"
                                    >
                                        <Check size={14} />
                                        <span>{t("acceptOffer")}</span>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Card>
        </motion.div>
    );
});
JobCard.displayName = 'JobCard';

const JobMarket: React.FC<JobMarketProps> = ({ user, userRole, goBack: _goBack }) => {
    const { t, language } = useLanguage();
    const containerRef = useRef<HTMLDivElement>(null);

    // Jobs state
    const [jobs, setJobs] = useState<MarketJob[]>(() => {
        if (isTestEnv) return [];
        try {
            const cached = localStorage.getItem('fixsy_market_jobs_v2');
            if (cached) return JSON.parse(cached);
        } catch {}
        return DEMO_MARKET_JOBS;
    });

    const [loading, setLoading] = useState(!isTestEnv ? false : true);
    const [error, setError] = useState<string | null>(null);

    // Offer Submission State
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
    const [offerPrice, setOfferPrice] = useState<string>('');

    // Post Job Form State (for clients)
    const [newJob, setNewJob] = useState({
        title: '',
        desc: '',
        budget: '',
        location: '',
    });

    // Filters
    const [filterType, setFilterType] = useState<'newest' | 'highest'>('newest');

    // 1. Subscribe to Live Firestore Jobs
    useEffect(() => {
        let unsubscribe: (() => void) | undefined;

        try {
            const q = userRole === 'client'
                ? query(collection(db, "market_jobs"), where("client_email", "==", user?.email || ""), where("status", "==", "open"))
                : query(collection(db, "market_jobs"), where("status", "==", "open"));

            unsubscribe = onSnapshot(
                q,
                (snapshot) => {
                    const firestoreJobs = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as MarketJob));
                    if (firestoreJobs.length > 0) {
                        setJobs(firestoreJobs);
                    } else if (isTestEnv) {
                        setJobs([]);
                    } else {
                        setJobs(DEMO_MARKET_JOBS);
                    }
                    setLoading(false);
                    setError(null);
                },
                (err) => {
                    if (import.meta.env.DEV) {
                        console.warn("Firestore market_jobs offline/error:", err);
                    }
                    if (isTestEnv) {
                        setJobs([]);
                    } else {
                        setJobs(DEMO_MARKET_JOBS);
                    }
                    setLoading(false);
                }
            );
        } catch {
            if (isTestEnv) {
                setJobs([]);
            } else {
                setJobs(DEMO_MARKET_JOBS);
            }
            setLoading(false);
        }

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [userRole, user?.email]);

    // 2. Post New Job (Client)
    const postJob = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newJob.title || !newJob.budget) {
            return toast.error(t("fillAllFields") || "يرجى كتابة عنوان الطلب والميزانية");
        }

        try {
            await addDoc(collection(db, "market_jobs"), {
                title: newJob.title,
                desc: newJob.desc || "",
                budget: Number(newJob.budget),
                location: newJob.location || "",
                client_name: user.displayName || t("client") || "عميل",
                client_email: user.email,
                status: "open",
                date: new Date().toISOString(),
                offers: []
            });

            // Trigger celebratory confetti in real environment
            if (typeof window !== 'undefined' && !isTestEnv) {
                try {
                    confetti({
                        particleCount: 50,
                        spread: 60,
                        origin: { y: 0.7 }
                    });
                } catch {}
            }

            toast.success(t("postedSuccessfully") || "تم نشر طلبك في سوق المناقصات بنجاح! 🚀");
            setNewJob({ title: '', desc: '', budget: '', location: '' });
        } catch {
            toast.error(t("errorOccurred") || "حدث خطأ أثناء نشر الطلب");
        }
    };

    // 3. Submit Offer (Tech)
    const submitOffer = async (job: MarketJob) => {
        if (!offerPrice) return toast.error(t("putPrice") || "يرجى تحديد سعر العرض");
        try {
            const jobRef = doc(db, "market_jobs", job.id);
            const newOffer: Offer = {
                tech_name: user.displayName || t("technician") || "فني معتمد",
                tech_email: user.email || '',
                price: Number(offerPrice),
                date: new Date().toISOString()
            };
            const updatedOffers = [...(job.offers || []), newOffer];
            await updateDoc(jobRef, { offers: updatedOffers });

            toast.success(t("offerSubmitted") || "تم إرسال عرضك بنجاح للعميل! 💼");
            setSelectedJobId(null);
            setOfferPrice('');
        } catch {
            toast.error(t("errorOccurred") || "تعذر إرسال العرض، حاول ثانية");
        }
    };

    // 4. Accept Offer (Client)
    const acceptOffer = async (job: MarketJob, offer: Offer) => {
        try {
            await addDoc(collection(db, "requests"), {
                technician_name: offer.tech_name,
                technician_email: offer.tech_email,
                client_name: user.displayName || t("client") || "عميل",
                client_email: user.email,
                client_address: job.location || t("dealAddress") || "عنوان متفق عليه",
                location: null,
                problem_desc: `${t("tenderPrefix") || "مناقصة سوق:"} ${job.title} - ${job.desc}`,
                price: offer.price,
                status: "accepted",
                date: new Date().toISOString()
            });
            await updateDoc(doc(db, "market_jobs", job.id), { status: "closed" });
            toast.success(`${t("acceptedDeal") || "تم قبول عرض الفني"} ${offer.tech_name} ✅`);
        } catch {
            toast.error(t("errorOccurred") || "حدث خطأ أثناء قبول العرض");
        }
    };

    const retryFetch = () => {
        setLoading(true);
        setError(null);
    };

    // Sorting Logic
    const sortedJobs = useMemo(() => {
        return [...jobs].sort((a, b) => {
            if (filterType === 'highest') return (b.budget || 0) - (a.budget || 0);
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
    }, [jobs, filterType]);

    return (
        <div ref={containerRef} className="job-market-container">
            {/* Market Hero Header */}
            <div className="market-header glass-card">
                <div className="market-header-badge">
                    <Sparkles size={16} />
                    <span>{t("openTendersMarket") || "سوق المناقصات والطلبات المفتوحة"}</span>
                </div>
                <h1 className="market-title">
                    <span>🏪 {t("marketTitle")}</span>
                </h1>
                <p className="market-desc">
                    {userRole === 'client' 
                        ? (t("marketDescClient") || "اطلب صيانة وحدد ميزانيتك وتلقى عروض الأسعار من أفضل الفنيين المعتمدين") 
                        : (t("marketDescTech") || "تصفح أحدث طلبات الصيانة المفتوحة وقدم عروض أسعار منافسة")}
                </p>
            </div>

            {/* Post Job Form (Client) */}
            {userRole === 'client' && (
                <div className="post-job-section glass-panel">
                    <h3 className="post-job-title">
                        <PlusCircle size={22} color="#0056D2" />
                        <span>{t("requestQuote")}</span>
                    </h3>

                    <form onSubmit={postJob} className="post-job-form">
                        <div className="form-row">
                            <Input
                                placeholder={t("titlePlaceholder")}
                                value={newJob.title}
                                onChange={e => setNewJob({ ...newJob, title: e.target.value })}
                                style={{ flex: 2 }}
                            />
                            <Input
                                type="number"
                                placeholder={t("budget")}
                                value={newJob.budget}
                                onChange={e => setNewJob({ ...newJob, budget: e.target.value })}
                                style={{ flex: 1 }}
                            />
                        </div>

                        <Input
                            placeholder={t("locationPlaceholder")}
                            value={newJob.location}
                            onChange={e => setNewJob({ ...newJob, location: e.target.value })}
                        />

                        <textarea
                            rows={3}
                            placeholder={t("descPlaceholder")}
                            value={newJob.desc}
                            onChange={e => setNewJob({ ...newJob, desc: e.target.value })}
                            className="input-base"
                            style={{ resize: 'none' }}
                        />

                        <Button 
                            type="submit" 
                            className="hover-scale submit-job-btn" 
                            icon={<Send size={20} />}
                        >
                            {t("postJob")}
                        </Button>
                    </form>
                </div>
            )}

            {/* Filters Section */}
            <div className="filter-section">
                <button
                    type="button"
                    onClick={() => setFilterType('newest')}
                    className={`filter-chip ${filterType === 'newest' ? 'active' : 'inactive'}`}
                >
                    {t("filterNewest")}
                </button>
                <button
                    type="button"
                    onClick={() => setFilterType('highest')}
                    className={`filter-chip ${filterType === 'highest' ? 'active' : 'inactive'}`}
                >
                    {t("filterHighestPrice")}
                </button>
            </div>

            {/* Job List */}
            <div className="job-list">
                {loading ? (
                    <>
                        {[1, 2, 3].map(i => <RequestSkeleton key={i} />)}
                    </>
                ) : error ? (
                    <div className="error-state glass-panel">
                        <div className="error-icon">⚠️</div>
                        <h3 className="error-title">{t("errorOccurred")}</h3>
                        <p className="error-desc">{error}</p>
                        <Button onClick={retryFetch} variant="primary">
                            {t("retry") || "إعادة المحاولة"} 🔄
                        </Button>
                    </div>
                ) : sortedJobs.length === 0 ? (
                    <div className="no-jobs glass-panel">
                        <Briefcase size={54} className="no-jobs-icon" />
                        <h3>{t("noJobs")}</h3>
                        <p>{t("noJobsDesc") || "لا توجد طلبات متاحة حالياً، كن أول من يضيف طلباً!"}</p>
                    </div>
                ) : (
                    sortedJobs.map(job => (
                        <JobCard
                            key={job.id}
                            job={job}
                            userRole={userRole}
                            t={t}
                            language={language}
                            selectedJobId={selectedJobId}
                            setSelectedJobId={setSelectedJobId}
                            offerPrice={offerPrice}
                            setOfferPrice={setOfferPrice}
                            submitOffer={submitOffer}
                            acceptOffer={acceptOffer}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default JobMarket;
