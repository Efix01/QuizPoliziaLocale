import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';

interface LockedOverlayProps {
    message?: string;
}

const LockedOverlay: React.FC<LockedOverlayProps> = ({
    message = "Accedi per sbloccare"
}) => {
    const navigate = useNavigate();

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => navigate('/login')}
            style={{
                position: 'absolute',
                inset: 0,
                zIndex: 10,
                background: 'rgba(15, 23, 42, 0.6)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                borderRadius: 'inherit',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                transition: 'background 0.3s',
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(15, 23, 42, 0.8)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(15, 23, 42, 0.6)'}
        >
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
                textAlign: 'center',
                padding: '1rem',
            }}>
                <div style={{
                    width: '64px',
                    height: '64px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 0 30px rgba(0, 0, 0, 0.2)',
                }}>
                    <Lock size={32} />
                </div>
                <div>
                    <span style={{ 
                        display: 'block',
                        color: '#fff', 
                        fontWeight: '800', 
                        fontSize: '1.25rem',
                        letterSpacing: '-0.02em',
                        marginBottom: '0.25rem'
                    }}>
                        {message}
                    </span>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        color: '#60a5fa',
                        fontSize: '0.9rem',
                        fontWeight: '600'
                    }}>
                        <LogIn size={16} />
                        Vai al Login
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default LockedOverlay;
