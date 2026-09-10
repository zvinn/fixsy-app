// src/types/index.ts
// Complete TypeScript type definitions for Fixsy

import { Timestamp } from 'firebase/firestore';

// ==================== Client Types ====================

export interface ClientReview {
    techId: string;
    techName: string;
    rating: number;
    comment: string;
    date: Timestamp;
}

export type PaymentReliability = 'excellent' | 'good' | 'average' | 'poor';

export interface Client {
    id: string;
    email: string;
    name: string;
    phone?: string;
    address?: string;

    // NEW: Client Rating System
    rating: number;
    totalRatings: number;
    totalJobsCompleted: number;
    totalJobsCancelled: number;
    cancellationRate: number;
    paymentReliability: PaymentReliability;
    reviewsFromTechs: ClientReview[];

    // Existing fields
    createdAt: Timestamp;
    referralCode?: string;
    points?: number;
    streak?: number;
}

// ==================== Technician Types ====================

export interface TechnicianPreferences {
    autoAccept: boolean;
    minJobPrice?: number;
    maxDistance?: number;
    preferredAreas?: string[];
    acceptUrgentOnly?: boolean;
}

export interface Technician {
    id: string;
    email: string;
    name: string;
    phone: string;
    specialty: string;
    area: string;
    rating: number;
    completedJobs: number;

    // NEW: Technician Preferences
    preferences?: TechnicianPreferences;

    // Backward compatible fields
    image?: string;
    img?: string;
    portfolio?: string[];
    experience?: string;
    joinDate?: string;
    verified?: boolean;
    badges?: string[];
    earnings?: number;
    level?: number;
    isVerified?: boolean;
    role?: string;
    price?: number;
    workingHours?: {
        start: string;
        end: string;
        offDays?: string[];
    };
}

// ==================== Request/Booking Types ====================

export type RequestStatus =
    | 'pending' | 'viewed' | 'accepted' | 'rejected'
    | 'in-progress' | 'completed' | 'cancelled';

export interface TechnicianOffer {
    techId: string;
    techName: string;
    viewedAt: Timestamp;
    interestedAt?: Timestamp;
}

export interface ServiceRequest {
    id: string;
    clientId: string;
    clientName: string;
    problem: string;
    category: string;
    location: string;
    address?: string;
    phone: string;
    status: RequestStatus;
    assignedTo?: string;
    viewedBy: string[];
    offeredBy: TechnicianOffer[];
    suggestedPrice?: number;
    agreedPrice?: number;
    createdAt: Timestamp;
    scheduledFor?: Timestamp;
    acceptedAt?: Timestamp;
    completedAt?: Timestamp;
    photos?: string[];
    aiAnalysis?: {
        category: string;
        severity: string;
        estimatedCost: number;
    };
}

// ==================== Booking Types ====================

export interface BookingFormData {
    problem: string;
    category: string;
    location: string;
    address?: string;
    phone: string;
    scheduledDate?: string;
    scheduledTime?: string;
    urgency?: 'normal' | 'urgent';
    photos?: string[];
}

// ==================== AI Analysis Types ====================

export interface AIAnalysisResult {
    category: string;
    type?: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    estimatedCost: number;
    estimatedPrice?: number;
    estimatedDuration: string;
    recommendation: string;
    advice?: string;
    action?: string;
    requiredTools?: string[];
    icon?: string;              // Icon for display
    tips?: string[];            // Helpful tips array
}

// ==================== Service Types ====================

export interface ServiceItem {
    id: string;
    name: string;
    icon: string;
    category: string;
}

// ==================== Weather Types ====================

export interface WeatherAlert {
    show: boolean;
    message?: string;
    severity?: 'info' | 'warning' | 'danger';
    icon?: string;              // Icon for display
}

// ==================== Error Types ====================

export interface FirebaseErrorWithCode extends Error {
    code?: string;
}

export type LogLevel = 'log' | 'warn' | 'error' | 'debug';

export type LoggerData = Record<string, unknown> | null | undefined;

// ==================== User Profile Types ====================

export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    role?: 'client' | 'technician' | 'admin';
}

// ==================== Review/Rating Types ====================

export interface TechnicianReview {
    clientId: string;
    clientName: string;
    rating: number;
    comment: string;
    date: Timestamp;
}

export interface ClientRatingData {
    requestId: string;
    clientId: string;
    rating: number;
    comment: string;
    paymentReliability: PaymentReliability;
    wouldWorkAgain: boolean;
}

// ==================== Filter Types ====================

export interface RequestFilter {
    maxDistance?: number;
    minPrice?: number;
    maxPrice?: number;
    categories?: string[];
    areas?: string[];
    urgentOnly?: boolean;
}

// ==================== Stats Types ====================

export interface ClientStats {
    rating: number;
    totalJobs: number;
    completedJobs: number;
    cancelledJobs: number;
    cancellationRate: number;
    paymentReliability: PaymentReliability;
    memberSince: string;
}

// ==================== Client Profile Types ====================

export interface Address {
    id?: number;
    title: string;
    detail: string;
    coordinates?: {
        lat: number;
        lng: number;
    };
}

export interface ClientProfile {
    userId: string;
    name: string;
    email: string;
    phone?: string;
    photoURL?: string;
    addresses?: Address[];
    favoritesList?: string[];
    tier?: 'basic' | 'premium' | 'vip';
    points?: number;
    streak?: number;
    stats?: ClientStats;
    [key: string]: any; // For Firebase extensibility
}

// ==================== Utility Types ====================

/**
 * Translation function type for i18n support
 */
export type TranslationFunction = (
    key: string,
    params?: Record<string, any>
) => string;

/**
 * Generic callback for state setters
 */
export type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

/**
 * Voice command from speech recognition
 */
export interface VoiceCommand {
    transcript: string;
    confidence: number;
    timestamp: number;
}

/**
 * Browser SpeechRecognition types for Web Speech API
 */
export interface SpeechRecognitionWindow extends Window {
    SpeechRecognition?: any; // Browser API constructor
    webkitSpeechRecognition?: any; // Webkit prefix
}

export interface SpeechRecognitionEvent {
    results: SpeechRecognitionResultList;
    resultIndex: number;
}

export interface SpeechRecognitionErrorEvent {
    error: string;
    message: string;
}

// ==================== AI Service Types ====================

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface UserAIProfile {
    name?: string;
    location?: string;
    previousServices?: string[];
    preferences?: Record<string, unknown>;
}

// ==================== Firebase User Extension Types ====================

import { User as FirebaseUser } from 'firebase/auth';

/**
 * Extended User type that includes emergencyContact field
 * This extends Firebase Auth User with custom properties
 */
export interface UserWithEmergencyContact extends FirebaseUser {
    emergencyContact?: string;
}

// ==================== Canvas Confetti Types ====================

/**
 * Confetti configuration options
 */
export interface ConfettiOptions {
    particleCount?: number;
    spread?: number;
    origin?: { x?: number; y?: number };
    colors?: string[];
    startVelocity?: number;
    decay?: number;
    gravity?: number;
    drift?: number;
    ticks?: number;
    shapes?: string[];
    scalar?: number;
    zIndex?: number;
    disableForReducedMotion?: boolean;
}

/**
 * Confetti function type
 */
export type ConfettiFunction = (options?: ConfettiOptions) => Promise<null> | null;
