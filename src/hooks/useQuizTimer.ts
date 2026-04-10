import { useState, useEffect } from 'react';

/**
 * Hook per la gestione del countdown di una sessione quiz.
 * @param durataMinuti - Durata iniziale in minuti. Se 0, il timer rimane disattivo.
 * @param onExpired - Callback invocata alla scadenza del tempo.
 */
export function useQuizTimer(durataMinuti: number, onExpired: () => void) {
    // Calcoliamo i secondi totali iniziali
    const [secondiRimasti, setSecondiRimasti] = useState(durataMinuti * 60);
    const [isActive, setIsActive] = useState(durataMinuti > 0);

    useEffect(() => {
        // Se il timer ha raggiunto zero mentre è attivo, completalo asincronamente
        if (secondiRimasti <= 0 && isActive) {
            const timeoutId = setTimeout(() => {
                setIsActive(false);
                onExpired();
            }, 0);
            return () => clearTimeout(timeoutId);
        }

        // Se non è attivo o già scaduto, non fare nulla
        if (!isActive || secondiRimasti <= 0) return;

        const id = setInterval(() => {
            setSecondiRimasti(s => {
                if (s <= 1) {
                    clearInterval(id);
                    return 0;
                }
                return s - 1;
            });
        }, 1000);

        return () => clearInterval(id);
    }, [isActive, secondiRimasti, onExpired]);

    // Funzione helper per formattare MM:SS
    const formatTime = () => {
        const mm = Math.floor(secondiRimasti / 60);
        const ss = secondiRimasti % 60;
        return `${mm.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`;
    };

    return {
        secondiRimasti,
        isExpired: isActive && secondiRimasti <= 0,
        formattedTime: formatTime(),
        stopTimer: () => setIsActive(false)
    };
}
