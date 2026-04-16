import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { AuthContext, type AuthContextType, type User } from './AuthContext';
import { isUserAdmin } from '../config/adminWhitelist';
import { auth, googleProvider } from '../lib/firebase';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signInWithPopup, 
    signOut, 
    onAuthStateChanged,
    updateProfile,
    deleteUser,
    reauthenticateWithCredential,
    EmailAuthProvider,
    reauthenticateWithPopup,
    GoogleAuthProvider
} from 'firebase/auth';

// Schema di validazione Zod
export const LoginSchema = z.object({
    email: z.string().email('Email non valida'),
    password: z.string().min(8, 'La password deve avere almeno 8 caratteri')
});

export const RegisterSchema = LoginSchema.extend({
    displayName: z.string().min(2, 'Il nome deve avere almeno 2 caratteri')
});

export const ForgotPasswordSchema = z.object({
    email: z.string().email('Email non valida')
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Initial check con Firebase OnAuthStateChanged
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                setUser({
                    uid: firebaseUser.uid,
                    email: firebaseUser.email || '',
                    displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Utente'
                });
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    // Firebase Email/Password Login
    const login = async (email: string, password: string) => {
        setError(null);
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            // Non serve setUser qui, onAuthStateChanged scatterà da solo
        } catch (err) {
            console.error("Login err:", err);
            const errorMsg = err instanceof Error ? err.message : "Errore durante il login. Controlla le credenziali.";
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // Firebase Register
    const register = async (email: string, password: string, displayName: string) => {
        setError(null);
        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            // Updating Profile with displayName
            if (userCredential.user) {
                await updateProfile(userCredential.user, { displayName });
                // Forza l'aggiornamento locale del context per reattività immediata
                setUser({
                    uid: userCredential.user.uid,
                    email: userCredential.user.email || email,
                    displayName
                });
            }
        } catch (err) {
            console.error("Register err:", err);
            const errorMsg = err instanceof Error ? err.message : "Errore durante la registrazione.";
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // Firebase Google Login
    const loginWithGoogle = async () => {
        setError(null);
        setLoading(true);
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (err) {
            console.error("Google login err:", err);
            const errorMsg = err instanceof Error ? err.message : "Errore durante il login con Google.";
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // Firebase Logout
    const logout = async () => {
        setError(null);
        try {
            await signOut(auth);
            setUser(null);
            // Ripulisce il fallback storage legacy se presente (cleanup opzionale)
            localStorage.removeItem('quiz_pl_auth');
        } catch (err) {
            console.error("Logout err:", err);
            const errorMsg = err instanceof Error ? err.message : "Errore durante il logout.";
            setError(errorMsg);
        }
    };

    // Firebase Account Deletion con gestione re-autenticazione
    const deleteAccount = async (password?: string) => {
        setError(null);
        setLoading(true);
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) throw new Error('Nessun utente loggato.');

            // Tenta eliminazione diretta
            try {
                await deleteUser(currentUser);
            } catch (firstErr) {
                // Se Firebase richiede ri-autenticazione
                if ((firstErr as {code?: string}).code === 'auth/requires-recent-login') {
                    const providerId = currentUser.providerData[0]?.providerId;

                    if (providerId === 'google.com') {
                        // Ri-autentica con Google
                        await reauthenticateWithPopup(currentUser, new GoogleAuthProvider());
                    } else if (password) {
                        // Ri-autentica con email+password fornita
                        const credential = EmailAuthProvider.credential(currentUser.email!, password);
                        await reauthenticateWithCredential(currentUser, credential);
                    } else {
                        throw new Error('Per motivi di sicurezza devi inserire la password per eliminare l\'account.');
                    }
                    // Secondo tentativo dopo ri-autenticazione
                    await deleteUser(currentUser);
                } else {
                    throw firstErr;
                }
            }

            setUser(null);
            // Rimuove solo le chiavi specifiche dell'app
            const APP_KEYS = ['pl_progress_v2', 'pl_user_profile', 'quiz_pl_auth'];
            APP_KEYS.forEach(key => localStorage.removeItem(key));
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : "Errore durante l'eliminazione.";
            setError(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const clearError = () => setError(null);

    const value: AuthContextType = {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        isAdmin: isUserAdmin(user?.email),
        login,
        register,
        loginWithGoogle,
        logout,
        deleteAccount,
        clearError
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
