// src/pages/Home.tsx
import { useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
    Search, ArrowRight, CheckCircle, Sparkles,
    Wrench, Zap, Hammer, Wind, PaintRoller, Tv, Satellite, Grid,
    Filter, Star
} from 'lucide-react';
import OptimizedImage from '../components/common/OptimizedImage';
import gsap from 'gsap';

interface Technician {
    id: string;
    name: string;
    specialty: string;
    rating: number;
    price?: number;
    img?: string;
    isVerified?: boolean;
    [key: string]: unknown;
}

interface HomeProps {
    technicians: Technician[];
    setSelectedTech: (tech: Technician) => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    sortOrder: string;
    setSortOrder: (order: string) => void;
    setShowAIModal: (show: boolean) => void;
}

const Home: React.FC<HomeProps> = ({
    technicians, setSelectedTech, searchTerm, setSearchTerm, sortOrder, setSortOrder, setShowAIModal
}) => {
    const { t } = useLanguage();
    const containerRef = useRef<HTMLDivElement>(null);

    // Entry Animation
    useEffect(() => {
        if (!containerRef.current) return;
        const ctx = gsap.context(() => {
            // Header
            gsap.fromTo(".hero-content",
                { y: -50, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
            );
            // Services
            gsap.fromTo(".service-item",
                { scale: 0.8, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.5, stagger: 0.05, ease: "back.out(1.7)", delay: 0.3 }
            );
            // Tech Cards
            gsap.fromTo(".tech-card-pro",
                { y: 50, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out", delay: 0.6 }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    // Services List
    const servicesList = [
        { name: 'سباكة', icon: <Wrench size={28} aria-hidden="true" />, color: '#0ea5e9', bg: '#e0f2fe' },
        { name: 'كهرباء', icon: <Zap size={28} aria-hidden="true" />, color: '#eab308', bg: '#fef9c3' },
        { name: 'نجارة', icon: <Hammer size={28} aria-hidden="true" />, color: '#8b5cf6', bg: '#ede9fe' },
        { name: 'تكييف', icon: <Wind size={28} aria-hidden="true" />, color: '#10b981', bg: '#d1fae5' },
        { name: 'نقاشة', icon: <PaintRoller size={28} aria-hidden="true" />, color: '#ec4899', bg: '#fce7f3' },
        { name: 'أجهزة', icon: <Tv size={28} aria-hidden="true" />, color: '#6366f1', bg: '#e0e7ff' },
        { name: 'دش', icon: <Satellite size={28} aria-hidden="true" />, color: '#f43f5e', bg: '#ffe4e6' },
        { name: 'الكل', icon: <Grid size={28} aria-hidden="true" />, color: '#64748b', bg: '#f1f5f9' }
    ];

    // Filter Logic
    const filteredTechs = technicians
        .filter(tech => {
            if (!searchTerm || searchTerm === "الكل") return true;
            return (
                tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tech.specialty.includes(searchTerm)
            );
        })
        .sort((a, b) => {
            if (sortOrder === "low") return (a.price || 0) - (b.price || 0);
            if (sortOrder === "high") return (b.price || 0) - (a.price || 0);
            return 0;
        });

    return (
        <div ref={containerRef} style={{ paddingBottom: '100px', background: '#F8FAFC', minHeight: '100vh' }}>

            {/* 1. Hero Section */}
            <header style={{
                background: 'radial-gradient(circle at 10% 20%, rgb(0, 86, 210) 0%, rgb(2, 132, 199) 90%)',
                padding: '50px 20px 90px',
                borderRadius: '0 0 50px 50px',
                color: 'white', textAlign: 'center', position: 'relative', overflow: 'hidden',
                boxShadow: '0 20px 40px -10px rgba(2, 132, 199, 0.4)'
            }} role="banner">
                {/* Decorative Circles */}
                <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '300px', height: '300px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} aria-hidden="true"></div>
                <div style={{ position: 'absolute', bottom: '-20%', right: '-5%', width: '200px', height: '200px', background: 'rgba(255,255,255,0.08)', borderRadius: '50%' }} aria-hidden="true"></div>

                <div className="hero-content" style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
                        <span style={{ background: 'rgba(255,255,255,0.2)', padding: '5px 15px', borderRadius: '20px', fontSize: '0.8rem', backdropFilter: 'blur(5px)' }}>✨ المنصة رقم 1 في مصر</span>
                    </div>
                    <h1 style={{ margin: '0 0 15px', fontSize: '2.2rem', fontWeight: '900', letterSpacing: '-1px' }}>صيانة بيتك.. <span style={{ color: '#93C5FD' }}>أسهل وأسرع</span></h1>

                    <div style={{
                        background: 'white', padding: '8px', borderRadius: '16px',
                        display: 'flex', alignItems: 'center', gap: '10px', maxWidth: '600px', margin: '30px auto 0',
                        boxShadow: '0 15px 35px rgba(0,0,0,0.15)', transform: 'translateY(40px)'
                    }} role="search">
                        <div style={{ padding: '0 15px' }}><Search color="#94A3B8" size={22} aria-hidden="true" /></div>
                        <input
                            type="text"
                            placeholder="ابحث عن سباك، كهربائي، نجار..."
                            style={{ border: 'none', outline: 'none', flex: 1, fontSize: '1rem', color: '#1E293B', padding: '12px 0' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            aria-label="Search technicians"
                        />
                        <button onClick={() => setShowAIModal(true)} style={{
                            background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                            border: 'none', borderRadius: '12px', padding: '12px 20px',
                            color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)', transition: '0.3s', fontWeight: 'bold'
                        }}>
                            <Sparkles size={18} aria-hidden="true" /> الذكاء الاصطناعي
                        </button>
                    </div>
                </div>
            </header>

            {/* 2. Services Grid */}
            <main className="container" style={{ marginTop: '70px', padding: '0 20px' }}>
                <section style={{ marginBottom: '40px' }} aria-label="Services">
                    <h3 style={{ fontSize: '1.1rem', color: '#1E293B', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>🛠️ الخدمات المتاحة</span>
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }} role="list">
                        {servicesList.map((s) => (
                            <div key={s.name} className="service-item" onClick={() => setSearchTerm(s.name === 'الكل' ? '' : s.name)} role="listitem" style={{
                                background: 'white', padding: '15px 5px', borderRadius: '16px',
                                textAlign: 'center', cursor: 'pointer', border: '1px solid transparent',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                            }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = s.color; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'transparent'; }}
                            >
                                <div style={{
                                    background: s.bg, color: s.color, width: '50px', height: '50px',
                                    borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: `0 4px 10px ${s.bg}`
                                }} aria-hidden="true">
                                    {s.icon}
                                </div>
                                <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: '700' }}>{s.name}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 3. Technicians (Pro Cards) */}
                <section aria-label="Technicians">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '1.1rem', color: '#1E293B', margin: 0 }}>⭐ أفضل الفنيين</h3>
                        <div style={{ background: 'white', padding: '5px', borderRadius: '20px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center' }}>
                            <Filter size={16} color="#64748B" style={{ marginLeft: '5px' }} aria-hidden="true" />
                            <select onChange={(e) => setSortOrder(e.target.value)} aria-label="Sort technicians" style={{ border: 'none', background: 'transparent', fontSize: '0.8rem', color: '#475569', outline: 'none', cursor: 'pointer' }}>
                                <option value="default">ترتيب تلقائي</option>
                                <option value="low">الأرخص سعراً</option>
                                <option value="high">الأعلى سعراً</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }} role="list">
                        {filteredTechs.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                                <Search size={40} style={{ marginBottom: '15px', opacity: 0.3 }} aria-hidden="true" />
                                <p>عفواً، لا يوجد فنيين مطابقين لبحثك حالياً.</p>
                                <button onClick={() => setSearchTerm('')} style={{ marginTop: '10px', color: '#0056D2', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' }}>عرض الجميع</button>
                            </div>
                        ) : (
                            filteredTechs.map((tech, index) => (
                                <div key={index} className="tech-card-pro" role="listitem" style={{
                                    background: 'white', borderRadius: '20px', padding: '15px',
                                    display: 'flex', gap: '15px', alignItems: 'center',
                                    boxShadow: '0 2px 15px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9',
                                    position: 'relative', transition: '0.2s'
                                }}>
                                    {/* Verification Badge */}
                                    {tech.isVerified && (
                                        <div style={{ position: 'absolute', top: '15px', left: '15px', background: '#F0FDF4', color: '#166534', padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }} aria-label="Verified Technician">
                                            <CheckCircle size={12} aria-hidden="true" /> موثق
                                        </div>
                                    )}

                                    {/* Image */}
                                    <div style={{ position: 'relative', width: '80px', height: '80px' }}>
                                        <OptimizedImage
                                            src={tech.img || "https://via.placeholder.com/150"}
                                            alt={tech.name}
                                            style={{ width: '80px', height: '80px', borderRadius: '18px' }}
                                        />
                                        <div style={{ position: 'absolute', bottom: '-5px', right: '-5px', background: 'white', padding: '2px', borderRadius: '50%', zIndex: 10 }} aria-label="Online Status">
                                            <div style={{ background: '#10B981', width: '12px', height: '12px', borderRadius: '50%', border: '2px solid white' }}></div>
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: '0 0 5px', fontSize: '1rem', color: '#1E293B' }}>{tech.name}</h4>
                                        <p style={{ margin: '0 0 10px', fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <Wrench size={14} aria-hidden="true" /> {tech.specialty}
                                        </p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem' }}>
                                            <span style={{ color: '#F59E0B', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Star size={14} fill="#F59E0B" aria-hidden="true" /> {tech.rating}
                                            </span>
                                            <span style={{ background: '#F1F5F9', color: '#475569', padding: '2px 8px', borderRadius: '6px' }}>
                                                {tech.price ? `${tech.price} ج.م` : 'اتفاق'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Book Button */}
                                    <button onClick={() => setSelectedTech(tech)} aria-label={`Book ${tech.name}`} style={{
                                        background: '#0056D2', color: 'white', border: 'none',
                                        padding: '12px', borderRadius: '14px',
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: '0 4px 12px rgba(0, 86, 210, 0.25)', transition: '0.2s'
                                    }}>
                                        <ArrowRight size={22} aria-hidden="true" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}

export default Home;
