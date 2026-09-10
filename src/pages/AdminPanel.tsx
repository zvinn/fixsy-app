// src/pages/AdminPanel.tsx
/* src/AdminPanel.tsx - Professional Design & Smart Rejection */
import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { db } from '../services/firebase';
import { collection, addDoc, query, where, getDocs, setDoc, doc } from 'firebase/firestore';
import { useAdminData } from '../hooks/useAdminData';

import { ShieldCheck, Users, DollarSign, FileText, XCircle, CheckCircle, Trash2, Plus, Megaphone, Ticket, Map, CloudRain, Sun, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLiveMap from '../components/AdminLiveMap';
import AdminAnalytics from '../components/AdminAnalytics';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import './AdminPanel.css';

interface AdminPanelProps {
    goBack: () => void;
}

interface Technician {
    id: string;
    name?: string;
    email?: string;
    nationalId?: string;
    idCardImage?: string;
    isVerified: boolean | 'pending' | 'approved';
    debt: number;
    unpaidOrdersCount?: number;
    referralCount?: number;
    referralCode?: string;
    role?: 'tech';
    [key: string]: unknown;
}

interface Client {
    id: string;
    name?: string;
    email?: string;
    referralCount?: number;
    referralCode?: string;
    role?: 'client';
    [key: string]: unknown;
}

interface Admin {
    id: string;
    email: string;
}

interface Coupon {
    id: string;
    code: string;
    discount: number;
    isActive: boolean;
}

interface Dispute {
    id: string;
    reqId?: string;
    clientEmail?: string;
    techId?: string;
    reason?: string;
    date: string;
    status: string;
}

interface BroadcastForm {
    title: string;
    body: string;
    recipient: string;
}

type ReferralUserType = (Technician | Client) & { role: 'client' | 'tech' };

function AdminPanel({ goBack }: AdminPanelProps) {
    const { t, language } = useLanguage();
    const [activeTab, setActiveTab] = useState('verification');

    // Use custom hook for data management
    const {
        pendingTechs,
        debtors,
        admins,
        coupons,
        referralUsers,
        disputes,
        fetchPendingTechs,
        fetchDebtors,
        fetchAdmins,
        fetchCoupons,
        fetchReferrals,
        fetchDisputes,
        approveTech,
        rejectTech,
        settleDebt,
        addCoupon,
        toggleCouponStatus,
        deleteCoupon,
        addNewAdmin,
        resolveDispute
    } = useAdminData();

    // Rejection Variables
    const [rejectingId, setRejectingId] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");

    const [newCoupon, setNewCoupon] = useState({ code: '', discount: '' });
    const [newAdminEmail, setNewAdminEmail] = useState('');

    // Admin 2.0 Broadcast State
    const [broadcastForm, setBroadcastForm] = useState<BroadcastForm>({ title: '', body: '', recipient: 'all_techs' });
    const [isBroadcasting, setIsBroadcasting] = useState(false);

    useEffect(() => {
        if (activeTab === 'verification') fetchPendingTechs();
        if (activeTab === 'finance') fetchDebtors();
        if (activeTab === 'admins') fetchAdmins();
        if (activeTab === 'coupons') fetchCoupons();
        if (activeTab === 'referrals') fetchReferrals();
        if (activeTab === 'disputes') fetchDisputes();
    }, [activeTab, fetchPendingTechs, fetchDebtors, fetchAdmins, fetchCoupons, fetchReferrals, fetchDisputes]);

    const confirmReject = async (id: string) => {
        await rejectTech(id, rejectionReason, t);
        setRejectingId(null);
        setRejectionReason("");
    };

    const handleApproveTech = async (id: string) => {
        await approveTech(id, t);
    };

    const handleSettleDebt = async (tech: Technician) => {
        await settleDebt(tech, t);
    };

    const handleAddCoupon = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCoupon.code || !newCoupon.discount) return;
        await addCoupon(newCoupon.code, Number(newCoupon.discount), t);
        setNewCoupon({ code: '', discount: '' });
    };

    const handleToggleCouponStatus = async (id: string, currentStatus: boolean) => {
        await toggleCouponStatus(id, currentStatus, t);
    };

    const handleDeleteCoupon = async (id: string) => {
        await deleteCoupon(id, t);
    };

    const handleAddNewAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAdminEmail) return;
        await addNewAdmin(newAdminEmail, t);
        setNewAdminEmail('');
    };

    const handleResolveDispute = async (id: string) => {
        await resolveDispute(id, t);
    };

    const sendBroadcast = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!broadcastForm.title || !broadcastForm.body) return;
        setIsBroadcasting(true);
        const toastId = toast.loading(t("loading"));

        try {
            let targets: string[] = [];
            if (broadcastForm.recipient === 'all_techs') {
                const q = query(collection(db, "technicians"), where("isVerified", "==", true));
                const snap = await getDocs(q);
                targets = snap.docs.map(d => d.data().email).filter(e => e) as string[];
            }

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

    const toggleWeatherAlert = async (type: string) => {
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

    interface TabButtonProps {
        id: string;
        label: string;
        icon: React.ReactNode;
    }

    const TabButton: React.FC<TabButtonProps> = ({ id, label, icon }) => (
        <button onClick={() => setActiveTab(id)} className={`tab-button ${activeTab === id ? 'active' : 'inactive'}`}>
            {icon} {label}
        </button>
    );

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h2 className="admin-title"><ShieldCheck size={24} /> {t("adminTitle")}</h2>
                <Button variant="secondary" onClick={goBack}>{t("logout")}</Button>
            </div>

            <div className="tab-container">
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
                    <h3 className="section-title">{t("liveTechMap") || "Technician Live Location"}</h3>
                    <AdminLiveMap />
                </div>
            )}

            {activeTab === 'verification' && (
                <div>
                    <h3 className="section-title">{t("pendingRequests")} ({pendingTechs.length})</h3>
                    {pendingTechs.length === 0 ? <div className="empty-state"><CheckCircle size={40} style={{ marginBottom: '10px', opacity: 0.5 }} /><p>{t("noPendingRequests")}</p></div> :
                        pendingTechs.map(tech => (
                            <div key={tech.id} className="tech-card">
                                <div style={{ flex: '0 0 120px' }}>
                                    {tech.idCardImage ? <a href={tech.idCardImage} target="_blank" rel="noreferrer"><img src={tech.idCardImage} alt="ID" className="tech-id-image" /></a> : <div style={{ height: '80px', background: '#eee', borderRadius: '8px' }}></div>}
                                </div>
                                <div style={{ flex: 1 }} className="tech-info">
                                    <h4>{tech.name}</h4>
                                    <p style={{ margin: '5px 0', fontSize: '0.9rem', color: '#475569' }}>🆔 {tech.nationalId}</p>
                                    {rejectingId === tech.id ? (
                                        <div className="rejection-box">
                                            <Input placeholder={t("rejectionReason")} value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} style={{ marginBottom: '10px' }} />
                                            <Button variant="danger" size="sm" onClick={() => confirmReject(tech.id)}>{t("confirm")}</Button>
                                        </div>
                                    ) : (
                                        <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                                            <Button variant="primary" style={{ flex: 1 }} onClick={() => handleApproveTech(tech.id)}>{t("acceptOffer")}</Button>
                                            <Button variant="danger" style={{ flex: 1 }} onClick={() => setRejectingId(tech.id)}>{t("reject")}</Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                </div>
            )}

            {activeTab === 'disputes' && (
                <div>
                    <h3 className="section-title">🚨 {t("activeDisputes") || "Active Disputes"} ({disputes.length})</h3>
                    {disputes.length === 0 ? <p className="empty-state">{t("noDisputes") || "No disputes found."}</p> :
                        disputes.map(d => (
                            <div key={d.id} className="dispute-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <strong style={{ color: '#991B1B' }}>Request ID: {d.reqId || 'N/A'}</strong>
                                    <span style={{ fontSize: '0.8rem', color: '#7F1D1D' }}>{new Date(d.date).toLocaleDateString()}</span>
                                </div>
                                <p style={{ margin: '0 0 10px', color: '#B91C1C' }}><strong>Reason:</strong> {d.reason}</p>
                                <div style={{ fontSize: '0.9rem', color: '#7F1D1D', marginBottom: '15px' }}>
                                    Client: {d.clientEmail} <br />
                                    Tech ID: {d.techId}
                                </div>
                                <Button variant="secondary" onClick={() => handleResolveDispute(d.id)} style={{ color: '#DC2626', borderColor: '#FECACA' }}>
                                    ✅ {t("resolve") || "Mark Resolved"}
                                </Button>
                            </div>
                        ))
                    }
                </div>
            )}

            {activeTab === 'broadcast' && (
                <div className="fade-in">
                    <div className="broadcast-panel">
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
                                    </select>
                                </div>
                                <div style={{ flex: 2 }}>
                                    <Input
                                        label={t("messageTitle")}
                                        value={broadcastForm.title}
                                        onChange={e => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                                        placeholder={t("messageTitle")}
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

                            <Button
                                type="submit"
                                disabled={isBroadcasting}
                                isLoading={isBroadcasting}
                                style={{ alignSelf: 'flex-end' }}
                                icon={<Megaphone size={18} />}
                            >
                                {t("sendNotification")}
                            </Button>
                        </form>
                    </div>
                </div>
            )}


            {/* Weather Controls Widget (Only visible in Broadcast tab for now) */}
            {
                activeTab === 'broadcast' && (
                    <div className="fade-in" style={{ marginTop: '20px' }}>
                        <div className="broadcast-panel">
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
                        <div className="finance-summary-card">
                            <h3 style={{ margin: 0, color: '#0369A1' }}>💰 {t("totalDues")}</h3>
                            <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0284C7' }}>{debtors.reduce((acc, curr) => acc + curr.debt, 0)} {t("currency")}</span>
                        </div>
                        {debtors.map(tech => (
                            <div key={tech.id} className="debtor-card" style={{ borderLeft: tech.debt >= 200 ? '5px solid #EF4444' : '5px solid #E2E8F0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{tech.name}</h4>
                                    <span style={{ color: '#DC2626', fontWeight: 'bold', fontSize: '1.1rem' }}>{tech.debt} {t("currency")}</span>
                                </div>
                                <Button onClick={() => handleSettleDebt(tech)} style={{ width: '100%', background: '#0056D2', color: 'white' }}>💵 {t("collectMoney")}</Button>
                            </div>
                        ))}
                    </div>
                )
            }

            {
                activeTab === 'referrals' && (
                    <div>
                        <div className="finance-summary-card">
                            <div>
                                <h3 style={{ margin: 0, color: '#0369A1' }}>👥 {t("topReferrers") || "Top Referrers"}</h3>
                                <p style={{ margin: '5px 0 0', color: '#0284C7', fontSize: '0.9rem' }}>{t("totalReferralPayouts") || "Total Payouts"}: {referralUsers.reduce((acc, u) => acc + ((u.referralCount || 0) * 50), 0)} {t("currency")}</p>
                            </div>
                            <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0284C7' }}>{referralUsers.length} {t("users") || "Users"}</span>
                        </div>

                        <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                            <table className="referral-table">
                                <thead>
                                    <tr>
                                        <th>{t("user") || "User"}</th>
                                        <th>{t("role") || "Role"}</th>
                                        <th>{t("referralCode") || "Code"}</th>
                                        <th style={{ textAlign: 'center' }}>{t("invites") || "Invites"}</th>
                                        <th style={{ textAlign: 'right' }}>{t("earned") || "Earned"}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {referralUsers.map((user) => (
                                        <tr key={user.id}>
                                            <td style={{ fontWeight: 'bold', color: '#334155' }}>
                                                {user.name}
                                                <div style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 'normal' }}>{user.email}</div>
                                            </td>
                                            <td>
                                                <span style={{ background: user.role === 'client' ? '#DBEAFE' : '#DCFCE7', color: user.role === 'client' ? '#1E40AF' : '#166534', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                                    {user.role === 'client' ? t("client") : t("technician")}
                                                </span>
                                            </td>
                                            <td style={{ fontFamily: 'monospace', fontSize: '1.1rem' }}>{user.referralCode}</td>
                                            <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#3B82F6' }}>{user.referralCount}</td>
                                            <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#10B981' }}>{(user.referralCount || 0) * 50} {t("currency")}</td>
                                        </tr>
                                    ))}
                                    {referralUsers.length === 0 && (
                                        <tr>
                                            <td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: '#94A3B8' }}>{t("noReferralsYet") || "No referrals found yet."}</td>
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
                        <div className="create-coupon-card">
                            <h4 style={{ marginTop: 0, marginBottom: '15px', color: '#334155' }}>➕ {t("createCoupon")}</h4>
                            <form onSubmit={handleAddCoupon} style={{ display: 'flex', gap: '10px' }}>
                                <Input placeholder={t("codePlaceholder")} value={newCoupon.code} onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value })} style={{ flex: 2 }} required />
                                <Input type="number" placeholder={t("discountPlaceholder")} value={newCoupon.discount} onChange={e => setNewCoupon({ ...newCoupon, discount: e.target.value })} style={{ flex: 1 }} required />
                                <Button type="submit" style={{ background: '#F59E0B', color: 'white', border: 'none' }}><Plus size={20} /></Button>
                            </form>
                        </div>
                        {coupons.map(coupon => (
                            <div key={coupon.id} className="coupon-ticket" style={{ opacity: coupon.isActive ? 1 : 0.7 }}>
                                {/* Ticket Left Side (Visual) */}
                                <div className="coupon-left" style={{ background: coupon.isActive ? '#10B981' : '#CBD5E1' }}>
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
                                        <Button size="sm" onClick={() => handleToggleCouponStatus(coupon.id, coupon.isActive)} style={{ background: coupon.isActive ? '#FECACA' : '#BBF7D0', color: coupon.isActive ? '#991B1B' : '#166534', border: 'none' }}>
                                            {coupon.isActive ? t("stop") : t("activate")}
                                        </Button>
                                        <Button size="sm" onClick={() => handleDeleteCoupon(coupon.id)} variant="ghost" style={{ background: '#F1F5F9', color: '#64748B' }}><Trash2 size={16} /></Button>
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
                            <form onSubmit={handleAddNewAdmin} style={{ display: 'flex', gap: '10px' }}>
                                <Input type="email" placeholder={t("addAdminEmail")} value={newAdminEmail} onChange={e => setNewAdminEmail(e.target.value)} style={{ flex: 1 }} required />
                                <Button type="submit" variant="secondary" style={{ background: '#334155', color: 'white', border: 'none' }}>{t("add")}</Button>
                            </form>
                        </div>
                        {admins.map(admin => (
                            <div key={admin.id} className="admin-item">
                                <div style={{ background: '#F1F5F9', padding: '8px', borderRadius: '50%' }}><ShieldCheck size={20} color="#64748B" /></div>
                                <span style={{ fontWeight: '500', color: '#334155' }}>{admin.email}</span>
                            </div>
                        ))}
                    </div>
                )
            }

            {
                activeTab === 'analytics' && (
                    <AdminAnalytics />
                )
            }
        </div >
    );
}

export default AdminPanel;
