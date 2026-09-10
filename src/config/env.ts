// src/config/env.ts
/**
 * Centralized environment variable access with validation
 */

interface EnvironmentConfig {
    firebaseApiKey: string;
    firebaseAuthDomain: string;
    firebaseProjectId: string;
    cloudinaryCloudName: string;
    cloudinaryUploadPreset: string;
    googleAiKey?: string;
    groqApiKey?: string;
    geminiApiKey?: string;
    adminEmail?: string;
    sentryDsn?: string;
    nodeEnv: string;
    isDevelopment: boolean;
    isProduction: boolean;
}

class EnvironmentService {
    private config: EnvironmentConfig;

    constructor() {
        this.config = this.loadAndValidate();
    }

    private loadAndValidate(): EnvironmentConfig {
        const firebaseApiKey = import.meta.env.VITE_FIREBASE_API_KEY || '';
        const firebaseAuthDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '';
        const firebaseProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || '';
        const cloudinaryCloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
        const cloudinaryUploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '';
        const googleAiKey = import.meta.env.VITE_GOOGLE_AI_KEY;
        const groqApiKey = import.meta.env.VITE_GROQ_API_KEY;
        const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
        const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
        const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
        const nodeEnv = import.meta.env.MODE || 'development';

        return {
            firebaseApiKey,
            firebaseAuthDomain,
            firebaseProjectId,
            cloudinaryCloudName,
            cloudinaryUploadPreset,
            googleAiKey,
            groqApiKey,
            geminiApiKey,
            adminEmail,
            sentryDsn,
            nodeEnv,
            isDevelopment: nodeEnv === 'development',
            isProduction: nodeEnv === 'production'
        };
    }

    get firebase() {
        return {
            apiKey: this.config.firebaseApiKey,
            authDomain: this.config.firebaseAuthDomain,
            projectId: this.config.firebaseProjectId
        };
    }

    get cloudinary() {
        return {
            cloudName: this.config.cloudinaryCloudName,
            uploadPreset: this.config.cloudinaryUploadPreset
        };
    }

    get googleAi() {
        return this.config.googleAiKey || '';
    }

    get sentry() {
        return this.config.sentryDsn || '';
    }

    get groq() {
        return this.config.groqApiKey || '';
    }

    get gemini() {
        return this.config.geminiApiKey || '';
    }

    get adminEmail() {
        return this.config.adminEmail || '';
    }

    get environment() {
        return {
            nodeEnv: this.config.nodeEnv,
            isDevelopment: this.config.isDevelopment,
            isProduction: this.config.isProduction
        };
    }
}

export const env = new EnvironmentService();
