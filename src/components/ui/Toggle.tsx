import React from 'react';
import { motion } from 'framer-motion';

interface ToggleProps {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}

const Toggle: React.FC<ToggleProps> = ({ label, checked, onChange }) => {
    return (
        <div 
            onClick={() => onChange(!checked)}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.25rem 1.5rem',
                background: '#1e293b',
                border: `1px solid ${checked ? '#3b82f6' : '#334155'}`,
                borderRadius: '16px',
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'all 0.2s ease',
                boxShadow: checked 
                    ? '0 0 0 1px rgba(59, 130, 246, 0.3)' 
                    : 'none',
                opacity: 1,
            }}
            onMouseOver={(e) => {
                if (!checked) {
                    e.currentTarget.style.borderColor = '#475569';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                }
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.borderColor = checked ? '#3b82f6' : '#334155';
                e.currentTarget.style.transform = 'translateY(0)';
            }}
        >
            <span style={{ 
                color: '#f8fafc', 
                fontSize: '1rem', 
                fontWeight: '600',
                letterSpacing: '-0.01em',
            }}>
                {label}
            </span>
            
            <div 
                style={{
                    width: '56px',
                    height: '32px',
                    background: checked ? '#3b82f6' : '#0f172a',
                    borderRadius: '16px',
                    padding: '4px',
                    position: 'relative',
                    transition: 'background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: '1px solid #334155',
                    boxShadow: checked 
                        ? '0 0 15px rgba(59, 130, 246, 0.2)' 
                        : '0 0 0 1px #334155',
                }}
            >
                <motion.div
                    animate={{ x: checked ? 24 : 0 }}
                    transition={{ 
                        type: "spring", 
                        stiffness: 500, 
                        damping: 30,
                        mass: 0.8
                    }}
                    style={{
                        width: '22px',
                        height: '22px',
                        background: '#fff',
                        borderRadius: '50%',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                    }}
                />
            </div>
        </div>
    );
};

export default Toggle;
