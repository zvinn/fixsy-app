import logger from '../services/loggerService';

// Error messages for different languages
const errorMessages: Record<string, Record<string, string>> = {
    ar: {
        'auth/user-not-found': 'المستخدم غير موجود',
        'auth/wrong-password': 'كلمة المرور غير صحيحة',
        'auth/email-already-in-use': 'البريد الإلكتروني مستخدم بالفعل',
        'auth/weak-password': 'كلمة المرور ضعيفة',
        'auth/invalid-email': 'البريد الإلكتروني غير صحيح',
        'auth/popup-closed-by-user': 'تم إلغاء تسجيل الدخول',
        'auth/network-request-failed': 'فشل الاتصال بالشبكة',
        'permission-denied': 'ليس لديك صلاحية للوصول',
        'not-found': 'البيانات غير موجودة',
        'unavailable': 'الخدمة غير متاحة حالياً',
        'cancelled': 'تم إلغاء العملية',
        'unknown': 'حدث خطأ غير متوقع',
        'network-error': 'تحقق من اتصالك بالإنترنت',
        'quota-exceeded': 'تم تجاوز الحد المسموح، حاول لاحقاً',
        'invalid-data': 'البيانات المدخلة غير صحيحة'
    },
    en: {
        'auth/user-not-found': 'User not found',
        'auth/wrong-password': 'Incorrect password',
        'auth/email-already-in-use': 'Email already in use',
        'auth/weak-password': 'Password is too weak',
        'auth/invalid-email': 'Invalid email address',
        'auth/popup-closed-by-user': 'Login cancelled',
        'auth/network-request-failed': 'Network connection failed',
        'permission-denied': 'You don\'t have permission',
        'not-found': 'Data not found',
        'unavailable': 'Service temporarily unavailable',
        'cancelled': 'Operation cancelled',
        'unknown': 'An unexpected error occurred',
        'network-error': 'Check your internet connection',
        'quota-exceeded': 'Quota exceeded, try again later',
        'invalid-data': 'Invalid data provided'
    }
};

type Language = 'ar' | 'en';

/**
 * Get user-friendly error message
 * @param {string} errorCode - Firebase error code or custom code
 * @param {string} language - 'ar' or 'en'
 * @returns {string} User-friendly message
 */
export function getErrorMessage(errorCode: string, language: Language = 'ar'): string {
    const messages = errorMessages[language] || errorMessages.ar;
    return messages[errorCode] || messages.unknown;
}

/**
 * Parse Firebase error and return user-friendly message
 * @param {Error} error - Firebase error object
 * @param {string} language - 'ar' or 'en'
 * @returns {string} User-friendly message
 */
export function parseFirebaseError(error: unknown, language: Language = 'ar'): string {
    interface FirebaseError {
        code?: string;
        message?: string;
    }
    const code = (error as FirebaseError)?.code || 'unknown';
    return getErrorMessage(code, language);
}

/**
 * Log error to console (and optionally to analytics in production)
 * @param {string} context - Where the error occurred
 * @param {Error} error - The error object
 */
export function logError(context: string, error: unknown): void {
    const errorData = error instanceof Error
        ? { message: error.message, stack: error.stack, name: error.name }
        : { message: String(error) };

    logger.error(`[${context}]`, errorData);

    // In production, you could send to analytics:
    // if (process.env.NODE_ENV === 'production') {
    //   analytics.logEvent('error', { context, message: error.message });
    // }
}

interface StandardError {
    code: string;
    message: string;
    timestamp: string;
}

/**
 * Create a standardized error response
 * @param {string} code - Error code
 * @param {string} message - Error message
 * @returns {object} Standardized error object
 */
export function createError(code: string, message: string): StandardError {
    return {
        code,
        message,
        timestamp: new Date().toISOString()
    };
}

const errorUtils = {
    getErrorMessage,
    parseFirebaseError,
    logError,
    createError
};

export default errorUtils;
