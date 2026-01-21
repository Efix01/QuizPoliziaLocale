import { useEffect, useCallback } from 'react';
import { useCookieConsent } from '../context/CookieContext';

// Google Analytics Measurement ID - set this in .env as VITE_GA_MEASUREMENT_ID
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;

// Declare gtag on window
declare global {
    interface Window {
        dataLayer: unknown[];
        gtag: (...args: unknown[]) => void;
    }
}

/**
 * Hook for Google Analytics integration with GDPR consent
 * Analytics scripts are loaded ONLY when user has given consent
 */
export const useAnalytics = () => {
    const { preferences, hasConsented } = useCookieConsent();

    // Load Google Analytics script dynamically
    useEffect(() => {
        // Only proceed if:
        // 1. User has consented
        // 2. Analytics preference is enabled
        // 3. We have a measurement ID configured
        // 4. Script hasn't been loaded yet
        if (
            !hasConsented ||
            !preferences.analytics ||
            !GA_MEASUREMENT_ID ||
            document.getElementById('ga-script')
        ) {
            return;
        }

        // Initialize dataLayer
        window.dataLayer = window.dataLayer || [];
        window.gtag = function gtag(...args: unknown[]) {
            window.dataLayer.push(args);
        };
        window.gtag('js', new Date());
        window.gtag('config', GA_MEASUREMENT_ID, {
            anonymize_ip: true, // GDPR: anonymize IP addresses
            cookie_flags: 'SameSite=None;Secure',
        });

        // Create and inject the script
        const script = document.createElement('script');
        script.id = 'ga-script';
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
        document.head.appendChild(script);

        console.log('[Analytics] Google Analytics initialized with consent');
    }, [hasConsented, preferences.analytics]);

    // Track page views
    const trackPageView = useCallback((path: string, title?: string) => {
        if (!preferences.analytics || !GA_MEASUREMENT_ID || !window.gtag) {
            return;
        }

        window.gtag('config', GA_MEASUREMENT_ID, {
            page_path: path,
            page_title: title,
        });
    }, [preferences.analytics]);

    // Track custom events
    const trackEvent = useCallback((
        eventName: string,
        eventParams?: Record<string, unknown>
    ) => {
        if (!preferences.analytics || !GA_MEASUREMENT_ID || !window.gtag) {
            return;
        }

        window.gtag('event', eventName, eventParams);
    }, [preferences.analytics]);

    return {
        trackPageView,
        trackEvent,
        isEnabled: preferences.analytics && !!GA_MEASUREMENT_ID,
    };
};

export default useAnalytics;
