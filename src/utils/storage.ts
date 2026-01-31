/**
 * Safe LocalStorage wrapper to prevent crashes in private modes or restricted environments.
 */

// Generic getter
export const getSafeItem = <T>(key: string, parseJson = false): T | null => {
    try {
        const item = localStorage.getItem(key);
        if (!item) return null;
        if (parseJson) {
            try {
                return JSON.parse(item) as T;
            } catch (e) {
                console.warn(`Error parsing JSON for key "${key}":`, e);
                return null;
            }
        }
        return item as unknown as T;
    } catch (error) {
        console.warn(`LocalStorage ACCESS DENIED for key "${key}":`, error);
        return null;
    }
};

// Generic setter
export const setSafeItem = (key: string, value: any, stringify = false): void => {
    try {
        const valueToStore = stringify ? JSON.stringify(value) : value;
        localStorage.setItem(key, valueToStore);
    } catch (error) {
        console.warn(`LocalStorage SET FAILED for key "${key}":`, error);
    }
};

// Generic remover
export const removeSafeItem = (key: string): void => {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.warn(`LocalStorage REMOVE FAILED for key "${key}":`, error);
    }
};
