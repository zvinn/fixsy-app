// src/constants/serviceTypes.js
// Centralized service type definitions for Fixsy

import { Wrench, Zap, Hammer, Wind, PaintRoller, Tv, Satellite, Grid, Flame } from 'lucide-react';

/**
 * Service type configurations with translations, icons, and colors
 */
export const SERVICE_TYPES = {
    plumbing: {
        id: 'plumbing',
        keywords: ['plumbing', 'سباكة', 'plumber', 'water', 'pipe', 'leak', 'ماسورة', 'تسريب'],
        color: '#3B82F6',
        bg: '#EFF6FF',
        icon: Wrench
    },
    electricity: {
        id: 'electricity',
        keywords: ['electricity', 'كهرباء', 'electric', 'power', 'wire', 'socket', 'سلك', 'بريزة'],
        color: '#EAB308',
        bg: '#FEFCE8',
        icon: Zap
    },
    carpentry: {
        id: 'carpentry',
        keywords: ['carpentry', 'نجارة', 'carpenter', 'wood', 'furniture', 'door', 'خشب', 'أثاث', 'باب'],
        color: '#A16207',
        bg: '#FEF3C7',
        icon: Hammer
    },
    ac: {
        id: 'ac',
        keywords: ['ac', 'تكييف', 'air conditioner', 'cooling', 'hvac', 'مكيف', 'تبريد'],
        color: '#0EA5E9',
        bg: '#E0F2FE',
        icon: Wind
    },
    painting: {
        id: 'painting',
        keywords: ['painting', 'نقاشة', 'painter', 'paint', 'wall', 'دهان', 'حيطة'],
        color: '#D946EF',
        bg: '#FAE8FF',
        icon: PaintRoller
    },
    appliances: {
        id: 'appliances',
        keywords: ['appliances', 'أجهزة', 'أجهزة منزلية', 'washer', 'fridge', 'غسالة', 'ثلاجة'],
        color: '#64748B',
        bg: '#F1F5F9',
        icon: Tv
    },
    dish: {
        id: 'dish',
        keywords: ['dish', 'دش', 'satellite', 'receiver', 'ريسيفر'],
        color: '#6366F1',
        bg: '#EEF2FF',
        icon: Satellite
    },
    gas: {
        id: 'gas',
        keywords: ['gas', 'غاز', 'بوتاجاز', 'stove', 'heater'],
        color: '#F97316',
        bg: '#FFF7ED',
        icon: Flame
    },
    allServices: {
        id: 'allServices',
        keywords: [],
        color: '#64748B',
        bg: '#F1F5F9',
        icon: Grid
    }
};

/**
 * Get service list for display (with React components)
 */
export const getServicesList = () => {
    return Object.values(SERVICE_TYPES).map(service => ({
        id: service.id,
        icon: service.icon,
        color: service.color,
        bg: service.bg
    }));
};

/**
 * Legacy mapping for DB compatibility
 */
export const SERVICE_MAP = {
    plumbing: ['plumbing', 'سباكة'],
    electricity: ['electricity', 'كهرباء'],
    carpentry: ['carpentry', 'نجارة'],
    ac: ['ac', 'تكييف'],
    painting: ['painting', 'نقاشة'],
    appliances: ['appliances', 'أجهزة', 'أجهزة منزلية'],
    dish: ['dish', 'دش'],
    alumetal: ['alumetal', 'الوميتال'],
    gas: ['gas', 'غاز'],
    allServices: []
};

/**
 * Find service type from keyword
 * @param {string} keyword - Search keyword
 * @returns {string|null} Service ID or null
 */
export const findServiceByKeyword = (keyword) => {
    const lowerKeyword = keyword.toLowerCase();
    for (const [serviceId, service] of Object.entries(SERVICE_TYPES)) {
        if (service.keywords.some(kw => lowerKeyword.includes(kw.toLowerCase()))) {
            return serviceId;
        }
    }
    return null;
};

export default SERVICE_TYPES;
