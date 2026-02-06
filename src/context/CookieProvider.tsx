import React, { useState, type ReactNode } from 'react';
import { CookieContext, type CookiePreferences, type CookieConsentState, type CookieContextType } from './CookieContext';
import { STORAGE_KEYS } from '../constants';

<<<<<<< HEAD:src/context/CookieProvider.tsx
=======
// Cookie preference types
export interface CookiePreferences {
    necessary: boolean;  // Always true, cannot be disabled
    analytics: boolean;
    marketing: boolean;
}

export interface CookieConsentState {
    hasConsented: boolean;
    showBanner: boolean;
    showPreferences: boolean;
    preferences: CookiePreferences;
}

interface CookieContextType extends CookieConsentState {
    acceptAll: () => void;
    rejectNonEssential: () => void;
    savePreferences: (prefs: Partial<CookiePreferences>) => void;
    openPreferences: () => void;
    closePreferences: () => void;
    resetConsent: () => void;
}

import { STORAGE_KEYS } from '../constants';

>>>>>>> ee0c0ea0426f1702a579c3697492238db91d5a62:src/context/CookieContext.tsx
const STORAGE_KEY = STORAGE_KEYS.COOKIE_PREFERENCES;

const defaultPreferences: CookiePreferences = {
    necessary: true,
    analytics: false,
    marketing: false,
};

interface CookieProviderProps {
    children: ReactNode;
}

export const CookieProvider: React.FC<CookieProviderProps> = ({ children }) => {
    const [state, setState] = useState<CookieConsentState>(() => {
        // Check localStorage for existing consent
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                return {
                    hasConsented: true,
                    showBanner: false,
                    showPreferences: false,
                    preferences: {
                        necessary: true, // Always true
                        analytics: parsed.analytics ?? false,
                        marketing: parsed.marketing ?? false,
                    },
                };
            }
        } catch (e) {
            console.error('Error reading cookie consent from localStorage:', e);
        }

        // No consent stored, show banner
        return {
            hasConsented: false,
            showBanner: true,
            showPreferences: false,
            preferences: defaultPreferences,
        };
    });

    // Persist consent to localStorage
    const persistConsent = (preferences: CookiePreferences) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                analytics: preferences.analytics,
                marketing: preferences.marketing,
                consentDate: new Date().toISOString(),
            }));
        } catch (e) {
            console.error('Error saving cookie consent to localStorage:', e);
        }
    };

    const acceptAll = () => {
        const allAccepted: CookiePreferences = {
            necessary: true,
            analytics: true,
            marketing: true,
        };
        persistConsent(allAccepted);
        setState({
            hasConsented: true,
            showBanner: false,
            showPreferences: false,
            preferences: allAccepted,
        });
    };

    const rejectNonEssential = () => {
        const essentialOnly: CookiePreferences = {
            necessary: true,
            analytics: false,
            marketing: false,
        };
        persistConsent(essentialOnly);
        setState({
            hasConsented: true,
            showBanner: false,
            showPreferences: false,
            preferences: essentialOnly,
        });
    };

    const savePreferences = (prefs: Partial<CookiePreferences>) => {
        const newPreferences: CookiePreferences = {
            necessary: true, // Always true
            analytics: prefs.analytics ?? state.preferences.analytics,
            marketing: prefs.marketing ?? state.preferences.marketing,
        };
        persistConsent(newPreferences);
        setState({
            hasConsented: true,
            showBanner: false,
            showPreferences: false,
            preferences: newPreferences,
        });
    };

    const openPreferences = () => {
        setState(prev => ({ ...prev, showPreferences: true }));
    };

    const closePreferences = () => {
        setState(prev => ({ ...prev, showPreferences: false }));
    };

    const resetConsent = () => {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (e) {
            console.error('Error removing cookie consent from localStorage:', e);
        }
        setState({
            hasConsented: false,
            showBanner: true,
            showPreferences: false,
            preferences: defaultPreferences,
        });
    };

    const value: CookieContextType = {
        ...state,
        acceptAll,
        rejectNonEssential,
        savePreferences,
        openPreferences,
        closePreferences,
        resetConsent,
    };

    return (
        <CookieContext.Provider value={value}>
            {children}
        </CookieContext.Provider>
    );
};
