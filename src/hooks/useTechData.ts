// src/hooks/useTechData.ts
import { useState, useCallback, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, addDoc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import toast from 'react-hot-toast';

interface TechData {
    wallet: number;
    rating: number;
    completedCount: number;
    isAvailable: boolean;
    schedule?: {
        monday?: { startTime: string; endTime: string };
        tuesday?: { startTime: string; endTime: string };
        wednesday?: { startTime: string; endTime: string };
        thursday?: { startTime: string; endTime: string };
        friday?: { startTime: string; endTime: string };
        saturday?: { startTime: string; endTime: string };
        sunday?: { startTime: string; endTime: string };
    };
}

interface BookingRequest {
    id: string;
    status: string;
    [key: string]: unknown;
}

interface Transaction {
    id: string;
    amount: number;
    date: string;
    type: string;
    [key: string]: unknown;
}

export function useTechData(userEmail: string | null | undefined) {
    const [techData, setTechData] = useState<TechData>({
        wallet: 0,
        rating: 0,
        completedCount: 0,
        isAvailable: false,
        schedule: {}
    });
    const [requests, setRequests] = useState<BookingRequest[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch tech data
    const fetchTechData = useCallback(async () => {
        if (!userEmail) return;

        try {
            const q = query(collection(db, "technicians"), where("email", "==", userEmail));
            const snap = await getDocs(q);

            if (!snap.empty) {
                const data = snap.docs[0].data() as TechData;
                setTechData(data);
            }
        } catch (error) {
            console.error('Error fetching tech data:', error);
        }
    }, [userEmail]);

    // Fetch requests
    const fetchRequests = useCallback(async () => {
        if (!userEmail) return;

        try {
            const q = query(collection(db, "bookingRequests"), where("techEmail", "==", userEmail));
            const snap = await getDocs(q);
            setRequests(snap.docs.map(d => ({ ...d.data(), id: d.id } as BookingRequest)));
        } catch (error) {
            console.error('Error fetching requests:', error);
        }
    }, [userEmail]);

    // Fetch transactions
    const fetchTransactions = useCallback(async () => {
        if (!userEmail) return;

        try {
            const q = query(collection(db, "transactions"), where("techEmail", "==", userEmail));
            const snap = await getDocs(q);
            setTransactions(snap.docs.map(d => ({ ...d.data(), id: d.id } as Transaction)));
        } catch (error) {
            console.error('Error fetching transactions:', error);
        }
    }, [userEmail]);

    // Toggle availability
    const toggleAvailability = useCallback(async () => {
        if (!userEmail) return;

        try {
            const q = query(collection(db, "technicians"), where("email", "==", userEmail));
            const snap = await getDocs(q);

            if (!snap.empty) {
                const docId = snap.docs[0].id;
                const newStatus = !techData.isAvailable;
                await updateDoc(doc(db, "technicians", docId), { isAvailable: newStatus });
                setTechData(prev => ({ ...prev, isAvailable: newStatus }));
                toast.success(newStatus ? "Available" : "Unavailable");
            }
        } catch (error) {
            toast.error("Failed to update status");
        }
    }, [userEmail, techData.isAvailable]);

    // Update request status
    const updateStatus = useCallback(async (request: BookingRequest, newStatus: string) => {
        try {
            await updateDoc(doc(db, "bookingRequests", request.id), { status: newStatus });

            // Send notification
            if (request.clientEmail) {
                await addDoc(collection(db, "notifications"), {
                    userId: request.clientEmail,
                    message: `Request status updated to: ${newStatus}`,
                    date: new Date().toISOString(),
                    read: false
                });
            }

            await fetchRequests();
            toast.success("Status updated");
        } catch (error) {
            toast.error("Failed to update status");
        }
    }, [fetchRequests]);

    // Save schedule
    const saveSchedule = useCallback(async (schedule: TechData['schedule']) => {
        if (!userEmail) return;

        try {
            const q = query(collection(db, "technicians"), where("email", "==", userEmail));
            const snap = await getDocs(q);

            if (!snap.empty) {
                const docId = snap.docs[0].id;
                await updateDoc(doc(db, "technicians", docId), { schedule });
                setTechData(prev => ({ ...prev, schedule }));
                toast.success("Schedule saved");
            }
        } catch (error) {
            toast.error("Failed to save schedule");
        }
    }, [userEmail]);

    // Update location
    const updateLocation = useCallback(async (lat: number, lng: number) => {
        if (!userEmail) return;

        try {
            await setDoc(doc(db, "techLocations", userEmail), {
                lat,
                lng,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error updating location:', error);
        }
    }, [userEmail]);

    // Initial data fetch
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([
                fetchTechData(),
                fetchRequests(),
                fetchTransactions()
            ]);
            setLoading(false);
        };

        if (userEmail) {
            loadData();
        }
    }, [userEmail, fetchTechData, fetchRequests, fetchTransactions]);

    return {
        techData,
        requests,
        transactions,
        loading,
        toggleAvailability,
        updateStatus,
        saveSchedule,
        updateLocation,
        refreshData: useCallback(async () => {
            await Promise.all([fetchTechData(), fetchRequests(), fetchTransactions()]);
        }, [fetchTechData, fetchRequests, fetchTransactions])
    };
}
