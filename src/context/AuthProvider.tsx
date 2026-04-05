import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { AuthContext, type AuthContextType, type User } from './AuthContext';
import { auth, googleProvider } from '../lib/firebase';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signInWithPopup, 
    signOut, 
    onAuthStateChanged,
    updateProfile,
    deleteUser
} from 'firebase/auth';

// Schema di validazione Zod
export const LoginSchema = z.object({
    email: z.string().email('Email non valida'),
    password: z.string().min(6, 'La password deve avere almeno 6 caratteri')
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
        } catch (err: any) {
            console.error("Login err:", err);
            setError(err.message || "Errore durante il login. Controlla le credenziali.");
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
        } catch (err: any) {
            console.error("Register err:", err);
            setError(err.message || "Errore durante la registrazione.");
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
        } catch (err: any) {
            console.error("Google login err:", err);
            setError(err.message || "Errore durante il login con Google.");
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
        } catch (err: any) {
            console.error("Logout err:", err);
            setError(err.message || "Errore durante il logout.");
        }
    };

    // Firebase Account Deletion
    const deleteAccount = async () => {
        setError(null);
        setLoading(true);
        try {
            const currentUser = auth.currentUser;
            if (currentUser) {
                await deleteUser(currentUser);
                setUser(null);
                localStorage.clear(); // Cleanup completo
            }
        } catch (err: any) {
            console.error("Delete account err:", err);
            setError(err.message || "Errore durante l'eliminazione. Potrebbe essere necessario ri-effettuare il login per motivi di sicurezza.");
            throw err; // Rilancio per gestirlo nel modal
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
        login,
        register,
        loginWithGoogle,
        logout,
        deleteAccount,
        clearError
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#111827' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ width: '40px', height: '40px', border: '4px solid #f3f4f6', borderTop: '4px solid var(--oro-sardegna)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
                        Verifica sessione...
                    </div>
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};
