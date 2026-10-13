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
  popupAnchor: [0, -35],
});

const activeTechIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/9131/9131546.png',
  iconSize: [40, 40],
  className: 'pulsing-icon',
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
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
    location: { latitude: 30.045, longitude: 31.002 },
  },
  {
    id: 'map-tech-2',
    name: 'أسطى أحمد وجدي',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    profession: 'electricity',
    isOnline: true,
    isVerified: true,
    location: { latitude: 29.96, longitude: 31.258 },
  },
  {
    id: 'map-tech-3',
    name: 'أسطى محمد سعد',
    img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    profession: 'plumbing',
    isOnline: true,
    isVerified: true,
    location: { latitude: 30.028, longitude: 31.472 },
  },
  {
    id: 'map-tech-4',
    name: 'أسطى كرم النجار',
    img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    profession: 'carpentry',
    isOnline: false,
    isVerified: true,
    location: { latitude: 30.056, longitude: 31.345 },
  },
  {
    id: 'map-tech-5',
    name: 'سامح النقاش',
    img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    profession: 'painting',
    isOnline: true,
    isVerified: true,
    location: { latitude: 30.038, longitude: 31.212 },
  },
];

const AdminLiveMap: React.FC = () => {
  const { t } = useLanguage();
  const [techs, setTechs] = useState<TechnicianData[]>([]);
  const [selectedProfession, setSelectedProfession] = useState<string>('all');
  const [onlineOnly, setOnlineOnly] = useState<boolean>(false);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    try {
      const q = query(collection(db, 'technicians'), where('isVerified', 'in', [true, 'approved']));
      unsubscribe = onSnapshot(
        q,
        snapshot => {
          const techData = snapshot.docs
            .map(doc => ({ ...doc.data(), id: doc.id }) as TechnicianData)
            .filter(tech => tech.location && tech.location.latitude && tech.location.longitude);
          if (techData.length > 0) {
            setTechs(techData);
          } else {
            setTechs(DEMO_MAP_TECHS);
          }
        },
        err => {
          console.warn('Live map snapshot notice:', err);
          setTechs(DEMO_MAP_TECHS);
        }
      );
    } catch {
      setTechs(DEMO_MAP_TECHS);
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const onlineCount = techs.filter(tk => tk.isOnline).length;

  const filteredTechs = techs.filter(tech => {
    if (onlineOnly && !tech.isOnline) return false;
    if (selectedProfession !== 'all' && tech.profession !== selectedProfession) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Live Map Control Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          padding: '12px 18px',
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderRadius: '14px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#10B981',
                boxShadow: '0 0 10px #10B981',
                display: 'inline-block',
              }}
            />
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1E293B' }}>
              {t('onlineTechs') || 'الفنيين المتصلين'}:{' '}
              <strong style={{ color: '#10B981' }}>{onlineCount}</strong>
            </span>
          </div>

          <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
            {t('totalTracked') || 'إجمالي على الخريطة'}: {techs.length}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Profession Filter */}
          <select
            value={selectedProfession}
            onChange={e => setSelectedProfession(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '0.85rem',
              color: '#334155',
              background: '#FFFFFF',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="all">{t('allProfessions') || 'جميع التخصصات'}</option>
            <option value="ac">{t('ac') || 'تكييف وتبريد'}</option>
            <option value="electricity">{t('electricity') || 'كهرباء'}</option>
            <option value="plumbing">{t('plumbing') || 'سباكة'}</option>
            <option value="carpentry">{t('carpentry') || 'نجارة'}</option>
            <option value="painting">{t('painting') || 'نقاشة'}</option>
          </select>

          {/* Online Only Toggle */}
          <button
            type="button"
            onClick={() => setOnlineOnly(!onlineOnly)}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: onlineOnly ? '1px solid #10B981' : '1px solid #CBD5E1',
              background: onlineOnly ? '#ECFDF5' : '#FFFFFF',
              color: onlineOnly ? '#047857' : '#64748B',
              fontSize: '0.85rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {onlineOnly ? '✓ ' : ''}
            {t('onlineOnly') || 'المتصلين فقط'}
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div
        style={{
          height: '520px',
          width: '100%',
          borderRadius: '16px',
          overflow: 'hidden',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        }}
        role="region"
        aria-label={t('liveMap') || 'Live Map'}
      >
        <MapContainer
          center={[30.0444, 31.2357]}
          zoom={10}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          {filteredTechs.map(tech => (
            <Marker
              key={tech.id}
              position={[tech.location!.latitude, tech.location!.longitude]}
              icon={tech.isOnline ? activeTechIcon : techIcon}
            >
              <Popup>
                <div style={{ textAlign: 'center', minWidth: '130px', padding: '4px' }}>
                  <img
                    src={
                      tech.img ||
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
                    }
                    alt={tech.name}
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '50%',
                      marginBottom: '6px',
                      objectFit: 'cover',
                      border: tech.isOnline ? '2px solid #10B981' : '2px solid #CBD5E1',
                    }}
                  />
                  <h4 style={{ margin: '0 0 4px 0', color: '#1E293B', fontSize: '0.95rem' }}>
                    {tech.name}
                  </h4>
                  <div style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '6px' }}>
                    {t(tech.profession || 'technician')}
                  </div>
                  <div
                    style={{
                      padding: '3px 10px',
                      borderRadius: '12px',
                      background: tech.isOnline ? '#DCFCE7' : '#F1F5F9',
                      color: tech.isOnline ? '#166534' : '#64748B',
                      fontSize: '0.75rem',
                      display: 'inline-block',
                      fontWeight: 600,
                    }}
                  >
                    {tech.isOnline
                      ? `● ${t('online') || 'متصل'}`
                      : `○ ${t('offline') || 'غير متصل'}`}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default AdminLiveMap;
