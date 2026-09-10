// src/components/TechnicianMap.tsx
/**
 * Real-time technician location tracking map component
 * Uses Google Maps Static API for simplicity (no API key required for basic usage)
 * Can be upgraded to interactive Google Maps with API key
 */
import { useState, useEffect } from 'react';
import { MapPin, Navigation, Clock, Phone } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Button } from './ui/Button';

interface TechnicianMapProps {
    technicianName: string;
    technicianPhone?: string;
    clientAddress: string;
    estimatedMinutes?: number;
    isOnWay?: boolean;
}

const TechnicianMap: React.FC<TechnicianMapProps> = ({
    technicianName,
    technicianPhone,
    clientAddress,
    estimatedMinutes = 30,
    isOnWay = true
}) => {
    const { t } = useLanguage();
    const [progress, setProgress] = useState(0);

    // Simulate progress animation
    useEffect(() => {
        if (!isOnWay) return;
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 1;
            });
        }, estimatedMinutes * 600); // Progress based on estimated time
        return () => clearInterval(interval);
    }, [isOnWay, estimatedMinutes]);

    return (
        <div className="technician-map-container" style={{
            background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
            borderRadius: '20px',
            padding: '20px',
            marginBottom: '20px',
            color: 'white'
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Navigation size={20} color="#10B981" />
                    {t("techOnWay")}
                </h3>
                <div style={{
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: '#10B981',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                }}>
                    <Clock size={14} />
                    {estimatedMinutes} {t("minutes")}
                </div>
            </div>

            {/* Map Placeholder with Animated Route */}
            <div style={{
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '16px',
                height: '150px',
                position: 'relative',
                overflow: 'hidden',
                marginBottom: '15px'
            }}>
                {/* Animated Road */}
                <div style={{
                    position: 'absolute',
                    bottom: '50%',
                    left: '10%',
                    width: '80%',
                    height: '4px',
                    background: 'rgba(255,255,255,0.2)',
                    borderRadius: '2px'
                }}>
                    {/* Progress */}
                    <div style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        width: `${progress}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #10B981, #34D399)',
                        borderRadius: '2px',
                        transition: 'width 0.5s ease'
                    }} />
                </div>

                {/* Tech Icon */}
                <div style={{
                    position: 'absolute',
                    bottom: 'calc(50% - 15px)',
                    left: `calc(10% + ${progress * 0.8}% - 15px)`,
                    width: '30px',
                    height: '30px',
                    background: '#10B981',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 20px rgba(16, 185, 129, 0.5)',
                    transition: 'left 0.5s ease'
                }}>
                    🚗
                </div>

                {/* Start Point */}
                <div style={{
                    position: 'absolute',
                    bottom: 'calc(50% - 10px)',
                    left: 'calc(10% - 10px)',
                    width: '20px',
                    height: '20px',
                    background: '#64748B',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px'
                }}>
                    📍
                </div>

                {/* End Point (Client) */}
                <div style={{
                    position: 'absolute',
                    bottom: 'calc(50% - 10px)',
                    right: 'calc(10% - 10px)',
                    width: '20px',
                    height: '20px',
                    background: '#0056D2',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px'
                }}>
                    🏠
                </div>

                {/* Map grid pattern overlay */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                }} />
            </div>

            {/* Technician Info */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '12px 15px'
            }}>
                <div>
                    <div style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '2px' }}>{t("technician")}</div>
                    <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{technicianName}</div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {technicianPhone && (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => window.open(`tel:${technicianPhone}`, '_self')}
                            style={{ background: '#10B981', border: 'none' }}
                        >
                            <Phone size={18} color="white" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Destination */}
            <div style={{
                marginTop: '10px',
                padding: '10px 15px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
            }}>
                <MapPin size={16} color="#94A3B8" />
                <span style={{ fontSize: '0.85rem', color: '#CBD5E1' }}>{clientAddress}</span>
            </div>
        </div>
    );
};

export default TechnicianMap;
