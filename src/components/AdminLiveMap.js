import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { db } from '../services/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useLanguage } from '../context/LanguageContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom Marker Icons
const techIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/9131/9131546.png', // Tech Icon
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [0, -35]
});

const activeTechIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/9131/9131546.png', // Green/Active variation if needed
    iconSize: [40, 40],
    className: 'pulsing-icon', // We can add CSS for pulsing later
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
});

function AdminLiveMap() {
    const { t } = useLanguage();
    const [techs, setTechs] = useState([]);

    useEffect(() => {
        // Fetch all verified techs who have location data
        const q = query(collection(db, "technicians"), where("isVerified", "in", [true, "approved"]));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const techData = snapshot.docs
                .map(doc => ({ ...doc.data(), id: doc.id }))
                .filter(tech => tech.location && tech.location.latitude && tech.location.longitude);
            setTechs(techData);
        });
        return () => unsubscribe();
    }, []);

    return (
        <div style={{ height: '500px', width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <MapContainer center={[30.0444, 31.2357]} zoom={10} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                />

                {techs.map(tech => (
                    <Marker
                        key={tech.id}
                        position={[tech.location.latitude, tech.location.longitude]}
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
                                <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{t(tech.profession)}</div>
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
}

export default AdminLiveMap;
