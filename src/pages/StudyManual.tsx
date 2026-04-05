import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import manualeData from '../data/manuale_pl.json';

// Mappa ID categorie per compatibilità StudyLibrary
const CATEGORY_ID_MAP: Record<string, keyof typeof manualeData> = {
  'cds': 'cds',
  'tuel': 'tuel',
  'san_amm': 'l689',
  'dir_amm': 'l241',
  'dir_pen': 'penale',
  'proc_pen': 'penale',
};

const CATEGORY_COLORS: Record<string, string> = {
  cds: '#f59e0b',
  tuel: '#3b82f6',
  san_amm: '#ec4899',
  dir_amm: '#a855f7',
  dir_pen: '#ef4444',
  proc_pen: '#22c55e',
};

export default function StudyManual() {
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId: string }>();
  
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);

  // Mappa ID dalla library alla chiave nel JSON
  const jsonKey = categoryId ? CATEGORY_ID_MAP[categoryId] : null;

  // Se categoria non esiste o non è mappata, redirect a library
  if (!categoryId || !jsonKey || !(jsonKey in manualeData)) {
    // Usiamo un piccolo trick per evitare loop di render se navigate viene chiamato direttamente
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <button onClick={() => navigate('/library')} style={{ background: '#1e293b', color: '#fff', padding: '1rem', borderRadius: '12px', border: '1px solid #334155', cursor: 'pointer' }}>
          Categoria non trovata. Torna alla Biblioteca
        </button>
      </div>
    );
  }

  const categoria = (manualeData as any)[jsonKey];
  const categoryColor = CATEGORY_COLORS[categoryId] || '#3b82f6';
  const currentChapter = categoria.capitoli[currentChapterIndex];

  const handleNext = () => {
    if (currentChapterIndex < categoria.capitoli.length - 1) {
      setCurrentChapterIndex(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrev = () => {
    if (currentChapterIndex > 0) {
      setCurrentChapterIndex(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f8fafc', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Header */}
        <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <button
            onClick={() => navigate('/library')}
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              color: '#fff',
              padding: '0.75rem',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ArrowLeft size={24} />
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <BookOpen size={24} color={categoryColor} />
              <h1 style={{ fontSize: '1.75rem', fontWeight: '800', margin: 0 }}>
                {categoria.titolo}
              </h1>
            </div>
            <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>
              {categoria.descrizione}
            </p>
          </div>
        </header>

        {/* Barra progresso */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '0.5rem',
          color: '#94a3b8',
          fontSize: '0.9rem'
        }}>
          <span>Capitolo {currentChapterIndex + 1} di {categoria.capitoli.length}</span>
          <span>{Math.round(((currentChapterIndex + 1) / categoria.capitoli.length) * 100)}% completato</span>
        </div>
        <div style={{ 
          height: '6px', 
          background: '#1e293b', 
          borderRadius: '3px', 
          overflow: 'hidden', 
          marginBottom: '2rem' 
        }}>
          <div
            style={{
              width: `${((currentChapterIndex + 1) / categoria.capitoli.length) * 100}%`,
              height: '100%',
              background: categoryColor,
              transition: 'width 0.3s ease',
            }}
          />
        </div>

        {/* Card capitolo */}
        <div
          style={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '24px',
            padding: '2.5rem',
            marginBottom: '2rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
          }}
        >
          {/* Titolo capitolo */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem',
            marginBottom: '1.5rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid #334155'
          }}>
            <FileText size={28} color={categoryColor} />
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '700', 
              margin: 0,
              color: '#f8fafc'
            }}>
              {currentChapter.titolo}
            </h2>
          </div>

          {/* Contenuto testuale */}
          <div style={{ 
            fontSize: '1.1rem', 
            lineHeight: 1.8, 
            color: '#cbd5e1'
          }}>
            {currentChapter.testo.map((paragrafo: string, index: number) => (
              <p key={index} style={{ 
                marginBottom: '1.5rem',
                textAlign: 'justify'
              }}>
                {paragrafo}
              </p>
            ))}
          </div>
        </div>

        {/* Navigazione */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
          <button
            onClick={handlePrev}
            disabled={currentChapterIndex === 0}
            style={{
              flex: 1,
              background: currentChapterIndex === 0 ? '#334155' : '#1e293b',
              border: '1px solid #334155',
              color: currentChapterIndex === 0 ? '#64748b' : '#f8fafc',
              padding: '1rem',
              borderRadius: '12px',
              cursor: currentChapterIndex === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontWeight: '600',
              fontSize: '1rem',
            }}
          >
            <ChevronLeft size={20} />
            Capitolo Precedente
          </button>
          <button
            onClick={handleNext}
            disabled={currentChapterIndex === categoria.capitoli.length - 1}
            style={{
              flex: 1,
              background: currentChapterIndex === categoria.capitoli.length - 1 ? '#334155' : categoryColor,
              border: 'none',
              color: '#fff',
              padding: '1rem',
              borderRadius: '12px',
              cursor: currentChapterIndex === categoria.capitoli.length - 1 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontWeight: '600',
              fontSize: '1rem',
            }}
          >
            Capitolo Successivo
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Info completamento */}
        {currentChapterIndex === categoria.capitoli.length - 1 && (
          <div
            style={{
              marginTop: '2rem',
              padding: '1.5rem',
              background: '#065f46',
              border: '1px solid #047857',
              borderRadius: '12px',
              textAlign: 'center',
            }}
          >
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>
              🎉 Hai completato tutti i capitoli di {categoria.titolo}!
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.9)', margin: '0 0 1rem 0' }}>
              Ottimo lavoro. Torna alla biblioteca per studiare altre materie.
            </p>
            <button
              onClick={() => navigate('/library')}
              style={{
                background: '#fff',
                color: '#065f46',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              Torna alla Biblioteca
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
