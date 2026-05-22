/**
 * AchievementPanel — Pannello traguardi per la dashboard
 * 
 * Mostra i traguardi dell'utente organizzati per rarità,
 * con barre di progresso animate e indicatori di stato.
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Lock, ChevronRight, Sparkles } from 'lucide-react';
import { useProgress } from '../../context/ProgressContext';
import {
  ACHIEVEMENT_CATALOG,
  getAchievementsStatus,
  getAchievementColor,
  getAchievementRaritaLabel,
  type AchievementSbloccato,
  type AchievementRarity,
} from '../../engine/AchievementEngine';

interface AchievementPanelProps {
  /** Achievement sbloccati salvati nello stato utente */
  achievementsSbloccati: Record<string, AchievementSbloccato>;
  /** Se true, mostra pannello compatto (solo prossimi 3) */
  compact?: boolean;
}

const RARITY_ORDER: AchievementRarity[] = ['leggendario', 'epico', 'raro', 'comune'];

export default function AchievementPanel({ achievementsSbloccati, compact = false }: AchievementPanelProps) {
  const { progressiGlobali } = useProgress();
  const [selectedRarity, setSelectedRarity] = useState<AchievementRarity | 'tutti'>('tutti');
  const [expanded, setExpanded] = useState(!compact);

  const status = useMemo(
    () => getAchievementsStatus(progressiGlobali, achievementsSbloccati),
    [progressiGlobali, achievementsSbloccati],
  );

  const sbloccatiCount = status.filter(s => s.sbloccato).length;
  const totale = ACHIEVEMENT_CATALOG.length;

  // Filtro e ordinamento
  const filtered = useMemo(() => {
    let items = status;
    if (selectedRarity !== 'tutti') {
      items = items.filter(s => s.achievement.rarita === selectedRarity);
    }
    // Ordina: quasi-sbloccati prima, poi per progresso, poi per rarità
    return items.sort((a, b) => {
      if (a.sbloccato && !b.sbloccato) return 1;
      if (!a.sbloccato && b.sbloccato) return -1;
      if (!a.sbloccato && !b.sbloccato) {
        return b.progressPct - a.progressPct;
      }
      return RARITY_ORDER.indexOf(a.achievement.rarita) - RARITY_ORDER.indexOf(b.achievement.rarita);
    });
  }, [status, selectedRarity]);

  // Compact: mostra solo i prossimi 3 traguardi più vicini (non sbloccati)
  const displayItems = compact
    ? filtered.filter(s => !s.sbloccato).slice(0, 3)
    : filtered;

  return (
    <section style={{
      background: 'var(--bg-card)',
      borderRadius: '24px',
      padding: '2rem',
      border: '1px solid var(--border-elite)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
    }}>
      {/* Header */}
      <div
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: compact ? 'pointer' : 'default' }}
        onClick={() => compact && setExpanded(!expanded)}
        role={compact ? 'button' : undefined}
        tabIndex={compact ? 0 : undefined}
        onKeyDown={e => compact && e.key === 'Enter' && setExpanded(!expanded)}
      >
        <div>
          <h3 style={{
            margin: 0,
            fontSize: '1.3rem',
            fontWeight: '800',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <Trophy size={22} color="#f59e0b" />
            Traguardi
          </h3>
          <p style={{ color: '#94a3b8', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
            {sbloccatiCount}/{totale} sbloccati — {sbloccatiCount === totale ? 'Tutti completati! 🏆' : 'Continua a studiare!'}
          </p>
        </div>
        {compact && (
          <ChevronRight
            size={20}
            color="#64748b"
            style={{
              transition: 'transform 0.3s',
              transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
            }}
          />
        )}
      </div>

      {/* Barra progresso globale */}
      <div>
        <div style={{
          height: '8px',
          background: 'var(--bg-deep)',
          borderRadius: '4px',
          overflow: 'hidden',
        }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.round((sbloccatiCount / totale) * 100)}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #f59e0b, #eab308)',
              borderRadius: '4px',
            }}
          />
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '0.35rem',
          fontSize: '0.75rem',
          color: '#64748b',
          fontWeight: 600,
        }}>
          <span>{Math.round((sbloccatiCount / totale) * 100)}%</span>
          <span>{sbloccatiCount} su {totale}</span>
        </div>
      </div>

      <AnimatePresence>
        {(expanded || !compact) && (
          <motion.div
            initial={compact ? { height: 0, opacity: 0 } : undefined}
            animate={{ height: 'auto', opacity: 1 }}
            exit={compact ? { height: 0, opacity: 0 } : undefined}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            {/* Filtri rarità (solo in full mode) */}
            {!compact && (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {(['tutti', ...RARITY_ORDER] as const).map(rarity => (
                  <button
                    key={rarity}
                    onClick={() => setSelectedRarity(rarity)}
                    style={{
                      background: selectedRarity === rarity
                        ? rarity === 'tutti' ? 'var(--elite-primary)' : getAchievementColor(rarity as AchievementRarity)
                        : 'var(--bg-deep)',
                      color: selectedRarity === rarity ? '#fff' : '#94a3b8',
                      border: `1px solid ${selectedRarity === rarity ? 'transparent' : 'var(--border-elite)'}`,
                      padding: '0.4rem 0.9rem',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {rarity === 'tutti' ? 'Tutti' : getAchievementRaritaLabel(rarity as AchievementRarity)}
                  </button>
                ))}
              </div>
            )}

            {/* Lista traguardi */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              maxHeight: compact ? undefined : '400px',
              overflowY: compact ? undefined : 'auto',
              paddingRight: compact ? undefined : '0.5rem',
            }}>
              {displayItems.map((item, idx) => {
                const { achievement, sbloccato, progressPct, progressDesc } = item;
                const rarityColor = getAchievementColor(achievement.rarita);

                return (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    style={{
                      display: 'flex',
                      gap: '1rem',
                      alignItems: 'center',
                      background: sbloccato
                        ? `linear-gradient(135deg, ${rarityColor}08 0%, ${rarityColor}04 100%)`
                        : 'var(--bg-deep)',
                      border: `1px solid ${sbloccato ? `${rarityColor}30` : 'var(--border-elite)'}`,
                      borderRadius: '14px',
                      padding: '1rem',
                      opacity: sbloccato ? 1 : progressPct > 0 ? 0.95 : 0.65,
                      transition: 'all 0.2s',
                    }}
                  >
                    {/* Icona */}
                    <div style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: sbloccato ? `${rarityColor}18` : 'var(--bg-card)',
                      fontSize: '1.4rem',
                      flexShrink: 0,
                      position: 'relative',
                    }}>
                      {sbloccato ? (
                        <>
                          {achievement.icona}
                          <Sparkles size={12} color={rarityColor} style={{ position: 'absolute', top: -2, right: -2 }} />
                        </>
                      ) : (
                        <Lock size={18} color="#475569" />
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.5rem' }}>
                        <h4 style={{
                          margin: 0,
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          color: sbloccato ? '#f8fafc' : '#cbd5e1',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {achievement.titolo}
                        </h4>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: rarityColor,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          flexShrink: 0,
                        }}>
                          {getAchievementRaritaLabel(achievement.rarita)}
                        </span>
                      </div>
                      <p style={{ margin: '0.2rem 0', fontSize: '0.8rem', color: '#64748b', lineHeight: 1.3 }}>
                        {achievement.descrizione}
                      </p>

                      {/* Barra progresso */}
                      {!sbloccato && (
                        <div style={{ marginTop: '0.4rem' }}>
                          <div style={{
                            height: '5px',
                            background: 'var(--bg-card)',
                            borderRadius: '3px',
                            overflow: 'hidden',
                          }}>
                            <div style={{
                              width: `${progressPct}%`,
                              height: '100%',
                              background: progressPct >= 80 ? rarityColor : '#475569',
                              borderRadius: '3px',
                              transition: 'width 0.5s ease',
                            }} />
                          </div>
                          <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.15rem', display: 'block' }}>
                            {progressDesc}
                          </span>
                        </div>
                      )}

                      {/* XP reward */}
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        marginTop: '0.3rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: sbloccato ? '#f59e0b' : '#475569',
                      }}>
                        <Sparkles size={12} />
                        +{achievement.xpReward} XP
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
