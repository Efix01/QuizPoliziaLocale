
interface RuotaData {
  raggi: (number | string)[];
  sommaOpposti: number;
  indiceMancante: number;
}

function spokeAngle(i: number, n: number): number {
  return (2 * Math.PI * i) / n - Math.PI / 2;
}

export default function RuotaNumerica({ data }: { data: RuotaData }) {
  const { raggi, sommaOpposti } = data;
  const n = raggi.length;

  const S = 300;
  const cx = S / 2, cy = S / 2;
  const R_HUB   = 34;
  const R_RIM   = 90;
  const R_NODE  = 22;
  const R_LABEL = R_RIM + R_NODE + 6; // 118px from center

  return (
    <svg
      viewBox={`0 0 ${S} ${S}`}
      className="w-full max-w-[260px] mx-auto drop-shadow-sm"
      aria-label="Ruota numerica"
    >
      <defs>
        <radialGradient id="rn-hub" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#4f46e5" />
        </radialGradient>
        <filter id="rn-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer dashed rim */}
      <circle
        cx={cx} cy={cy} r={R_RIM}
        fill="none" stroke="#818cf8" strokeWidth={1.5}
        strokeDasharray="6 4" opacity={0.35}
      />

      {/* Spokes and tip nodes */}
      {raggi.map((val, i) => {
        const a  = spokeAngle(i, n);
        const nx = cx + R_LABEL * Math.cos(a);
        const ny = cy + R_LABEL * Math.sin(a);
        const sx1 = cx + (R_HUB + 3) * Math.cos(a);
        const sy1 = cy + (R_HUB + 3) * Math.sin(a);
        const sx2 = cx + (R_RIM  - 2) * Math.cos(a);
        const sy2 = cy + (R_RIM  - 2) * Math.sin(a);
        const isQ = val === '?';

        return (
          <g key={i}>
            <line
              x1={sx1} y1={sy1} x2={sx2} y2={sy2}
              stroke={isQ ? '#f59e0b' : '#818cf8'}
              strokeWidth={isQ ? 2.5 : 1.5}
              opacity={isQ ? 1 : 0.6}
            />
            <circle
              cx={nx} cy={ny} r={R_NODE}
              fill={isQ ? '#fef3c7' : '#eef2ff'}
              stroke={isQ ? '#f59e0b' : '#818cf8'}
              strokeWidth={isQ ? 2.5 : 1.5}
              filter={isQ ? 'url(#rn-glow)' : undefined}
            />
            <text
              x={nx} y={ny}
              textAnchor="middle" dominantBaseline="middle"
              fontSize={isQ ? 20 : 15}
              fontWeight="bold"
              fill={isQ ? '#d97706' : '#4338ca'}
            >
              {val}
            </text>
          </g>
        );
      })}

      {/* Central hub */}
      <circle cx={cx} cy={cy} r={R_HUB} fill="url(#rn-hub)" />
      <text
        x={cx} y={cy - 11}
        textAnchor="middle" fontSize={8} fill="white" opacity={0.85}
        letterSpacing="0.3"
      >
        Σ opposti
      </text>
      <text
        x={cx} y={cy + 10}
        textAnchor="middle" dominantBaseline="middle"
        fontSize={20} fontWeight="bold" fill="white"
      >
        {sommaOpposti}
      </text>
    </svg>
  );
}
