
interface Pos { r: number; c: number }

interface PuntoData {
  dimensione: number;
  posizioni: Pos[];   // oggetti {r, c} — Firestore non supporta array annidati
  prossima: Pos;
}

export default function PuntoMobile({ data }: { data: PuntoData }) {
  const { dimensione: dim, posizioni } = data;
  const frames = posizioni.length + 1; // last frame = "?"

  const CELL   = 15;  // cell size inside each mini-grid
  const GAP    = 2;   // gap between cells
  const GRID   = dim * CELL + (dim - 1) * GAP; // 49px for 3x3
  const PAD    = 5;
  const MINI_W = GRID + PAD * 2;       // 59px
  const LABEL_H = 16;
  const MINI_H  = MINI_W + LABEL_H;   // 75px total
  const ARROW_W = 20;
  const TOTAL_W = frames * MINI_W + (frames - 1) * ARROW_W;

  const DOT_R = CELL * 0.3;

  return (
    <svg
      viewBox={`0 0 ${TOTAL_W} ${MINI_H}`}
      className="w-full max-w-[380px] mx-auto"
      aria-label="Punto mobile in griglia"
    >
      {Array.from({ length: frames }, (_, fi) => {
        const isQ    = fi === frames - 1;
        const dotPos = isQ ? null : posizioni[fi];
        const gx     = fi * (MINI_W + ARROW_W);

        return (
          <g key={fi}>
            {/* Arrow between frames */}
            {fi < frames - 1 && (
              <g>
                <line
                  x1={gx + MINI_W + 2}        y1={MINI_W / 2}
                  x2={gx + MINI_W + ARROW_W - 2} y2={MINI_W / 2}
                  stroke="#a5b4fc" strokeWidth={1.5}
                />
                <polygon
                  points={`
                    ${gx + MINI_W + ARROW_W - 2},${MINI_W / 2}
                    ${gx + MINI_W + ARROW_W - 8},${MINI_W / 2 - 4}
                    ${gx + MINI_W + ARROW_W - 8},${MINI_W / 2 + 4}
                  `}
                  fill="#a5b4fc"
                />
              </g>
            )}

            {/* Frame background */}
            <rect
              x={gx} y={0} width={MINI_W} height={MINI_W} rx={5}
              fill={isQ ? '#fef9c3' : '#f0f4ff'}
              stroke={isQ ? '#f59e0b' : '#c7d2fe'}
              strokeWidth={isQ ? 2 : 1.2}
            />

            {/* Grid cells */}
            {Array.from({ length: dim }, (_, row) =>
              Array.from({ length: dim }, (_, col) => {
                const cellX  = gx + PAD + col * (CELL + GAP);
                const cellY  = PAD + row * (CELL + GAP);
                const hasDot = dotPos ? dotPos.r === row && dotPos.c === col : false;

                return (
                  <g key={`${row}-${col}`}>
                    <rect
                      x={cellX} y={cellY} width={CELL} height={CELL} rx={2.5}
                      fill={hasDot ? '#4f46e5' : 'white'}
                      stroke={hasDot ? '#3730a3' : '#e0e7ff'}
                      strokeWidth={hasDot ? 1.5 : 0.7}
                    />
                    {hasDot && (
                      <circle
                        cx={cellX + CELL / 2} cy={cellY + CELL / 2}
                        r={DOT_R} fill="white" opacity={0.85}
                      />
                    )}
                  </g>
                );
              })
            )}

            {/* Frame number / "?" label */}
            <text
              x={gx + MINI_W / 2} y={MINI_H - 2}
              textAnchor="middle" fontSize={11} fontWeight="bold"
              fill={isQ ? '#d97706' : '#6366f1'}
            >
              {isQ ? '?' : fi + 1}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
