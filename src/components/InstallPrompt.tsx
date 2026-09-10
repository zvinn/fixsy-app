// src/components/InstallPrompt.tsx
import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPrompt: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isVisible, setIsVisible] = useState<boolean>(false);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event): void => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            // Check if mobile
            if (typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
                setIsVisible(true);
            }
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async (): Promise<void> => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setIsVisible(false);
        }
    };

    const handleClose = (): void => {
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div
            role="dialog"
            aria-labelledby="install-prompt-title"
            aria-describedby="install-prompt-desc"
            style={{
                position: 'fixed',
                bottom: '20px',
                left: '20px',
                right: '20px',
                zIndex: 9999,
                background: '#fff',
                padding: '15px',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: '1px solid #e0e0e0'
            }}
        >
            <div style={{ flex: 1 }}>
                <h3 id="install-prompt-title" style={{ margin: '0 0 4px', fontSize: '16px', color: '#333' }}>
                    تثبيت Fixsy
                </h3>
                <p id="install-prompt-desc" style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                    أحصل على تجربة أفضل مع التطبيق
                </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
                <button
                    onClick={handleClose}
                    aria-label="إغلاق"
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#666',
                        fontSize: '14px',
                        cursor: 'pointer',
                        padding: '8px'
                    }}
                >
                    لا شكراً
                </button>
                <button
                    onClick={handleInstallClick}
                    aria-label="تثبيت التطبيق"
                    style={{
                        backgroundColor: '#0056D2',
                        color: '#fff',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}
                >
                    تثبيت
                </button>
            </div>
        </div>
    );
};

export default InstallPrompt;
