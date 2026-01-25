import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import './LockedOverlay.css';

interface LockedOverlayProps {
    message?: string;
}

const LockedOverlay: React.FC<LockedOverlayProps> = ({
    message = "Accedi per sbloccare"
}) => {
    const navigate = useNavigate();

    return (
        <div className="locked-overlay" onClick={() => navigate('/login')}>
            <div className="locked-content">
                <div className="locked-icon">
                    <Lock />
                </div>
                <span className="locked-text">{message}</span>
            </div>
        </div>
    );
};

export default LockedOverlay;
