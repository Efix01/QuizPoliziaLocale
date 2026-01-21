import React from 'react';
import { X } from 'lucide-react';
import './BottomSheet.css';

interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, title, children }) => {
    return (
        <div
            className={`bottom-sheet-overlay ${isOpen ? 'open' : ''}`}
            onClick={onClose}
            aria-hidden={!isOpen}
        >
            <div
                className="bottom-sheet"
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="bottom-sheet-title"
            >
                <div className="bottom-sheet-handle"></div>
                <div className="bottom-sheet-header">
                    <h3 id="bottom-sheet-title" className="bottom-sheet-title">{title}</h3>
                    <button
                        onClick={onClose}
                        className="bottom-sheet-close"
                        aria-label="Chiudi"
                    >
                        <X size={18} />
                    </button>
                </div>
                <div className="bottom-sheet-content">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default BottomSheet;
