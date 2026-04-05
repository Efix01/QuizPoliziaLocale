import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

interface XPBonusOverlayProps {
    message: string;
    amount: number;
    onClose: () => void;
}

export const XPBonusOverlay: React.FC<XPBonusOverlayProps> = ({ message, amount, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(4px)',
            pointerEvents: 'none',
        }}>
            <motion.div
                initial={{ scale: 0.5, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', damping: 15, stiffness: 300 }}
                style={{
                    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                    border: '2px solid #f59e0b',
                    borderRadius: '32px',
                    padding: '2rem 3rem',
                    textAlign: 'center',
                    boxShadow: '0 0 40px rgba(245, 158, 11, 0.3)',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Effetto luce radiale */}
                <div style={{
                    position: 'absolute',
                    top: '-50%',
                    left: '-50%',
                    width: '200%',
                    height: '200%',
                    background: 'radial-gradient(circle, rgba(245, 158, 11, 0.1) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }} />

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1rem',
                    position: 'relative',
                    zIndex: 1,
                }}>
                    <div style={{
                        background: '#f59e0b',
                        color: '#fff',
                        borderRadius: '50%',
                        padding: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 20px rgba(245, 158, 11, 0.5)',
                    }}>
                        <Zap size={32} />
                    </div>
                    
                    <h2 style={{ 
                        fontSize: '1.5rem', 
                        fontWeight: '900', 
                        margin: 0, 
                        color: '#f8fafc',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        {message}
                    </h2>
                    
                    <div style={{ 
                        fontSize: '2.5rem', 
                        fontWeight: '900', 
                        color: '#f59e0b'
                    }}>
                        +{amount} XP
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
