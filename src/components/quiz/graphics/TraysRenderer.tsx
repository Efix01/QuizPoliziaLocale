import React from 'react';

// Esempio dato ingresso vassoio:
// [ { 'pizza': 2, 'hotdog': 1 }, { 'pizza': 1, 'bibita': 3 } ]

interface TraysRendererProps {
  data: Array<Record<string, number>>;
}

export default function TraysRenderer({ data }: TraysRendererProps) {
  // Mapping emoji per tipologia di prodotto
  const emojiMap: Record<string, string> = {
    'pizza': '🍕',
    'hotdog': '🌭',
    'bibita': '🥤',
    'gelato': '🍦',
    'brioche': '🥐',
    'mela': '🍎',
    'aranciata': '🍊'
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 p-4 justify-center items-center flex-wrap w-full">
      {data.map((vassoio, vIndex) => (
        <div key={vIndex} className="relative w-64 pt-12 pb-6 px-4 bg-slate-50 dark:bg-slate-800/80 rounded-[32px] border-4 border-slate-200 dark:border-slate-700 shadow-xl flex flex-col items-center">
          
          {/* Maniglie del vassoio Decorative */}
          <div className="absolute top-1/2 -left-3 w-3 h-16 bg-slate-300 dark:bg-slate-600 rounded-l-full -translate-y-1/2" />
          <div className="absolute top-1/2 -right-3 w-3 h-16 bg-slate-300 dark:bg-slate-600 rounded-r-full -translate-y-1/2" />
          
          {/* Etichetta Vassoio */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white font-bold py-1 px-4 rounded-full shadow-md text-sm whitespace-nowrap">
            Vassoio {vIndex + 1}
          </div>
          
          {/* Cibo all'interno */}
          <div className="flex flex-col gap-4 w-full mt-2">
            {Object.entries(vassoio).map(([item, qty], iItem) => (
              <div key={iItem} className="flex justify-between items-center bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50">
                <span className="text-3xl filter drop-shadow-sm">{emojiMap[item.toLowerCase()] || '❓'}</span>
                <span className="text-slate-400 dark:text-slate-500 font-bold mx-2">x</span>
                <span className="text-2xl font-black text-slate-700 dark:text-slate-200">{qty}</span>
              </div>
            ))}
          </div>
          
        </div>
      ))}
    </div>
  );
}
