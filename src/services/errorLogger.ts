import { collection, addDoc, serverTimestamp, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from './firebase';

interface ErrorLogOptions {
    severity?: 'low' | 'medium' | 'high' | 'critical';
    context?: string;
    userId?: string;
    userAgent?: string;
    url?: string;
    componentStack?: string | null;
}

interface UserFriendlyMessages {
    [key: string]: string;
}

class ErrorLogger {
    private userFriendlyMessages: UserFriendlyMessages = {
        'auth/user-not-found': 'لم يتم العثور على حسابك. يرجى التسجيل أولاً.',
        'auth/wrong-password': 'كلمة المرور غير صحيحة',
        'auth/email-already-in-use': 'البريد الإلكتروني مستخدم بالفعل',
        'auth/weak-password': 'كلمة المرور ضعيفة جداً',
        'auth/invalid-email': 'البريد الإلكتروني غير صحيح',
        'auth/network-request-failed': 'خطأ في الاتصال بالإنترنت',
        'permission-denied': 'ليس لديك صلاحية للقيام بهذا الإجراء',
        'not-found': 'البيانات المطلوبة غير موجودة',
        'unavailable': 'الخدمة غير متاحة حالياً. يرجى المحاولة لاحقاً',
        'default': 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى'
    };

    private recentErrors: Set<string> = new Set();
    private isDevelopment = import.meta.env.DEV;

    /**
     * Generate error fingerprint for deduplication
     */
    private getErrorFingerprint(error: Error, context?: string): string {
        return `${error.message}_${context || ''}_${error.stack?.substring(0, 100) || ''}`;
    }

    /**
     * Check if error was recently logged (prevent spam)
     */
    private async isDuplicateError(fingerprint: string): Promise<boolean> {
        // Check in-memory cache first
        if (this.recentErrors.has(fingerprint)) {
            return true;
        }

        // Check Firestore for recent duplicates (last 5 minutes)
        try {
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            const q = query(
                collection(db, 'errors'),
                where('fingerprint', '==', fingerprint),
                where('timestamp', '>', fiveMinutesAgo),
                limit(1)
            );
            const snapshot = await getDocs(q);
            return !snapshot.empty;
        } catch {
            // If check fails, log anyway
            return false;
        }
    }

    /**
     * Main error logging function - saves to console AND Firestore
     */
    async logError(error: Error, options: ErrorLogOptions = {}): Promise<void> {
        const {
            severity = 'medium',
            context = 'unknown',
            userId,
            userAgent = navigator.userAgent,
            url = window.location.href,
            componentStack
        } = options;

        // Generate fingerprint
        const fingerprint = this.getErrorFingerprint(error, context);

        // Check for duplicates
        const isDuplicate = await this.isDuplicateError(fingerprint);
        if (isDuplicate) {
            if (this.isDevelopment) {
                console.warn('⚠️ Duplicate error suppressed:', error.message);
            }
            return;
        }

        // Add to recent errors cache
        this.recentErrors.add(fingerprint);
        setTimeout(() => this.recentErrors.delete(fingerprint), 5 * 60 * 1000);

        // Console logging (always in development, only critical in production)
        if (this.isDevelopment || severity === 'critical') {
            console.error('🔴 Error logged:', {
                message: error.message,
                severity,
                context,
                stack: error.stack,
                componentStack
            });
        }

        // Save to Firestore (production only to avoid spam during development)
        if (!this.isDevelopment) {
            try {
                await addDoc(collection(db, 'errors'), {
                    message: error.message,
                    stack: error.stack || null,
                    componentStack: componentStack || null,
                    severity,
                    context,
                    userId: userId || null,
                    userAgent,
                    url,
                    fingerprint,
                    timestamp: serverTimestamp(),
                    resolved: false
                });
                // Logged to Firestore successfully (no console spam)
            } catch (firestoreError) {
                // Fallback: if Firestore fails, log to console
                console.error('❌ Failed to log to Firestore:', firestoreError);
                console.error('Original error:', error);
            }
        }
        // Development mode - error not saved to Firestore (already logged to console above)
    }

    /**
     * Get user-friendly error message
     */
    getUserFriendlyMessage(error: Error): string {
        const errorCode = (error as any).code;

        if (errorCode && this.userFriendlyMessages[errorCode]) {
            return this.userFriendlyMessages[errorCode];
        }

        // Check if error message contains known patterns
        for (const [key, message] of Object.entries(this.userFriendlyMessages)) {
            if (error.message.includes(key)) {
                return message;
            }
        }

        return this.userFriendlyMessages.default;
    }

    /**
     * Log to Sentry (placeholder for future integration)
     */
    logToSentry(error: Error, options: ErrorLogOptions = {}): void {
        // TODO: Integrate with Sentry when needed
        // Sentry.captureException(error, {
        //     level: options.severity,
        //     tags: { context: options.context }
        // });
        if (this.isDevelopment) {
            console.warn('📊 Sentry integration placeholder:', error.message);
        }
    }
}

export const errorLogger = new ErrorLogger();
export default errorLogger;
