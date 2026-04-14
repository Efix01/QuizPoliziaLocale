import React from 'react';

interface PieChartRendererProps {
  data: Record<string, number>;
}

export default function PieChartRenderer({ data }: PieChartRendererProps) {
  const size = 300;
  const radius = size / 2;
  const cx = radius;
  const cy = radius;
  
  const entries = Object.entries(data);
  const total = entries.reduce((acc, [_, val]) => acc + val, 0);

  // Tailwind equivalent safe colors that look good in both light and dark mode
  const colors = [
    '#3b82f6', // blue-500
    '#10b981', // emerald-500
    '#f59e0b', // amber-500
    '#8b5cf6', // violet-500
    '#ef4444', // red-500
    '#06b6d4', // cyan-500
    '#ec4899', // pink-500
  ];

  let currentAngle = 0;

  // Calculates x,y on the circumference
  const getCoordinatesForPercent = (percent: number) => {
    const x = cx + radius * Math.cos(2 * Math.PI * percent);
    const y = cy + radius * Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  const slices = entries.map(([label, value], index) => {
    const slicePercent = value / total;
    const isLargeArc = slicePercent > 0.5 ? 1 : 0;

    // Start angle coordinates
    const [startX, startY] = getCoordinatesForPercent(currentAngle);
    
    // Accumulate angle
    currentAngle += slicePercent;
    
    // End angle coordinates
    const [endX, endY] = getCoordinatesForPercent(currentAngle);

    let pathData = `M ${startX} ${startY}`;
    // Se è 100%, draw un circle (l'arc path si rompe se start == end)
    if (slicePercent === 1) {
       pathData = `M ${cx - radius} ${cy} a ${radius},${radius} 0 1,0 ${radius * 2},0 a ${radius},${radius} 0 1,0 -${radius * 2},0`;
    } else {
       pathData = `M ${cx} ${cy} L ${startX} ${startY} A ${radius} ${radius} 0 ${isLargeArc} 1 ${endX} ${endY} Z`;
    }

    // Centroid for label text
    const midAngle = currentAngle - slicePercent / 2;
    // Position text inside the slice (70% of radius distance)
    const textRadius = radius * 0.65;
    const textX = cx + textRadius * Math.cos(2 * Math.PI * midAngle);
    const textY = cy + textRadius * Math.sin(2 * Math.PI * midAngle);

    return {
      pathData,
      color: colors[index % colors.length],
      label,
      value,
      percent: (slicePercent * 100).toFixed(1),
      textX,
      textY
    };
  });

  return (
    <div className="flex flex-col md:flex-row items-center gap-8 p-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-lg">
        <circle cx={cx} cy={cy} r={radius} fill="#1e293b" className="dark:fill-slate-800 fill-slate-100" />
        {slices.map((slice, i) => (
          <g key={i}>
            <path d={slice.pathData} fill={slice.color} className="stroke-white dark:stroke-slate-900" strokeWidth="3" />
            {parseFloat(slice.percent) > 4 && (
              <text 
                x={slice.textX} 
                y={slice.textY} 
                textAnchor="middle" 
                alignmentBaseline="middle" 
                className="fill-white font-bold text-sm drop-shadow-md"
              >
                {slice.percent}%
              </text>
            )}
          </g>
        ))}
        {/* Cerchio centrale per effetto "Donut" - opzionale
        <circle cx={cx} cy={cy} r={radius * 0.4} className="fill-white dark:fill-[#0f172a]" />
        */}
      </svg>
      
      {/* Legenda affiancata */}
      <div className="flex flex-col gap-3 min-w-[200px] bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
        <h4 className="text-sm font-bold text-slate-500 tracking-wider uppercase mb-1">Legenda</h4>
        {slices.map((slice, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full shadow-inner" style={{ backgroundColor: slice.color }}></div>
            <div className="flex-1 font-semibold text-slate-700 dark:text-slate-300">{slice.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
