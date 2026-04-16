import React from 'react';

interface PoligoniData {
  sequenza: number[];        // lati delle figure visibili
  prossimo: number;          // lati della risposta corretta
  incremento: number;
  fill: 'empty' | 'filled';
}

const NOMI: Record<number, string> = {
  3: 'Triangolo', 4: 'Quadrato', 5: 'Pentagono',
  6: 'Esagono',   7: 'Ettagono', 8: 'Ottagono', 9: 'Nonagono',
};
const nomePoly = (n: number) => NOMI[n] ?? `${n} lati`;

function polyPoints(cx: number, cy: number, r: number, n: number): string {
  return Array.from({ length: n }, (_, k) => {
    const a = (2 * Math.PI * k) / n - Math.PI / 2;
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(' ');
}

export default function SeriePoligoni({ data }: { data: PoligoniData }) {
  const { sequenza, fill } = data;
  const items = [...sequenza, -1]; // -1 = "?"

  const CELL_W  = 68;
  const CELL_H  = 88;
  const ARROW_W = 20;
  const R       = 26;
  const CY_POLY = CELL_H / 2 - 8;
  const totalW  = items.length * CELL_W + (items.length - 1) * ARROW_W;

  const baseStroke = '#6366f1';
  const baseFill   = fill === 'filled' ? '#c7d2fe' : 'none';

  return (
    <svg
      viewBox={`0 0 ${totalW} ${CELL_H}`}
      className="w-full max-w-[420px] mx-auto"
      aria-label="Serie di poligoni"
    >
      {items.map((n, i) => {
        const x0 = i * (CELL_W + ARROW_W);
        const cx = x0 + CELL_W / 2;
        const isQ = n === -1;

        // Arrowhead between shapes
        const ax1 = x0 + CELL_W + 3;
        const ax2 = x0 + CELL_W + ARROW_W - 3;
        const ay  = CY_POLY;

        return (
          <g key={i}>
            {/* Arrow (not after last cell) */}
            {i < items.length - 1 && (
              <g>
                <line x1={ax1} y1={ay} x2={ax2} y2={ay} stroke="#a5b4fc" strokeWidth={1.8} />
                <polygon
                  points={`${ax2},${ay} ${ax2 - 7},${ay - 4} ${ax2 - 7},${ay + 4}`}
                  fill="#a5b4fc"
                />
              </g>
            )}

            {/* Shape or "?" */}
            {isQ ? (
              <>
                <circle
                  cx={cx} cy={CY_POLY} r={R + 3}
                  fill="#fef9c3" stroke="#f59e0b"
                  strokeWidth={2} strokeDasharray="5 3"
                />
                <text
                  x={cx} y={CY_POLY}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize={26} fontWeight="bold" fill="#d97706"
                >?</text>
              </>
            ) : (
              <polygon
                points={polyPoints(cx, CY_POLY, R, n)}
                fill={baseFill}
                stroke={baseStroke}
                strokeWidth={2}
                strokeLinejoin="round"
              />
            )}

            {/* Label below shape */}
            <text
              x={cx} y={CELL_H - 5}
              textAnchor="middle"
              fontSize={9.5} fontWeight="600"
              fill={isQ ? '#d97706' : '#6366f1'}
            >
              {isQ ? '?' : nomePoly(n)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
