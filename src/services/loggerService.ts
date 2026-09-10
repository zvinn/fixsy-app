// src/services/loggerService.ts

import { LoggerData } from '../types';

// This service is a facade for whatever logging/monitoring solution we choose (Sentry, LogRocket, etc.)
// For now, it enhances console logging with styling and environment checks.

const STYLES = {
    info: 'background: #eff6ff; color: #2563eb; padding: 2px 5px; border-radius: 4px; font-weight: bold;',
    warn: 'background: #fffbeb; color: #d97706; padding: 2px 5px; border-radius: 4px; font-weight: bold;',
    error: 'background: #fef2f2; color: #dc2626; padding: 2px 5px; border-radius: 4px; font-weight: bold;',
    debug: 'background: #f3f4f6; color: #4b5563; padding: 2px 5px; border-radius: 4px; font-weight: bold;'
};

class LoggerService {
    private isDev: boolean;

    constructor() {
        this.isDev = import.meta.env.DEV;
    }

    log(message: string, data: LoggerData = null): void {
        if (this.isDev) {
            // ✅ Development only - safe for production
            console.warn(`%cINFO%c ${message}`, STYLES.info, 'color: inherit;', data || '');
        }
    }

    warn(message: string, data: LoggerData = null): void {
        console.warn(`%cWARN%c ${message}`, STYLES.warn, 'color: inherit;', data || '');
        // In production: Sentry.captureMessage(message, 'warning');
    }

    error(message: string, error: LoggerData = null, context: Record<string, unknown> = {}): void {
        console.error(`%cERROR%c ${message}`, STYLES.error, 'color: inherit;', error || '');

        // Example Sentry Integration (Mock)
        // if (!this.isDev) {
        //    Sentry.captureException(error, { extra: context });
        // }
    }

    debug(message: string, data: LoggerData = null): void {
        if (this.isDev) {
            console.debug(`%cDEBUG%c ${message}`, STYLES.debug, 'color: inherit;', data || '');
        }
    }

    trackPerformance(name: string, duration: number, context: Record<string, unknown> = {}): void {
        if (this.isDev) {
            console.warn(`%cPERF%c ${name}: ${duration.toFixed(2)}ms`, 'background: #fdf2f8; color: #db2777; padding: 2px 5px; border-radius: 4px; font-weight: bold;', 'color: inherit;', context);
        }
    }
}

const logger = new LoggerService();
export default logger;
