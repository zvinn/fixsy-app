import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { db } from '../services/firebase';
import { collection, getDocs, updateDoc, doc, query, where, increment, addDoc } from 'firebase/firestore';
import ChatWindow from '../components/ChatWindow';
import WalletPage from './WalletPage';
import { MapPin, PenTool, DollarSign, MessageCircle, CheckCircle, Navigation, Clock, AlertTriangle, Zap, ChevronLeft, Star, CreditCard, Banknote, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function TechDashboard({ user, goBack }) {
  const [requests, setRequests] = useState([]);
  const [chatRequestId, setChatRequestId] = useState(null);
  const [techData, setTechData] = useState(null);
  // 📅 Smart Schedule State
  const [workingHours, setWorkingHours] = useState({ start: '09:00', end: '18:00', offDays: ['Friday'] });
  const [showScheduleSettings, setShowScheduleSettings] = useState(false);

  const [loading, setLoading] = useState(true);
  const [showWallet, setShowWallet] = useState(false);
  const [chartExpanded, setChartExpanded] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'history'
  const { t } = useLanguage();

  const ADMIN_EMAIL = "mhamed.saad.ibrahim@gmail.com";
  const DEBT_LIMIT = 200;

  useEffect(() => {
    const fetchTechData = async () => {
      if (!user) return;
      if (user.email === ADMIN_EMAIL) {
        setTechData({ id: 'admin_preview', name: 'Admin', earnings: 999, debt: 0, isVerified: true, unpaidOrdersCount: 0 });
        setLoading(false); return;
      }
      const q = query(collection(db, "technicians"), where("email", "==", user.email));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const docData = querySnapshot.docs[0];
        setTechData({ ...docData.data(), id: docData.id });
        if (docData.data().workingHours) setWorkingHours(docData.data().workingHours);
      } else { console.log("No tech data"); }
      setLoading(false);
    };
    fetchTechData();
  }, [user]);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!user) return;
      let q;
      if (user.email === ADMIN_EMAIL) q = collection(db, "requests");
      else q = query(collection(db, "requests"), where("technician_email", "==", user.email));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })).sort((a, b) => new Date(b.date) - new Date(a.date));
      setRequests(data);
    };
    fetchRequests();
  }, [user]);

  // Fetch Transactions for Chart
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;

      const q = query(collection(db, "transactions"), where("userId", "==", user.email), where("type", "==", "earning"));
      const snap = await getDocs(q);
      const rawData = snap.docs.map(d => d.data());

      // Aggegate by Date (Last 7 Days)
      const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
      }).reverse();

      const aggregated = last7Days.map(date => {
        const dayTotal = rawData
          .filter(t => t.date.startsWith(date))
          .reduce((sum, t) => sum + (t.amount || 0), 0);

        return {
          name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }), // Mon, Tue...
          fullDate: date,
          amount: dayTotal
        };
      });

      setChartData(aggregated);
    };
    fetchTransactions();
  }, [user]);

  const watchIdRef = useRef(null);

  // Cleanup location watcher on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  const updateStatus = async (req, newStatus) => {
    try {
      const orderRef = doc(db, "requests", req.id);

      // 📍 Start Live Tracking if 'On Way'
      if (newStatus === 'on_way') {
        if (navigator.geolocation) {
          toast.loading(t("trackingStarted"), { duration: 2000 });
          const id = navigator.geolocation.watchPosition(
            (pos) => {
              updateDoc(orderRef, {
                tech_location: { lat: pos.coords.latitude, lng: pos.coords.longitude }
              });
            },
            (err) => console.error("Tracking Error:", err),
            { enableHighAccuracy: true }
          );
          watchIdRef.current = id;
        }
      }

      // 🛑 Stop Tracking if Arrived or Completed
      if ((newStatus === 'arrived' || newStatus === 'completed' || newStatus === 'cancelled') && watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }

      await updateDoc(orderRef, { status: newStatus });
      if (newStatus === 'completed' && techData && techData.id !== 'admin_preview') {
        const price = req.price || 0;
        const commission = price * 0.10;
        const techRef = doc(db, "technicians", techData.id);

        // 1. تسجيل عملية الربح (Transaction)
        await addDoc(collection(db, "transactions"), {
          userId: user.email,
          amount: price,
          type: 'earning',
          description: t("earnings"),
          date: new Date().toISOString(),
          relatedOrderId: req.id
        });

        if (!techData.isFirstOrderDone) {
          await updateDoc(techRef, { earnings: increment(price), isFirstOrderDone: true });
          setTechData(prev => ({ ...prev, isFirstOrderDone: true }));
          toast.success(t("firstOrderFree"));

          // First order: No commission transaction
        } else {
          await updateDoc(techRef, { earnings: increment(price), debt: increment(commission), unpaidOrdersCount: increment(1) });

          // 2. تسجيل عملية العمولة (Transaction)
          await addDoc(collection(db, "transactions"), {
            userId: user.email,
            amount: -commission,
            type: 'commission',
            description: `${t("discount")} (${commission} ${t("currency")})`,
            date: new Date().toISOString(),
            relatedOrderId: req.id
          });

          toast.success(t("earningsAdded"));
        }
      }
      setRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: newStatus } : r));
    } catch (error) { console.error(error); toast.error(t("errorOccurred")); }
  };

  // Save Schedule Settings
  const saveSchedule = async () => {
    if (!techData) return;
    try {
      const techRef = doc(db, "technicians", techData.id);
      await updateDoc(techRef, { workingHours });
      toast.success(t("scheduleSaved"));
      setShowScheduleSettings(false);
    } catch (e) {
      console.error(e);
      toast.error(t("errorOccurred"));
    }
  };

  const toggleOffDay = (day) => {
    setWorkingHours(prev => {
      const offDays = prev.offDays.includes(day)
        ? prev.offDays.filter(d => d !== day)
        : [...prev.offDays, day];
      return { ...prev, offDays };
    });
  };

  const toggleAvailability = async () => {
    if (!techData || techData.id === 'admin_preview') return;
    const newStatus = !techData.isAvailable;
    try {
      await updateDoc(doc(db, "technicians", techData.id), { isAvailable: newStatus });
      setTechData(prev => ({ ...prev, isAvailable: newStatus }));
      toast.success(newStatus ? t("youAreOnline") || "You are now Online 🟢" : t("youAreOffline") || "You are now Offline 🔴");
    } catch (e) {
      console.error(e);
      toast.error("Error updating status");
    }
  };

  const DAYS = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const renderActionButton = (req) => {
    if (req.status === 'cancelled') return <div style={{ background: '#FEE2E2', color: '#DC2626', textAlign: 'center', padding: '12px', width: '100%', borderRadius: '12px', fontWeight: 'bold' }}>❌ {t("orderCancelledClient")}</div>;

    // شرط التوثيق
    if (techData?.isVerified !== true && techData?.isVerified !== 'approved' && techData.id !== 'admin_preview') {
      return <button disabled style={{ background: '#E2E8F0', color: '#94A3B8', border: 'none', padding: '12px', borderRadius: '12px', width: '100%', cursor: 'not-allowed', fontWeight: 'bold' }}>⛔ {t("accountNotVerified")}</button>;
    }

    const btnStyle = (bg, color = '#fff') => ({ background: bg, color: color, border: 'none', padding: '12px', borderRadius: '12px', cursor: 'pointer', marginTop: '10px', width: '100%', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: '0.2s' });

    switch (req.status) {
      case 'pending':
        if (techData?.debt >= DEBT_LIMIT && techData.id !== 'admin_preview') return <button disabled style={btnStyle('#E2E8F0', '#94A3B8')}>⛔ {t("payDebtFirst")}</button>;
        return <button onClick={() => updateStatus(req, 'accepted')} style={btnStyle('#10B981')}><CheckCircle size={18} /> {t("acceptOrder")}</button>;
      case 'accepted': return <button onClick={() => updateStatus(req, 'on_way')} style={btnStyle('#3B82F6')}><Navigation size={18} /> {t("onMyWay")}</button>;
      case 'on_way': return <button onClick={() => updateStatus(req, 'arrived')} style={btnStyle('#8B5CF6')}><MapPin size={18} /> {t("arrivedLocation")}</button>;
      case 'arrived': return <button onClick={() => updateStatus(req, 'in_progress')} style={btnStyle('#F59E0B')}><PenTool size={18} /> {t("startWork")}</button>;
      case 'in_progress': return <button onClick={() => updateStatus(req, 'completed')} style={btnStyle('#059669')}><DollarSign size={18} /> {t("finishAndCollect")}</button>;
      case 'completed': return <div style={{ background: '#DCFCE7', color: '#166534', textAlign: 'center', padding: '12px', borderRadius: '12px', fontWeight: 'bold' }}>🎉 {t("taskCompletedSuccess")}</div>;
      default: return null;
    }
  };

  const statusBadge = (status) => {
    const map = {
      'pending': { text: t("pending"), bg: '#FEF3C7', col: '#B45309' },
      'accepted': { text: t("status"), bg: '#DBEAFE', col: '#1E40AF' }, // 'accepted' mapping was generic, maybe 'Accepted'?
      'on_way': { text: t("onMyWay"), bg: '#E0E7FF', col: '#4338CA' },
      'arrived': { text: t("arrivedLocation"), bg: '#F3E8FF', col: '#7E22CE' },
      'in_progress': { text: t("in_progress"), bg: '#FFF7ED', col: '#C2410C' },
      'completed': { text: t("completed"), bg: '#DCFCE7', col: '#15803D' },
      'cancelled': { text: t("cancelled"), bg: '#FEE2E2', col: '#991B1B' },
    };
    const s = map[status] || { text: status, bg: '#eee', col: '#333' };
    return <span style={{ background: s.bg, color: s.col, padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>{s.text}</span>;
  };

  if (showWallet) return <WalletPage user={user} goBack={() => setShowWallet(false)} />;

  if (loading || !techData) return <div className="loading-container"><div className="spinner"></div><div className="loading-text">{t("loading")}</div></div>;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', paddingTop: '80px', paddingBottom: '100px' }}>
      {/* الهيدر المثبت */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, background: 'white', padding: '15px 20px', zIndex: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <h2 style={{ color: '#0056D2', margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={24} /> {t("dailyTasks")}
        </h2>

        {/* 🟢 Availability Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.85rem', color: techData.isAvailable ? '#16A34A' : '#64748B', fontWeight: 'bold' }}>
            {techData.isAvailable ? (t("online") || "Online") : (t("offline") || "Offline")}
          </span>
          <button
            onClick={toggleAvailability}
            style={{
              width: '50px', height: '28px',
              background: techData.isAvailable ? '#16A34A' : '#E2E8F0',
              borderRadius: '20px', position: 'relative', border: 'none', cursor: 'pointer',
              transition: '0.3s'
            }}
          >
            <div style={{
              width: '22px', height: '22px',
              background: 'white', borderRadius: '50%',
              position: 'absolute', top: '3px',
              left: techData.isAvailable ? '25px' : '3px',
              transition: '0.3s', boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
            }}></div>
          </button>
        </div>
        {/* زرار الرجوع اختياري طالما الشريط السفلي موجود */}
      </div>

      {chatRequestId && <ChatWindow requestId={chatRequestId} currentUser={user} closeChat={() => setChatRequestId(null)} />}

      {/* كارت المحفظة (الفيزا) */}
      <div onClick={() => setShowWallet(true)} style={{ cursor: 'pointer', background: 'linear-gradient(135deg, #0056D2 0%, #2563EB 100%)', color: 'white', padding: '25px', borderRadius: '20px', marginBottom: '25px', boxShadow: '0 10px 25px rgba(0, 86, 210, 0.3)', position: 'relative', overflow: 'hidden', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center' }}>
            <label style={{ fontSize: '0.85rem', opacity: 0.9, display: 'block', marginBottom: '5px' }}>{t("earnings")}</label>
            <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{techData.earnings} <span style={{ fontSize: '0.8rem' }}>{t("currency")}</span></div>
          </div>
          <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.3)' }}></div>
          <div style={{ textAlign: 'center' }}>
            <label style={{ fontSize: '0.85rem', opacity: 0.9, display: 'block', marginBottom: '5px' }}>{t("wallet")}</label>
            <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{techData.walletBalance || 0} <span style={{ fontSize: '0.8rem' }}>{t("currency")}</span></div>
          </div>
          <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.3)' }}></div>
          <div style={{ textAlign: 'center' }}>
            <label style={{ fontSize: '0.85rem', opacity: 0.9, display: 'block', marginBottom: '5px' }}>{t("debt")}</label>
            <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#FCA5A5' }}>{techData.debt} <span style={{ fontSize: '0.8rem' }}>{t("currency")}</span></div>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '0.9rem', opacity: 0.9, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
          {t("transactionDetails")} <ChevronLeft size={16} />
        </div>
        {techData.unpaidOrdersCount > 0 && <div style={{ marginTop: '15px', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '10px', textAlign: 'center', fontSize: '0.8rem' }}>⚠️ {t("debtWarning")} {techData.unpaidOrdersCount} {t("unpaidCommissionOrders")}</div>}
      </div>

      {/* Analytics Expansion */}
      {chartExpanded && (
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '24px', marginBottom: '25px', animation: 'fadeIn 0.5s ease-out' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={20} color="#10B981" /> {t("weeklyEarnings")}
          </h3>
          <div style={{ height: '200px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                  itemStyle={{ color: '#059669', fontWeight: 'bold' }}
                  cursor={{ stroke: '#10B981', strokeWidth: 1, strokeDasharray: '5 5' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorEarnings)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Expand/Collapse Control */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '-20px', marginBottom: '20px', gap: '10px' }}>
        <button onClick={() => setChartExpanded(!chartExpanded)} style={{
          background: 'white', border: 'none', borderRadius: '20px', padding: '8px 16px',
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)', cursor: 'pointer', color: '#0056D2', fontWeight: 'bold',
          display: 'flex', alignItems: 'center', gap: '5px'
        }}>
          {chartExpanded ? <ChevronUp size={16} /> : <TrendingUp size={16} />} {chartExpanded ? t("hideAnalytics") : t("analytics")}
        </button>

        <button onClick={() => setShowScheduleSettings(!showScheduleSettings)} style={{
          background: 'white', border: 'none', borderRadius: '20px', padding: '8px 16px',
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)', cursor: 'pointer', color: '#D97706', fontWeight: 'bold',
          display: 'flex', alignItems: 'center', gap: '5px'
        }}>
          <Clock size={16} /> {t("scheduleSettings") || "Work Schedule"}
        </button>
      </div>

      {/* 📅 Schedule Settings Panel */}
      {showScheduleSettings && (
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '24px', marginBottom: '25px', animation: 'fadeIn 0.4s' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#D97706' }}>📅 {t("scheduleSettings") || "Work Schedule"}</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#64748B' }}>{t("startTime") || "Start Time"}</label>
              <input type="time" className="form-input" value={workingHours.start} onChange={e => setWorkingHours({ ...workingHours, start: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '12px', border: '1px solid #E2E8F0' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#64748B' }}>{t("endTime") || "End Time"}</label>
              <input type="time" className="form-input" value={workingHours.end} onChange={e => setWorkingHours({ ...workingHours, end: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '12px', border: '1px solid #E2E8F0' }} />
            </div>
          </div>

          <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.9rem', color: '#64748B' }}>{t("offDays") || "Days Off"}</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
            {DAYS.map(day => (
              <button key={day} onClick={() => toggleOffDay(day)} style={{
                padding: '8px 12px', borderRadius: '20px', border: '1px solid',
                borderColor: workingHours.offDays.includes(day) ? '#EF4444' : '#E2E8F0',
                background: workingHours.offDays.includes(day) ? '#FEF2F2' : 'white',
                color: workingHours.offDays.includes(day) ? '#B91C1C' : '#64748B',
                cursor: 'pointer', fontSize: '0.85rem'
              }}>
                {t(day) || day}
              </button>
            ))}
          </div>

          <button onClick={saveSchedule} className="submit-btn" style={{ width: '100%', background: '#D97706' }}>{t("save")}</button>
        </div>
      )}

      {/* تنبيه التوثيق */}
      {techData.isVerified !== true && techData.isVerified !== 'approved' && (
        <div style={{ background: '#FFF7ED', border: '1px solid #F97316', padding: '15px', borderRadius: '16px', marginBottom: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
          <h4 style={{ margin: 0, color: '#C2410C', display: 'flex', alignItems: 'center', gap: '8px' }}><AlertTriangle size={20} /> {t("accountInactive")}</h4>
          <p style={{ fontSize: '0.9rem', color: '#555', margin: 0 }}>
            {techData.isVerified === 'pending' ? `⏳ ${t("reviewingData")}` : `❌ ${t("uploadDocsPrompt")}`}
          </p>
        </div>
      )}

      {/* قائمة الطلبات */}
      {/* 🟢 Tabs: Active vs History */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px' }}>
        <button onClick={() => setActiveTab('active')} style={{ flex: 1, padding: '10px', background: activeTab === 'active' ? '#EFF6FF' : 'transparent', color: activeTab === 'active' ? '#0056D2' : '#64748B', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s', borderBottom: activeTab === 'active' ? '2px solid #0056D2' : 'none' }}>
          🚀 {t("active") || "Active"} ({requests.filter(r => ['pending', 'accepted', 'on_way', 'arrived', 'in_progress'].includes(r.status)).length})
        </button>
        <button onClick={() => setActiveTab('history')} style={{ flex: 1, padding: '10px', background: activeTab === 'history' ? '#F0FDF4' : 'transparent', color: activeTab === 'history' ? '#15803D' : '#64748B', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s', borderBottom: activeTab === 'history' ? '2px solid #15803D' : 'none' }}>
          📜 {t("history") || "History"}
        </button>
      </div>

      {/* قائمة الطلبات */}
      {requests.filter(req => {
        if (activeTab === 'active') return ['pending', 'accepted', 'on_way', 'arrived', 'in_progress'].includes(req.status);
        return ['completed', 'cancelled', 'rejected'].includes(req.status);
      }).length === 0 ?
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
          <div style={{ background: '#F1F5F9', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}><Navigation size={40} color="#CBD5E1" /></div>
          <p>{activeTab === 'active' ? (t("noTasksAssigned") || "No active tasks") : (t("noHistory") || "No completed jobs yet")} ☕</p>
        </div>
        :
        requests.filter(req => {
          if (activeTab === 'active') return ['pending', 'accepted', 'on_way', 'arrived', 'in_progress'].includes(req.status);
          return ['completed', 'cancelled', 'rejected'].includes(req.status);
        }).map((req) => (
          <div key={req.id} className="glass-panel" style={{
            padding: '20px', marginBottom: '20px', borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            position: 'relative', overflow: 'hidden'
          }}>

            {/* Payment Method Badge */}
            <div style={{
              position: 'absolute', top: '20px', left: '20px', // RTL support: consider direction
              background: req.paymentMethod === 'wallet' ? '#EFF6FF' : '#ECFDF5',
              padding: '6px 12px', borderRadius: '12px',
              display: 'flex', alignItems: 'center', gap: '6px',
              border: req.paymentMethod === 'wallet' ? '1px solid #BFDBFE' : '1px solid #A7F3D0'
            }}>
              {req.paymentMethod === 'wallet' ? <CreditCard size={14} color="#2563EB" /> : <Banknote size={14} color="#059669" />}
              <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: req.paymentMethod === 'wallet' ? '#1E40AF' : '#047857' }}>
                {req.paymentMethod === 'wallet' ? t("wallet") : t("cash")}
              </span>
            </div>

            {/* Header: Client Info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#1E293B' }}>{req.client_name || t("client")}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px' }}>
                  {statusBadge(req.status)}
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>

              <div style={{ background: 'rgba(255,255,255,0.5)', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: '#F1F5F9', padding: '8px', borderRadius: '50%' }}><MapPin size={18} color="#64748B" /></div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{t("yourAddress")}</div>
                  <div style={{ fontSize: '0.9rem', color: '#334155', fontWeight: 'bold' }}>{req.client_address ? req.client_address.substring(0, 15) + '...' : '...'}</div>
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.5)', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: '#F1F5F9', padding: '8px', borderRadius: '50%' }}><Clock size={18} color="#64748B" /></div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{t("visitDate")}</div>
                  <div style={{ fontSize: '0.9rem', color: '#334155', fontWeight: 'bold' }}>{new Date(req.scheduledDate || req.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>

            </div>

            {/* Problem Description & Price */}
            <div style={{ background: '#F8FAFC', padding: '15px', borderRadius: '16px', marginBottom: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'start', gap: '10px', marginBottom: '10px' }}>
                <PenTool size={18} color="#64748B" style={{ marginTop: '3px' }} />
                <p style={{ margin: 0, fontSize: '0.95rem', color: '#475569', lineHeight: '1.5' }}>{req.problem_desc}</p>
              </div>
              <div style={{ borderTop: '1px dashed #E2E8F0', paddingTop: '10px', marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', color: '#64748B' }}>{t("price")}</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#0056D2' }}>{req.price} {t("currency")}</span>
              </div>
            </div>

            {/* Problem Image */}
            {req.problem_image && (
              <div style={{ marginBottom: '15px' }}>
                <a href={req.problem_image} target="_blank" rel="noreferrer" style={{ display: 'block', position: 'relative', borderRadius: '16px', overflow: 'hidden', height: '120px' }}>
                  <img src={req.problem_image} alt="Problem" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(0,0,0,0.6) 0%, transparent 50%)', display: 'flex', alignItems: 'flex-end', padding: '10px' }}>
                    <span style={{ color: 'white', fontSize: '0.8rem', fontWeight: 'bold' }}>📸 {t("problemImage")}</span>
                  </div>
                </a>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px' }}>
              {req.location && (
                <a href={`https://www.google.com/maps/search/?api=1&query=${req.location.lat},${req.location.lng}`} target="_blank" rel="noreferrer"
                  style={{ flex: 1, height: '44px', background: '#F1F5F9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', textDecoration: 'none' }}>
                  <Navigation size={20} />
                </a>
              )}
              {req.status !== 'pending' && req.status !== 'cancelled' && (
                <button onClick={() => setChatRequestId(req.id)} style={{ flex: 1, height: '44px', background: '#F1F5F9', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
                  <MessageCircle size={20} />
                </button>
              )}
            </div>

            {/* Main Action Button */}
            <div style={{ marginTop: '15px' }}>
              {renderActionButton(req)}
            </div>

          </div>
        ))
      }
    </div>
  );
}

export default TechDashboard;
