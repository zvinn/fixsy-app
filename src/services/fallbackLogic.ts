import type { AIAnalysisResult } from '../types';

// Fallback logic - returns proper types matching AIAnalysisResult from types/index.ts
const fallbackLogic = (text: string, language: string = 'ar'): AIAnalysisResult => {
    const tLower = text.toLowerCase();
    const isAr = language === 'ar';

    // Plumbing detection
    if (tLower.includes("ميه") || tLower.includes("سباك") || tLower.includes("تسريب") ||
        tLower.includes("water") || tLower.includes("leak") || tLower.includes("pipe")) {
        return {
            category: isAr ? "سباكة" : "Plumbing",
            type: isAr ? "سباكة" : "Plumbing",
            severity: 'high',
            estimatedCost: 200,
            estimatedPrice: 200,
            estimatedDuration: isAr ? '1-2 ساعات' : '1-2 hours',
            recommendation: isAr ? "أغلق محبس المياه فوراً" : "Turn off water valve immediately",
            advice: isAr ? "أغلق محبس المياه فوراً" : "Turn off water valve immediately",
            action: 'BOOK_REQUEST',
            tips: isAr ? ["تفقد المصدر", "جفف المكان", "اتصل بسباك"] : ["Check source", "Dry area", "Call plumber"],
            icon: '💧'
        };
    }

    // Electrical detection
    if (tLower.includes("كهرب") || tLower.includes("نور") || tLower.includes("فيش") ||
        tLower.includes("electric") || tLower.includes("light") || tLower.includes("power")) {
        return {
            category: isAr ? "كهرباء" : "Electrical",
            type: isAr ? "كهرباء" : "Electrical",
            severity: 'critical',
            estimatedCost: 250,
            estimatedPrice: 250,
            estimatedDuration: isAr ? '2-3 ساعات' : '2-3 hours',
            recommendation: isAr ? "افصل الكهرباء فوراً" : "Turn off power immediately",
            advice: isAr ? "افصل الكهرباء فوراً" : "Turn off power immediately",
            action: 'BOOK_REQUEST',
            tips: isAr ? ["لا تلمس الأسلاك", "أبعد الأطفال", "اتصل بكهربائي"] : ["Don't touch wires", "Safety first", "Call electrician"],
            icon: '⚡'
        };
    }

    // AC/HVAC detection
    if (tLower.includes("تكييف") || tLower.includes("ac") || tLower.includes("هواء")) {
        return {
            category: isAr ? "تكييف" : "AC/HVAC",
            type: isAr ? "تكييف" : "AC/HVAC",
            severity: 'medium',
            estimatedCost: 300,
            estimatedPrice: 300,
            estimatedDuration: isAr ? '1-3 ساعات' : '1-3 hours',
            recommendation: isAr ? "افحص الفلتر والمروحة" : "Check filter and fan",
            advice: isAr ? "افحص الفلتر والمروحة" : "Check filter and fan",
            action: 'BOOK_REQUEST',
            tips: isAr ? ["نظف الفلتر", "تحقق من الريموت", "اتصل بفني تكييف"] : ["Clean filter", "Check remote", "Call AC tech"],
            icon: '❄️'
        };
    }

    // Carpentry detection
    if (tLower.includes("نجار") || tLower.includes("باب") || tLower.includes("شباك") ||
        tLower.includes("carpen") || tLower.includes("door") || tLower.includes("window")) {
        return {
            category: isAr ? "نجارة" : "Carpentry",
            type: isAr ? "نجارة" : "Carpentry",
            severity: 'low',
            estimatedCost: 180,
            estimatedPrice: 180,
            estimatedDuration: isAr ? '1-2 ساعات' : '1-2 hours',
            recommendation: isAr ? "افحص المفصلات والأقفال" : "Check hinges and locks",
            advice: isAr ? "افحص المفصلات والأقفال" : "Check hinges and locks",
            action: 'BOOK_REQUEST',
            tips: isAr ? ["تحقق من التلف", "قس المقاسات", "اتصل بنجار"] : ["Check damage", "Measure size", "Call carpenter"],
            icon: '🪚'
        };
    }

    // Painting detection
    if (tLower.includes("دهان") || tLower.includes("نقاش") || tLower.includes("paint")) {
        return {
            category: isAr ? "دهانات" : "Painting",
            type: isAr ? "دهانات" : "Painting",
            severity: 'low',
            estimatedCost: 150,
            estimatedPrice: 150,
            estimatedDuration: isAr ? '2-4 ساعات' : '2-4 hours',
            recommendation: isAr ? "حدد المساحة المطلوبة" : "Determine area needed",
            advice: isAr ? "حدد المساحة المطلوبة" : "Determine area needed",
            action: 'BOOK_REQUEST',
            tips: isAr ? ["اختر اللون", "جهز المكان", "اتصل بنقاش"] : ["Choose color", "Prepare area", "Call painter"],
            icon: '🎨'
        };
    }

    // Default - General Maintenance
    return {
        category: isAr ? "صيانة عامة" : "General Maintenance",
        type: isAr ? "صيانة عامة" : "General Maintenance",
        severity: 'medium',
        estimatedCost: 150,
        estimatedPrice: 150,
        estimatedDuration: isAr ? '1 ساعة' : '1 hour',
        recommendation: isAr ? "يُنصح بفحص فني" : "Professional inspection recommended",
        advice: isAr ? "يُنصح بفحص فني" : "Professional inspection recommended",
        action: 'BOOK_REQUEST',
        tips: isAr ? ["وثق المشكلة", "تجنب التصليح الذاتي", "التواصل مع متخصص"] : ["Document issue", "Avoid DIY", "Contact specialist"],
        icon: '🔧'
    };
};

export default fallbackLogic;
