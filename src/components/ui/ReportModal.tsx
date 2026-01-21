import React from 'react';
import { Flag, Mail, X } from 'lucide-react';
import './ReportModal.css';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    questionId: number | string;
    category: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, questionId, category }) => {
    if (!isOpen) return null;

    const generateEmailParams = () => {
        const subject = encodeURIComponent(`Segnalazione Errore - Quiz ID #${questionId}`);
        const body = encodeURIComponent(
            `Ciao Efisio,\n\nHo trovato un errore nel quesito ID #${questionId}\n` +
            `Argomento: ${category}\n\n` +
            `Dettagli errore:\n[Scrivi qui cosa c'è che non va]\n`
        );
        return { subject, body };
    };

    const handleDefaultMail = () => {
        const { subject, body } = generateEmailParams();
        window.location.href = `mailto:efix01@gmail.com?subject=${subject}&body=${body}`;
        onClose();
    };

    const handleGmail = () => {
        const { subject, body } = generateEmailParams();
        // Gmail web compose URL
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=efix01@gmail.com&su=${subject}&body=${body}`;
        window.open(gmailUrl, '_blank');
        onClose();
    };

    return (
        <div className="report-modal-overlay" onClick={onClose}>
            <div className="report-modal-card" onClick={e => e.stopPropagation()}>
                <button className="report-modal-close" onClick={onClose}>
                    <X size={20} />
                </button>

                <div className="report-modal-header">
                    <div className="report-modal-icon">
                        <Flag size={24} />
                    </div>
                    <h2 className="report-modal-title">Segnala Errore</h2>
                    <p className="report-modal-subtitle">ID Quesito: #{questionId}</p>
                </div>

                <div className="report-modal-content">
                    <p className="report-modal-text">
                        Grazie per il tuo aiuto! Questa è un'app non ufficiale e il tuo contributo è prezioso
                        per correggere eventuali imprecisioni.
                    </p>
                    <p className="report-modal-text">
                        Verificherò la segnalazione confrontandola con le fonti normative e aggiornerò il
                        database al prossimo rilascio.
                    </p>
                </div>

                <div className="report-modal-footer">
                    <button className="btn-cancel" onClick={onClose}>
                        Annulla
                    </button>
                    <div className="action-buttons">
                        <button className="btn-confirm btn-gmail" onClick={handleGmail}>
                            <Mail size={18} />
                            Gmail
                        </button>
                        <button className="btn-confirm" onClick={handleDefaultMail}>
                            <Mail size={18} />
                            App Mail
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
