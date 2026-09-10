// src/constants/errorCodes.js
// Centralized error messages with i18n support

/**
 * Firebase and custom error codes with translations
 */
export const ERROR_MESSAGES = {
    ar: {
        // Auth Errors
        'auth/user-not-found': 'المستخدم غير موجود',
        'auth/wrong-password': 'كلمة المرور غير صحيحة',
        'auth/email-already-in-use': 'البريد الإلكتروني مستخدم بالفعل',
        'auth/weak-password': 'كلمة المرور ضعيفة',
        'auth/invalid-email': 'البريد الإلكتروني غير صحيح',
        'auth/popup-closed-by-user': 'تم إلغاء تسجيل الدخول',
        'auth/network-request-failed': 'فشل الاتصال بالشبكة',

        // Firestore Errors
        'permission-denied': 'ليس لديك صلاحية للوصول',
        'not-found': 'البيانات غير موجودة',
        'unavailable': 'الخدمة غير متاحة حالياً',
        'cancelled': 'تم إلغاء العملية',

        // Custom App Errors
        'unknown': 'حدث خطأ غير متوقع',
        'network-error': 'تحقق من اتصالك بالإنترنت',
        'quota-exceeded': 'تم تجاوز الحد المسموح، حاول لاحقاً',
        'invalid-data': 'البيانات المدخلة غير صحيحة',
        'booking-failed': 'فشل في إنشاء الحجز',
        'tech-not-found': 'الفني غير موجود',
        'already-booked': 'لديك حجز نشط بالفعل'
    },
    en: {
        // Auth Errors
        'auth/user-not-found': 'User not found',
        'auth/wrong-password': 'Incorrect password',
        'auth/email-already-in-use': 'Email already in use',
        'auth/weak-password': 'Password is too weak',
        'auth/invalid-email': 'Invalid email address',
        'auth/popup-closed-by-user': 'Login cancelled',
        'auth/network-request-failed': 'Network connection failed',

        // Firestore Errors
        'permission-denied': 'You don\'t have permission',
        'not-found': 'Data not found',
        'unavailable': 'Service temporarily unavailable',
        'cancelled': 'Operation cancelled',

        // Custom App Errors
        'unknown': 'An unexpected error occurred',
        'network-error': 'Check your internet connection',
        'quota-exceeded': 'Quota exceeded, try again later',
        'invalid-data': 'Invalid data provided',
        'booking-failed': 'Failed to create booking',
        'tech-not-found': 'Technician not found',
        'already-booked': 'You already have an active booking'
    }
};

/**
 * Get user-friendly error message
 * @param {string} errorCode - Firebase or custom error code
 * @param {string} language - 'ar' or 'en'
 * @returns {string} Translated error message
 */
export const getErrorMessage = (errorCode, language = 'ar') => {
    const messages = ERROR_MESSAGES[language] || ERROR_MESSAGES.ar;
    return messages[errorCode] || messages.unknown;
};

/**
 * Parse Firebase error and return user-friendly message
 * @param {Error} error - Firebase error object
 * @param {string} language - 'ar' or 'en'
 * @returns {string} Translated error message
 */
export const parseFirebaseError = (error, language = 'ar') => {
    const code = error?.code || 'unknown';
    return getErrorMessage(code, language);
};

export default ERROR_MESSAGES;
