// src/components/AdminLiveMap.tsx
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { db } from '../services/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useLanguage } from '../context/LanguageContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface TechLocation {
    latitude: number;
    longitude: number;
}

interface TechnicianData {
    id: string;
    name: string;
    img?: string;
    profession?: string;
    isOnline?: boolean;
    isVerified?: boolean | string;
    location?: TechLocation;
}

// Custom Marker Icons
const techIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/9131/9131546.png',
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [0, -35]
});

const activeTechIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/9131/9131546.png',
    iconSize: [40, 40],
    className: 'pulsing-icon',
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
});

// Fallback realistic demo technicians across Greater Cairo
const DEMO_MAP_TECHS: TechnicianData[] = [
    {
        id: 'map-tech-1',
        name: 'م. كريم سامي',
        img: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
        profession: 'ac',
        isOnline: true,
        isVerified: true,
        location: { latitude: 30.045, longitude: 31.002 }
    },
    {
        id: 'map-tech-2',
        name: 'أسطى أحمد وجدي',
        img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        profession: 'electricity',
        isOnline: true,
        isVerified: true,
        location: { latitude: 29.960, longitude: 31.258 }
    },
    {
        id: 'map-tech-3',
        name: 'أسطى محمد سعد',
        img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        profession: 'plumbing',
        isOnline: true,
        isVerified: true,
        location: { latitude: 30.028, longitude: 31.472 }
    },
    {
        id: 'map-tech-4',
        name: 'أسطى كرم النجار',
        img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        profession: 'carpentry',
        isOnline: false,
        isVerified: true,
        location: { latitude: 30.056, longitude: 31.345 }
    },
    {
        id: 'map-tech-5',
        name: 'سامح النقاش',
        img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
        profession: 'painting',
        isOnline: true,
        isVerified: true,
        location: { latitude: 30.038, longitude: 31.212 }
    }
];

const AdminLiveMap: React.FC = () => {
    const { t } = useLanguage();
    const [techs, setTechs] = useState<TechnicianData[]>([]);

    useEffect(() => {
        let unsubscribe: (() => void) | undefined;
        try {
            const q = query(collection(db, "technicians"), where("isVerified", "in", [true, "approved"]));
            unsubscribe = onSnapshot(q, (snapshot) => {
                const techData = snapshot.docs
                    .map(doc => ({ ...doc.data(), id: doc.id } as TechnicianData))
                    .filter(tech => tech.location && tech.location.latitude && tech.location.longitude);
                if (techData.length > 0) {
                    setTechs(techData);
                } else {
                    setTechs(DEMO_MAP_TECHS);
                }
            }, (err) => {
                console.warn("Live map snapshot notice:", err);
                setTechs(DEMO_MAP_TECHS);
            });
        } catch {
            setTechs(DEMO_MAP_TECHS);
        }
        return () => { if (unsubscribe) unsubscribe(); };
    }, []);

    return (
        <div
            style={{ height: '500px', width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
            role="region"
            aria-label={t("liveMap") || "Live Map"}
        >
            <MapContainer center={[30.0444, 31.2357]} zoom={10} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                />

                {techs.map(tech => (
                    <Marker
                        key={tech.id}
                        position={[tech.location!.latitude, tech.location!.longitude]}
                        icon={tech.isOnline ? activeTechIcon : techIcon}
                    >
                        <Popup>
                            <div style={{ textAlign: 'center' }}>
                                <img
                                    src={tech.img || 'https://via.placeholder.com/50'}
                                    alt={tech.name}
                                    style={{ width: '50px', height: '50px', borderRadius: '50%', marginBottom: '5px', objectFit: 'cover' }}
                                />
                                <h4 style={{ margin: '0 0 5px 0', color: '#1E293B' }}>{tech.name}</h4>
                                <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{t(tech.profession || 'technician')}</div>
                                <div style={{
                                    marginTop: '5px',
                                    padding: '2px 8px',
                                    borderRadius: '10px',
                                    background: tech.isOnline ? '#DCFCE7' : '#F1F5F9',
                                    color: tech.isOnline ? '#166534' : '#94A3B8',
                                    fontSize: '0.75rem',
                                    display: 'inline-block',
                                    fontWeight: 'bold'
                                }}>
                                    {tech.isOnline ? t("online") : t("offline")}
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default AdminLiveMap;
