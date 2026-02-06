import { createContext, useContext } from 'react';

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

export interface CookieContextType extends CookieConsentState {
    acceptAll: () => void;
    rejectNonEssential: () => void;
    savePreferences: (prefs: Partial<CookiePreferences>) => void;
    openPreferences: () => void;
    closePreferences: () => void;
    resetConsent: () => void;
}

export const CookieContext = createContext<CookieContextType | undefined>(undefined);

export const useCookieConsent = (): CookieContextType => {
    const context = useContext(CookieContext);
    if (!context) {
        throw new Error('useCookieConsent must be used within a CookieProvider');
    }
    return context;
};


