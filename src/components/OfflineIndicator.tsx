// src/components/OfflineIndicator.tsx
// Offline Status Banner with accessibility support
import { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const OfflineIndicator: React.FC = () => {
    const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
    const [showBanner, setShowBanner] = useState<boolean>(false);
    const { t } = useLanguage();

    useEffect(() => {
        const handleOnline = (): void => {
            setIsOnline(true);
            // Show "back online" briefly then hide
            setShowBanner(true);
            setTimeout(() => setShowBanner(false), 3000);
        };

        const handleOffline = (): void => {
            setIsOnline(false);
            setShowBanner(true);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Show banner initially if offline
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
            setShowBanner(true);
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!showBanner) return null;

    return (
        <div
            role="alert"
            aria-live="polite"
            aria-atomic="true"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                padding: '12px 20px',
                background: isOnline
                    ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                    : 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                zIndex: 9999,
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                animation: 'slideDown 0.3s ease-out',
                fontWeight: 'bold',
                fontSize: '0.95rem'
            }}
        >
            {isOnline ? (
                <>
                    <Wifi size={20} aria-hidden="true" />
                    {t("backOnline") || "You're back online!"}
                </>
            ) : (
                <>
                    <WifiOff size={20} aria-hidden="true" />
                    {t("offlineMode") || "You're offline. Some features may be limited."}
                </>
            )}
        </div>
    );
};

export default OfflineIndicator;
