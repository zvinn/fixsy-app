// src/hooks/useTechnicians.ts
// Technician fetching and management hook

import { useState, useEffect, useMemo } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Technician } from '../types';
import safeLocalStorage from '../utils/safeLocalStorage';

interface ServiceMap {
    [key: string]: string[];
}

interface UseTechniciansReturn {
    technicians: Technician[];
    isLoading: boolean;
    error: string | null;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    filteredTechnicians: Technician[];
    serviceMap: ServiceMap;
    refreshTechnicians: () => Promise<void>;
}

const CACHE_KEY = 'cached_technicians';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useTechnicians = (): UseTechniciansReturn => {
    const [technicians, setTechnicians] = useState<Technician[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>("");

    // Service mapping for legacy data support
    const serviceMap: ServiceMap = {
        plumbing: ['plumbing', 'سباكة'],
        electricity: ['electricity', 'كهرباء'],
        carpentry: ['carpentry', 'نجارة'],
        ac: ['ac', 'تكييف'],
        painting: ['painting', 'نقاشة'],
        appliances: ['appliances', 'أجهزة', 'أجهزة منزلية'],
        dish: ['dish', 'دش'],
        alumetal: ['alumetal', 'الوميتال'],
        allServices: []
    };

    /**
     * Load technicians from cache
     */
    const loadFromCache = (): Technician[] | null => {
        try {
            const cached = safeLocalStorage.getItem(CACHE_KEY);
            if (!cached) return null;

            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp > CACHE_DURATION) {
                safeLocalStorage.removeItem(CACHE_KEY);
                return null;
            }
            return data;
        } catch {
            return null;
        }
    };

    /**
     * Save technicians to cache
     */
    const saveToCache = (techs: Technician[]): void => {
        try {
            safeLocalStorage.setItem(CACHE_KEY, JSON.stringify({
                data: techs,
                timestamp: Date.now()
            }));
        } catch (e) {
            console.warn("Failed to cache technicians:", e);
        }
    };

    /**
     * Fetch technicians from Firestore
     */
    const fetchTechnicians = async (): Promise<void> => {
        setError(null);

        // Try cache first
        const cached = loadFromCache();
        if (cached) {
            setTechnicians(cached);
            setIsLoading(false);
        }

        try {
            const querySnapshot = await getDocs(collection(db, "technicians"));
            const techs = querySnapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id
            })) as Technician[];

            setTechnicians(techs);
            saveToCache(techs);
        } catch (err) {
            console.error("Error fetching technicians:", err);
            setError("Failed to load technicians");
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch on mount
    useEffect(() => {
        fetchTechnicians();
    }, []);

    /**
     * Filter technicians by search term
     */
    const filteredTechnicians = useMemo(() => {
        if (!searchTerm.trim()) return technicians;

        const term = searchTerm.toLowerCase();
        return technicians.filter(tech => {
            const nameMatch = tech.name?.toLowerCase().includes(term);
            const specialtyMatch = tech.specialty?.toLowerCase().includes(term);

            // Check service map for matching specialty
            const mappedMatch = Object.entries(serviceMap).some(([key, values]) => {
                if (values.some(v => v.toLowerCase().includes(term))) {
                    return tech.specialty?.toLowerCase().includes(key);
                }
                return false;
            });

            return nameMatch || specialtyMatch || mappedMatch;
        });
    }, [technicians, searchTerm, serviceMap]);

    return {
        technicians,
        isLoading,
        error,
        searchTerm,
        setSearchTerm,
        filteredTechnicians,
        serviceMap,
        refreshTechnicians: fetchTechnicians
    };
};

export default useTechnicians;
