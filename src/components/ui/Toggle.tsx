import React from 'react';
import './Toggle.css';

interface ToggleProps {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}

const Toggle: React.FC<ToggleProps> = ({ label, checked, onChange }) => {
    return (
        <div className="toggle-container" onClick={() => onChange(!checked)}>
            <span className="toggle-label">{label}</span>
            <div className={`toggle-switch ${checked ? 'checked' : ''}`}>
                <div className="toggle-thumb"></div>
            </div>
        </div>
    );
};

export default Toggle;
