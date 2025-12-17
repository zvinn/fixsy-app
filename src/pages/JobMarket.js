/* src/JobMarket.js - سوق المناقصات الاحترافي (Premium 2.0) */
import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { db } from '../services/firebase';
import { collection, addDoc, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import gsap from 'gsap';
import { Megaphone, PlusCircle, Briefcase, DollarSign, CheckCircle, Clock, X, Send, User, MapPin, Filter, ArrowUpRight } from 'lucide-react';

import RequestSkeleton from '../components/RequestSkeleton';

function JobMarket({ user, userRole, goBack }) {
  const { t, language } = useLanguage();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const [newJob, setNewJob] = useState({ title: '', desc: '', budget: '', location: '' });
  const [offerPrice, setOfferPrice] = useState('');
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [filterType, setFilterType] = useState('newest'); // 'newest' | 'highest'
  const containerRef = useRef(null);

  // ... (Animations and other hooks) ...

  // 1. جلب الوظائف
  useEffect(() => {
    const q = userRole === 'client'
      ? query(collection(db, "market_jobs"), where("client_email", "==", user.email), where("status", "==", "open"))
      : query(collection(db, "market_jobs"), where("status", "==", "open"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setJobs(data);
      setLoading(false); // Set loading false
    });
    return () => unsubscribe();
  }, [user, userRole]);

  // ... (Post Job, Submit Offer, etc) ...

  // ... (Render sections) ...



  // 2. نشر وظيفة
  const postJob = async (e) => {
    e.preventDefault();
    if (!newJob.title || !newJob.desc) return toast.error(t("writeDetails"));
    try {
      await addDoc(collection(db, "market_jobs"), {
        title: newJob.title,
        desc: newJob.desc,
        budget: newJob.budget ? Number(newJob.budget) : 0,
        location: newJob.location || "",
        client_name: user.displayName,
        client_email: user.email,
        status: "open",
        date: new Date().toISOString(),
        offers: []
      });
      toast.success(t("postedSuccessfully"));
      setNewJob({ title: '', desc: '', budget: '', location: '' });
    } catch (error) { toast.error(t("errorOccurred")); }
  };

  // 3. تقديم عرض
  const submitOffer = async (job) => {
    if (!offerPrice) return toast.error(t("putPrice"));
    try {
      const jobRef = doc(db, "market_jobs", job.id);
      const newOffer = {
        tech_name: user.displayName,
        tech_email: user.email,
        price: Number(offerPrice),
        date: new Date().toISOString()
      };
      const updatedOffers = [...(job.offers || []), newOffer];
      await updateDoc(jobRef, { offers: updatedOffers });

      toast.success(t("offerSubmitted"));
      setSelectedJobId(null); setOfferPrice('');
    } catch (error) { toast.error(t("errorOccurred")); }
  };

  // 4. قبول عرض
  const acceptOffer = async (job, offer) => {
    try {
      await addDoc(collection(db, "requests"), {
        technician_name: offer.tech_name,
        technician_email: offer.tech_email,
        client_name: user.displayName,
        client_email: user.email,
        client_address: job.location || t("dealAddress"), // Use job location if available
        location: null,
        problem_desc: `${t("tenderPrefix")} ${job.title}: ${job.desc}`,
        price: offer.price,
        status: "accepted",
        date: new Date().toISOString()
      });
      await updateDoc(doc(db, "market_jobs", job.id), { status: "closed" });
      toast.success(`${t("acceptedDeal")} ${offer.tech_name} ✅`);
    } catch (error) { toast.error(t("errorOccurred")); }
  };

  // Logic: Sorting
  const sortedJobs = [...jobs].sort((a, b) => {
    if (filterType === 'highest') return (b.budget || 0) - (a.budget || 0);
    return new Date(b.date) - new Date(a.date); // Default: Newest
  });

  return (
    <div ref={containerRef} style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', paddingBottom: '100px' }}>

      {/* الهيدر */}
      <div className="market-header" style={{ marginBottom: '25px', textAlign: 'center' }}>
        <h2 style={{ color: '#1e293b', margin: '0 0 10px', fontSize: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
          <span style={{ fontSize: '2.5rem' }}>🏪</span> {t("marketTitle")}
        </h2>
        <p style={{ color: '#64748b', margin: 0 }}>{userRole === 'client' ? "اطلب خدمة وحدد ميزانيتك، والفنيين هيقدموا عروضهم" : "تصفح أحدث المناقصات وقدم سعرك المناسب"}</p>
      </div>

      {/* فورم النشر للعميل (Premium) */}
      {userRole === 'client' && (
        <div className="market-header" style={{
          background: 'linear-gradient(135deg, #FFF 0%, #F8FAFC 100%)',
          padding: '25px', borderRadius: '24px', marginBottom: '40px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0'
        }}>
          <h3 style={{ marginTop: 0, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <PlusCircle size={22} color="#2563EB" /> {t("requestQuote")}
          </h3>
          <form onSubmit={postJob} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', gap: '15px' }}>
              <input placeholder={t("titlePlaceholder")} value={newJob.title} onChange={e => setNewJob({ ...newJob, title: e.target.value })} style={{ flex: 2, padding: '14px', borderRadius: '14px', border: '1px solid #CBD5E1', fontSize: '1rem', outline: 'none', transition: '0.2s', background: '#F8FAFC' }} />
              <input type="number" placeholder={t("budget")} value={newJob.budget} onChange={e => setNewJob({ ...newJob, budget: e.target.value })} style={{ flex: 1, padding: '14px', borderRadius: '14px', border: '1px solid #CBD5E1', fontSize: '1rem', outline: 'none', background: '#F8FAFC' }} />
            </div>

            <input placeholder={t("locationPlaceholder")} value={newJob.location} onChange={e => setNewJob({ ...newJob, location: e.target.value })} style={{ padding: '14px', borderRadius: '14px', border: '1px solid #CBD5E1', fontSize: '1rem', outline: 'none', background: '#F8FAFC' }} />

            <textarea rows="3" placeholder={t("descPlaceholder")} value={newJob.desc} onChange={e => setNewJob({ ...newJob, desc: e.target.value })} style={{ padding: '14px', borderRadius: '14px', border: '1px solid #CBD5E1', fontSize: '1rem', fontFamily: 'inherit', resize: 'none', background: '#F8FAFC' }} />

            <button type="submit" className="hover-scale" style={{ background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)', color: 'white', border: 'none', padding: '16px', borderRadius: '16px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)' }}>
              {t("postJob")} <Send size={20} />
            </button>
          </form>
        </div>
      )}

      {/* الفلاتر (Only for Techs mainly, but useful for Clients too to see list) */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '5px' }}>
        <button onClick={() => setFilterType('newest')} className="filter-chip" style={{
          padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
          background: filterType === 'newest' ? '#0F172A' : '#F1F5F9',
          color: filterType === 'newest' ? 'white' : '#64748B',
          fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', transition: '0.2s'
        }}>
          {t("filterNewest")}
        </button>
        <button onClick={() => setFilterType('highest')} className="filter-chip" style={{
          padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
          background: filterType === 'highest' ? '#0F172A' : '#F1F5F9',
          color: filterType === 'highest' ? 'white' : '#64748B',
          fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', transition: '0.2s'
        }}>
          {t("filterHighestPrice")}
        </button>
      </div>

      {/* قائمة الوظائف (Premium Feed) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {loading ? (
          <>
            {[1, 2, 3].map(i => <RequestSkeleton key={i} />)}
          </>
        ) : sortedJobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
            <Briefcase size={50} style={{ marginBottom: '15px', opacity: 0.5 }} />
            <p>{t("noJobs")}</p>
          </div>
        ) : (
          sortedJobs.map(job => (
            <div key={job.id} className="job-card glass-panel" style={{
              background: 'rgba(255, 255, 255, 0.8)', borderRadius: '24px', padding: '25px',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              position: 'relative', overflow: 'hidden', backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)'
            }}>
              {/* Status Badge */}
              <div style={{
                position: 'absolute',
                top: 0,
                [language === 'ar' ? 'left' : 'right']: 0,
                background: 'rgba(16, 185, 129, 0.1)',
                padding: '6px 12px',
                [language === 'ar' ? 'borderBottomRightRadius' : 'borderBottomLeftRadius']: '20px',
                color: '#10B981', fontWeight: 'bold', fontSize: '0.8rem',
                display: 'flex', alignItems: 'center', gap: '6px'
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'block', boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.3)' }}></span>
                {t("openStatus")}
              </div>

              {/* Title & Budget */}
              <div style={{ paddingRight: '0px' }}>
                <h3 style={{ margin: '0 0 5px', color: '#1e293b', fontSize: '1.2rem', fontWeight: '800' }}>{job.title}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', fontSize: '0.9rem', color: '#64748b', marginBottom: '15px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> {new Date(job.date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</span>
                  {job.location && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {job.location}</span>}
                </div>

                {/* Budget Display */}
                <div style={{ marginBottom: '15px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#64748B' }}>{t("budgetLabel")}</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: '800', color: job.budget > 0 ? '#0056D2' : '#94A3B8' }}>
                    {job.budget > 0 ? `${job.budget} ${t("currency")}` : t("noBudget")}
                  </div>
                </div>
              </div>

              <p style={{ color: '#475569', fontSize: '1rem', lineHeight: '1.6', background: 'rgba(241, 245, 249, 0.6)', padding: '15px', borderRadius: '16px', margin: '0 0 20px 0' }}>{job.desc}</p>

              {/* Actions Area */}
              <div style={{ borderTop: '1px solid rgba(226, 232, 240, 0.8)', paddingTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', fontWeight: 'bold' }}>
                      {job.client_name ? job.client_name[0].toUpperCase() : 'U'}
                    </div>
                    <span style={{ fontSize: '0.9rem', color: '#334155', fontWeight: '500' }}>{job.client_name}</span>
                  </div>
                  <span style={{ fontSize: '0.9rem', color: '#64748B', background: '#F1F5F9', padding: '4px 10px', borderRadius: '10px' }}>{job.offers ? job.offers.length : 0} {t("offersCount").split(' ')[0]}</span>
                </div>

                {/* للفني: خانة التقديم */}
                {userRole === 'tech' && (
                  <div>
                    {selectedJobId === job.id ? (
                      <div className="fade-in" style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#FFF7ED', padding: '10px', borderRadius: '14px', border: '1px dashed #FDBA74' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                          <DollarSign size={16} style={{ position: 'absolute', top: '14px', right: '12px', color: '#F97316' }} />
                          <input type="number" placeholder={t("offerPricePlaceholder")} value={offerPrice} onChange={e => setOfferPrice(e.target.value)} style={{ width: '100%', padding: '12px 35px 12px 12px', borderRadius: '10px', border: '1px solid #FED7AA', outline: 'none', background: 'white' }} autoFocus />
                        </div>
                        <button onClick={() => submitOffer(job)} style={{ background: '#F97316', color: 'white', border: 'none', width: '45px', height: '45px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(249, 115, 22, 0.3)' }}><CheckCircle size={22} /></button>
                        <button onClick={() => setSelectedJobId(null)} style={{ background: 'white', color: '#64748b', border: '1px solid #E2E8F0', width: '45px', height: '45px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={22} /></button>
                      </div>
                    ) : (
                      <button onClick={() => setSelectedJobId(job.id)} style={{ width: '100%', background: '#0F172A', color: 'white', border: 'none', padding: '14px', borderRadius: '14px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: '0.2s' }}>
                        {t("submitOffer")} <ArrowUpRight size={18} />
                      </button>
                    )}
                  </div>
                )}

                {/* للعميل: قائمة العروض */}
                {userRole === 'client' && job.offers && job.offers.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                    <h4 style={{ margin: '0 0 5px 0', fontSize: '0.9rem', color: '#475569' }}>العروض المقدمة:</h4>
                    {job.offers.map((offer, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '12px 15px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ background: '#F0FDF4', padding: '8px', borderRadius: '10px', color: '#166534' }}><User size={18} /></div>
                          <div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#0F172A' }}>{offer.tech_name}</div>
                            <div style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 'bold' }}>{offer.price} {t("currency")}</div>
                          </div>
                        </div>
                        <button onClick={() => acceptOffer(job, offer)} style={{ background: '#166534', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(22, 101, 52, 0.2)' }}>{t("acceptOffer")}</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default JobMarket;
