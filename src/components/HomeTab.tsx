import React, { useMemo } from 'react';
import Tilt from 'react-parallax-tilt';
import { Star, CheckCircle, ArrowRight, X, Search } from 'lucide-react';
import { User } from 'firebase/auth';
import SkeletonCard from './SkeletonCard';
import Stories from './Stories';
import { capitalizeName } from '../utils/formatters';
import TechProfileModal from './Modals/TechProfileModal';
import './HomeTab.css';
import '../styles/components.css'; // ✅ Design system components

import { Technician, WeatherAlert } from '../types';

interface ServiceItem {
    id: string;
    icon: React.ReactNode;
    color: string;
    bg: string;
}

interface HomeTabProps {
    user: User | null;
    userRole: string;
    t: (key: string) => string;
    weatherAlert: WeatherAlert | null;
    setWeatherAlert: (val: WeatherAlert | null) => void;
    servicesList: ServiceItem[];
    setSearchTerm: (val: string) => void;
    searchTerm: string;
    technicians: Technician[];
    isLoadingTechs: boolean;
    serviceMap: Record<string, string[]>;
    setSelectedTech: (tech: Technician) => void;
    favorites: string[];
    toggleFavorite: (id: string) => void;
}

const HomeTab: React.FC<HomeTabProps> = ({
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
    const [showTechProfile, setShowTechProfile] = React.useState(false);
    const [selectedTechForProfile, setSelectedTechForProfile] = React.useState<Technician | null>(null);

    // Memoize filtered technicians to avoid recalculation on every render
    const filteredTechnicians = useMemo(() => {
        if (!searchTerm) return technicians;
        return technicians.filter(tech =>
            tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tech.specialty?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [technicians, searchTerm]);

    // ✅ FIXED: Memoize filter logic to prevent duplicate O(n) iterations
    const filteredTechs = React.useMemo(() => {
        return technicians.filter(tech => {
            if (tech.role !== 'tech') return false;
            if (user && tech.email === user.email) return false;

            const lowerName = (tech.name || '').toLowerCase();
            const lowerSpecialty = (tech.specialty || '').toLowerCase();
            if (lowerName.includes('test') || lowerName.includes('debug') || lowerSpecialty.includes('debug')) {
                return false;
            }

            if (!searchTerm) return true;

            if (serviceMap[searchTerm]) {
                return serviceMap[searchTerm].some(term => tech.specialty.includes(term));
            }

            return tech.specialty.includes(searchTerm) || tech.name.includes(searchTerm);
        });
    }, [technicians, user, searchTerm, serviceMap]);

    return (
        <div className="home-tab">
            <div className="home-container">
                {/* ⛈️ Weather Alert */}
                {weatherAlert && (
                    <div className="weather-alert">
                        <div className="weather-icon">{weatherAlert.icon}</div>
                        <div className="weather-content">
                            <div className="weather-title">Weather Alert</div>
                            <div className="weather-message">{weatherAlert.message}</div>
                        </div>
                        <button onClick={() => setWeatherAlert(null)} aria-label={t("closeAlert") || "Close alert"} className="close-alert-btn">
                            <X size={14} />
                        </button>
                    </div>
                )}

                {/* 📸 Stories */}
                <Stories user={user} userRole={userRole} />

                {/* Services Grid */}
                <div className="services-section">
                    <h3 className="section-title">{t("servicesTitle")}</h3>
                    <div className="services-grid">
                        {servicesList.map((s) => (
                            <div key={s.id} className="service-item glass-card" onClick={() => setSearchTerm(s.id === 'allServices' ? '' : s.id)}>
                                <div className="service-icon-box" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
                                <span className="service-label">{t(s.id)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Technicians List */}
                <div className="section-header">
                    <h3 className="section-title">{t("topTechs")}</h3>
                    <span className="view-all-link">{t("viewAll")}</span>
                </div>

                <div className="techs-grid">
                    {isLoadingTechs ? (
                        <>
                            {[1, 2, 3].map((_, idx) => (
                                <SkeletonCard key={idx} />
                            ))}
                        </>
                    ) : filteredTechs.length === 0 ? (
                        <div className="no-techs">
                            <Search size={40} />
                            <p>{t("noTechs")}</p>
                        </div>
                    ) : (
                        filteredTechs.map((tech, index) => (
                            <Tilt key={index} tiltMaxAngleX={5} tiltMaxAngleY={5} scale={1.02} transitionSpeed={2500}>
                                <div className="tech-card glass-card" onClick={() => setSelectedTechForProfile(tech)}>

                                    <button
                                        className="favorite-btn"
                                        onClick={(e) => { e.stopPropagation(); toggleFavorite(tech.id); }}
                                        aria-label={favorites?.includes(tech.id) ? t("removeFromFavorites") : t("addToFavorites")}>
                                        <Star size={18} fill={favorites?.includes(tech.id) ? "#EF4444" : "none"} color={favorites?.includes(tech.id) ? "#EF4444" : "#94A3B8"} />
                                    </button>

                                    <div className="tech-image-container">
                                        <img src={tech.img || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} alt={tech.name} className="tech-image" />
                                        {tech.isVerified && (
                                            <div className="verified-badge">
                                                <CheckCircle size={10} color="white" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="tech-info">
                                        <h4 className="tech-name">{capitalizeName(tech.name)}</h4>
                                        <p className="tech-specialty">
                                            {t(tech.specialty) === tech.specialty ? tech.specialty : (serviceMap.plumbing?.includes(tech.specialty) ? t('plumbing') : tech.specialty)}
                                        </p>

                                        <div className="tech-rating">
                                            <Star size={12} fill="#FBBF24" color="#FBBF24" />
                                            <span className="rating-value">{tech.rating}</span>
                                        </div>

                                        <p className="tech-price">
                                            {tech.price} {t("currency")}
                                        </p>
                                    </div>

                                    <div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setSelectedTechForProfile(tech); }}
                                            className="view-details-btn"
                                        >
                                            {t("viewDetails") || "View"} <ArrowRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            </Tilt>
                        ))
                    )}
                </div>
            </div>

            {/* Tech Profile Modal */}
            {selectedTechForProfile && (
                <TechProfileModal
                    tech={selectedTechForProfile}
                    isOpen={!!selectedTechForProfile}
                    onClose={() => setSelectedTechForProfile(null)}
                    onBook={() => {
                        setSelectedTech(selectedTechForProfile);
                        setSelectedTechForProfile(null);
                    }}
                    t={t}
                />
            )}
        </div>
    );
};

// Export with React.memo for performance optimization
export default React.memo(HomeTab);
