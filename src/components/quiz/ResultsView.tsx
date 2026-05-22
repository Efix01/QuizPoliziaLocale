import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, CheckCircle, Clock, AlertTriangle, ArrowRight, BarChart3, Trophy, Flame, Sparkles, Zap, Target, BookOpen } from 'lucide-react';
import { useProgress } from '../../context/ProgressContext';
import { useQuizPL } from '../../hooks/useQuizPL';

const NOMI = ['Mario', 'Francesco', 'Alessandro', 'Andrea', 'Giuseppe', 'Matteo', 'Lorenzo', 'Gabriele', 'Mattia', 'Leonardo', 'Davide', 'Riccardo', 'Federico', 'Marco', 'Tommaso', 'Antonio', 'Giovanni', 'Roberto', 'Stefano', 'Luca', 'Sofia', 'Giulia', 'Aurora', 'Alice', 'Emma', 'Giorgia', 'Beatrice', 'Greta', 'Ludovica', 'Chiara', 'Sara', 'Camilla', 'Francesca', 'Elena', 'Martina', 'Federica', 'Valentina', 'Roberta', 'Elisa', 'Silvia'];
const COGNOMI = ['A.', 'B.', 'C.', 'D.', 'E.', 'F.', 'G.', 'L.', 'M.', 'N.', 'O.', 'P.', 'Q.', 'R.', 'S.', 'T.', 'U.', 'V.', 'Z.'];

interface ResultsViewProps {
  risultati: {
    punteggioTotale: number;
    percentuale: number;
    corrette: number;
    errate: number;
    nonDate: number;
    tempo: number;
    statsByLayer: {
      core: { corrette: number; totali: number; percentuale: number };
      regionale: { corrette: number; totali: number; percentuale: number };
      comunale: { corrette: number; totali: number; percentuale: number };
    };
    categorieDeboli: Array<{
      nome: string;
      layer: 'core' | 'regionale' | 'comunale';
      percentuale: number;
      corrette: number;
      totali: number;
    }>;
    parametri: {
      punteggioCorretta: number;
      punteggioErrata: number;
      punteggioNonData: number;
    };
  };
  isSimulationMode?: boolean;
  isDailyChallenge?: boolean;
  onRevisione: () => void;
  onNuovoQuiz: () => void;
}


