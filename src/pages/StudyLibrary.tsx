import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BookOpen, Scale, Map, ShieldAlert, Gavel,
    FileText, ChevronRight
} from 'lucide-react';
import { usePL } from '../context/PLContext';
import '../styles/pl-components.css';
import './StudyLibrary.css';

// Categorie di studio per Polizia Locale
const STUDY_CATEGORIES = [
    { id: 'cds', title: 'Codice della Strada', icon: Map, color: '#FACC15', description: 'D.Lgs. 285/1992 — Circolazione, sanzioni, veicoli' },
    { id: 'tuel', title: 'Ordinamento Enti Locali', icon: Scale, color: '#38BDF8', description: 'D.Lgs. 267/2000 — Organi, competenze, ordinanze' },
    { id: 'san_amm', title: 'Sanzioni Amministrative', icon: FileText, color: '#F472B6', description: 'L. 689/1981 — Contestazione, pagamento, ricorsi' },
    { id: 'dir_amm', title: 'Diritto Amministrativo', icon: BookOpen, color: '#A78BFA', description: 'L. 241/1990 — Procedimento, accesso, silenzio' },
    { id: 'dir_pen', title: 'Diritto Penale', icon: Gavel, color: '#EF4444', description: 'Delitti contro la PA — Peculato, corruzione, abuso' },
    { id: 'proc_pen', title: 'Procedura Penale', icon: ShieldAlert, color: '#4ADE80', description: 'C.P.P. — Polizia giudiziaria, arresto, notizia di reato' },
];

const StudyLibrary: React.FC = () => {
    const navigate = useNavigate();
    const { domandeCore, totaleDomandeDisponibili } = usePL();

    const getCategoryCount = (catId: string) => {
        return domandeCore.filter(d => d.categoriaId === catId).length;
    };

    return (
        <div className="study-library">
            <header className="library-header">
                <h1 className="library-title">Piano di Studio</h1>
                <p className="library-subtitle">
                    {totaleDomandeDisponibili} domande disponibili per la tua preparazione.
                </p>
            </header>

            <div className="subjects-list">
                {STUDY_CATEGORIES.map(cat => {
                    const count = getCategoryCount(cat.id);
                    const Icon = cat.icon;

                    return (
                        <div
                            key={cat.id}
                            className="subject-card"
                            onClick={() => navigate(`/manual/${cat.id}`)}
                        >
                            <div className="subject-content">
                                <div className="subject-header">
                                    <div className="subject-icon" style={{ color: cat.color }}>
                                        <Icon size={20} />
                                    </div>
                                    <div className="subject-info">
                                        <h2 className="subject-title">{cat.title}</h2>
                                        <p className="subject-description">{cat.description}</p>
                                    </div>
                                </div>
                                <div className="subject-meta">
                                    <span className="subject-chapters">{count} domande</span>
                                </div>
                            </div>
                            <ChevronRight className="subject-arrow" />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StudyLibrary;
