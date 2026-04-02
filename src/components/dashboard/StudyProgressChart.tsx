import React from 'react';
import { usePL } from '../../context/PLContext';

const StudyProgressChart: React.FC = () => {
    const { domandeCore, domandeRegionali, domandeComunali } = usePL();

    const totalCore = domandeCore.length;
    const totalRegionali = domandeRegionali.length;
    const totalComunali = domandeComunali.length;
    const total = totalCore + totalRegionali + totalComunali;

    if (total === 0) {
        return (
            <div className="chart-empty-state">
                <p>Inizia a studiare per vedere i tuoi progressi qui.</p>
                <style>{`
                    .chart-empty-state {
                        height: 200px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: rgba(255,255,255,0.4);
                        font-size: 0.9rem;
                        border: 1px dashed rgba(255,255,255,0.1);
                        border-radius: 12px;
                        margin-top: 20px;
                    }
                `}</style>
            </div>
        );
    }

    // Barra visuale semplice: Core | Regionali | Comunali
    const corePercent = total > 0 ? (totalCore / total) * 100 : 0;
    const regPercent = total > 0 ? (totalRegionali / total) * 100 : 0;
    const comPercent = total > 0 ? (totalComunali / total) * 100 : 0;

    return (
        <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', gap: '2px', height: 32, borderRadius: 8, overflow: 'hidden' }}>
                {totalCore > 0 && (
                    <div style={{ width: `${corePercent}%`, background: 'linear-gradient(135deg, #38BDF8, #0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'white' }}>{totalCore}</span>
                    </div>
                )}
                {totalRegionali > 0 && (
                    <div style={{ width: `${regPercent}%`, background: 'linear-gradient(135deg, #A78BFA, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'white' }}>{totalRegionali}</span>
                    </div>
                )}
                {totalComunali > 0 && (
                    <div style={{ width: `${comPercent}%`, background: 'linear-gradient(135deg, #4ADE80, #16A34A)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'white' }}>{totalComunali}</span>
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#38BDF8' }}></span>
                    <span>Core ({totalCore})</span>
                </div>
                {totalRegionali > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#A78BFA' }}></span>
                        <span>Regionali ({totalRegionali})</span>
                    </div>
                )}
                {totalComunali > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ADE80' }}></span>
                        <span>Comunali ({totalComunali})</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudyProgressChart;
