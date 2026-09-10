// src/components/AdminAnalytics.tsx
import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs, orderBy, query, DocumentData } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, Tag, Sparkles, PieChart as PieChartIcon, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';

interface AnalyticsData {
    revenue: { date: string; amount: number }[];
    status: { name: string; value: number; color: string }[];
    services: { name: string; value: number }[];
    stats: {
        users: number;
        orders: number;
        revenue: number;
        activeTechs: number;
    };
}

interface AILog extends DocumentData {
    id: string;
    type: string;
    date?: string | number | { seconds: number; nanoseconds: number };
}

const AdminAnalytics: React.FC = () => {
    const { t, language } = useLanguage();
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
        revenue: [],
        status: [],
        services: [],
        stats: { users: 0, orders: 0, revenue: 0, activeTechs: 0 }
    });
    const [aiLogs, setAiLogs] = useState<AILog[]>([]);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            // Fetch Requests
            const snap = await getDocs(collection(db, "requests"));
            const requests = snap.docs.map(d => d.data());

            // Fetch Techs for count
            const techSnap = await getDocs(collection(db, "technicians"));
            const activeTechs = techSnap.docs.filter(d => d.data().isVerified === true).length;

            // 1. Stats
            const totalRevenue = requests.filter(r => r.status === 'completed').reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);
            const totalOrders = requests.length;

            // 2. Status Distribution (Pie)
            const statusCounts = requests.reduce((acc, curr) => {
                const status = curr.status as string;
                acc[status] = (acc[status] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            const statusData = [
                { name: t("completed"), value: statusCounts['completed'] || 0, color: '#10B981' },
                { name: t("cancelled"), value: statusCounts['cancelled'] || 0, color: '#EF4444' },
                { name: t("pending"), value: statusCounts['pending'] || 0, color: '#F59E0B' },
                { name: t("in_progress"), value: statusCounts['in_progress'] || 0, color: '#3B82F6' }
            ].filter(i => i.value > 0);

            // 3. Revenue by Date (Bar)
            const revenueMap: Record<string, number> = {};
            requests.filter(r => r.status === 'completed').forEach(req => {
                const dateVal = req.date || Date.now();
                const date = new Date(dateVal).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-GB'); // DD/MM/YYYY fallback
                revenueMap[date] = (revenueMap[date] || 0) + (Number(req.price) || 0);
            });
            const revenueData = Object.keys(revenueMap).slice(-7).map(date => ({ date, amount: revenueMap[date] }));

            // 4. Top Services (Pie)
            const serviceMap: Record<string, number> = {};
            requests.forEach(req => {
                if (req.serviceType) {
                    const serviceType = req.serviceType as string;
                    serviceMap[serviceType] = (serviceMap[serviceType] || 0) + 1;
                }
            });
            const serviceData = Object.keys(serviceMap).map(name => ({
                name: t(name) || name,
                value: serviceMap[name]
            })).sort((a, b) => b.value - a.value);

            setAnalyticsData({
                revenue: revenueData,
                status: statusData,
                services: serviceData,
                stats: { users: 0, orders: totalOrders, revenue: totalRevenue, activeTechs }
            });

            // 4. AI Logs Fetch
            let aiSnap;
            try {
                aiSnap = await getDocs(query(collection(db, "ai_logs"), orderBy("date", "desc")));
            } catch (e) {
                console.warn("AI Logs index missing, falling back to basic fetch");
                aiSnap = await getDocs(collection(db, "ai_logs"));
            }
            setAiLogs(aiSnap.docs.map(d => ({ ...d.data(), id: d.id } as AILog)));

        } catch (error) {
            console.error("Error fetching analytics:", error);
            toast.error(t("errorOccurred"));
        }
    };

    return (
        <div className="animate-fade-in" role="region" aria-label={t("adminAnalytics") || "Admin Analytics"}>
            {/* 1. Key Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '25px' }}>
                <div style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)', color: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(37,99,235,0.2)' }}>
                    <h4 style={{ margin: '0 0 10px 0', opacity: 0.9 }}>{t("totalRevenue")}</h4>
                    <span style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{analyticsData.stats.revenue} {t("currency")}</span>
                </div>
                <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#64748B' }}>{t("ordersCount")}</h4>
                    <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#1E293B' }}>{analyticsData.stats.orders}</span>
                </div>
                <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#64748B' }}>{t("activeTechs") || "Active Techs"}</h4>
                    <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#10B981' }}>{analyticsData.stats.activeTechs || 0}</span>
                </div>
            </div>

            {/* 2. Charts Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>

                {/* Status Distribution */}
                <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)', height: '350px' }}>
                    <h4 style={{ margin: '0 0 20px 0', color: '#334155', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <PieChartIcon size={18} aria-hidden="true" /> {t("statusDistribution")}
                    </h4>
                    <ResponsiveContainer width="100%" height="90%">
                        <PieChart>
                            <Pie data={analyticsData.status} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                {analyticsData.status.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Revenue Trends */}
                <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)', height: '350px' }}>
                    <h4 style={{ margin: '0 0 20px 0', color: '#334155', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <TrendingUp size={18} aria-hidden="true" /> {t("dailyRevenue")}
                    </h4>
                    <ResponsiveContainer width="100%" height="90%">
                        <BarChart data={analyticsData.revenue}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
                            <Bar dataKey="amount" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Top Services */}
                <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)', height: '350px' }}>
                    <h4 style={{ margin: '0 0 20px 0', color: '#334155', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <Tag size={18} aria-hidden="true" /> {t("topServices") || "Top Services"}
                    </h4>
                    <ResponsiveContainer width="100%" height="90%">
                        <PieChart>
                            <Pie data={analyticsData.services} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                {analyticsData.services?.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={['#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#3B82F6'][index % 5]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>


            {/* --- AI Analytics Section --- */}
            <div style={{ marginTop: '40px', borderTop: '2px dashed #E2E8F0', paddingTop: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <div style={{ background: '#7C3AED', padding: '10px', borderRadius: '10px' }} aria-hidden="true"><Sparkles size={24} color="white" /></div>
                    <h3 style={{ margin: 0, color: '#4C1D95' }}>{t("aiReview")}</h3>
                </div>

                {/* KPI Card */}
                <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h4 style={{ margin: '0 0 5px 0', color: '#64748B' }}>{t("totalQueries")}</h4>
                        <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#7C3AED' }}>{aiLogs.length}</span>
                    </div>
                    <BarChart3 size={40} color="#D8B4FE" aria-hidden="true" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
                    {/* 1. Top Diagnoses Pie */}
                    <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)', height: '350px' }}>
                        <h4 style={{ margin: '0 0 20px 0', color: '#334155', textAlign: 'center' }}>{t("topDiagnoses")}</h4>
                        <ResponsiveContainer width="100%" height="90%">
                            <PieChart>
                                <Pie
                                    data={Object.entries(aiLogs.reduce((acc, curr) => {
                                        acc[curr.type] = (acc[curr.type] || 0) + 1;
                                        return acc;
                                    }, {} as Record<string, number>)).map(([name, value]) => ({ name, value }))}
                                    cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value"
                                >
                                    {['#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#3B82F6'].map((c, i) => <Cell key={i} fill={c} />)}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
