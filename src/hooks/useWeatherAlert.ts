// src/hooks/useWeatherAlert.ts
// Weather alert hook for real-time weather warnings from admin

import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

interface WeatherAlert {
    isActive: boolean;
    message?: string;
    severity?: 'info' | 'warning' | 'danger';
    affectedAreas?: string[];
    icon?: string;
}

interface UseWeatherAlertReturn {
    weatherAlert: WeatherAlert | null;
    isLoading: boolean;
}

export const useWeatherAlert = (): UseWeatherAlertReturn => {
    const [weatherAlert, setWeatherAlert] = useState<WeatherAlert | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const unsubscribe = onSnapshot(
            doc(db, "system", "weather_alert"),
            (docSnap) => {
                if (docSnap.exists() && docSnap.data().isActive) {
                    setWeatherAlert(docSnap.data() as WeatherAlert);
                } else {
                    setWeatherAlert(null);
                }
                setIsLoading(false);
            },
            (error) => {
                // ✅ Weather sync error (removed console.log)
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    return {
        weatherAlert,
        isLoading
    };
};

export default useWeatherAlert;
