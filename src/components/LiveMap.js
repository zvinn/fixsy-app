import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLanguage } from '../context/LanguageContext';
import { renderToStaticMarkup } from 'react-dom/server';
import { Navigation, MapPin, User, Truck } from 'lucide-react';
import { db } from '../services/firebase';

// Fix for default Leaflet icons (keep as fallback)
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Helper to create vector icons
const createVectorIcon = (IconComponent, color) => {
    return L.divIcon({
        className: 'custom-map-marker',
        html: renderToStaticMarkup(
            <div style={{
                background: color,
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '3px solid white',
                boxShadow: '0 3px 10px rgba(0,0,0,0.3)',
                position: 'relative'
            }}>
                <IconComponent size={20} color="white" />
                <div style={{
                    position: 'absolute',
                    bottom: '-6px',
                    left: '50%',
                    transform: 'translate(-50%)',
                    width: '0',
                    height: '0',
                    borderLeft: '6px solid transparent',
                    borderRight: '6px solid transparent',
                    borderTop: `8px solid ${color}`
                }}></div>
            </div>
        ),
        iconSize: [36, 42],
        iconAnchor: [18, 42],
        popupAnchor: [0, -42]
    });
};

// Component to handle auto-fit bounds
function FitBounds({ clientLocation, techLocation }) {
    const map = useMap();

    useEffect(() => {
        if (!clientLocation || !techLocation) return;
        const bounds = L.latLngBounds([clientLocation, techLocation]);
        map.fitBounds(bounds, { padding: [50, 50], animate: true });
    }, [clientLocation, techLocation, map]);

    return null;
}

// Internal component to capture map instance
function MapController({ setMap }) {
    const map = useMap();
    useEffect(() => {
        setMap(map);
    }, [map, setMap]);
    return null;
}

const LiveMap = ({ clientLocation, techLocation, onClose }) => {
    const { t } = useLanguage();
    const [map, setMap] = React.useState(null);

    // Defaults if location missing
    const defaultCenter = clientLocation || { lat: 30.0444, lng: 31.2357 }; // Cairo

    // Vector Icons
    const clientIcon = createVectorIcon(User, '#3B82F6'); // Blue for Client
    const techIcon = createVectorIcon(Truck, '#10B981'); // Green for Tech

    return (
        <div style={{ position: 'relative', height: '100%', width: '100%', borderRadius: '16px', overflow: 'hidden' }}>
            <MapContainer
                center={defaultCenter}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {/* Client Marker */}
                {clientLocation && (
                    <Marker position={clientLocation} icon={clientIcon}>
                        <Popup>{t("yourAddress")}</Popup>
                    </Marker>
                )}

                {/* Tech Marker */}
                {techLocation && (
                    <Marker position={techLocation} icon={techIcon}>
                        <Popup>{t("techLocation")}</Popup>
                    </Marker>
                )}

                <FitBounds clientLocation={clientLocation} techLocation={techLocation} />
                <MapController setMap={setMap} />
            </MapContainer>

            {/* Floating Close Button in case used in Fullscreen but here mostly inside Modal */}
            <button onClick={onClose} style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                zIndex: 1000,
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.2rem',
                color: '#333'
            }}>
                ✕
            </button>

            {/* Focus on Tech Button */}
            {techLocation && (
                <button
                    onClick={() => {
                        if (map) {
                            map.flyTo(techLocation, 16, { duration: 1.5 });
                        }
                    }}
                    style={{
                        position: 'absolute',
                        bottom: '80px', // Above the legend
                        right: '10px',
                        background: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '45px',
                        height: '45px',
                        zIndex: 1000,
                        boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#059669',
                        animation: 'pulse-blue 2s infinite'
                    }}
                    title={t("focusTech")}
                >
                    <Navigation size={24} fill="#059669" />
                </button>
            )}

            <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(255,255,255,0.9)',
                padding: '8px 16px',
                borderRadius: '20px',
                zIndex: 1000,
                boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
                fontSize: '0.85rem',
                fontWeight: 'bold',
                display: 'flex',
                gap: '15px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ width: '10px', height: '10px', background: '#2A81CB', borderRadius: '50%', display: 'inline-block' }}></span> {t("you")}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ width: '10px', height: '10px', background: '#2AAD27', borderRadius: '50%', display: 'inline-block' }}></span> {t("technician")} ({t("live")})
                </div>
            </div>
        </div>
    );
};

export default LiveMap;
