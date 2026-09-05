import React, { useState, useEffect } from 'react';
import Tilt from 'react-parallax-tilt';
import { Star, CheckCircle, ArrowRight, X, Search, MapPin } from 'lucide-react';
import SkeletonCard from './SkeletonCard';
import Stories from './Stories';

const HomeTab = ({
    user,
    userRole,
    t,
    weatherAlert,
    setWeatherAlert,
    servicesList,
    setSearchTerm,
    searchTerm,
    technicians,
    isLoadingTechs,
    serviceMap,
    setSelectedTech,
    favorites,
    toggleFavorite
}) => {


    return (
        <div className="home-tab animate-fade-in">
            {/* Container */}
            <div className="container" style={{ marginTop: '20px', padding: '0 20px' }}>



                {/* ⛈️ Weather Alert */}
                {weatherAlert && (
                    <div className="hover-scale" style={{
                        background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
                        borderRadius: '16px', padding: '15px', marginBottom: '20px',
                        display: 'flex', alignItems: 'center', gap: '15px', color: 'white',
                        boxShadow: '0 4px 15px rgba(30, 41, 59, 0.3)', position: 'relative'
                    }}>
                        <div style={{ fontSize: '2rem' }}>{weatherAlert.icon}</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '2px' }}>Weather Alert</div>
                            <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>{weatherAlert.message}</div>
                        </div>
                        <button onClick={() => setWeatherAlert(null)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '24px', height: '24px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <X size={14} />
                        </button>
                    </div>
                )}

                {/* 📸 Stories */}
                <Stories user={user} userRole={userRole} />

                {/* Services Grid */}
                <div style={{ marginBottom: '40px' }}>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--text)', marginBottom: '20px', fontWeight: '700' }}>{t("servicesTitle")}</h3>
                    <div className="services-grid">
                        {servicesList.map((s) => (
                            <div key={s.id} className="service-item hover-scale glass-card" onClick={() => setSearchTerm(s.id === 'allServices' ? '' : s.id)} style={{
                                padding: '15px 5px', textAlign: 'center', cursor: 'pointer',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px'
                            }}>
                                <div style={{ background: s.bg, color: s.color, width: '55px', height: '55px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>{s.icon}</div>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text)', fontWeight: '700' }}>{t(s.id)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Technicians List */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--text)', margin: 0, fontWeight: '700' }}>{t("topTechs")}</h3>
                    <span style={{ color: 'var(--primary)', fontSize: '0.9rem', cursor: 'pointer' }}>{t("viewAll")}</span>
                </div>

                {isLoadingTechs ? (
                    <>
                        {[1, 2, 3].map((_, idx) => (
                            <SkeletonCard key={idx} />
                        ))}
                    </>
                ) : technicians.filter(t => {
                    if (t.role !== 'tech') return false;
                    if (!searchTerm) return true;

                    // 1. Exact Match via Service Map (e.g. 'plumbing' -> ['سباك', 'Plumber'])
                    if (serviceMap[searchTerm]) {
                        return serviceMap[searchTerm].some(term => t.specialty.includes(term));
                    }

                    // 2. Fuzzy Search in Name or Specialty (Arabic/English)
                    const termLower = searchTerm.toLowerCase();
                    const nameLower = t.name.toLowerCase();
                    const specLower = t.specialty.toLowerCase();

                    return nameLower.includes(termLower) || specLower.includes(termLower);
                }).length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                        <Search size={40} style={{ opacity: 0.3, marginBottom: '10px' }} />
                        <p>{t("noTechs")}</p>
                    </div>
                ) : (
                    technicians.filter(t => {
                        if (t.role !== 'tech') return false;
                        if (!searchTerm) return true;
                        if (serviceMap[searchTerm]) {
                            return serviceMap[searchTerm].some(term => t.specialty.includes(term));
                        }
                        return t.specialty.includes(searchTerm) || t.name.includes(searchTerm);
                    }).map((tech, index) => (
                        <Tilt key={index} tiltMaxAngleX={5} tiltMaxAngleY={5} scale={1.02} transitionSpeed={2500}>
                            <div className="tech-card-pro hover-scale glass-card" onClick={() => setSelectedTech(tech)} style={{ cursor: 'pointer', borderLeft: '4px solid var(--primary)' }}>
                                <img src={tech.img || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} alt={tech.name} style={{ width: '60px', height: '60px', borderRadius: '18px', objectFit: 'cover' }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                                        <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text)' }}>{tech.name}</h4>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(245, 158, 11, 0.1)', padding: '4px 8px', borderRadius: '10px' }}>
                                            <Star size={14} fill="#F59E0B" color="#F59E0B" />
                                            <span style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#F59E0B' }}>{tech.rating}</span>
                                        </div>
                                    </div>
                                    <p style={{ margin: '0 0 8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{t(tech.specialty) === tech.specialty ? tech.specialty : (serviceMap.plumbing.includes(tech.specialty) ? t('plumbing') : tech.specialty)} • {tech.isVerified ? <span style={{ color: 'var(--success)', display: 'inline-flex', alignItems: 'center', gap: '2px' }}><CheckCircle size={12} />{t("verified")}</span> : ''}</p>
                                    <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--primary)', fontSize: '1rem' }}>{tech.price} {t("currency")}</p>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <button onClick={(e) => { e.stopPropagation(); toggleFavorite(tech.id); }} style={{ background: favorites?.includes(tech.id) ? '#FEE2E2' : 'var(--bg-secondary)', color: favorites?.includes(tech.id) ? '#EF4444' : 'var(--text-secondary)', border: 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}>
                                        <Star size={20} fill={favorites?.includes(tech.id) ? "#EF4444" : "none"} color={favorites?.includes(tech.id) ? "#EF4444" : "currentColor"} />
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); setSelectedTech(tech); }} style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '12px', borderRadius: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0, 86, 210, 0.25)' }}><ArrowRight size={22} /></button>
                                </div>
                            </div>
                        </Tilt>
                    ))
                )}
            </div>
        </div>
    );
};

export default HomeTab;
