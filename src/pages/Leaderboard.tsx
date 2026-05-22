import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Flame, Zap, Award, Users, Globe, ChevronLeft } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { usePL } from '../context/PLContext';
import { useAuth } from '../context/AuthContext';

interface LeaderboardEntry {
  rank: number;
  nome: string;
  avatarGradient: string;
  xp: number;
  streak: number;
  livello: number;
  isCurrentUser?: boolean;
}

export default function Leaderboard() {
  const navigate = useNavigate();
  const { progressiGlobali } = useProgress();
  const { profilo } = usePL();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'nazionale' | 'settimanale' | 'amici'>('settimanale');

  const {
    xp = 0,
    streak = 0,
    livello = 1,
  } = progressiGlobali || {};

  const currentUserName = user?.displayName || (profilo?.nomeComune ? `Candidato ${profilo.nomeComune}` : 'Tu (Candidato)');

  // Generazione classifiche simulate coerenti
  const leaderboardData = useMemo(() => {
    // 1. Dati Nazionale
    const mockNazionale: LeaderboardEntry[] = [
      { rank: 1, nome: 'Marco R.', avatarGradient: 'linear-gradient(135deg, #f59e0b, #d97706)', xp: 14250, streak: 28, livello: 8 },
      { rank: 2, nome: 'Sofia V.', avatarGradient: 'linear-gradient(135deg, #a855f7, #7c3aed)', xp: 12100, streak: 14, livello: 7 },
      { rank: 3, nome: 'Giuseppe B.', avatarGradient: 'linear-gradient(135deg, #06b6d4, #0891b2)', xp: 9800, streak: 19, livello: 6 },
      { rank: 4, nome: 'Elena M.', avatarGradient: 'linear-gradient(135deg, #10b981, #059669)', xp: 7540, streak: 8, livello: 5 },
      { rank: 5, nome: currentUserName, avatarGradient: 'linear-gradient(135deg, #3b82f6, #2563eb)', xp: xp, streak: streak, livello: livello, isCurrentUser: true },
      { rank: 6, nome: 'Alessandro T.', avatarGradient: 'linear-gradient(135deg, #ec4899, #db2777)', xp: Math.max(1200, xp - 400), streak: 5, livello: Math.max(1, livello - 1) },
      { rank: 7, nome: 'Valentina P.', avatarGradient: 'linear-gradient(135deg, #f43f5e, #e11d48)', xp: Math.max(800, xp - 800), streak: 2, livello: Math.max(1, livello - 1) },
      { rank: 8, nome: 'Matteo G.', avatarGradient: 'linear-gradient(135deg, #84cc16, #65a30d)', xp: Math.max(500, xp - 1200), streak: 0, livello: Math.max(1, livello - 2) },
    ].sort((a, b) => b.xp - a.xp);

    // Ricalcola i rank dopo l'ordinamento
    mockNazionale.forEach((item, idx) => {
      item.rank = idx + 1;
    });

    // 2. Dati Settimanale
    // Per rendere interessante la competizione, l'utente è posizionato a metà della classifica settimanale
    const mockSettimanale: LeaderboardEntry[] = [
      { rank: 1, nome: 'Sofia V.', avatarGradient: 'linear-gradient(135deg, #a855f7, #7c3aed)', xp: 2150, streak: 14, livello: 7 },
      { rank: 2, nome: 'Elena M.', avatarGradient: 'linear-gradient(135deg, #10b981, #059669)', xp: 1840, streak: 8, livello: 5 },
      { rank: 3, nome: currentUserName, avatarGradient: 'linear-gradient(135deg, #3b82f6, #2563eb)', xp: Math.min(xp, 1600), streak: streak, livello: livello, isCurrentUser: true },
      { rank: 4, nome: 'Marco R.', avatarGradient: 'linear-gradient(135deg, #f59e0b, #d97706)', xp: 1200, streak: 28, livello: 8 },
      { rank: 5, nome: 'Alessandro T.', avatarGradient: 'linear-gradient(135deg, #ec4899, #db2777)', xp: 950, streak: 5, livello: Math.max(1, livello - 1) },
      { rank: 6, nome: 'Valentina P.', avatarGradient: 'linear-gradient(135deg, #f43f5e, #e11d48)', xp: 450, streak: 2, livello: Math.max(1, livello - 1) },
    ].sort((a, b) => b.xp - a.xp);

    mockSettimanale.forEach((item, idx) => {
      item.rank = idx + 1;
    });

    // 3. Dati Amici
    const mockAmici: LeaderboardEntry[] = [
      { rank: 1, nome: 'Giuseppe B. (Collega)', avatarGradient: 'linear-gradient(135deg, #06b6d4, #0891b2)', xp: 9800, streak: 19, livello: 6 },
      { rank: 2, nome: currentUserName, avatarGradient: 'linear-gradient(135deg, #3b82f6, #2563eb)', xp: xp, streak: streak, livello: livello, isCurrentUser: true },
      { rank: 3, nome: 'Alessandro T. (Amico)', avatarGradient: 'linear-gradient(135deg, #ec4899, #db2777)', xp: Math.max(1200, xp - 400), streak: 5, livello: Math.max(1, livello - 1) },
      { rank: 4, nome: 'Valentina P. (Studio)', avatarGradient: 'linear-gradient(135deg, #f43f5e, #e11d48)', xp: Math.max(800, xp - 800), streak: 2, livello: Math.max(1, livello - 1) },
    ].sort((a, b) => b.xp - a.xp);

    mockAmici.forEach((item, idx) => {
      item.rank = idx + 1;
    });

    return {
      nazionale: mockNazionale,
      settimanale: mockSettimanale,
      amici: mockAmici
    };
  }, [xp, streak, livello, currentUserName]);

  const activeList = leaderboardData[activeTab];

  // Trova la posizione dell'utente corrente
  const currentUserPos = activeList.find(item => item.isCurrentUser);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)', color: '#f8fafc', padding: '2rem 1.5rem', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Header */}
        <header style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-elite)',
              color: '#fff',
              padding: '0.6rem',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseOver={e => e.currentTarget.style.borderColor = 'var(--elite-primary)'}
            onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border-elite)'}
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Trophy size={24} color="#f59e0b" fill="#f59e0b" />
              Classifiche Accademia
            </h1>
            <p style={{ color: '#94a3b8', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
              Gareggia amichevolmente con altri candidati e mantieni alto l'impegno.
            </p>
          </div>
        </header>

        {/* User Card Podio Preview */}
        {currentUserPos && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, var(--bg-card) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.2)',
            borderRadius: '20px',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                background: '#f59e0b',
                color: '#0f172a',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '900',
                fontSize: '1rem',
                boxShadow: '0 0 10px rgba(245, 158, 11, 0.4)'
              }}>
                #{currentUserPos.rank}
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  La tua posizione ({activeTab})
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff' }}>{currentUserName}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>PUNTI XP</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.2rem', justifyContent: 'flex-end' }}>
                  <Zap size={14} color="#f59e0b" fill="#f59e0b" /> {xp}
                </div>
              </div>
              {streak > 0 && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>STREAK</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#f97316', display: 'flex', alignItems: 'center', gap: '0.2rem', justifyContent: 'flex-end' }}>
                    <Flame size={14} color="#f97316" fill="#f97316" /> {streak}d
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-card)',
          padding: '0.35rem',
          borderRadius: '14px',
          border: '1px solid var(--border-elite)',
        }}>
          {[
            { id: 'settimanale' as const, label: 'Settimanale', icon: Users },
            { id: 'nazionale' as const, label: 'Nazionale', icon: Globe },
            { id: 'amici' as const, label: 'Amici', icon: Trophy },
          ].map(tab => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  background: isActive ? '#1e293b' : 'transparent',
                  color: isActive ? '#fff' : '#94a3b8',
                  border: 'none',
                  padding: '0.6rem 0.5rem',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.88rem',
                  transition: 'all 0.2s',
                }}
              >
                <Icon size={16} color={isActive ? 'var(--elite-accent)' : '#94a3b8'} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* List of ranks */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '24px',
          border: '1px solid var(--border-elite)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {activeList.map((entry, index) => {
            const isTop3 = entry.rank <= 3;
            const isUser = entry.isCurrentUser;
            
            // Colori speciali per i primi 3
            const trophyColor = entry.rank === 1 ? '#d4af37' : entry.rank === 2 ? '#c0c0c0' : '#cd7f32';

            return (
              <motion.div
                key={entry.nome}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem 1.5rem',
                  borderBottom: index === activeList.length - 1 ? 'none' : '1px solid var(--border-elite)',
                  background: isUser ? 'rgba(59, 130, 246, 0.06)' : 'transparent',
                  transition: 'background 0.2s',
                }}
                onMouseOver={e => { if(!isUser) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                onMouseOut={e => { if(!isUser) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0 }}>
                  
                  {/* Posizione Rank */}
                  <div style={{
                    width: '32px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontWeight: '800',
                    fontSize: '1rem',
                    color: isTop3 ? trophyColor : '#64748b'
                  }}>
                    {isTop3 ? (
                      <Award size={22} color={trophyColor} />
                    ) : (
                      entry.rank
                    )}
                  </div>

                  {/* Avatar */}
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: entry.avatarGradient,
                    color: '#fff',
                    fontWeight: '800',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isTop3 ? `0 0 10px ${trophyColor}33` : 'none',
                    flexShrink: 0,
                  }}>
                    {entry.nome.slice(0, 2).toUpperCase()}
                  </div>

                  {/* Nome e Livello */}
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontWeight: isUser ? '800' : '600',
                      color: isUser ? '#fff' : '#cbd5e1',
                      fontSize: '0.95rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {entry.nome}
                      {isUser && <span style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6', fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 'bold' }}>TU</span>}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '500' }}>
                      Livello {entry.livello}
                    </div>
                  </div>
                </div>

                {/* XP & Streak details */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexShrink: 0 }}>
                  
                  {/* Streak */}
                  {entry.streak > 0 ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.15rem',
                      color: '#f97316',
                      fontWeight: '700',
                      fontSize: '0.85rem'
                    }} title={`Streak di ${entry.streak} giorni`}>
                      <Flame size={14} color="#f97316" fill="#f97316" />
                      {entry.streak}
                    </div>
                  ) : (
                    <div style={{ width: '22px' }} />
                  )}

                  {/* XP */}
                  <div style={{
                    minWidth: '65px',
                    textAlign: 'right',
                    fontWeight: '800',
                    color: '#f8fafc',
                    fontSize: '0.95rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '0.25rem'
                  }}>
                    <Zap size={14} color="#f59e0b" fill="#f59e0b" />
                    {entry.xp}
                  </div>

                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Tip Informativa */}
        <div style={{
          background: 'rgba(99, 102, 241, 0.05)',
          border: '1px solid rgba(99, 102, 241, 0.15)',
          borderRadius: '16px',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
        }}>
          <span style={{ fontSize: '1.25rem' }}>💡</span>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
            Ottieni XP completando simulazioni d'esame (+50 XP), rispondendo correttamente ai quiz (+10 XP) o mantenendo la tua striscia quotidiana di studio! La classifica settimanale si azzera ogni domenica a mezzanotte.
          </p>
        </div>

      </div>
    </div>
  );
}
