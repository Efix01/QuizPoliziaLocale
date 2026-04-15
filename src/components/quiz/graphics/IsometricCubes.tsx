

interface IsometricCubesProps {
  data: {
    numX: number;
    numY: number;
    numZ: number;
    lato?: number; // Lato in cm per il testo
  };
}

export default function IsometricCubes({ data }: IsometricCubesProps) {
  const { numX, numY, numZ, lato } = data;
  const size = 35; // Dimensione base in px
  const ratioX = 0.866; // cos(30)
  const ratioY = 0.5;   // sin(30)

  // Calcolo dimensioni canvas automatiche
  const totalW = (numX + numY) * size * ratioX + 150; 
  const totalH = (numX + numY) * size * ratioY + numZ * size + 100;

  const startX = totalW / 2;
  const startY = totalH / 2 - ((numX + numY) * size * ratioY - numZ * size)/2 + 20;

  const cubes = [];
  
  // Painter's algorithm
  for (let z = 0; z < numZ; z++) {
    for (let y = 0; y < numY; y++) {
      for (let x = 0; x < numX; x++) {
        cubes.push({ x, y, z });
      }
    }
  }

  // Colori (Tailwind Indigo ispirati)
  // Utilizziamo currentColor con opacity per permettere il cambio in dark mode
  // Ma SVG non accetta opacity fill bene se sovrapposte...
  // Useremo CSS vars o colori Tailwind statici
  
  const getCubePoints = (cx: number, cy: number, cz: number, isReference = false) => {
    // Proiezione Isometrica
    const isoX = startX + (cx - cy) * size * ratioX;
    const isoY = startY + (cx + cy) * size * ratioY - cz * size;
    // Offset per cubo di riferimento 'X' inserito a lato
    const finalX = isReference ? 60 : isoX;
    const finalY = isReference ? totalH - 80 : isoY;

    // Faccia superiore (Top)
    const pTop = `
      ${finalX},${finalY} 
      ${finalX + size*ratioX},${finalY - size*ratioY} 
      ${finalX},${finalY - size*ratioY*2} 
      ${finalX - size*ratioX},${finalY - size*ratioY}
    `;
    
    // Faccia destra (Right)
    const pRight = `
      ${finalX},${finalY} 
      ${finalX + size*ratioX},${finalY - size*ratioY} 
      ${finalX + size*ratioX},${finalY - size*ratioY + size} 
      ${finalX},${finalY + size}
    `;
    
    // Faccia sinistra (Left)
    const pLeft = `
      ${finalX},${finalY} 
      ${finalX - size*ratioX},${finalY - size*ratioY} 
      ${finalX - size*ratioX},${finalY - size*ratioY + size} 
      ${finalX},${finalY + size}
    `;

    return { pTop, pRight, pLeft, cx: finalX, cy: finalY - size*ratioY };
  };

  return (
    <div className="flex flex-col items-center">
      <svg width={Math.max(totalW, 300)} height={Math.max(totalH, 200)} viewBox={`0 0 ${Math.max(totalW, 300)} ${Math.max(totalH, 200)}`} className="w-full h-auto max-w-xl mx-auto drop-shadow-md">
        
        {/* Blocco Principale Y */}
        <g id="blocco-y">
          {cubes.map((c, i) => {
            const pts = getCubePoints(c.x, c.y, c.z);
            return (
              <g key={`c-${i}`}>
                <polygon points={pts.pTop} className="fill-slate-300 dark:fill-slate-600 stroke-slate-500 dark:stroke-slate-800" strokeWidth="1.5" strokeLinejoin="round" />
                <polygon points={pts.pRight} className="fill-slate-400 dark:fill-slate-500 stroke-slate-500 dark:stroke-slate-800" strokeWidth="1.5" strokeLinejoin="round" />
                <polygon points={pts.pLeft} className="fill-slate-200 dark:fill-slate-400 stroke-slate-500 dark:stroke-slate-800" strokeWidth="1.5" strokeLinejoin="round" />
              </g>
            );
          })}
        </g>
        
        {/* Cubo Riferimento X */}
        <g id="cubo-x" transform="translate(20, -20)">
           <polygon points={getCubePoints(0,0,0,true).pTop} className="fill-blue-400/80 dark:fill-blue-500/80 stroke-blue-600 dark:stroke-blue-800" strokeWidth="1.5" strokeLinejoin="round" />
           <polygon points={getCubePoints(0,0,0,true).pRight} className="fill-blue-500/80 dark:fill-blue-600/80 stroke-blue-600 dark:stroke-blue-800" strokeWidth="1.5" strokeLinejoin="round" />
           <polygon points={getCubePoints(0,0,0,true).pLeft} className="fill-blue-300/80 dark:fill-blue-400/80 stroke-blue-600 dark:stroke-blue-800" strokeWidth="1.5" strokeLinejoin="round" />
           <text x={95} y={totalH - 77} className="fill-slate-700 dark:fill-slate-300 font-bold text-lg font-mono">X</text>
        </g>
        
        {/* Label Y per il blocco grosso */}
        <text x={startX - 15} y={startY - (numZ * size) - 40} className="fill-slate-700 dark:fill-slate-300 font-bold text-xl font-mono">Y</text>

      </svg>
      {lato && (
        <div className="mt-2 text-sm text-slate-500 dark:text-slate-400 font-medium">Spigolo cubo X: <span className="font-bold text-slate-700 dark:text-slate-200">{lato} cm</span></div>
      )}
    </div>
  );
}
