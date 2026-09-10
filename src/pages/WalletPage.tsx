// src/pages/WalletPage.tsx
import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { db } from '../services/firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, Timestamp } from 'firebase/firestore';
import { ChevronRight, TrendingUp, TrendingDown, Wallet, ArrowUpRight, DollarSign, ChevronLeft } from 'lucide-react';
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import { User } from 'firebase/auth';

interface Transaction {
    id: string;
    userId: string;
    amount: number;
    type: 'earning' | 'withdrawal' | 'payment';
    description: string;
    date: string | number | Date | Timestamp;
    status?: string;
}

interface WalletPageProps {
    user: User | null;
    goBack: () => void;
}

const WalletPage: React.FC<WalletPageProps> = ({ user, goBack }) => {
    const { t, language } = useLanguage();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [balance, setBalance] = useState<number>(0);
    const [chartData, setChartData] = useState<{ name: string; amount: number }[]>([]);

    // Withdraw State
    const [withdrawAmount, setWithdrawAmount] = useState<string>('');
    const [showWithdrawModal, setShowWithdrawModal] = useState<boolean>(false);

    useEffect(() => {
        if (!user || !user.email) return;
        const q = query(collection(db, "transactions"), where("userId", "==", user.email), orderBy("date", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Transaction));
            setTransactions(data);

            // Calculate Balance
            const total = data.reduce((acc, curr) => acc + (curr.amount || 0), 0);
            setBalance(total);

            // Prepare Chart Data (Last 7 transactions for simplicity or mocked by month)
            if (data.length > 0) {
                const formattedData = data.slice(0, 7).reverse().map(txn => {
                    let dateObj: Date;
                    if (txn.date instanceof Timestamp) {
                        dateObj = txn.date.toDate();
                    } else {
                        dateObj = new Date(txn.date as string | number | Date);
                    }
                    return {
                        name: dateObj.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short' }),
                        amount: Math.abs(txn.amount)
                    };
                });
                setChartData(formattedData);
            } else {
                // Mock Data for "Empty State" Visual
                setChartData([
                    { name: 'Jan', amount: 400 },
                    { name: 'Feb', amount: 300 },
                    { name: 'Mar', amount: 600 },
                    { name: 'Apr', amount: 200 },
                    { name: 'May', amount: 500 },
                    { name: 'Jun', amount: 900 },
                    { name: 'Jul', amount: 100 },
                ]);
            }
        });
        return () => unsubscribe();
    }, [user, language]);

    const handleWithdraw = async () => {
        const amount = parseFloat(withdrawAmount);
        if (!amount || amount <= 0) {
            toast.error(t("enterValidAmount") || "Enter valid amount");
            return;
        }
        if (amount > balance) {
            toast.error(t("insufficientFunds") || "Insufficient funds");
            return;
        }

        try {
            if (!user?.email) return;
            await addDoc(collection(db, "withdrawals"), {
                userId: user.email,
                amount: amount,
                status: 'pending',
                date: new Date().toISOString()
            });
            setShowWithdrawModal(false);
            setWithdrawAmount('');
            toast.success(t("withdrawRequestSent") || "Withdrawal request sent!");
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error(error);
            }
            toast.error(t("errorOccurred"));
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', paddingTop: '80px', paddingBottom: '100px' }}>

            {/* Header */}
            <header style={{ position: 'fixed', top: 0, left: 0, right: 0, background: 'white', padding: '15px 20px', zIndex: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <h2 style={{ color: '#0056D2', margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Wallet size={24} aria-hidden="true" /> {t("wallet")}
                </h2>
                <button
                    onClick={goBack}
                    style={{ padding: '8px 15px', cursor: 'pointer', borderRadius: '8px', border: '1px solid #ddd', background: 'white', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                    aria-label={t("back")}
                >
                    {t("back")} {language === 'ar' ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                </button>
            </header>

            {/* Balance Summary */}
            <section aria-label={t("currentBalance")} style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: 'white', padding: '30px', borderRadius: '24px', textAlign: 'center', marginBottom: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{ opacity: 0.8, marginBottom: '5px' }}>{t("currentBalance")}</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '20px' }}>{balance.toFixed(1)} <span style={{ fontSize: '1rem' }}>{t("currency")}</span></div>

                    <button onClick={() => setShowWithdrawModal(true)} style={{
                        background: 'rgba(255,255,255,0.2)',
                        border: '1px solid rgba(255,255,255,0.4)',
                        padding: '10px 25px',
                        borderRadius: '30px',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        backdropFilter: 'blur(5px)',
                        fontWeight: 'bold'
                    }}>
                        <ArrowUpRight size={18} aria-hidden="true" /> {t("withdraw") || "Withdraw"}
                    </button>
                </div>
                {/* Decorative Circles */}
                <div style={{ position: 'absolute', top: -20, right: -20, width: '100px', height: '100px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} aria-hidden="true"></div>
                <div style={{ position: 'absolute', bottom: -20, left: -20, width: '80px', height: '80px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} aria-hidden="true"></div>
            </section>

            {/* Chart Section */}
            <section aria-label={t("earningsOverview") || "Earnings Overview"} style={{ background: 'white', padding: '20px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginBottom: '30px' }}>
                <h3 style={{ margin: '0 0 20px', fontSize: '1.1rem', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TrendingUp size={20} color="#10B981" aria-hidden="true" /> {t("earningsOverview") || "Earnings Overview"}
                </h3>
                <div style={{ height: '250px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                                cursor={{ stroke: '#10B981', strokeWidth: 1, strokeDasharray: '5 5' }}
                            />
                            <Area type="monotone" dataKey="amount" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </section>

            {/* Transaction History */}
            <h3 style={{ marginBottom: '15px', color: '#334155' }}>{t("transactionHistory")} ({transactions.length})</h3>

            {transactions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                    <p>{t("noTransactions")}</p>
                </div>
            ) : (
                <div role="list">
                    {transactions.map(txn => (
                        <div key={txn.id} role="listitem" style={{
                            background: 'white', padding: '20px', borderRadius: '16px', marginBottom: '15px',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            borderRight: txn.type === 'earning' ? '5px solid #10B981' : '5px solid #EF4444'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{
                                    background: txn.type === 'earning' ? '#DCFCE7' : '#FEE2E2',
                                    padding: '12px', borderRadius: '50%',
                                    color: txn.type === 'earning' ? '#166534' : '#991B1B'
                                }} aria-hidden="true">
                                    {txn.type === 'earning' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{txn.description}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                        {txn.date instanceof Timestamp
                                            ? txn.date.toDate().toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')
                                            : new Date(txn.date as string | number | Date).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}
                                    </div>
                                </div>
                            </div>
                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: txn.type === 'earning' ? '#10B981' : '#EF4444' }}>
                                {txn.type === 'earning' ? '+' : ''}{txn.amount} {t("currency")}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Withdraw Modal */}
            {showWithdrawModal && (
                <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="withdraw-title" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', zIndex: 2000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div className="modal-content" style={{
                        background: 'white', width: '90%', maxWidth: '400px',
                        padding: '25px', borderRadius: '24px', textAlign: 'center'
                    }}>
                        <h3 id="withdraw-title" style={{ margin: '0 0 20px' }}>{t("withdrawFunds") || "Withdraw Funds"}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', marginBottom: '20px', color: '#10B981' }}>
                            {balance.toFixed(1)} <span style={{ fontSize: '1rem', color: '#64748B', marginLeft: '5px' }}>{t("currency")}</span>
                        </div>

                        <div style={{ background: '#F8FAFC', padding: '15px', borderRadius: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
                            <DollarSign size={20} color="#94A3B8" aria-hidden="true" />
                            <input
                                type="number"
                                placeholder="Amount"
                                value={withdrawAmount}
                                onChange={(e) => setWithdrawAmount(e.target.value)}
                                aria-label="Amount to withdraw"
                                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '1.2rem', marginLeft: '10px', width: '100%', fontWeight: 'bold' }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <button onClick={() => setShowWithdrawModal(false)} style={{ padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', cursor: 'pointer' }}>
                                {t("cancel") || "Cancel"}
                            </button>
                            <button onClick={handleWithdraw} style={{ padding: '12px', borderRadius: '12px', border: 'none', background: '#10B981', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
                                {t("confirm") || "Confirm"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default WalletPage;
