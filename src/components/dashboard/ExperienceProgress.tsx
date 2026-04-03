import React from 'react';
import { motion } from 'framer-motion';

interface ExperienceProgressProps {
  xp: number;
  level: number;
  xpPerLevel?: number;
}

const ExperienceProgress: React.FC<ExperienceProgressProps> = ({ 
  xp, 
  level, 
  xpPerLevel = 500 
}) => {
  const currentXPPercent = Math.min(100, Math.max(0, ((xp % xpPerLevel) / xpPerLevel) * 100));

  return (
    <div className="xp-container">
      <div className="xp-label-row">
        <div>
          <span style={{ fontSize: '0.7rem', color: 'var(--slate-text)', display: 'block', marginBottom: '2px' }}>
            ESPERIENZA
          </span>
          <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'white' }}>
            {xp.toLocaleString()} <span style={{ fontSize: '0.8rem', color: 'var(--slate-text)', fontWeight: '400' }}>XP</span>
          </span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--slate-text)', display: 'block', marginBottom: '2px' }}>
            GRADO
          </span>
          <span className="xp-level-badge">
            {level}
          </span>
        </div>
      </div>
      
      <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '100px', overflow: 'hidden' }}>
        <motion.div
          style={{ height: '100%', background: 'linear-gradient(90deg, var(--pl-gold), var(--pl-gold-light))' }}
          initial={{ width: 0 }}
          animate={{ width: `${currentXPPercent}%` }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }}
        />
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--slate-text)', fontWeight: '500' }}>
        <span>LVL {level}</span>
        <span>{xpPerLevel - (xp % xpPerLevel)} XP AL PROSSIMO GRADO</span>
        <span>LVL {level + 1}</span>
      </div>
    </div>
  );
};

export default ExperienceProgress;
