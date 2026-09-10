
import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import toast from 'react-hot-toast';

const ReloadPrompt: React.FC = () => {
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            if (import.meta.env.DEV) {
                console.warn('SW Registered: ' + r);
            }
        },
        onRegisterError(error) {
            if (import.meta.env.DEV) {
                console.warn('SW registration error', error);
            }
        },
    });

    React.useEffect(() => {
        if (offlineReady) {
            toast.success('App is ready to work offline');
            setOfflineReady(false);
        }
    }, [offlineReady, setOfflineReady]);

    React.useEffect(() => {
        if (needRefresh) {
            toast(
                (t) => (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', direction: 'rtl' }}>
                        <span>🔄</span>
                        <span style={{ flex: 1, fontSize: '14px' }}>يوجد تحديث جديد</span>
                        <button
                            style={{
                                background: '#0056D2',
                                color: 'white',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: 'bold'
                            }}
                            onClick={() => {
                                updateServiceWorker(true);
                                toast.dismiss(t.id);
                            }}
                        >
                            تحديث
                        </button>
                        <button
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#94A3B8',
                                cursor: 'pointer',
                                fontSize: '18px',
                                padding: '4px'
                            }}
                            onClick={() => {
                                setNeedRefresh(false);
                                toast.dismiss(t.id);
                            }}
                        >
                            ✕
                        </button>
                    </div>
                ),
                {
                    duration: 8000, // Auto-dismiss after 8 seconds
                    position: 'top-center',
                    style: {
                        background: 'var(--bg-primary, white)',
                        color: 'var(--text, #333)',
                        borderRadius: '12px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                        padding: '12px 16px',
                        maxWidth: '350px'
                    }
                }
            );
        }
    }, [needRefresh, updateServiceWorker, setNeedRefresh]);

    return null;
};

export default ReloadPrompt;
