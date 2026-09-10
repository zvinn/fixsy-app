// src/pages/TechDashboard.tsx
import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { db } from '../services/firebase';
import { collection, getDocs, updateDoc, doc, query, where, increment, addDoc } from 'firebase/firestore';
import ChatWindow from '../components/ChatWindow';
import WalletPage from './WalletPage';
import { MapPin, PenTool, DollarSign, MessageCircle, CheckCircle, Navigation, Clock, AlertTriangle, Zap, ChevronLeft, CreditCard, Banknote, TrendingUp, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { User } from 'firebase/auth';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { DEMO_TECH_STATS } from '../constants/mockData';
import './TechDashboard.css';
import { env } from '../config/env';

interface TechDashboardProps {
    user: User;
    goBack: () => void;
}

interface Request {
    id: string;
    status: 'pending' | 'accepted' | 'on_way' | 'arrived' | 'in_progress' | 'completed' | 'cancelled' | 'rejected';
    paymentMethod?: 'wallet' | 'cash';
    client_name?: string;
    client_address?: string;
    date: string;
    scheduledDate?: string;
    problem_desc?: string;
    price?: number;
    problem_image?: string;
    location?: { lat: number; lng: number };
    technician_email?: string;
    client_email?: string;
    [key: string]: unknown;
}

interface TechData {
    id: string;
    email?: string;
    name?: string;
    earnings: number;
    debt: number;
    isVerified: boolean | 'pending' | 'approved';
    unpaidOrdersCount: number;
    isFirstOrderDone?: boolean;
    workingHours?: { start: string; end: string; offDays: string[] };
    isAvailable?: boolean;
    walletBalance?: number;
    [key: string]: unknown;
}

interface ChartData {
    name: string;
    fullDate: string;
    amount: number;
}

function TechDashboard({ user, goBack }: TechDashboardProps) {
    const [requests, setRequests] = useState<Request[]>([]);
    const [chatRequestId, setChatRequestId] = useState<string | null>(null);
    const [techData, setTechData] = useState<TechData | null>(null);
    const [workingHours, setWorkingHours] = useState({ start: '09:00', end: '18:00', offDays: ['Friday'] });
    const [showScheduleSettings, setShowScheduleSettings] = useState(false);

    const [loading, setLoading] = useState(true);
    const [showWallet, setShowWallet] = useState(false);
    const [chartExpanded, setChartExpanded] = useState(false);
    const [chartData, setChartData] = useState<ChartData[]>([]);
    const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
    const { t } = useLanguage();

    const ADMIN_EMAIL = env.adminEmail || "mhamed.saad.ibrahim@gmail.com";
    const DEBT_LIMIT = 200;

    const DAYS = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const watchIdRef = useRef<number | null>(null);

    // ✅ FIXED: Consolidated data fetching with parallel Promise.allSettled
    useEffect(() => {
        if (!user) return;

        const fetchTechData = async () => {
            if (user.email === ADMIN_EMAIL) {
                return { id: 'admin_preview', name: 'Admin', earnings: 999, debt: 0, isVerified: true, unpaidOrdersCount: 0 };
            }
            const q = query(collection(db, "technicians"), where("email", "==", user.email));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const docData = querySnapshot.docs[0];
                const data = docData.data();
                if (data.workingHours) setWorkingHours(data.workingHours);
                return { ...data as TechData, id: docData.id };
            }
            return null;
        };

        const fetchRequests = async () => {
            let q;
            if (user.email === ADMIN_EMAIL) q = collection(db, "requests");
            else q = query(collection(db, "requests"), where("technician_email", "==", user.email));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Request))
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        };

        const fetchTransactions = async () => {
            const q = query(collection(db, "transactions"), where("userId", "==", user.email), where("type", "==", "earning"));
            const snap = await getDocs(q);
            const rawData = snap.docs.map(d => d.data());

            const last7Days = [...Array(7)].map((_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - i);
                return d.toISOString().split('T')[0];
            }).reverse();

            return last7Days.map(date => {
                const dayTotal = rawData
                    .filter(t => t.date.startsWith(date))
                    .reduce((sum, t) => sum + (t.amount || 0), 0);
                return {
                    name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
                    fullDate: date,
                    amount: dayTotal
                };
            });
        };

        // Parallel fetch using Promise.allSettled for better performance
        Promise.allSettled([
            fetchTechData(),
            fetchRequests(),
            fetchTransactions()
        ]).then(results => {
            if (results[0].status === 'fulfilled' && results[0].value) {
                setTechData(results[0].value);
            }
            if (results[1].status === 'fulfilled') {
                setRequests(results[1].value);
            }
            if (results[2].status === 'fulfilled') {
                setChartData(results[2].value);
            }
            setLoading(false);
        });
    }, [user, ADMIN_EMAIL]);

    // ✅ FIXED: Proper geolocation cleanup with correct dependencies
    useEffect(() => {
        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
                watchIdRef.current = null;
            }
        };
    }, []);

    const updateStatus = async (req: Request, newStatus: string) => {
        try {
            const orderRef = doc(db, "requests", req.id);
            if (newStatus === 'on_way') {
                if (navigator.geolocation) {
                    toast.loading(t("trackingStarted"), { duration: 2000 });
                    const id = navigator.geolocation.watchPosition(
                        (pos) => updateDoc(orderRef, { tech_location: { lat: pos.coords.latitude, lng: pos.coords.longitude } }),
                        (err) => {
                            if (import.meta.env.DEV) {
                                console.error("Tracking Error:", err);
                            }
                        },
                        { enableHighAccuracy: true }
                    );
                    watchIdRef.current = id;
                }
            }
            if ((newStatus === 'arrived' || newStatus === 'completed' || newStatus === 'cancelled') && watchIdRef.current) {
                navigator.geolocation.clearWatch(watchIdRef.current);
                watchIdRef.current = null;
            }

            await updateDoc(orderRef, { status: newStatus });

            // Notify client about status change
            const clientEmail = req.client_email;
            if (clientEmail) {
                const statusMessages: Record<string, { icon: string; message: string }> = {
                    'accepted': { icon: '✅', message: t("techAcceptedOrder") || 'الفني قبل طلبك!' },
                    'on_way': { icon: '🚗', message: t("techOnWay") || 'الفني في الطريق إليك' },
                    'arrived': { icon: '📍', message: t("techArrived") || 'الفني وصل للموقع' },
                    'in_progress': { icon: '🔧', message: t("techStartedWork") || 'الفني بدأ العمل' },
                    'completed': { icon: '🎉', message: t("orderCompleted") || 'تم إكمال الطلب بنجاح!' }
                };

                if (statusMessages[newStatus]) {
                    await addDoc(collection(db, "notifications"), {
                        userId: clientEmail,
                        message: statusMessages[newStatus].message,
                        icon: statusMessages[newStatus].icon,
                        type: 'status_update',
                        date: new Date().toISOString(),
                        read: false,
                        orderId: req.id
                    });
                }
            }

            if (newStatus === 'completed' && techData && techData.id !== 'admin_preview') {
                const price = req.price || 0;
                const commission = price * 0.10;
                const techRef = doc(db, "technicians", techData.id);

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
                    setTechData(prev => prev ? ({ ...prev, isFirstOrderDone: true }) : null);
                    toast.success(t("firstOrderFree"));
                } else {
                    await updateDoc(techRef, { earnings: increment(price), debt: increment(commission), unpaidOrdersCount: increment(1) });
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
            setRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: newStatus as Request['status'] } : r));
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error(error);
            }
            toast.error(t("errorOccurred"));
        }
    };

    const saveSchedule = async () => {
        if (!techData) return;
        try {
            await updateDoc(doc(db, "technicians", techData.id), { workingHours });
            toast.success(t("scheduleSaved"));
            setShowScheduleSettings(false);
        } catch (e) { toast.error(t("errorOccurred")); }
    };

    const toggleOffDay = (day: string) => {
        setWorkingHours(prev => {
            const offDays = prev.offDays.includes(day) ? prev.offDays.filter(d => d !== day) : [...prev.offDays, day];
            return { ...prev, offDays };
        });
    };

    const toggleAvailability = async () => {
        if (!techData || techData.id === 'admin_preview') return;
        const newStatus = !techData.isAvailable;
        try {
            await updateDoc(doc(db, "technicians", techData.id), { isAvailable: newStatus });
            setTechData(prev => prev ? ({ ...prev, isAvailable: newStatus }) : null);
            toast.success(newStatus ? t("youAreOnline") : t("youAreOffline"));
        } catch (e) { toast.error("Error updating status"); }
    };

    const renderActionButton = (req: Request) => {
        if (req.status === 'cancelled') return <div className="text-center p-3 rounded-xl bg-red-100 text-red-600 font-bold">❌ {t("orderCancelledClient")}</div>;
        if (techData?.isVerified !== true && techData?.isVerified !== 'approved' && techData?.id !== 'admin_preview') {
            return <Button fullWidth disabled variant="secondary">⛔ {t("accountNotVerified")}</Button>;
        }

        switch (req.status) {
            case 'pending':
                if (techData && techData.debt >= DEBT_LIMIT && techData.id !== 'admin_preview') return <Button fullWidth disabled variant="secondary">⛔ {t("payDebtFirst")}</Button>;
                return <Button fullWidth onClick={() => updateStatus(req, 'accepted')} variant="success" icon={<CheckCircle size={18} />}>{t("acceptOrder")}</Button>;
            case 'accepted': return <Button fullWidth onClick={() => updateStatus(req, 'on_way')} variant="primary" icon={<Navigation size={18} />}>{t("onMyWay")}</Button>;
            case 'on_way': return <Button fullWidth onClick={() => updateStatus(req, 'arrived')} className="status-btn-on-way" icon={<MapPin size={18} />}>{t("arrivedLocation")}</Button>;
            case 'arrived': return <Button fullWidth onClick={() => updateStatus(req, 'in_progress')} variant="warning" icon={<PenTool size={18} />}>{t("startWork")}</Button>;
            case 'in_progress': return <Button fullWidth onClick={() => updateStatus(req, 'completed')} variant="success" icon={<DollarSign size={18} />}>{t("finishAndCollect")}</Button>;
            case 'completed': return <div className="text-center p-3 rounded-xl bg-green-100 text-green-700 font-bold">🎉 {t("taskCompletedSuccess")}</div>;
            default: return null;
        }
    };

    const statusBadge = (status: string) => {
        const variantMap: Record<string, "warning" | "info" | "primary" | "secondary" | "success" | "danger" | undefined> = {
            'pending': 'warning', 'accepted': 'primary', 'on_way': 'info',
            'arrived': 'secondary', 'in_progress': 'warning', 'completed': 'success', 'cancelled': 'danger'
        };
        const textMap: Record<string, string> = {
            'pending': t("pending"), 'accepted': t("status"), 'on_way': t("onMyWay"),
            'arrived': t("arrivedLocation"), 'in_progress': t("in_progress"), 'completed': t("completed"), 'cancelled': t("cancelled")
        };
        return <Badge variant={variantMap[status] || 'secondary'}>{textMap[status] || status}</Badge>;
    };

    if (showWallet) return <WalletPage user={user} goBack={() => setShowWallet(false)} />;
    if (loading || !techData) return <div className="loading-container"><div className="spinner"></div><div className="loading-text">{t("loading")}</div></div>;

    return (
        <div className="tech-dashboard-container">
            {/* Header */}
            <div className="dashboard-header">
                <h2 className="dashboard-title"><Zap size={24} /> {t("dailyTasks")}</h2>
                <div className="availability-wrapper">
                    <span className={`availability-text ${techData.isAvailable ? 'online' : 'offline'}`}>
                        {techData.isAvailable ? (t("online") || "Online") : (t("offline") || "Offline")}
                    </span>
                    <button onClick={toggleAvailability} className={`availability-toggle-btn ${techData.isAvailable ? 'available' : 'unavailable'}`}>
                        <div className={`availability-toggle-knob ${techData.isAvailable ? 'active' : 'inactive'}`}></div>
                    </button>
                </div>
            </div>

            {chatRequestId && <ChatWindow requestId={chatRequestId} currentUser={user} closeChat={() => setChatRequestId(null)} />}

            {/* Wallet Card */}
            <div className="wallet-card" onClick={() => setShowWallet(true)}>
                <div className="wallet-decoration-circle"></div>
                <div className="wallet-info-row">
                    <div className="wallet-stat">
                        <label className="wallet-stat-label">{t("earnings")}</label>
                        <div className="wallet-stat-value">{techData.earnings} <span className="currency">{t("currency")}</span></div>
                    </div>
                    <div className="wallet-divider"></div>
                    <div className="wallet-stat">
                        <label className="wallet-stat-label">{t("wallet")}</label>
                        <div className="wallet-stat-value">{techData.walletBalance || 0} <span className="currency">{t("currency")}</span></div>
                    </div>
                    <div className="wallet-divider"></div>
                    <div className="wallet-stat">
                        <label className="wallet-stat-label">{t("debt")}</label>
                        <div className="wallet-stat-value text-red-300">{techData.debt} <span className="currency">{t("currency")}</span></div>
                    </div>
                </div>
                <div className="wallet-footer">
                    {t("transactionDetails")} <ChevronLeft size={16} />
                </div>
                {techData.unpaidOrdersCount > 0 && <div className="wallet-alert">⚠️ {t("debtWarning")} {techData.unpaidOrdersCount} {t("unpaidCommissionOrders")}</div>}
            </div>

            {/* Analytics & Scheduling Controls */}
            <div className="controls-row">
                <button onClick={() => setChartExpanded(!chartExpanded)} className="control-btn analytics">
                    {chartExpanded ? <ChevronUp size={16} /> : <TrendingUp size={16} />} {chartExpanded ? t("hideAnalytics") : t("analytics")}
                </button>
                <button onClick={() => setShowScheduleSettings(!showScheduleSettings)} className="control-btn schedule">
                    <Clock size={16} /> {t("scheduleSettings")}
                </button>
            </div>

            {/* Analytics Panel */}
            {chartExpanded && (
                <div className="glass-panel dashboard-panel">
                    <h3 className="dashboard-section-title">
                        <TrendingUp size={20} color="#10B981" /> {t("weeklyEarnings")}
                    </h3>
                    <div className="map-container">
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
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} cursor={{ stroke: '#10B981', strokeDasharray: '5 5' }} />
                                <Area type="monotone" dataKey="amount" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorEarnings)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Schedule Settings Panel */}
            {showScheduleSettings && (
                <div className="schedule-panel">
                    <h3 className="dashboard-section-title warning">📅 {t("scheduleSettings")}</h3>
                    <div className="schedule-grid">
                        <div>
                            <label className="text-sm text-gray-500 block mb-1">{t("startTime")}</label>
                            <Input type="time" value={workingHours.start} onChange={e => setWorkingHours({ ...workingHours, start: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-sm text-gray-500 block mb-1">{t("endTime")}</label>
                            <Input type="time" value={workingHours.end} onChange={e => setWorkingHours({ ...workingHours, end: e.target.value })} />
                        </div>
                    </div>
                    <label className="text-sm text-gray-500 block mb-2">{t("offDays")}</label>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {DAYS.map(day => (
                            <button key={day} onClick={() => toggleOffDay(day)} className="day-btn"
                                style={{
                                    borderColor: workingHours.offDays.includes(day) ? '#EF4444' : '#E2E8F0',
                                    background: workingHours.offDays.includes(day) ? '#FEF2F2' : 'white',
                                    color: workingHours.offDays.includes(day) ? '#B91C1C' : '#64748B',
                                }}>
                                {t(day) || day}
                            </button>
                        ))}
                    </div>
                    <Button fullWidth onClick={saveSchedule} variant="warning">{t("save")}</Button>
                </div>
            )}

            {/* Verification Alert */}
            {techData.isVerified !== true && techData.isVerified !== 'approved' && (
                <div className="verification-alert">
                    <h4 className="flex items-center gap-2 m-0 text-orange-700"><AlertTriangle size={20} /> {t("accountInactive")}</h4>
                    <p className="text-sm text-gray-600 m-0">
                        {techData.isVerified === 'pending' ? `⏳ ${t("reviewingData")}` : `❌ ${t("uploadDocsPrompt")}`}
                    </p>
                </div>
            )}

            {/* Requests List */}
            <div className="tabs-container">
                <button onClick={() => setActiveTab('active')} className={`tab-btn ${activeTab === 'active' ? 'active' : 'inactive'}`}>
                    🚀 {t("active")} ({requests.filter(r => ['pending', 'accepted', 'on_way', 'arrived', 'in_progress'].includes(r.status)).length})
                </button>
                <button onClick={() => setActiveTab('history')} className={`tab-btn ${activeTab === 'history' ? 'history' : 'inactive'}`}>
                    📜 {t("history")}
                </button>
            </div>

            {requests.filter(req => activeTab === 'active'
                ? ['pending', 'accepted', 'on_way', 'arrived', 'in_progress'].includes(req.status)
                : ['completed', 'cancelled', 'rejected'].includes(req.status)
            ).length === 0 ? (
                <div className="text-center p-10 text-slate-400">
                    <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"><Navigation size={40} color="#CBD5E1" /></div>
                    <p>{activeTab === 'active' ? t("noTasksAssigned") : t("noHistory")}</p>
                </div>
            ) : (
                requests.filter(req => activeTab === 'active'
                    ? ['pending', 'accepted', 'on_way', 'arrived', 'in_progress'].includes(req.status)
                    : ['completed', 'cancelled', 'rejected'].includes(req.status)
                ).map((req) => (
                    <div key={req.id} className="request-card">
                        <div className={`payment-badge ${req.paymentMethod}`}>
                            {req.paymentMethod === 'wallet' ? <CreditCard size={14} color="#2563EB" /> : <Banknote size={14} color="#047857" />}
                            <span>{req.paymentMethod === 'wallet' ? t("wallet") : t("cash")}</span>
                        </div>

                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="m-0 text-lg text-slate-800">{req.client_name || t("client")}</h3>
                                <div className="mt-2">{statusBadge(req.status)}</div>
                            </div>
                        </div>

                        <div className="info-grid">
                            <div className="info-item">
                                <div className="info-icon-circle"><MapPin size={18} color="#64748B" /></div>
                                <div>
                                    <div className="text-xs text-slate-400">{t("yourAddress")}</div>
                                    <div className="text-sm font-bold text-slate-700">{req.client_address ? req.client_address.substring(0, 15) + '...' : '...'}</div>
                                </div>
                            </div>
                            <div className="info-item">
                                <div className="info-icon-circle"><Clock size={18} color="#64748B" /></div>
                                <div>
                                    <div className="text-xs text-slate-400">{t("visitDate")}</div>
                                    <div className="text-sm font-bold text-slate-700">{new Date(req.scheduledDate || req.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                </div>
                            </div>
                        </div>

                        <div className="problem-box">
                            <div className="flex items-start gap-2 mb-2">
                                <PenTool size={18} color="#64748B" className="mt-1" />
                                <p className="m-0 text-sm text-slate-600 leading-relaxed">{req.problem_desc}</p>
                            </div>
                            <div className="border-t border-dashed border-slate-200 pt-2 mt-2 flex justify-between items-center">
                                <span className="text-sm text-slate-500">{t("price")}</span>
                                <span className="text-lg font-bold text-blue-600">{req.price} {t("currency")}</span>
                            </div>
                        </div>

                        {req.problem_image && (
                            <div className="problem-image-wrapper">
                                <a href={req.problem_image} target="_blank" rel="noreferrer" className="block h-full">
                                    <img src={req.problem_image} alt="Problem" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                                        <span className="text-white text-xs font-bold">📸 {t("problemImage")}</span>
                                    </div>
                                </a>
                            </div>
                        )}

                        <div className="actions-row">
                            {req.location && (
                                <a href={`https://www.google.com/maps/search/?api=1&query=${req.location.lat},${req.location.lng}`} target="_blank" rel="noreferrer" className="action-icon-btn">
                                    <Navigation size={20} />
                                </a>
                            )}
                            {req.status !== 'pending' && req.status !== 'cancelled' && (
                                <button onClick={() => setChatRequestId(req.id)} className="action-icon-btn">
                                    <MessageCircle size={20} />
                                </button>
                            )}
                        </div>

                        <div className="mt-4">
                            {renderActionButton(req)}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

export default TechDashboard;
