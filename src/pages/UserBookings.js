import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { db } from '../services/firebase';
import { collection, query, where, updateDoc, doc, onSnapshot, addDoc, getDoc, getDocs, increment } from 'firebase/firestore';
import ChatWindow from '../components/ChatWindow';
import { MessageCircle, Star, XCircle, MapPin, Clock, Calendar, AlertTriangle, CheckCircle, Truck, Wrench, User, Send, ShieldAlert, PhoneCall } from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import Tilt from 'react-parallax-tilt';

import RequestSkeleton from '../components/RequestSkeleton';
import LiveMap from '../components/LiveMap';

function UserBookings({ user, goBack }) {
  const { t, language } = useLanguage();
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const [chatRequestId, setChatRequestId] = useState(null);
  const [reviewModal, setReviewModal] = useState({ show: false, req: null, rating: 5, comment: '', tip: 0 });
  const [reportModal, setReportModal] = useState({ show: false, req: null, reason: '' }); // 🚨 Dispute State
  const [mapRequest, setMapRequest] = useState(null); // Request being tracked on map
  const [showSOS, setShowSOS] = useState(false); // SOS Modal state

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "requests"), where("client_email", "==", user.email));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      setMyRequests(data);
      setLoading(false); // Set loading false
    });
    return () => unsubscribe();
  }, [user]);

  const openReviewModal = (req) => {
    setReviewModal({ show: true, req, rating: 5, comment: '' });
  };

  const submitReview = async () => {
    const { req, rating, comment, tip } = reviewModal;
    if (!req) return;

    try {
      // 💸 Tipping Logic
      if (tip > 0) {
        const clientRef = doc(db, "clients", user.email); // Assuming ID is email or passed prop has ID. Actually user.email might not be doc ID. 
        // In App.js we use user.email to query. Let's start with query.
        const q = query(collection(db, "clients"), where("email", "==", user.email));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const clientDoc = snap.docs[0];
          const currentBalance = clientDoc.data().walletBalance || 0;
          if (currentBalance < tip) {
            return toast.error(t("insufficientBalanceForTip") || "Insufficient balance for tip");
          }
          // Deduct
          await updateDoc(doc(db, "clients", clientDoc.id), { walletBalance: currentBalance - Number(tip) });

          // Add to Tech (Debt reduction or Wallet increase? Let's decrease debt or add to 'earnings')
          // For simplicity: Decrease Debt (Tech owes less) OR if Debt is 0, just ignore (real app would have payout).
          // Let's just decrease debt for now to simulate "Earnings"
          await updateDoc(doc(db, "technicians", req.technician_id), { debt: increment(-Number(tip)) });

          toast.success(`${t("tipSent") || "Tip Sent"}: ${tip} ${t("currency")}`);
        }
      }

      // 1. Update Request (Local)
      await updateDoc(doc(db, "requests", req.id), {
        client_rating: rating,
        client_comment: comment,
        tipAmount: Number(tip) || 0
      });

      // 2. Add Review to Tech's Subcollection
      if (req.technician_id) {
        await addDoc(collection(db, "technicians", req.technician_id, "reviews"), {
          clientId: user.email,
          clientName: user.displayName || t("client"),
          rating: rating,
          comment: comment,
          tip: Number(tip) || 0,
          date: new Date().toISOString()
        });

        // 3. Update Tech's Aggregate Rating
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
      }

      // 🎉 Celebration!
      confetti({
        particleCount: 100, spread: 70, origin: { y: 0.6 },
        colors: ['#F59E0B', '#FDE047']
      });

      toast.success(t("reviewSubmitted"));
      setReviewModal({ ...reviewModal, show: false });
    } catch (error) {
      console.error(error);
      toast.error(t("sendingError"));
    }
  };

  const submitReport = async () => {
    if (!reportModal.reason) return toast.error(t("enterReason") || "Please enter a reason");
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

  const cancelOrder = async (req) => {
    if (req.status === 'completed' || req.status === 'cancelled') return;

    let penaltyMessage = t("confirmCancel");
    if (req.status === 'accepted' || req.status === 'on_way') {
      penaltyMessage = t("cancelWarning");
    }

    if (window.confirm(penaltyMessage)) {
      try {
        const reqRef = doc(db, "requests", req.id);
        await updateDoc(reqRef, { status: "cancelled" });
        toast.success(t("orderCancelled"));
      } catch (error) {
        toast.error(t("cancelError"));
      }
    }
  };

  const renderTimeline = (status) => {
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
      <div style={{ margin: '25px 0', position: 'relative', padding: '0 10px', height: '80px' }}>
        {/* Track Line */}
        <div style={{ position: 'absolute', top: '15px', left: '20px', right: '20px', height: '4px', background: '#E2E8F0', borderRadius: '2px', zIndex: 0 }}></div>
        {/* Active Line (Animated Width) */}
        <div style={{
          position: 'absolute', top: '15px', right: '20px', height: '4px', background: 'linear-gradient(90deg, #10B981, #34D399)', borderRadius: '2px', zIndex: 0,
          width: `calc(${(currentStepIndex / (steps.length - 1)) * 100}% - 40px)`,
          transition: 'width 1s ease-in-out',
          boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)'
        }}></div>

        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', padding: '0 5px' }}>
          {steps.map((step, index) => {
            const active = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            return (
              <div key={step.key} style={{ zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '60px', position: 'relative' }}>
                <div style={{
                  width: '30px', height: '30px', borderRadius: '50%',
                  background: active ? '#10B981' : 'white',
                  color: active ? 'white' : '#CBD5E1',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: active ? '3px solid #D1FAE5' : '3px solid #F1F5F9',
                  boxShadow: active ? '0 4px 10px rgba(16, 185, 129, 0.3)' : 'none',
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  transform: isCurrent ? 'scale(1.2)' : 'scale(1)'
                }}>
                  {step.icon}
                </div>

                {/* Always render current label, maybe conditional for others if space permits later. For now only current to fix overlap */}
                <span style={{
                  position: 'absolute',
                  top: '40px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '120px',
                  textAlign: 'center',
                  fontSize: '0.75rem',
                  color: '#059669',
                  fontWeight: '800',
                  opacity: isCurrent ? 1 : 0,
                  pointerEvents: 'none',
                  transition: 'opacity 0.3s',
                  whiteSpace: 'normal',
                  lineHeight: '1.2'
                }}>
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
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', paddingBottom: '120px' }}>
      {chatRequestId && <ChatWindow requestId={chatRequestId} currentUser={user} closeChat={() => setChatRequestId(null)} />}

      {/* Review Modal */}
      {reviewModal.show && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ textAlign: 'center', border: '1px solid rgba(255,255,255,0.5)', background: 'rgba(255, 255, 255, 0.95)' }}>
            <button className="close-btn" onClick={() => setReviewModal({ ...reviewModal, show: false })}>✕</button>
            <h3 style={{ marginBottom: '10px', color: '#1E293B' }}>{t("rateService")}</h3>
            <p style={{ color: '#64748b', marginBottom: '20px' }}>{t("rateServicePrompt")} {reviewModal.req?.technician_name}؟</p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '25px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={36}
                  fill={star <= reviewModal.rating ? "#F59E0B" : "none"}
                  color={star <= reviewModal.rating ? "#F59E0B" : "#CBD5E1"}
                  style={{ cursor: 'pointer', transition: '0.2s', transform: star <= reviewModal.rating ? 'scale(1.1)' : 'scale(1)' }}
                  onClick={() => setReviewModal({ ...reviewModal, rating: star })}
                />
              ))}
            </div>

            <textarea
              placeholder={t("writeComment") || "Write your comment..."}
              value={reviewModal.comment}
              onChange={(e) => setReviewModal({ ...reviewModal, comment: e.target.value })}
              className="form-input"
              rows={3}
              style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', width: '100%', padding: '10px' }}
            />
            {/* 💸 Tip Input */}
            <div style={{ marginTop: '15px', display: 'flex', alignItems: 'center', gap: '10px', background: '#F0FDF4', padding: '10px', borderRadius: '12px' }}>
              <span style={{ fontSize: '1.2rem' }}>💸</span>
              <input
                type="number"
                placeholder={t("tipAmount") || "Tip (Optional)"}
                value={reviewModal.tip || ''}
                onChange={e => setReviewModal({ ...reviewModal, tip: e.target.value })}
                style={{ border: 'none', background: 'transparent', width: '100%', fontWeight: 'bold', color: '#166534', outline: 'none' }}
              />
              <span style={{ color: '#166534', fontWeight: 'bold' }}>{t("currency")}</span>
            </div>

            <button onClick={submitReview} className="submit-btn" style={{ marginTop: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', borderRadius: '12px', padding: '12px' }}>
              <Send size={18} /> {t("save")}
            </button>
          </div>
        </div>
      )}

      {/* 🚨 Report Modal */}
      {reportModal.show && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ borderRadius: '24px', padding: '30px', textAlign: 'center', background: 'white' }}>
            <button className="close-btn" onClick={() => setReportModal({ ...reportModal, show: false })}>✕</button>
            <h3 style={{ color: '#DC2626', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', marginBottom: '15px' }}><ShieldAlert size={24} /> {t("reportIssue") || "Report Issue"}</h3>
            <textarea
              value={reportModal.reason}
              onChange={e => setReportModal({ ...reportModal, reason: e.target.value })}
              placeholder={t("reportReason") || "Describe the issue..."}
              style={{ width: '100%', height: '100px', padding: '12px', borderRadius: '12px', border: '1px solid #FECACA', background: '#FEF2F2', marginBottom: '15px', resize: 'none' }}
            />
            <button onClick={submitReport} style={{ width: '100%', background: '#DC2626', color: 'white', padding: '12px', borderRadius: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>
              {t("submitReport") || "Submit Report"}
            </button>
          </div>
        </div>
      )}

      {/* Live Map Modal */}
      {mapRequest && (
        <div className="modal-overlay" style={{ zIndex: 3000 }}>
          <div className="glass-panel" style={{ width: '90%', height: '80vh', maxWidth: '600px', padding: 0, borderRadius: '24px', overflow: 'hidden', position: 'relative', background: 'white' }}>
            <LiveMap
              clientLocation={mapRequest.location} // Location saved in request (client's home)
              techLocation={mapRequest.tech_location} // Live tech location
              onClose={() => setMapRequest(null)}
            />
          </div>
        </div>
      )}

      {/* 🚨 SOS Modal */}
      {showSOS && (
        <div className="modal-overlay" style={{ zIndex: 4000, background: 'rgba(220, 38, 38, 0.9)' }}>
          <div className="modal-content" style={{ textAlign: 'center', background: 'white', borderRadius: '24px', padding: '30px', maxWidth: '400px' }}>
            <div style={{ background: '#FEE2E2', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <ShieldAlert size={48} color="#DC2626" className="pulse-icon" />
            </div>
            <h2 style={{ color: '#991B1B', marginBottom: '10px' }}>{t("sosTitle") || "Emergency SOS"}</h2>
            <p style={{ color: '#7F1D1D', marginBottom: '30px' }}>{t("sosDesc") || "Who do you want to call?"}</p>

            <div style={{ display: 'grid', gap: '15px' }}>
              <a href="tel:122" style={{ background: '#EF4444', color: 'white', padding: '15px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.1rem' }}>
                <ShieldAlert size={24} /> {t("callPolice") || "Police (122)"}
              </a>

              {user.emergencyContact && (
                <a href={`tel:${user.emergencyContact}`} style={{ background: '#3B82F6', color: 'white', padding: '15px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.1rem' }}>
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h2 style={{ color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.6rem', fontWeight: '800' }}>
          <div style={{ background: '#EFF6FF', padding: '10px', borderRadius: '12px' }}><Calendar size={26} color="#2563EB" /></div>
          {t("myRequests")}
        </h2>
      </div>

      {
        loading ? (
          <>
            {[1, 2].map(i => <RequestSkeleton key={i} />)}
          </>
        ) : myRequests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#94a3b8' }}>
            <div style={{ fontSize: '5rem', marginBottom: '20px', opacity: 0.5 }}>📦</div>
            <p style={{ fontSize: '1.2rem', marginBottom: '20px' }}>{t("noRequests")}</p>
            <button onClick={goBack} style={{ color: '#2563EB', background: 'white', border: '2px solid #2563EB', padding: '10px 25px', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s' }}>
              {t("startBooking")}
            </button>
          </div>
        ) : (
          myRequests.map((req) => (
            <Tilt key={req.id} tiltMaxAngleX={1} tiltMaxAngleY={1} scale={1.005} transitionSpeed={2500}>
              <div className="glass-panel" style={{
                padding: '25px',
                borderRadius: '24px',
                marginBottom: '25px',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0,0,0,0.02)',
                background: 'linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.95) 100%)'
              }}>

                {/* Header Gradient Stripe (Optional visual flair) */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: req.status === 'completed' ? '#10B981' : req.status === 'cancelled' ? '#EF4444' : '#3B82F6' }}></div>

                {/* رأس الكارت */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', marginTop: '10px' }}>
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={24} color="#64748B" />
                    </div>
                    <div>
                      <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', color: '#1E293B' }}>{req.technician_name || t("maintenanceTech")}</h3>
                      <span style={{ fontSize: '0.9rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Wrench size={12} /> {t("service")}: {req.service_type || t("maintenance")}
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#059669' }}>{req.price} <span style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>{t("currency")}</span></div>
                    {req.discount > 0 && <span style={{ fontSize: '0.75rem', color: '#EF4444', background: '#FEE2E2', padding: '2px 6px', borderRadius: '4px' }}>{t("discount")} {req.discount}</span>}
                  </div>
                </div>

                {/* الموعد */}
                <div style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #E2E8F0' }}>
                  <Calendar size={18} color="#3B82F6" />
                  <span style={{ color: '#334155', fontWeight: '500' }}>{new Date(req.scheduledDate || req.date).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long', hour: 'numeric', minute: 'numeric' })}</span>
                </div>

                {/* خط التتبع */}
                {renderTimeline(req.status)}

                {/* التفاصيل */}
                <div style={{ marginBottom: '20px', padding: '15px', background: '#F8FAFC', borderRadius: '16px', border: '1px solid #F1F5F9' }}>
                  <p style={{ color: '#334155', fontSize: '0.95rem', margin: '0 0 8px 0', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <AlertTriangle size={18} color="#F59E0B" style={{ minWidth: '18px', marginTop: '2px' }} />
                    <span>{req.problem_desc}</span>
                  </p>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <MapPin size={18} color="#94A3B8" style={{ minWidth: '18px' }} />
                    <span>{req.client_address}</span>
                  </p>
                </div>

                {/* صورة المشكلة */}
                {req.problem_image && (
                  <div style={{ marginBottom: '20px' }}>
                    <a href={req.problem_image} target="_blank" rel="noreferrer">
                      <img src={req.problem_image} alt="Problem" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '12px', border: '2px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />
                    </a>
                  </div>
                )}

                {/* أزرار التحكم */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '15px' }}>

                  {/* 📍 زر التتبع المباشر (داخل التطبيق) */}
                  {req.status === 'on_way' && req.tech_location && (
                    <button onClick={() => setMapRequest(req)} style={{ flex: 2, background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: 'white', border: 'none', padding: '14px', borderRadius: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold', animation: 'pulse 2s infinite', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)' }}>
                      <MapPin size={20} /> {t("trackTech")}
                    </button>
                  )}

                  {/* 🚨 SOS Button (Only during active service) */}
                  {(req.status === 'on_way' || req.status === 'in_progress') && (
                    <button onClick={() => setShowSOS(true)} style={{ flex: 0.5, background: '#FEE2E2', color: '#EF4444', border: '1px solid #FECACA', padding: '14px', borderRadius: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', minWidth: '50px' }}>
                      <ShieldAlert size={22} />
                    </button>
                  )}

                  {req.status !== 'pending' && req.status !== 'cancelled' && (
                    <button onClick={() => setChatRequestId(req.id)} style={{ flex: 1, background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', padding: '14px', borderRadius: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold', transition: '0.2s' }}>
                      <MessageCircle size={20} /> {t("chat")}
                    </button>
                  )}

                  {req.status !== 'completed' && req.status !== 'cancelled' && (
                    <button onClick={() => cancelOrder(req)} style={{ flex: 1, background: 'white', color: '#EF4444', border: '1px solid #FECACA', padding: '14px', borderRadius: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold', transition: '0.2s' }}>
                      <XCircle size={20} /> {t("cancel")}
                    </button>
                  )}
                  {/* 🚨 Report Button (For Completed/Cancelled) */}
                  {(req.status === 'completed' || req.status === 'cancelled') && (
                    <button onClick={() => setReportModal({ show: true, req, reason: '' })} style={{ flex: 1, background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', padding: '14px', borderRadius: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold' }}>
                      <ShieldAlert size={20} /> {t("report") || "Report"}
                    </button>
                  )}
                </div>

                {/* التقييم (يظهر عند الاكتمال) */}
                {req.status === 'completed' && (
                  <div style={{ textAlign: 'center', marginTop: '20px', borderTop: '1px dashed #E2E8F0', paddingTop: '20px' }}>
                    {req.client_rating ? (
                      <div style={{ background: '#F0FDF4', padding: '15px', borderRadius: '16px', border: '1px solid #BBF7D0', display: 'inline-block', width: '100%' }}>
                        <div style={{ color: '#F59E0B', fontSize: '1.4rem', marginBottom: '5px' }}>{"★".repeat(req.client_rating)}</div>
                        {req.client_comment && <p style={{ margin: '0 0 5px 0', fontSize: '1rem', color: '#334155', fontStyle: 'italic' }}>"{req.client_comment}"</p>}
                        <span style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 'bold' }}>✓ {t("reviewSent")}</span>
                      </div>
                    ) : (
                      <button onClick={() => openReviewModal(req)} style={{
                        background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', color: 'white', border: 'none', padding: '12px 30px', borderRadius: '50px',
                        cursor: 'pointer', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '8px',
                        boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)', transition: 'transform 0.2s'
                      }}>
                        <Star size={18} fill="white" /> {t("rateTech")}
                      </button>
                    )}
                  </div>
                )}

              </div>
            </Tilt>
          )))
      }
    </div >
  );
}

export default UserBookings;
