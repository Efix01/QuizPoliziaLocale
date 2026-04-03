import React from 'react';
import { motion } from 'framer-motion';

interface ReadinessGaugeProps {
  value: number; // 0 to 100
  label?: string;
  size?: number;
}

const ReadinessGauge: React.FC<ReadinessGaugeProps> = ({ value, label = "PRONTEZZA", size = 120 }) => {
  const radius = size / 2 - 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="readiness-gauge-container">
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="var(--pl-gold)"
            strokeWidth="8"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
            strokeLinecap="round"
          />
        </svg>
        
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '1.8rem', fontWeight: '800', lineHeight: 1 }}>
            {value}
          </span>
          <span style={{ fontSize: '0.6rem', color: 'var(--pl-gold)', fontWeight: '700' }}>
            %
          </span>
        </div>
      </div>
      <span className="readiness-label">{label}</span>
    </div>
  );
};

export default ReadinessGauge;
