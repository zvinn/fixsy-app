// src/hooks/useClientProfile.ts
// Client profile hook for fetching and managing client data

import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { User } from 'firebase/auth';

import { ClientProfile as GlobalClientProfile } from '../types';

interface UseClientProfileProps {
    user: User | null;
    userRole: string | null;
}

interface UseClientProfileReturn {
    clientProfile: GlobalClientProfile | null;
    isLoading: boolean;
}

export const useClientProfile = ({ user, userRole }: UseClientProfileProps): UseClientProfileReturn => {
    const [clientProfile, setClientProfile] = useState<GlobalClientProfile | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        if (!user?.email || userRole !== 'client') {
            setIsLoading(false);
            return;
        }

        const q = query(collection(db, "clients"), where("email", "==", user.email));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                setClientProfile(snapshot.docs[0].data() as GlobalClientProfile);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user, userRole]);

    return {
        clientProfile,
        isLoading
    };
};

export default useClientProfile;
