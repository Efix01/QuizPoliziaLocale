import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, title, children }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay / Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(15, 23, 42, 0.7)',
                            backdropFilter: 'blur(8px)',
                            zIndex: 4000,
                        }}
                    />

                    {/* Sheet Container */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        style={{
                            position: 'fixed',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            background: '#1e293b',
                            borderTop: '1px solid #334155',
                            borderTopLeftRadius: '32px',
                            borderTopRightRadius: '32px',
                            zIndex: 4001,
                            maxHeight: '90vh',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: '0 -20px 25px -5px rgba(0, 0, 0, 0.3)',
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Drag Handle Overlay */}
                        <div style={{
                            width: '40px',
                            height: '4px',
                            background: '#334155',
                            borderRadius: '2px',
                            margin: '12px auto',
                            flexShrink: 0
                        }} />

                        {/* Header */}
                        <div style={{
                            padding: '0 1.5rem 1rem 1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                        }}>
                            <h3 style={{
                                fontSize: '1.25rem',
                                fontWeight: '800',
                                color: '#f8fafc',
                                margin: 0
                            }}>
                                {title}
                            </h3>
                            <button
                                onClick={onClose}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#64748b',
                                    cursor: 'pointer'
                                }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Content */}
                        <div style={{
                            padding: '1.5rem',
                            overflowY: 'auto',
                            WebkitOverflowScrolling: 'touch',
                            color: '#cbd5e1',
                            fontSize: '0.95rem',
                            lineHeight: 1.6
                        }}>
                            {children}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default BottomSheet;
