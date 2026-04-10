import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BookOpen, Scale, Map, ShieldAlert, Gavel,
    FileText, ChevronRight, Library
} from 'lucide-react';
import { usePL } from '../context/PLContext';
import type { CategoriaId } from '../types/pl';

// ===================================================
// Categorie di studio per Polizia Locale
// ===================================================

const STUDY_CATEGORIES: { id: CategoriaId; title: string; icon: React.ElementType; color: string; description: string }[] = [
    { 
      id: 'cds', 
      title: 'Codice della Strada', 
      icon: Map, 
      color: '#f59e0b', 
      description: 'D.Lgs. 285/1992 — Circolazione, sanzioni, veicoli' 
    },
    { 
      id: 'tuel', 
      title: 'Ordinamento Enti Locali', 
      icon: Scale, 
      color: '#3b82f6', 
      description: 'D.Lgs. 267/2000 — Organi, competenze, ordinanze' 
    },
    { 
      id: 'l689', 
      title: 'Sanzioni Amministrative', 
      icon: FileText, 
      color: '#ec4899', 
      description: 'L. 689/1981 — Contestazione, pagamento, ricorsi' 
    },
    { 
      id: 'l241', 
      title: 'Diritto Amministrativo', 
      icon: BookOpen, 
      color: '#a855f7', 
      description: 'L. 241/1990 — Procedimento, accesso, silenzio' 
    },
    { 
      id: 'penale', 
      title: 'Diritto e Proc. Penale', 
      icon: Gavel, 
      color: '#ef4444', 
      description: 'Codice Penale e Procedura — Polizia Giudiziaria' 
    },
    { 
      id: 'reg_generale', 
      title: 'Normativa Regionale', 
      icon: ShieldAlert, 
      color: '#22c55e', 
      description: 'Leggi Regionali — Ordinamento Polizia Locale e Commercio' 
    }
];

const StudyLibrary: React.FC = () => {
    const navigate = useNavigate();
    const { domandeCore, totaleDomandeDisponibili } = usePL();

    const getCategoryCount = (catId: string) => {
        return domandeCore.filter(d => d.categoriaId === catId).length;
    };

    return (
        <div style={{ 
            minHeight: '100vh', 
            background: '#0f172a', 
            color: '#f8fafc', 
            padding: '2rem 1rem' 
        }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                
                {/* Header */}
                <header style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '1rem',
                        marginBottom: '1rem'
                    }}>
                        <Library size={40} color="#3b82f6" />
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', margin: 0 }}>
                            Biblioteca di Studio
                        </h1>
                    </div>
                    <p style={{ color: '#94a3b8', fontSize: '1.1rem', margin: 0 }}>
                        {totaleDomandeDisponibili} domande disponibili per la tua preparazione
                    </p>
                </header>

                {/* Grid categorie */}
                <section style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: '1.5rem' 
                }}>
                    {STUDY_CATEGORIES.map(cat => {
                        const count = getCategoryCount(cat.id);
                        const Icon = cat.icon;

                        return (
                            <div
                                key={cat.id}
                                onClick={() => navigate(`/manual/${cat.id}`)}
                                style={{
                                    background: '#1e293b',
                                    border: '1px solid #334155',
                                    borderRadius: '20px',
                                    padding: '1.5rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '1rem',
                                    transition: 'all 0.2s',
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.3)';
                                    e.currentTarget.style.borderColor = cat.color;
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                    e.currentTarget.style.borderColor = '#334155';
                                }}
                            >
                                {/* Contenuto */}
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: 1 }}>
                                    {/* Icona */}
                                    <div style={{
                                        background: '#0f172a',
                                        borderRadius: '12px',
                                        width: '50px',
                                        height: '50px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        color: cat.color
                                    }}>
                                        <Icon size={24} />
                                    </div>

                                    {/* Info */}
                                    <div style={{ flex: 1 }}>
                                        <h2 style={{ 
                                            fontSize: '1.2rem', 
                                            fontWeight: '700', 
                                            margin: '0 0 0.5rem 0',
                                            color: '#f8fafc'
                                        }}>
                                            {cat.title}
                                        </h2>
                                        <p style={{ 
                                            fontSize: '0.9rem', 
                                            color: '#94a3b8', 
                                            margin: '0 0 0.75rem 0',
                                            lineHeight: 1.5
                                        }}>
                                            {cat.description}
                                        </p>
                                        <div style={{
                                            display: 'inline-block',
                                            background: '#334155',
                                            color: '#cbd5e1',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '99px',
                                            fontSize: '0.85rem',
                                            fontWeight: '600'
                                        }}>
                                            {count} domande
                                        </div>
                                    </div>
                                </div>

                                {/* Freccia */}
                                <ChevronRight size={24} color="#64748b" style={{ flexShrink: 0 }} />
                            </div>
                        );
                    })}
                </section>

                {/* Info aggiuntiva (se serve) */}
                <footer style={{ 
                    textAlign: 'center', 
                    padding: '2rem 0',
                    borderTop: '1px solid #334155',
                    color: '#64748b',
                    fontSize: '0.9rem'
                }}>
                    💡 Seleziona una materia per accedere al manuale interattivo con tutte le domande disponibili.
                </footer>
            </div>
        </div>
    );
};

export default StudyLibrary;
