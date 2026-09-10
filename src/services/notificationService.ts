import { messaging, getToken } from './firebase';
import { onMessage, MessagePayload, Unsubscribe } from 'firebase/messaging';
import { errorLogger } from './errorLogger';

export const requestForToken = async (): Promise<string | undefined> => {
    if (!messaging) return;
    try {
        const currentToken = await getToken(messaging, { vapidKey: 'BMD3L4w6j8q8r9f8u0y2k3l4m5n6o7p8q9r0s1t2u3v4w5x6y7z8a9b0c1d2e3f4' });
        if (currentToken) {
            // ✅ Token received (removed console.log)
            return currentToken;
        } else {
            // ✅ No token - need permission (removed console.log)
        }
    } catch (error) {
        errorLogger.logError(error instanceof Error ? error : new Error(String(error)), {
            severity: 'low',
            context: 'Notification Registration'
        });
    }
};

export const onMessageListener = (callback: (payload: MessagePayload) => void): Unsubscribe | undefined => {
    if (!messaging) return;
    return onMessage(messaging, (payload) => {
        callback(payload);
    });
};
