export default function AdminDashboard() {
  return (
    <div>
      <h2 style={{ fontSize: '2rem', margin: '0 0 1rem 0' }}>Centro di Comando</h2>
      <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
        Benvenuto nel pannello di Controllo Elite. Da qui puoi gestire i quiz e le integrazioni dell'Agente AI.
      </p>
      
      <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2.5rem' }}>
        <div style={{ background: '#1e293b', border: '1px solid #334155', padding: '2rem', borderRadius: '20px', flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: '1.5rem' }}>Statistiche Base</h3>
          <p style={{ color: '#94a3b8' }}>Prossimamente qui verranno inseriti i contatori globali dell'applicazione.</p>
        </div>
      </div>
    </div>
  );
}
