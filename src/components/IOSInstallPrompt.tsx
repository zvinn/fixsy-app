// src/components/IOSInstallPrompt.tsx
import { useState, useEffect } from 'react';
import { Share, PlusSquare, X } from 'lucide-react';
import safeLocalStorage from '../utils/safeLocalStorage';

interface IOSInstallPromptProps {
    t?: (key: string) => string;
}

const IOSInstallPrompt: React.FC<IOSInstallPromptProps> = ({ t }) => {
    const [isVisible, setIsVisible] = useState<boolean>(false);

    useEffect(() => {
        if (typeof navigator === 'undefined' || typeof window === 'undefined') return;

        // Detect iOS
        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
        // Detect if already installed (standalone mode)
        const isStandalone = (navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches;

        if (isIOS && !isStandalone) {
            const lastDismissed = safeLocalStorage.getItem('iosInstallPromptDismissed');
            const now = Date.now();
            // Show if never dismissed or dismissed more than 7 days ago
            if (!lastDismissed || now - parseInt(lastDismissed) > 7 * 24 * 60 * 60 * 1000) {
                setIsVisible(true);
            }
        }
    }, []);

    const handleClose = (): void => {
        setIsVisible(false);
        safeLocalStorage.setItem('iosInstallPromptDismissed', Date.now().toString());
    };

    if (!isVisible) return null;

    return (
        <div
            role="dialog"
            aria-labelledby="ios-install-title"
            aria-describedby="ios-install-desc"
            style={{
                position: 'fixed',
                bottom: '0',
                left: '0',
                width: '100%',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderTop: '1px solid #e0e0e0',
                padding: '20px',
                zIndex: 10000,
                boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
                animation: 'slideUp 0.5s ease-out'
            }}
        >
            <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative' }}>
                <button
                    onClick={handleClose}
                    aria-label="إغلاق"
                    style={{ position: 'absolute', top: '-10px', right: '0', background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}
                >
                    <X size={20} color="#666" aria-hidden="true" />
                </button>

                <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                    <img src="/logo192.png" alt="Fixsy logo" style={{ width: '60px', borderRadius: '14px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }} />
                    <div>
                        <h3 id="ios-install-title" style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 'bold' }}>
                            تثبيت Fixsy على الآيفون
                        </h3>
                        <p id="ios-install-desc" style={{ margin: '0 0 12px', fontSize: '14px', color: '#555', lineHeight: '1.5' }}>
                            لتجربة أفضل، أضف التطبيق إلى شاشتك الرئيسية.
                        </p>

                        <ol style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: '#333', margin: 0, padding: '0 20px' }}>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                اضغط على زر المشاركة <Share size={18} color="#007AFF" aria-hidden="true" />
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                اختر &quot;إضافة إلى الصفحة الرئيسية&quot; <PlusSquare size={18} aria-hidden="true" />
                            </li>
                        </ol>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes slideUp {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default IOSInstallPrompt;
