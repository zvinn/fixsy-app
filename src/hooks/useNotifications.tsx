// src/hooks/useNotifications.tsx
// Notifications hook with sound alerts and browser notifications

import { useState, useEffect, useRef, useCallback } from 'react';
import { db } from '../services/firebase';
import { collection, query, where, onSnapshot, getDocs, updateDoc, doc } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { requestForToken, onMessageListener } from '../services/notificationService';
import toast from 'react-hot-toast';

interface UseNotificationsProps {
    user: User | null;
    t: (key: string) => string;
}

interface UseNotificationsReturn {
    unreadCount: number;
    isRinging: boolean;
    initializeNotifications: () => Promise<void>;
}

const NOTIFICATION_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

/**
 * Custom notification toast component
 */
const NotificationToast: React.FC<{ title?: string; body?: string }> = ({ title, body }) => (
    <div style={{
        background: 'white',
        padding: '16px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        border: '1px solid #e0e0e0'
    }}>
        <img src="/logo192.png" alt="Logo" style={{ width: '40px', height: '40px' }} />
        <div>
            <h4 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 'bold' }}>
                {title}
            </h4>
            <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
                {body}
            </p>
        </div>
    </div>
);

export const useNotifications = ({ user, t }: UseNotificationsProps): UseNotificationsReturn => {
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [isRinging, setIsRinging] = useState<boolean>(false);

    const notificationSound = useRef<HTMLAudioElement | null>(null);
    const prevUnreadCount = useRef<number>(0);

    // Initialize audio on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            notificationSound.current = new Audio(NOTIFICATION_SOUND_URL);
        }
    }, []);

    /**
     * Save FCM token to Firestore
     */
    const saveUserToken = async (email: string, token: string): Promise<void> => {
        try {
            const q = query(collection(db, "clients"), where("email", "==", email));
            const snap = await getDocs(q);
            if (!snap.empty) {
                await updateDoc(doc(db, "clients", snap.docs[0].id), { fcmToken: token });
            }
        } catch (error) {
            console.error("Error saving FCM token:", error);
        }
    };

    /**
     * Initialize push notifications
     */
    const initializeNotifications = useCallback(async (): Promise<void> => {
        if (!user?.email) return;

        try {
            const token = await requestForToken();
            if (token) {
                await saveUserToken(user.email, token);
            }
        } catch (error) {
            console.error("Failed to initialize notifications:", error);
        }
    }, [user]);

    // Initialize notifications when user changes
    useEffect(() => {
        if (user) {
            initializeNotifications();
        }
    }, [user, initializeNotifications]);

    // Listen for foreground messages
    useEffect(() => {
        if (!user) return;

        const unsubscribe = onMessageListener((payload: any) => {
            // ✅ Notification payload received (removed console.log)
            toast.custom(() => (
                <NotificationToast
                    title={payload?.notification?.title}
                    body={payload?.notification?.body}
                />
            ), { duration: 5000 });
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [user]);

    // Listen for unread notifications
    useEffect(() => {
        if (!user?.email) return;

        const q = query(
            collection(db, "notifications"),
            where("userId", "==", user.email),
            where("read", "==", false)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newCount = snapshot.size;

            // Play sound and animate if count increased
            if (newCount > prevUnreadCount.current) {
                notificationSound.current?.play().catch(e => {
                    // ✅ Audio play failed silently (removed console.log)
                });
                setIsRinging(true);
                setTimeout(() => setIsRinging(false), 1000);

                // Browser notification if supported and tab is hidden
                if (Notification.permission === "granted" && document.hidden) {
                    new Notification("Fixsy", {
                        body: t("newNotification"),
                        icon: "/logo192.png"
                    });
                }
            }

            setUnreadCount(newCount);
            prevUnreadCount.current = newCount;
        });

        return () => unsubscribe();
    }, [user, t]);

    return {
        unreadCount,
        isRinging,
        initializeNotifications
    };
};

export default useNotifications;