export default function ResultsView({ risultati, isSimulationMode = false, isDailyChallenge = false, onRevisione, onNuovoQuiz }: ResultsViewProps) {
  const { progressiGlobali } = useProgress();
  const navigate = useNavigate();
  const { generaQuizVeloce } = useQuizPL();
  const { percentuale, corrette, errate, nonDate, tempo, statsByLayer, categorieDeboli, punteggioTotale } = risultati;

  const totali = corrette + errate + nonDate;
  const isPassed = percentuale >= 60; // soglia personalizzabile
  const tempoMinuti = Math.floor(tempo / 60);
  const tempoSecondi = tempo % 60;

  // 🆕 Performance delta vs last quiz
  const lastQuizPercentage = useMemo(() => {
    try {
      const stored = localStorage.getItem('pl_last_quiz_percentage');
      return stored ? parseInt(stored, 10) : null;
    } catch { return null; }
  }, []);

  const performanceDelta = lastQuizPercentage !== null ? percentuale - lastQuizPercentage : null;

  // Salva il punteggio corrente per i futuri confronti
  useEffect(() => {
    try {
      localStorage.setItem('pl_last_quiz_percentage', String(percentuale));
    } catch (e) {
      console.warn("Errore nel salvataggio del punteggio dell'ultimo quiz:", e);
    }
  }, [percentuale]);

  const getColor = (pct: number) => pct >= 75 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444';

  const graduatoria = useMemo(() => {
    if (!isSimulationMode) return [];

    const randomNormal = (mean: number, stdDev: number) => {
      let u = 0, v = 0;
      while(u === 0) u = Math.random();
      while(v === 0) v = Math.random();
      const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
      return num * stdDev + mean;
    };

    const candidati = [];
    const params = risultati.parametri;

    // Genera 150 candidati
    for (let i = 0; i < 150; i++) {
      const nomeCasuale = NOMI[Math.floor(Math.random() * NOMI.length)];
      const cognomeCasuale = COGNOMI[Math.floor(Math.random() * COGNOMI.length)];
      const nomeCompleto = `${nomeCasuale} ${cognomeCasuale}`;

      // Percentuale di risposte corrette con distribuzione gaussiana (media 62%, deviazione standard 14%)
      let pctCorrette = randomNormal(62, 14);
      pctCorrette = Math.max(0, Math.min(100, pctCorrette));

      // Percentuale di risposte non date tra 0% e 15%
      const pctNonDate = Math.random() * 15;

      const corretteSim = Math.round((pctCorrette / 100) * totali);
      const nonDateSim = Math.min(totali - corretteSim, Math.round((pctNonDate / 100) * totali));
      const errateSim = totali - corretteSim - nonDateSim;

      const punteggioSim = corretteSim * params.punteggioCorretta + 
                           errateSim * params.punteggioErrata + 
                           nonDateSim * params.punteggioNonData;

      candidati.push({
        id: `cand_${i}`,
        nome: nomeCompleto,
        punteggio: Math.round(punteggioSim * 100) / 100,
        corrette: corretteSim,
        errate: errateSim,
        nonDate: nonDateSim,
        percentuale: Math.round((corretteSim / totali) * 100),
        isUser: false
      });
    }

    // Aggiungi l'utente reale
    candidati.push({
      id: 'utente_reale',
      nome: 'Tu (Candidato)',
      punteggio: punteggioTotale,
      corrette: corrette,
      errate: errate,
      nonDate: nonDate,
      percentuale: percentuale,
      isUser: true
    });

    // Ordina decrescente per punteggio, poi corrette, poi meno errate
    candidati.sort((a, b) => {
      if (b.punteggio !== a.punteggio) return b.punteggio - a.punteggio;
      if (b.corrette !== a.corrette) return b.corrette - a.corrette;
      return a.errate - b.errate;
    });

    // Assegna la posizione
    return candidati.map((c, index) => ({
      ...c,
      posizione: index + 1
    }));
  }, [isSimulationMode, totali, corrette, errate, nonDate, percentuale, punteggioTotale, risultati.parametri]);

  const utentePosizione = useMemo(() => {
    if (!isSimulationMode) return 0;
    const userIndex = graduatoria.findIndex(c => c.isUser);
    return userIndex !== -1 ? userIndex + 1 : 0;
  }, [isSimulationMode, graduatoria]);

  const userStatus = useMemo(() => {
    if (!isSimulationMode) return null;
    if (percentuale < 60) return 'non_idoneo';
    if (utentePosizione <= 30) return 'vincitore';
    return 'idoneo_non_vincitore';
  }, [isSimulationMode, utentePosizione, percentuale]);

  useEffect(() => {
    if (isSimulationMode) {
      setTimeout(() => {
        const userRow = document.getElementById('user-rank-row');
        if (userRow) {
          userRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
    }
  }, [isSimulationMode]);

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f8fafc', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {isDailyChallenge && (
          <section style={{ 
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(234, 179, 8, 0.05) 100%)', 
            borderRadius: '24px', 
            padding: '2.5rem 2rem', 
            textAlign: 'center',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            boxShadow: '0 20px 25px -5px rgba(245, 158, 11, 0.1)',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.25rem'
          }}>
            {/* Animazione/Effetto di sfondo */}
            <div style={{ 
              position: 'absolute', 
              top: '-50px', 
              right: '-50px', 
              width: '150px', 
              height: '150px', 
              background: 'radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, transparent 70%)', 
              pointerEvents: 'none' 
            }} />
            
            {/* Cerchio con Fiamma Pulsante */}
            <div style={{ 
              background: 'rgba(245, 158, 11, 0.15)', 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(245, 158, 11, 0.2)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              animation: 'pulse 2s infinite'
            }}>
              <Flame size={44} color="#f97316" fill="#f97316" />
            </div>

            <div>
              <h2 style={{ fontSize: '2rem', fontWeight: '900', margin: '0 0 0.5rem 0', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Sparkles size={24} color="#f59e0b" />
                SFIDA DEL GIORNO COMPLETATA!
                <Sparkles size={24} color="#f59e0b" />
              </h2>
              <p style={{ color: '#cbd5e1', fontSize: '1.1rem', maxWidth: '600px', margin: 0, lineHeight: '1.6' }}>
                Grande costanza! Hai completato la Sfida Rapida Quotidiana. Ti sei aggiudicato un bonus speciale di <strong style={{ color: '#f59e0b' }}>+50 XP</strong> ed hai mantenuto attivo lo streak di studio!
              </p>
            </div>

            {/* Streak Counter Widget */}
            <div style={{ 
              background: '#1e293b', 
              border: '1px solid #334155',
              borderRadius: '20px',
              padding: '1rem 2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
            }}>
              <Flame size={28} color="#f59e0b" fill="#f59e0b" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#fff', fontFamily: 'monospace', lineHeight: 1.1 }}>
                  {progressiGlobali?.streak || 1} Giorni
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Serie di Studio Attiva
                </div>
              </div>
            </div>
            
            <style>{`
              @keyframes pulse {
                0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
                70% { transform: scale(1.05); box-shadow: 0 0 0 15px rgba(245, 158, 11, 0); }
                100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
              }
            `}</style>
          </section>
        )}

        {/* Header con risultato principale */}
        <section style={{ 
          background: isPassed 
            ? 'linear-gradient(135deg, #065f46 0%, #047857 100%)' 
            : 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)', 
          borderRadius: '24px', 
          padding: '3rem 2rem', 
          textAlign: 'center',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{ fontSize: '5rem', fontWeight: '900', marginBottom: '1rem', lineHeight: 1 }}>
            {percentuale}%
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem', margin: 0 }}>
            {isPassed ? '✅ Superato!' : '❌ Non superato'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', margin: '0.5rem 0 0 0' }}>
            Punteggio: <strong>{punteggioTotale}</strong> / {totali} • {corrette} corrette, {errate} errate
            {nonDate > 0 && `, ${nonDate} non date`}
          </p>
          
          {/* Breakdown del calcolo (UX Improvement) */}
          <div style={{ 
            marginTop: '0.75rem', 
            fontSize: '0.85rem', 
            color: 'rgba(255,255,255,0.6)', 
            fontFamily: 'monospace',
            background: 'rgba(0,0,0,0.1)',
            display: 'inline-block',
            padding: '4px 12px',
            borderRadius: '99px'
          }}>
            {corrette}×({risultati.parametri.punteggioCorretta}) + {errate}×({risultati.parametri.punteggioErrata}) {nonDate > 0 && `+ ${nonDate}×(${risultati.parametri.punteggioNonData})`} = {punteggioTotale}
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.7)' }}>
            <Clock size={18} />
            <span>{tempoMinuti}:{tempoSecondi.toString().padStart(2, '0')}</span>
          </div>
        </section>

        {/* Sezione Graduatoria Concorso */}
        {isSimulationMode && graduatoria.length > 0 && (
          <section style={{ 
            background: 'rgba(30, 41, 59, 0.4)', 
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '24px', 
            padding: '2.5rem 2rem', 
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
          }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0 0 1.5rem 0' }}>
              <Trophy size={24} color="#eab308" />
              Graduatoria Concorso Ufficiale (Simulata)
            </h3>

            {/* Box Esito Personale in Graduatoria */}
            <div style={{
              background: userStatus === 'vincitore' 
                ? 'rgba(34, 197, 94, 0.1)' 
                : userStatus === 'idoneo_non_vincitore'
                  ? 'rgba(59, 130, 246, 0.1)'
                  : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${
                userStatus === 'vincitore' 
                  ? 'rgba(34, 197, 94, 0.25)' 
                  : userStatus === 'idoneo_non_vincitore'
                    ? 'rgba(59, 130, 246, 0.25)'
                    : 'rgba(239, 68, 68, 0.25)'
              }`,
              borderRadius: '20px',
              padding: '1.5rem',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.5rem'
            }}>
              <div>
                <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                  Stato Candidatura
                </div>
                <div style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '900', 
                  color: userStatus === 'vincitore' 
                    ? '#4ade80' 
                    : userStatus === 'idoneo_non_vincitore'
                      ? '#60a5fa'
                      : '#f87171'
                }}>
                  {userStatus === 'vincitore' && '🏆 VINCITORE DI CONCORSO'}
                  {userStatus === 'idoneo_non_vincitore' && '🤝 IDONEO NON VINCITORE'}
                  {userStatus === 'non_idoneo' && '❌ NON IDONEO'}
                </div>
                <div style={{ fontSize: '0.95rem', color: '#cbd5e1', marginTop: '0.25rem' }}>
                  {userStatus === 'vincitore' && 'Sei rientrato nei primi 30 posti disponibili con punteggio utile!'}
                  {userStatus === 'idoneo_non_vincitore' && 'Hai superato la prova concorsuale, ma sei fuori dai 30 posti messi a bando.'}
                  {userStatus === 'non_idoneo' && 'Punteggio insufficiente. La soglia minima di idoneità è del 60%.'}
                </div>
              </div>

              <div style={{ 
                background: 'rgba(15, 23, 42, 0.5)', 
                border: '1px solid rgba(255,255,255,0.05)',
                padding: '1rem 1.75rem', 
                borderRadius: '16px', 
                textAlign: 'center',
                minWidth: '150px'
              }}>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600' }}>POSIZIONE</div>
                <div style={{ fontSize: '2rem', fontWeight: '900', color: '#fff', fontFamily: 'monospace' }}>
                  {utentePosizione}° <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 'normal' }}>su 151</span>
                </div>
              </div>
            </div>

            {/* Tabella Graduatoria Scrollabile */}
            <div style={{ 
              background: 'rgba(15, 23, 42, 0.3)', 
              borderRadius: '16px', 
              border: '1px solid rgba(255,255,255,0.05)',
              overflow: 'hidden'
            }}>
              {/* Header Tabella */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '80px 1fr 100px 100px', 
                padding: '1rem 1.5rem', 
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(15, 23, 42, 0.6)',
                fontWeight: 'bold',
                color: '#94a3b8',
                fontSize: '0.85rem',
                textTransform: 'uppercase'
              }}>
                <div>Pos</div>
                <div>Candidato</div>
                <div style={{ textAlign: 'right' }}>Precisione</div>
                <div style={{ textAlign: 'right' }}>Punti</div>
              </div>

              {/* Lista candidati scrollabile */}
              <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                {graduatoria.map((c) => {
                  const isPodio = c.posizione <= 3;
                  const isVincitore = c.posizione <= 30;

                  let rigaBg = 'transparent';
                  let rigaBorder = 'none';
                  
                  if (c.isUser) {
                    rigaBg = 'rgba(234, 179, 8, 0.12)';
                    rigaBorder = '1px solid rgba(234, 179, 8, 0.4)';
                  } else if (c.posizione % 2 === 0) {
                    rigaBg = 'rgba(255, 255, 255, 0.01)';
                  }

                  return (
                    <div 
                      key={c.id} 
                      id={c.isUser ? 'user-rank-row' : undefined}
                      style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '80px 1fr 100px 100px', 
                        padding: '0.9rem 1.5rem', 
                        alignItems: 'center',
                        background: rigaBg,
                        border: rigaBorder,
                        borderBottom: c.isUser ? rigaBorder : '1px solid rgba(255,255,255,0.03)',
                        fontSize: '0.95rem',
                        fontWeight: c.isUser ? 'bold' : 'normal',
                        color: c.isUser ? '#fde047' : '#e2e8f0',
                      }}
                    >
                      {/* Posizione */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {isPodio ? (
                          <span style={{ 
                            background: c.posizione === 1 ? '#eab308' : c.posizione === 2 ? '#94a3b8' : '#cd7f32', 
                            color: '#0f172a',
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem',
                            fontWeight: 'bold'
                          }}>
                            {c.posizione}
                          </span>
                        ) : (
                          <span style={{ 
                            color: isVincitore ? '#4ade80' : '#64748b', 
                            fontFamily: 'monospace',
                            paddingLeft: '4px'
                          }}>
                            {c.posizione}°
                          </span>
                        )}
                      </div>

                      {/* Nome Candidato */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>{c.nome}</span>
                        {c.isUser && (
                          <span style={{ 
                            background: '#eab308', 
                            color: '#0f172a', 
                            fontSize: '0.7rem', 
                            padding: '1px 6px', 
                            borderRadius: '99px',
                            fontWeight: '900'
                          }}>
                            TU
                          </span>
                        )}
                        {!c.isUser && isVincitore && (
                          <span style={{ 
                            background: 'rgba(34, 197, 94, 0.15)', 
                            color: '#4ade80', 
                            fontSize: '0.7rem', 
                            padding: '1px 6px', 
                            borderRadius: '99px',
                          }}>
                            Vincitore
                          </span>
                        )}
                      </div>

                      {/* Precisione */}
                      <div style={{ textAlign: 'right', fontFamily: 'monospace', color: '#94a3b8' }}>
                        {c.percentuale}%
                      </div>

                      {/* Punteggio */}
                      <div style={{ 
                        textAlign: 'right', 
                        fontFamily: 'monospace', 
                        fontWeight: 'bold', 
                        color: isVincitore ? '#f8fafc' : '#94a3b8' 
                      }}>
                        {c.punteggio.toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Stats per Layer */}
        <section style={{ background: '#1e293b', borderRadius: '20px', padding: '2rem', border: '1px solid #334155' }}>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1.5rem 0' }}>
            <BarChart3 size={24} color="#3b82f6" />
            Prestazioni per Layer
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Core */}
            {statsByLayer.core.totali > 0 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                  <span style={{ fontWeight: '600' }}>Core Nazionale</span>
                  <span style={{ color: '#94a3b8' }}>
                    {statsByLayer.core.corrette}/{statsByLayer.core.totali} ({statsByLayer.core.percentuale}%)
                  </span>
                </div>
                <div style={{ height: '12px', background: '#0f172a', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${statsByLayer.core.percentuale}%`, 
                    height: '100%', 
                    background: getColor(statsByLayer.core.percentuale),
                    transition: 'width 0.8s ease'
                  }} />
                </div>
              </div>
            )}

            {/* Regionale */}
            {statsByLayer.regionale.totali > 0 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                  <span style={{ fontWeight: '600' }}>Regionale</span>
                  <span style={{ color: '#94a3b8' }}>
                    {statsByLayer.regionale.corrette}/{statsByLayer.regionale.totali} ({statsByLayer.regionale.percentuale}%)
                  </span>
                </div>
                <div style={{ height: '12px', background: '#0f172a', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${statsByLayer.regionale.percentuale}%`, 
                    height: '100%', 
                    background: getColor(statsByLayer.regionale.percentuale),
                    transition: 'width 0.8s ease'
                  }} />
                </div>
              </div>
            )}

            {/* Comunale */}
            {statsByLayer.comunale.totali > 0 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                  <span style={{ fontWeight: '600' }}>Comunale</span>
                  <span style={{ color: '#94a3b8' }}>
                    {statsByLayer.comunale.corrette}/{statsByLayer.comunale.totali} ({statsByLayer.comunale.percentuale}%)
                  </span>
                </div>
                <div style={{ height: '12px', background: '#0f172a', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${statsByLayer.comunale.percentuale}%`, 
                    height: '100%', 
                    background: getColor(statsByLayer.comunale.percentuale),
                    transition: 'width 0.8s ease'
                  }} />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Categorie Deboli */}
        {categorieDeboli.length > 0 && (
          <section style={{ 
            background: '#1e293b', 
            borderRadius: '20px', 
            padding: '2rem', 
            border: '1px solid #334155',
            borderLeft: '4px solid #f59e0b'
          }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1rem 0' }}>
              <AlertTriangle size={24} color="#f59e0b" />
              Aree da migliorare
            </h3>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#94a3b8', lineHeight: 2 }}>
              {categorieDeboli.slice(0, 5).map((cat, idx) => (
                <li key={idx}>
                  <strong style={{ color: '#f8fafc' }}>{cat.nome}</strong> 
                  <span style={{ color: '#64748b' }}> ({cat.layer})</span> — {cat.corrette}/{cat.totali} ({cat.percentuale}%)
                </li>
              ))}
            </ul>
            {categorieDeboli.length > 5 && (
              <p style={{ marginTop: '1rem', marginBottom: 0, color: '#64748b', fontSize: '0.9rem' }}>
                ...e altre {categorieDeboli.length - 5} categorie sotto il 60%
              </p>
            )}
          </section>
        )}

        {/* 🆕 Post-Quiz Recovery Screen */}
        <section style={{
          background: '#1e293b',
          borderRadius: '20px',
          padding: '2rem',
          border: '1px solid #334155',
        }}>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1.5rem 0' }}>
            <Target size={24} color="#8b5cf6" />
            Report Post-Quiz
          </h3>

          {/* Delta vs ultima sessione */}
          {performanceDelta !== null && (
            <div style={{
              background: performanceDelta >= 0 ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)',
              border: `1px solid ${performanceDelta >= 0 ? 'rgba(34, 197, 94, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
              borderRadius: '16px',
              padding: '1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}>
              <div style={{
                fontSize: '2rem',
                fontWeight: '900',
                fontFamily: 'monospace',
                color: performanceDelta >= 0 ? '#4ade80' : '#f87171',
              }}>
                {performanceDelta >= 0 ? `+${performanceDelta}%` : `${performanceDelta}%`}
              </div>
              <div>
                <div style={{ fontWeight: '700', color: '#f8fafc', marginBottom: '0.25rem' }}>
                  {performanceDelta >= 0 ? '📈 Stai migliorando!' : '📉 Risultato in calo'}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                  Rispetto al quiz precedente ({lastQuizPercentage}%)
                </div>
              </div>
            </div>
          )}

          {/* Punti Forti e Deboli */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {/* Punti Forti */}
            <div style={{
              background: 'rgba(34, 197, 94, 0.06)',
              border: '1px solid rgba(34, 197, 94, 0.15)',
              borderRadius: '16px',
              padding: '1.25rem',
            }}>
              <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '1rem', color: '#4ade80', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={18} /> Punti Forti
              </h4>
              {statsByLayer.core.percentuale >= 75 && statsByLayer.core.totali > 0 && (
                <div style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '0.25rem' }}>✅ Core Nazionale ({statsByLayer.core.percentuale}%)</div>
              )}
              {statsByLayer.regionale.percentuale >= 75 && statsByLayer.regionale.totali > 0 && (
                <div style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '0.25rem' }}>✅ Regionale ({statsByLayer.regionale.percentuale}%)</div>
              )}
              {statsByLayer.comunale.percentuale >= 75 && statsByLayer.comunale.totali > 0 && (
                <div style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '0.25rem' }}>✅ Comunale ({statsByLayer.comunale.percentuale}%)</div>
              )}
              {percentuale >= 75 && <div style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>✅ Precisione globale eccellente</div>}
              {statsByLayer.core.percentuale < 75 && statsByLayer.regionale.percentuale < 75 && statsByLayer.comunale.percentuale < 75 && percentuale < 75 && (
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>Nessun layer supera il 75% — continua a studiare!</div>
              )}
            </div>

            {/* Punti Deboli */}
            <div style={{
              background: 'rgba(239, 68, 68, 0.06)',
              border: '1px solid rgba(239, 68, 68, 0.15)',
              borderRadius: '16px',
              padding: '1.25rem',
            }}>
              <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '1rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <XCircle size={18} /> Punti Deboli
              </h4>
              {categorieDeboli.slice(0, 3).map((cat, idx) => (
                <div key={idx} style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '0.25rem' }}>
                  ⚠️ {cat.nome} ({cat.percentuale}%)
                </div>
              ))}
              {categorieDeboli.length === 0 && (
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>Nessuna materia sotto il 60% — ottimo lavoro!</div>
              )}
            </div>
          </div>

          {/* CTA Correzione Errori Immediata */}
          {errate > 0 && (
            <button
              onClick={onRevisione}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                border: 'none',
                borderRadius: '16px',
                padding: '1.25rem',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '1.1rem',
                fontWeight: '700',
                transition: 'transform 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.25)',
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              🩹 Ripassa subito i tuoi {errate} errori con feedback immediato!
            </button>
          )}
        </section>

        {/* 🆕 Infinite Study Flow */}
        <section style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)',
          borderRadius: '20px',
          padding: '2rem',
          border: '1px solid rgba(99, 102, 241, 0.2)',
        }}>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1.5rem 0' }}>
            Cosa vuoi fare adesso? ♾️
          </h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {/* Opzione 1: Prossimo Quiz */}
            <button
              onClick={() => {
                const domande = generaQuizVeloce(10);
                if (domande.length > 0) {
                  navigate('/study', { state: { domande, mode: 'veloce' } });
                }
              }}
              style={{
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '16px',
                padding: '1.25rem',
                color: '#f8fafc',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                fontSize: '1.05rem',
                fontWeight: '600',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = '#3b82f6';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = '#334155';
              }}
            >
              <div style={{ background: 'rgba(59, 130, 246, 0.15)', width: '46px', height: '46px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ArrowRight size={24} color="#3b82f6" />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div>Affronta il Prossimo Quiz ➡️</div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'normal' }}>10 domande casuali da tutte le materie</div>
              </div>
            </button>

            {/* Opzione 2: Mini Sfida da 5 */}
            <button
              onClick={() => {
                const domande = generaQuizVeloce(5);
                if (domande.length > 0) {
                  navigate('/study', { state: { domande, mode: 'veloce' } });
                }
              }}
              style={{
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '16px',
                padding: '1.25rem',
                color: '#f8fafc',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                fontSize: '1.05rem',
                fontWeight: '600',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = '#eab308';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = '#334155';
              }}
            >
              <div style={{ background: 'rgba(234, 179, 8, 0.15)', width: '46px', height: '46px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Zap size={24} color="#eab308" />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div>Mini Sfida da 5 Quiz ⚡</div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'normal' }}>Ultra-rapido: mettiti alla prova in 2 minuti</div>
              </div>
            </button>

            {/* Opzione 3: Studio materia debole */}
            {categorieDeboli.length > 0 && (
              <button
                onClick={() => navigate('/quiz-builder')}
                style={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  color: '#f8fafc',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  fontSize: '1.05rem',
                  fontWeight: '600',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = '#8b5cf6';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = '#334155';
                }}
              >
                <div style={{ background: 'rgba(139, 92, 246, 0.15)', width: '46px', height: '46px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <BookOpen size={24} color="#8b5cf6" />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div>Studia Materia: {categorieDeboli[0].nome} 📚</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'normal' }}>Concentrati sulla tua materia più debole ({categorieDeboli[0].percentuale}%)</div>
                </div>
              </button>
            )}

            {/* Torna alla Dashboard */}
            <button
              onClick={onNuovoQuiz}
              style={{
                background: 'transparent',
                border: '1px solid #475569',
                borderRadius: '16px',
                padding: '1rem',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: '600',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => { e.currentTarget.style.color = '#f8fafc'; e.currentTarget.style.borderColor = '#64748b'; }}
              onMouseOut={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = '#475569'; }}
            >
              🏠 Torna alla Dashboard
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
