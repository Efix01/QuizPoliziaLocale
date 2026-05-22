/**
 * AchievementToast — Notifica animata per traguardi sbloccati
 * 
 * Mostra un toast celebrativo con animazione quando l'utente
 * sblocca un nuovo traguardo. Stile premium con particelle.
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import type { Achievement } from '../../engine/AchievementEngine';
import { getAchievementColor, getAchievementRaritaLabel } from '../../engine/AchievementEngine';

interface AchievementToastProps {
  achievement: Achievement | null;
  onDismiss: () => void;
  autoDismissMs?: number;
}

export default function AchievementToast({
  achievement,
  onDismiss,
  autoDismissMs = 6000,
}: AchievementToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onDismiss, 400); // wait for exit animation
      }, autoDismissMs);
      return () => clearTimeout(timer);
    }
  }, [achievement, autoDismissMs, onDismiss]);

  if (!achievement) return null;

  const rarityColor = getAchievementColor(achievement.rarita);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -80, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.95 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          style={{
            position: 'fixed',
            top: '1.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            width: 'min(420px, calc(100vw - 2rem))',
          }}
        >
          <div style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.97) 0%, rgba(30, 41, 59, 0.97) 100%)',
            backdropFilter: 'blur(16px)',
            border: `2px solid ${rarityColor}50`,
            borderRadius: '20px',
            padding: '1.5rem',
            boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 30px ${rarityColor}20`,
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Glow background */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `radial-gradient(ellipse at 50% 0%, ${rarityColor}15 0%, transparent 70%)`,
              pointerEvents: 'none',
            }} />

            {/* Close button */}
            <button
              onClick={() => { setVisible(false); setTimeout(onDismiss, 300); }}
              style={{
                position: 'absolute',
                top: '0.75rem',
                right: '0.75rem',
                background: 'none',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: '0.25rem',
                zIndex: 1,
              }}
              aria-label="Chiudi notifica traguardo"
            >
              <X size={16} />
            </button>

            {/* Content */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              {/* Top label */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  marginBottom: '0.75rem',
                }}
              >
                <Sparkles size={14} color={rarityColor} />
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  color: rarityColor,
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                }}>
                  Traguardo {getAchievementRaritaLabel(achievement.rarita)} Sbloccato!
                </span>
              </motion.div>

              {/* Main content */}
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                {/* Badge icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.3 }}
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `${rarityColor}18`,
                    border: `1px solid ${rarityColor}30`,
                    fontSize: '1.8rem',
                    flexShrink: 0,
                  }}
                >
                  {achievement.icona}
                </motion.div>

                {/* Text */}
                <div>
                  <motion.h4
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 }}
                    style={{
                      margin: 0,
                      fontSize: '1.15rem',
                      fontWeight: 800,
                      color: '#f8fafc',
                    }}
                  >
                    {achievement.titolo}
                  </motion.h4>
                  <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    style={{
                      margin: '0.2rem 0 0 0',
                      fontSize: '0.85rem',
                      color: '#94a3b8',
                      lineHeight: 1.3,
                    }}
                  >
                    {achievement.descrizione}
                  </motion.p>
                </div>
              </div>

              {/* XP Reward */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '0.4rem',
                  marginTop: '0.75rem',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  color: '#f59e0b',
                }}
              >
                <Sparkles size={14} />
                +{achievement.xpReward} XP
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
