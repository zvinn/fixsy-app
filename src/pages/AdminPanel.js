/* src/AdminPanel.js - تصميم احترافي ورفض ذكي */
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { db } from '../services/firebase';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, deleteDoc, setDoc, orderBy } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ShieldCheck, Users, DollarSign, FileText, Tag, XCircle, CheckCircle, Trash2, Plus, Search, AlertTriangle, BarChart3, Sparkles, Edit2, Check, X, Megaphone, Ticket, Map, CloudRain, Sun } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLiveMap from '../components/AdminLiveMap';
import AdminAnalytics from '../components/AdminAnalytics';

function AdminPanel({ goBack }) {
    const { t, language } = useLanguage();
    const [activeTab, setActiveTab] = useState('verification');
    const [pendingTechs, setPendingTechs] = useState([]);
    const [debtors, setDebtors] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [coupons, setCoupons] = useState([]);
    const [referralUsers, setReferralUsers] = useState([]);
    const [disputes, setDisputes] = useState([]); // 🚨 Disputes State

    const [analyticsData, setAnalyticsData] = useState({ revenue: [], status: [], services: [], stats: { users: 0, orders: 0, revenue: 0 } });
    const [aiLogs, setAiLogs] = useState([]);
    const [editingLogId, setEditingLogId] = useState(null);
    const [correctionType, setCorrectionType] = useState("");

    const aiCategories = [
        language === 'ar' ? 'سباكة' : 'Plumbing',
        language === 'ar' ? 'كهرباء' : 'Electrical',
        language === 'ar' ? 'تكييف' : 'AC',
        language === 'ar' ? 'أجهزة منزلية' : 'Appliances',
        language === 'ar' ? 'دهانات' : 'Painting',
        language === 'ar' ? 'نجارة' : 'Carpentry',
        language === 'ar' ? 'صيانة عامة' : 'General'
    ];

    // متغيرات الرفض
    const [rejectingId, setRejectingId] = useState(null);
    const [rejectionReason, setRejectionReason] = useState("");

    const [newCoupon, setNewCoupon] = useState({ code: '', discount: '' });
    const [newAdminEmail, setNewAdminEmail] = useState('');

    // Admin 2.0 Broadcast State
    const [broadcastForm, setBroadcastForm] = useState({ title: '', body: '', recipient: 'all_techs' });
    const [isBroadcasting, setIsBroadcasting] = useState(false);

    useEffect(() => {
        if (activeTab === 'verification') fetchPendingTechs();
        if (activeTab === 'finance') fetchDebtors();
        if (activeTab === 'admins') fetchAdmins();
        if (activeTab === 'coupons') fetchCoupons();
        if (activeTab === 'coupons') fetchCoupons();

        if (activeTab === 'referrals') fetchReferrals();
        if (activeTab === 'disputes') fetchDisputes();
    }, [activeTab]);

    const fetchPendingTechs = async () => {
        const q = query(collection(db, "technicians"), where("isVerified", "==", "pending"));
        const snap = await getDocs(q);
        setPendingTechs(snap.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    };
    const fetchDebtors = async () => {
        const q = query(collection(db, "technicians"), where("debt", ">", 0), orderBy("debt", "desc"));
        const snap = await getDocs(q);
        setDebtors(snap.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    };
    const fetchAdmins = async () => {
        const snap = await getDocs(collection(db, "admins"));
        setAdmins(snap.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    };
    const fetchCoupons = async () => {
        const snap = await getDocs(collection(db, "coupons"));
        setCoupons(snap.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    };

    const fetchReferrals = async () => {
        // Fetch clients and techs, filter by referralCount > 0
        const clientsSnap = await getDocs(collection(db, "clients"));
        const techsSnap = await getDocs(collection(db, "technicians"));

        const allUsers = [
            ...clientsSnap.docs.map(d => ({ ...d.data(), id: d.id, role: 'client' })),
            ...techsSnap.docs.map(d => ({ ...d.data(), id: d.id, role: 'tech' }))
        ];

        const referrers = allUsers
            .filter(u => u.referralCount > 0)
            .sort((a, b) => b.referralCount - a.referralCount);

        setReferralUsers(referrers);
    };

    const fetchDisputes = async () => {
        const snap = await getDocs(collection(db, "disputes"));
        setDisputes(snap.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    };

    const resolveDispute = async (id) => {
        if (!window.confirm(t("confirmResolve") || "Mark as resolved?")) return;
        await deleteDoc(doc(db, "disputes", id));
        toast.success(t("resolved"));
        fetchDisputes();
    };



    const handleCorrectDiagnosis = async (logId) => {
        if (!correctionType) return;
        try {
            await updateDoc(doc(db, "ai_logs", logId), {
                type: correctionType,
                isCorrected: true,
                correctedAt: new Date().toISOString()
            });
            toast.success(t("save"));
            setEditingLogId(null);
            setCorrectionType("");

        } catch (e) { toast.error(t("errorOccurred")); }
    };

    const approveTech = async (id) => {
        try {
            await updateDoc(doc(db, "technicians", id), { isVerified: true });
            const techDoc = pendingTechs.find(t => t.id === id);
            if (techDoc && techDoc.email) {
                await addDoc(collection(db, "notifications"), {
                    userId: techDoc.email, message: t("verifySuccessMsg"), icon: "✅", type: 'system', date: new Date().toISOString(), read: false
                });
            }
            toast.success(t("verifySuccessToast"));
            fetchPendingTechs();
        } catch (error) { toast.error(t("errorOccurred")); }
    };

    const confirmReject = async (id) => {
        if (!rejectionReason) return toast.error(t("rejectReasonToast"));
        try {
            await updateDoc(doc(db, "technicians", id), { isVerified: false, rejectionReason: rejectionReason });
            const techDoc = pendingTechs.find(t => t.id === id);
            if (techDoc && techDoc.email) {
                await addDoc(collection(db, "notifications"), {
                    userId: techDoc.email, message: `${t("rejectMsgPrefix")} ${rejectionReason}`, icon: "❌", type: 'system', date: new Date().toISOString(), read: false
                });
            }
            toast.success(t("rejectToast"));
            setRejectingId(null); setRejectionReason(""); fetchPendingTechs();
        } catch (error) { toast.error(t("errorOccurred")); }
    };

    const sendBroadcast = async (e) => {
        e.preventDefault();
        if (!broadcastForm.title || !broadcastForm.body) return;
        setIsBroadcasting(true);
        const toastId = toast.loading(t("loading"));

        try {
            let targets = [];
            // For MVP, we only support 'all_techs' efficiently if we have them in state, 
            // or we query them. We already have pendingTechs and debtors, but not *all* techs.
            // Let's query all verified techs.
            if (broadcastForm.recipient === 'all_techs') {
                const q = query(collection(db, "technicians"), where("isVerified", "==", true));
                const snap = await getDocs(q);
                targets = snap.docs.map(d => d.data().email).filter(e => e);
            }

            // Loop and send (Batching would be better but simple loop ok for < 100 users)
            const promises = targets.map(email =>
                addDoc(collection(db, "notifications"), {
                    userId: email,
                    title: broadcastForm.title,
                    message: broadcastForm.body,
                    icon: "📢",
                    type: 'broadcast',
                    date: new Date().toISOString(),
                    read: false
                })
            );

            await Promise.all(promises);
            toast.success(t("sentSuccess"), { id: toastId });
            setBroadcastForm({ title: '', body: '', recipient: 'all_techs' });
        } catch (error) {
            console.error(error);
            toast.error(t("errorOccurred"), { id: toastId });
        } finally {
            setIsBroadcasting(false);
        }
    };

    const settleDebt = async (tech) => {
        if (!window.confirm(`${t("confirmReceipt")} ${tech.debt} ${t("currency")}?`)) return;
        await updateDoc(doc(db, "technicians", tech.id), { debt: 0, unpaidOrdersCount: 0 });
        toast.success(t("accountSettled"));
        fetchDebtors();
    };

    const addNewAdmin = async (e) => {
        e.preventDefault();
        if (!newAdminEmail) return;
        await addDoc(collection(db, "admins"), { email: newAdminEmail });
        setNewAdminEmail('');
        toast.success(t("adminAdded"));
        fetchAdmins();
    };

    const addCoupon = async (e) => {
        e.preventDefault();
        if (!newCoupon.code || !newCoupon.discount) return;
        await addDoc(collection(db, "coupons"), { code: newCoupon.code.toUpperCase(), discount: Number(newCoupon.discount), isActive: true });
        setNewCoupon({ code: '', discount: '' });
        toast.success(t("couponCreated"));
        fetchCoupons();
    };

    const toggleCouponStatus = async (id, currentStatus) => {
        await updateDoc(doc(db, "coupons", id), { isActive: !currentStatus });
        fetchCoupons();
        toast.success(currentStatus ? t("couponStopped") : t("couponActivated"));
    };

    const deleteCoupon = async (id) => {
        if (!window.confirm(t("deleteCouponConfirm"))) return;
        await deleteDoc(doc(db, "coupons", id));
        fetchCoupons();
    };

    const toggleWeatherAlert = async (type) => {
        try {
            await setDoc(doc(db, "system", "weather_alert"), {
                isActive: true,
                type: type,
                icon: type === 'rain' ? '⛈️' : '🔥',
                message: type === 'rain' ? t("rainAlert") || "Heavy rain alert! Check windows." : t("heatAlert") || "Extreme heat alert! Stay hydrated."
            });
            toast.success(t("alertActivated") || "Alert Activated");
        } catch (e) { toast.error(t("errorOccurred")); }
    };

    const clearWeatherAlert = async () => {
        try {
            await setDoc(doc(db, "system", "weather_alert"), { isActive: false });
            toast.success(t("alertCleared") || "Alert Cleared");
        } catch (e) { toast.error(t("errorOccurred")); }
    };

    const TabButton = ({ id, label, icon }) => (
        <button onClick={() => setActiveTab(id)}
            style={{
                flex: 1, padding: '12px', border: 'none', borderRadius: '12px', cursor: 'pointer',
                background: activeTab === id ? '#0056D2' : '#F1F5F9', color: activeTab === id ? 'white' : '#64748B',
                fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: '0.3s'
            }}>
            {icon} {label}
        </button>
    );

    return (
        <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto', paddingBottom: '100px' }}>
            <div style={{ background: 'white', padding: '15px 20px', borderRadius: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <h2 style={{ color: '#0056D2', margin: 0, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem' }}><ShieldCheck size={24} /> {t("adminTitle")}</h2>
                <button onClick={goBack} style={{ padding: '8px 15px', cursor: 'pointer', borderRadius: '8px', border: '1px solid #ddd', background: 'white' }}>{t("logout")}</button>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', flexWrap: 'wrap' }}>
                <TabButton id="verification" label={t("verification")} icon={<FileText size={18} />} />
                <TabButton id="live_map" label={t("liveMap") || "Live Map"} icon={<Map size={18} />} />
                <TabButton id="finance" label={t("finance")} icon={<DollarSign size={18} />} />
                <TabButton id="coupons" label={t("coupons")} icon={<Ticket size={18} />} />
                <TabButton id="referrals" label={t("referrals") || "Referrals"} icon={<Users size={18} />} />
                <TabButton id="broadcast" label={t("broadcast")} icon={<Megaphone size={18} />} />
                <TabButton id="disputes" label={t("disputes") || "Disputes"} icon={<ShieldCheck size={18} />} />
                <TabButton id="analytics" label={t("analytics")} icon={<BarChart3 size={18} />} />
                <TabButton id="admins" label={t("admin")} icon={<Users size={18} />} />
            </div>

            {activeTab === 'live_map' && (
                <div style={{ marginBottom: '30px' }}>
                    <h3 style={{ margin: '0 0 15px', color: '#1E293B' }}>{t("liveTechMap") || "Technician Live Location"}</h3>
                    <AdminLiveMap />
                </div>
            )}

            {activeTab === 'verification' && (
                <div>
                    <h3 style={{ color: '#334155', margin: '0 0 15px 0' }}>{t("pendingRequests")} ({pendingTechs.length})</h3>
                    {pendingTechs.length === 0 ? <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}><CheckCircle size={40} style={{ marginBottom: '10px', opacity: 0.5 }} /><p>{t("noPendingRequests")}</p></div> :
                        pendingTechs.map(tech => (
                            <div key={tech.id} style={{ background: 'white', padding: '20px', borderRadius: '16px', marginBottom: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', display: 'flex', gap: '20px', flexWrap: 'wrap', border: '1px solid #f1f5f9' }}>
                                <div style={{ flex: '0 0 120px' }}>
                                    {tech.idCardImage ? <a href={tech.idCardImage} target="_blank" rel="noreferrer"><img src={tech.idCardImage} alt="ID" style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd' }} /></a> : <div style={{ height: '80px', background: '#eee', borderRadius: '8px' }}></div>}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>{tech.name}</h4>
                                    <p style={{ margin: '5px 0', fontSize: '0.9rem', color: '#475569' }}>🆔 {tech.nationalId}</p>
                                    {rejectingId === tech.id ? (
                                        <div style={{ marginTop: '15px', background: '#FFF1F2', padding: '15px' }}>
                                            <input type="text" placeholder={t("rejectionReason")} value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
                                            <button onClick={() => confirmReject(tech.id)} style={{ background: '#E11D48', color: 'white', padding: '8px' }}>{t("confirm")}</button>
                                        </div>
                                    ) : (
                                        <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                                            <button onClick={() => approveTech(tech.id)} style={{ background: '#10B981', color: 'white', padding: '10px', flex: 1 }}>{t("acceptOffer")}</button>
                                            <button onClick={() => setRejectingId(tech.id)} style={{ background: '#FFF1F2', color: '#E11D48', padding: '10px', flex: 1 }}>{t("reject")}</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                </div>
            )}

            {activeTab === 'disputes' && (
                <div>
                    <h3 style={{ color: '#334155', margin: '0 0 15px 0' }}>🚨 {t("activeDisputes") || "Active Disputes"} ({disputes.length})</h3>
                    {disputes.length === 0 ? <p style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>{t("noDisputes") || "No disputes found."}</p> :
                        disputes.map(d => (
                            <div key={d.id} style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: '20px', borderRadius: '16px', marginBottom: '15px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <strong style={{ color: '#991B1B' }}>Request ID: {d.reqId || 'N/A'}</strong>
                                    <span style={{ fontSize: '0.8rem', color: '#7F1D1D' }}>{new Date(d.date).toLocaleDateString()}</span>
                                </div>
                                <p style={{ margin: '0 0 10px', color: '#B91C1C' }}><strong>Reason:</strong> {d.reason}</p>
                                <div style={{ fontSize: '0.9rem', color: '#7F1D1D', marginBottom: '15px' }}>
                                    Client: {d.clientEmail} <br />
                                    Tech ID: {d.techId}
                                </div>
                                <button onClick={() => resolveDispute(d.id)} style={{ background: 'white', border: '1px solid #FECACA', color: '#DC2626', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                                    ✅ {t("resolve") || "Mark Resolved"}
                                </button>
                            </div>
                        ))
                    }
                </div>
            )}

            {activeTab === 'broadcast' && (
                <div className="fade-in">
                    <div style={{ background: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid #F1F5F9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
                            <div style={{ background: '#EFF6FF', padding: '12px', borderRadius: '12px' }}><Megaphone size={28} color="#2563EB" /></div>
                            <div>
                                <h3 style={{ margin: 0, color: '#1E293B', fontSize: '1.2rem' }}>{t("broadcast")}</h3>
                                <p style={{ margin: '5px 0 0 0', color: '#64748B', fontSize: '0.9rem' }}>{t("sendNotification")}</p>
                            </div>
                        </div>

                        <form onSubmit={sendBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'flex', gap: '20px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#334155' }}>{t("recipient")}</label>
                                    <select
                                        value={broadcastForm.recipient}
                                        onChange={e => setBroadcastForm({ ...broadcastForm, recipient: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC' }}
                                    >
                                        <option value="all_techs">{t("allTechs")}</option>
                                        {/* Future: <option value="all_users">{t("allUsers")}</option> */}
                                    </select>
                                </div>
                                <div style={{ flex: 2 }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#334155' }}>{t("messageTitle")}</label>
                                    <input
                                        type="text"
                                        value={broadcastForm.title}
                                        onChange={e => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                                        placeholder={t("messageTitle")}
                                        style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC' }}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#334155' }}>{t("messageBody")}</label>
                                <textarea
                                    value={broadcastForm.body}
                                    onChange={e => setBroadcastForm({ ...broadcastForm, body: e.target.value })}
                                    placeholder={t("messageBody")}
                                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC', minHeight: '120px', resize: 'vertical' }}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isBroadcasting}
                                style={{
                                    alignSelf: 'flex-end',
                                    background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 30px',
                                    borderRadius: '12px',
                                    cursor: isBroadcasting ? 'not-allowed' : 'pointer',
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)',
                                    opacity: isBroadcasting ? 0.7 : 1
                                }}
                            >
                                <Megaphone size={18} /> {isBroadcasting ? t("loading") : t("sendNotification")}
                            </button>
                        </form>
                    </div>
                </div>
            )}


            {/* Weather Controls Widget (Only visible in Broadcast tab for now) */}
            {
                activeTab === 'broadcast' && (
                    <div className="fade-in" style={{ marginTop: '20px' }}>
                        <div style={{ background: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid #F1F5F9' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
                                <div style={{ background: '#F0F9FF', padding: '12px', borderRadius: '12px' }}><CloudRain size={28} color="#0EA5E9" /></div>
                                <div>
                                    <h3 style={{ margin: 0, color: '#1E293B', fontSize: '1.2rem' }}>{t("weatherControl") || "Weather Control"}</h3>
                                    <p style={{ margin: '5px 0 0 0', color: '#64748B', fontSize: '0.9rem' }}>{t("triggerNetworkAlert") || "Trigger Network-wide Alerts"}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <button onClick={() => toggleWeatherAlert('rain')} style={{ flex: 1, padding: '15px', borderRadius: '12px', border: '1px solid #BAE6FD', background: '#F0F9FF', color: '#0369A1', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                                    <CloudRain size={20} /> {t("triggerRain") || "Rain Alert"}
                                </button>
                                <button onClick={() => toggleWeatherAlert('heat')} style={{ flex: 1, padding: '15px', borderRadius: '12px', border: '1px solid #FECACA', background: '#FEF2F2', color: '#B91C1C', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                                    <Sun size={20} /> {t("triggerHeat") || "Heat Alert"}
                                </button>
                                <button onClick={clearWeatherAlert} style={{ flex: 1, padding: '15px', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', color: '#64748B', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                                    <XCircle size={20} /> {t("clearAlert") || "Clear"}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                activeTab === 'finance' && (
                    <div>
                        <div style={{ background: '#F0F9FF', padding: '20px', borderRadius: '16px', marginBottom: '20px', border: '1px solid #BAE6FD', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, color: '#0369A1' }}>💰 {t("totalDues")}</h3>
                            <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0284C7' }}>{debtors.reduce((acc, curr) => acc + curr.debt, 0)} {t("currency")}</span>
                        </div>
                        {debtors.map(tech => (
                            <div key={tech.id} style={{ background: 'white', padding: '20px', borderRadius: '16px', marginBottom: '10px', borderLeft: tech.debt >= 200 ? '5px solid #EF4444' : '5px solid #E2E8F0', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{tech.name}</h4>
                                    <span style={{ color: '#DC2626', fontWeight: 'bold', fontSize: '1.1rem' }}>{tech.debt} {t("currency")}</span>
                                </div>
                                <button onClick={() => settleDebt(tech)} style={{ width: '100%', background: '#0056D2', color: 'white', padding: '12px', borderRadius: '10px' }}>💵 {t("collectMoney")}</button>
                            </div>
                        ))}
                    </div>
                )
            }

            {
                activeTab === 'referrals' && (
                    <div>
                        <div style={{ background: '#F0F9FF', padding: '20px', borderRadius: '16px', marginBottom: '20px', border: '1px solid #BAE6FD', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ margin: 0, color: '#0369A1' }}>👥 {t("topReferrers") || "Top Referrers"}</h3>
                                <p style={{ margin: '5px 0 0', color: '#0284C7', fontSize: '0.9rem' }}>{t("totalReferralPayouts") || "Total Payouts"}: {referralUsers.reduce((acc, u) => acc + (u.referralCount * 50), 0)} {t("currency")}</p>
                            </div>
                            <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0284C7' }}>{referralUsers.length} {t("users") || "Users"}</span>
                        </div>

                        <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ background: '#F8FAFC' }}>
                                    <tr>
                                        <th style={{ padding: '15px', textAlign: 'left', color: '#64748B' }}>{t("user") || "User"}</th>
                                        <th style={{ padding: '15px', textAlign: 'left', color: '#64748B' }}>{t("role") || "Role"}</th>
                                        <th style={{ padding: '15px', textAlign: 'left', color: '#64748B' }}>{t("referralCode") || "Code"}</th>
                                        <th style={{ padding: '15px', textAlign: 'center', color: '#64748B' }}>{t("invites") || "Invites"}</th>
                                        <th style={{ padding: '15px', textAlign: 'right', color: '#64748B' }}>{t("earned") || "Earned"}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {referralUsers.map((user, idx) => (
                                        <tr key={user.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                            <td style={{ padding: '15px', fontWeight: 'bold', color: '#334155' }}>
                                                {user.name}
                                                <div style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 'normal' }}>{user.email}</div>
                                            </td>
                                            <td style={{ padding: '15px' }}>
                                                <span style={{ background: user.role === 'client' ? '#DBEAFE' : '#DCFCE7', color: user.role === 'client' ? '#1E40AF' : '#166534', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                                    {user.role === 'client' ? t("client") : t("technician")}
                                                </span>
                                            </td>
                                            <td style={{ padding: '15px', fontFamily: 'monospace', fontSize: '1.1rem' }}>{user.referralCode}</td>
                                            <td style={{ padding: '15px', textAlign: 'center', fontWeight: 'bold', color: '#3B82F6' }}>{user.referralCount}</td>
                                            <td style={{ padding: '15px', textAlign: 'right', fontWeight: 'bold', color: '#10B981' }}>{user.referralCount * 50} {t("currency")}</td>
                                        </tr>
                                    ))}
                                    {referralUsers.length === 0 && (
                                        <tr>
                                            <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#94A3B8' }}>{t("noReferralsYet") || "No referrals found yet."}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            }

            {
                activeTab === 'coupons' && (
                    <div>
                        <div style={{ background: 'white', padding: '20px', borderRadius: '16px', marginBottom: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                            <h4 style={{ marginTop: 0, marginBottom: '15px', color: '#334155' }}>➕ {t("createCoupon")}</h4>
                            <form onSubmit={addCoupon} style={{ display: 'flex', gap: '10px' }}>
                                <input type="text" placeholder={t("codePlaceholder")} value={newCoupon.code} onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value })} style={{ flex: 2, padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC' }} required />
                                <input type="number" placeholder={t("discountPlaceholder")} value={newCoupon.discount} onChange={e => setNewCoupon({ ...newCoupon, discount: e.target.value })} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC' }} required />
                                <button type="submit" style={{ background: '#F59E0B', color: 'white', border: 'none', padding: '0 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}><Plus size={20} /></button>
                            </form>
                        </div>
                        {coupons.map(coupon => (
                            <div key={coupon.id} style={{
                                opacity: coupon.isActive ? 1 : 0.7,
                                background: 'white', padding: '0', marginBottom: '15px', borderRadius: '12px',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'stretch',
                                border: '1px solid #CBD5E1', overflow: 'hidden', position: 'relative',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                            }}>
                                {/* Ticket Left Side (Visual) */}
                                <div style={{ width: '50px', background: coupon.isActive ? '#10B981' : '#CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                                    <Ticket size={24} style={{ transform: 'rotate(-90deg)' }} />
                                </div>

                                {/* Ticket Content - WRAPPABLE */}
                                <div style={{ flex: 1, padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                                    <div style={{ minWidth: '120px' }}>
                                        <div style={{ fontWeight: '900', fontSize: '1.2rem', color: '#334155', letterSpacing: '1px' }}>{coupon.code}</div>
                                        <div style={{ color: '#64748B', fontSize: '0.9rem' }}>{t("discount")}: <strong>{coupon.discount} {t("currency")}</strong></div>
                                        <div style={{ fontSize: '0.75rem', marginTop: '5px', color: coupon.isActive ? '#059669' : '#EF4444', fontWeight: 'bold' }}>
                                            {coupon.isActive ? t("couponValid") : t("couponExpired")}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '90px' }}>
                                        <button onClick={() => toggleCouponStatus(coupon.id, coupon.isActive)} style={{ background: coupon.isActive ? '#FECACA' : '#BBF7D0', color: coupon.isActive ? '#991B1B' : '#166534', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold', width: '100%' }}>
                                            {coupon.isActive ? t("stop") : t("activate")}
                                        </button>
                                        <button onClick={() => deleteCoupon(coupon.id)} style={{ background: '#F1F5F9', color: '#64748B', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer', width: '100%' }}><Trash2 size={16} /></button>
                                    </div>
                                </div>

                                {/* Perforation Effect */}
                                <div style={{ position: 'absolute', top: '50%', left: '46px', transform: 'translateY(-50%)', height: '90%', borderLeft: '2px dashed white' }}></div>
                                <div style={{ position: 'absolute', top: '-10px', left: '40px', width: '20px', height: '20px', background: 'var(--bg)', borderRadius: '50%' }}></div>
                                <div style={{ position: 'absolute', bottom: '-10px', left: '40px', width: '20px', height: '20px', background: 'var(--bg)', borderRadius: '50%' }}></div>
                            </div>
                        ))}
                    </div>
                )
            }

            {
                activeTab === 'admins' && (
                    <div>
                        <div style={{ background: 'white', padding: '20px', borderRadius: '16px', marginBottom: '20px' }}>
                            <form onSubmit={addNewAdmin} style={{ display: 'flex', gap: '10px' }}>
                                <input type="email" placeholder={t("addAdminEmail")} value={newAdminEmail} onChange={e => setNewAdminEmail(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC' }} required />
                                <button type="submit" style={{ background: '#334155', color: 'white', border: 'none', padding: '0 25px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>{t("add")}</button>
                            </form>
                        </div>
                        {admins.map(admin => (
                            <div key={admin.id} style={{ padding: '15px', background: 'white', marginBottom: '8px', borderRadius: '12px', border: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ background: '#F1F5F9', padding: '8px', borderRadius: '50%' }}><ShieldCheck size={20} color="#64748B" /></div>
                                <span style={{ fontWeight: '500', color: '#334155' }}>{admin.email}</span>
                            </div>
                        ))}
                    </div>
                )
            }

            {
                activeTab === 'analytics' && (
                    <AdminAnalytics t={t} language={language} />
                )
            }
        </div >
    );
}

export default AdminPanel;
