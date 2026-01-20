import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    type User,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, displayName: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Listen to auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Login with email/password
    const login = async (email: string, password: string) => {
        setError(null);
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err);
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Register new user
    const register = async (email: string, password: string, displayName: string) => {
        setError(null);
        setLoading(true);
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            // Update display name
            await updateProfile(result.user, { displayName });
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err);
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Login with Google
    const loginWithGoogle = async () => {
        setError(null);
        setLoading(true);
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err);
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Logout
    const logout = async () => {
        setError(null);
        try {
            await signOut(auth);
        } catch (err: unknown) {
            const errorMessage = getErrorMessage(err);
            setError(errorMessage);
            throw err;
        }
    };

    const clearError = () => setError(null);

    // Helper function to get readable error messages
    const getErrorMessage = (err: unknown): string => {
        if (err && typeof err === 'object' && 'code' in err) {
            const code = (err as { code: string }).code;
            switch (code) {
                case 'auth/email-already-in-use':
                    return 'Questa email è già registrata. Prova ad accedere.';
                case 'auth/invalid-email':
                    return 'Email non valida.';
                case 'auth/weak-password':
                    return 'La password deve avere almeno 6 caratteri.';
                case 'auth/user-not-found':
                    return 'Utente non trovato. Registrati prima.';
                case 'auth/wrong-password':
                    return 'Password errata.';
                case 'auth/invalid-credential':
                    return 'Credenziali non valide.';
                case 'auth/popup-closed-by-user':
                    return 'Finestra di login chiusa.';
                default:
                    return 'Errore durante l\'autenticazione.';
            }
        }
        return 'Errore sconosciuto.';
    };

    const value: AuthContextType = {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        login,
        register,
        loginWithGoogle,
        logout,
        clearError
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
