// src/utils/performanceMonitor.ts
/**
 * Performance monitoring utility
 * Tracks page load times, API calls, and component renders
 */

import logger from '../services/loggerService';

interface PerformanceMetric {
    name: string;
    startTime: number;
    endTime?: number;
    duration?: number;
}

class PerformanceMonitor {
    private metrics: Map<string, PerformanceMetric> = new Map();

    /**
     * Start tracking a metric
     */
    start(name: string): void {
        this.metrics.set(name, {
            name,
            startTime: performance.now()
        });
    }

    /**
     * End tracking and log the metric
     */
    end(name: string, context?: Record<string, unknown>): void {
        const metric = this.metrics.get(name);

        if (!metric) {
            logger.warn(`Performance metric "${name}" not found`);
            return;
        }

        const endTime = performance.now();
        const duration = endTime - metric.startTime;

        metric.endTime = endTime;
        metric.duration = duration;

        // Log to logger service
        logger.trackPerformance(name, duration, context);

        // Clean up
        this.metrics.delete(name);
    }

    /**
     * Track page load time
     */
    trackPageLoad(): void {
        if (typeof window === 'undefined') return;

        window.addEventListener('load', () => {
            const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

            if (perfData) {
                const metrics = {
                    dns: perfData.domainLookupEnd - perfData.domainLookupStart,
                    tcp: perfData.connectEnd - perfData.connectStart,
                    ttfb: perfData.responseStart - perfData.requestStart,
                    download: perfData.responseEnd - perfData.responseStart,
                    domProcessing: perfData.domInteractive - perfData.responseEnd,
                    total: perfData.loadEventEnd - perfData.fetchStart
                };

                logger.trackPerformance('page-load', metrics.total, metrics);
            }
        });
    }

    /**
     * Track API call performance
     */
    trackApiCall(endpoint: string, method: string, duration: number, status: number): void {
        logger.trackPerformance('api-call', duration, {
            endpoint,
            method,
            status
        });
    }

    /**
     * Track component render time
     */
    trackComponentRender(componentName: string, duration: number): void {
        logger.trackPerformance('component-render', duration, {
            component: componentName
        });
    }

    /**
     * Get Web Vitals
     */
    trackWebVitals(): void {
        if (typeof window === 'undefined') return;

        // FCP - First Contentful Paint
        const paintEntries = performance.getEntriesByType('paint');
        const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');

        if (fcp) {
            logger.trackPerformance('fcp', fcp.startTime);
        }

        // LCP - Largest Contentful Paint
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            logger.trackPerformance('lcp', lastEntry.startTime);
        });

        observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }
}

export const performanceMonitor = new PerformanceMonitor();
export default performanceMonitor;
