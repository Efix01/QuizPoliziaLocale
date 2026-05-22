import React from 'react';

interface RavenCell {
  forma: 'cerchio' | 'quadrato' | 'triangolo' | 'rombo';
  fill: number; // 0=vuoto, 0.5=metà, 1=pieno
}

interface MatriceData {
  celle: (RavenCell | null)[]; // 9 elementi, null = "?"
  forme: string[];
  fills: number[];
}

const PRIMARY = '#4f46e5';
const STROKE  = '#4338ca';

interface ShapeProps {
  forma: string;
  fill: number;
  cx: number;
  cy: number;
  s: number; // cell size
}

function Shape({ forma, fill, cx, cy, s }: ShapeProps) {
  const r  = s * 0.34;
  const shapeProps = {
    fill:        fill === 0 ? 'white' : PRIMARY,
    fillOpacity: fill === 0.5 ? 0.28 : 1,
    stroke:      STROKE,
    strokeWidth: 1.5,
  };

  if (forma === 'cerchio') {
    return <circle cx={cx} cy={cy} r={r} {...shapeProps} />;
  }
  if (forma === 'quadrato') {
    return <rect x={cx - r} y={cy - r} width={r * 2} height={r * 2} rx={2} {...shapeProps} />;
  }
  if (forma === 'triangolo') {
    const pts = `${cx},${cy - r * 1.1} ${cx + r * 1.15},${cy + r * 0.9} ${cx - r * 1.15},${cy + r * 0.9}`;
    return <polygon points={pts} {...shapeProps} />;
  }
  if (forma === 'rombo') {
    const pts = `${cx},${cy - r * 1.1} ${cx + r * 1.1},${cy} ${cx},${cy + r * 1.1} ${cx - r * 1.1},${cy}`;
    return <polygon points={pts} {...shapeProps} />;
  }
  return null;
}

export default function MatriceRaven({ data }: { data: MatriceData }) {
  const { celle } = data;
  const CELL  = 64;
  const GAP   = 5;
  const PAD   = 8;
  const BOARD = 3 * CELL + 2 * GAP + PAD * 2; // ≈ 222px

  function cellPos(i: number) {
    return {
      x: PAD + (i % 3) * (CELL + GAP),
      y: PAD + Math.floor(i / 3) * (CELL + GAP),
    };
  }

  return (
    <svg
      viewBox={`0 0 ${BOARD} ${BOARD}`}
      className="w-full max-w-[260px] mx-auto drop-shadow-sm"
      aria-label="Matrice 3×3"
    >
      {/* Board background */}
      <rect
        x={0} y={0} width={BOARD} height={BOARD} rx={12}
        fill="#f0f2ff" stroke="#c7d2fe" strokeWidth={1.5}
      />

      {/* Row and column dividers */}
      {[1, 2].map(i => {
        const linePos = PAD + i * (CELL + GAP) - GAP / 2;
        return (
          <React.Fragment key={i}>
            <line
              x1={PAD} y1={linePos} x2={BOARD - PAD} y2={linePos}
              stroke="#dde1ff" strokeWidth={GAP} strokeLinecap="round"
            />
            <line
              x1={linePos} y1={PAD} x2={linePos} y2={BOARD - PAD}
              stroke="#dde1ff" strokeWidth={GAP} strokeLinecap="round"
            />
          </React.Fragment>
        );
      })}

      {/* Cells */}
      {celle.map((cell, i) => {
        const { x, y } = cellPos(i);
        const isNull = cell === null || (cell.forma as string) === '?' || cell.fill === -1;
        return (
          <g key={i}>
            <rect
              x={x} y={y} width={CELL} height={CELL} rx={6}
              fill={isNull ? '#fef3c7' : 'white'}
              stroke={isNull ? '#f59e0b' : '#e0e7ff'}
              strokeWidth={isNull ? 2 : 1}
            />
            {isNull ? (
              <text
                x={x + CELL / 2} y={y + CELL / 2}
                textAnchor="middle" dominantBaseline="middle"
                fontSize={28} fontWeight="bold" fill="#d97706"
              >
                ?
              </text>
            ) : (
              <Shape
                forma={cell.forma}
                fill={cell.fill}
                cx={x + CELL / 2}
                cy={y + CELL / 2}
                s={CELL}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}
