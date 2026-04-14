import React from 'react';
import IsometricCubes from './IsometricCubes';
import PieChartRenderer from './PieChartRenderer';
import TraysRenderer from './TraysRenderer';

interface LogicRendererProps {
  layout?: {
    tipo: 'cubi' | 'torta' | 'struttura' | 'griglia' | 'vassoio';
    dati: any;
  };
}

export default function LogicRenderer({ layout }: LogicRendererProps) {
  if (!layout) return null;

  return (
    <div className="my-6 p-6 md:p-8 rounded-2xl bg-white dark:bg-[#0f172a] shadow-sm border border-slate-200 dark:border-slate-800 flex justify-center items-center transition-colors overflow-hidden">
      {layout.tipo === 'cubi' && <IsometricCubes data={layout.dati} />}
      {layout.tipo === 'torta' && <PieChartRenderer data={layout.dati} />}
      {layout.tipo === 'vassoio' && <TraysRenderer data={layout.dati} />}
      
      {['struttura', 'griglia'].includes(layout.tipo) && (
        <div className="text-slate-400 dark:text-slate-500 italic text-sm py-8 text-center bg-slate-50 dark:bg-slate-800/30 w-full rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
          <p className="font-semibold text-slate-600 dark:text-slate-400 mb-1">Motore {layout.tipo} SVG</p>
          <p>La simulazione vettoriale in arrivo col prossimo aggiornamento strutturale.</p>
        </div>
      )}
    </div>
  );
}
