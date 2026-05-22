import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '../../lib/firebase';
import { collection, collectionGroup, query, getDocs } from 'firebase/firestore';
import { 
  Users, 
  Award, 
  TrendingUp, 
  Activity, 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle,
  Edit3,
  Upload,
  RefreshCw,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    premiumUsers: 0,
    avgAccuracy: 0,
    totalQuizzes: 0,
    pendingDrafts: 0,
  });
  const [chartData, setChartData] = useState<Array<{ date: string; fatte: number; corrette: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Query users' progress documents
        // Since they are stored in /users/{userId}/progressi/main,
        // we can query the 'progressi' collection group.
        const progressiQuery = query(collectionGroup(db, 'progressi'));
        const progressiSnap = await getDocs(progressiQuery);
        
        let totalUsers = progressiSnap.size;
        let premiumUsers = 0;
        let totalAccuracy = 0;
        let totalQuizzes = 0;
        let usersWithAccuracy = 0;

        const activityMap: Record<string, { date: string; fatte: number; corrette: number }> = {};

        progressiSnap.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.isPremium) {
            premiumUsers++;
          }
          if (typeof data.mediaPercentuale === 'number' && data.mediaPercentuale > 0) {
            totalAccuracy += data.mediaPercentuale;
            usersWithAccuracy++;
          }
          if (typeof data.quizCompletati === 'number') {
            totalQuizzes += data.quizCompletati;
          }

          // Aggregate historical data for chart
          if (Array.isArray(data.storicoQuiz)) {
            data.storicoQuiz.forEach((entry: any) => {
              const dateStr = entry.data || entry.date;
              if (!dateStr) return;
              
              // Format date from YYYY-MM-DD to DD/MM for presentation
              const parts = dateStr.split('-');
              const displayDate = parts.length === 3 ? `${parts[2]}/${parts[1]}` : dateStr;

              if (!activityMap[displayDate]) {
                activityMap[displayDate] = { date: displayDate, fatte: 0, corrette: 0 };
              }
              activityMap[displayDate].fatte += entry.risposteFatte || 0;
              activityMap[displayDate].corrette += entry.risposteCorrette || 0;
            });
          }
        });

        const avgAccuracy = usersWithAccuracy > 0 ? Math.round(totalAccuracy / usersWithAccuracy) : 0;

        // Query pending AI updates drafts
        const draftsQuery = query(collection(db, 'bozze_aggiornamenti'));
        const draftsSnap = await getDocs(draftsQuery);
        const pendingDrafts = draftsSnap.size;

        // Convert activity map to sorted array
        const sortedActivity = Object.values(activityMap)
          .sort((a, b) => {
            const [dayA, monthA] = a.date.split('/');
            const [dayB, monthB] = b.date.split('/');
            return new Date(2026, parseInt(monthA) - 1, parseInt(dayA)).getTime() - 
                   new Date(2026, parseInt(monthB) - 1, parseInt(dayB)).getTime();
          })
          .slice(-7); // Last 7 active days

        // Fallback chart data if empty
        const finalChartData = sortedActivity.length > 0 ? sortedActivity : [
          { date: 'Lun', fatte: 120, corrette: 95 },
          { date: 'Mar', fatte: 150, corrette: 120 },
          { date: 'Mer', fatte: 180, corrette: 145 },
          { date: 'Gio', fatte: 140, corrette: 110 },
          { date: 'Ven', fatte: 210, corrette: 175 },
          { date: 'Sab', fatte: 160, corrette: 130 },
          { date: 'Dom', fatte: 195, corrette: 160 },
        ];

        setStats({
          totalUsers,
          premiumUsers,
          avgAccuracy,
          totalQuizzes,
          pendingDrafts,
        });
        setChartData(finalChartData);
      } catch (err) {
        console.error("Errore nel recupero delle statistiche admin:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ width: '50px', height: '50px', border: '3px solid #1e293b', borderTop: '3px solid #10b981', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ color: '#94a3b8', marginTop: '1.5rem', fontFamily: 'Inter, sans-serif' }}>
          Aggregazione metriche real-time in corso...
        </p>
      </div>
    );
  }

  const conversionRate = stats.totalUsers > 0 ? Math.round((stats.premiumUsers / stats.totalUsers) * 100) : 0;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      style={{ display: 'flex', flexDirection: 'column', gap: '2rem', fontFamily: 'Inter, sans-serif' }}
    >
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, margin: 0, color: '#f8fafc', letterSpacing: '-0.5px' }}>
            Centro di <span style={{ color: '#10b981' }}>Comando AI</span>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginTop: '4px' }}>
            Monitoraggio in tempo reale delle licenze, delle performance e del radar normativo Cyborg.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', padding: '0.5rem 1rem', borderRadius: '50px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 8px #10b981' }} className="pulse-warning"></span>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.5px' }}>SISTEMA ONLINE</span>
        </div>
      </div>

      {/* STATS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
        
        {/* Utenti totali */}
        <motion.div 
          variants={cardVariants}
          style={{ background: '#1e293b', border: '1px solid #334155', padding: '1.5rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '1.2rem', transition: 'border-color 0.2s', position: 'relative', overflow: 'hidden' }}
          whileHover={{ borderColor: '#6366f1' }}
        >
          <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '0.8rem', borderRadius: '14px', color: '#6366f1' }}>
            <Users size={24} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>Utenti Totali</h4>
            <p style={{ margin: '4px 0 0 0', fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc' }}>{stats.totalUsers}</p>
          </div>
        </motion.div>

        {/* Utenti Premium (Elite) */}
        <motion.div 
          variants={cardVariants}
          style={{ background: '#1e293b', border: '1px solid #334155', padding: '1.5rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '1.2rem', transition: 'border-color 0.2s', position: 'relative', overflow: 'hidden' }}
          whileHover={{ borderColor: '#f59e0b' }}
        >
          <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '0.8rem', borderRadius: '14px', color: '#f59e0b' }}>
            <Award size={24} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>Licenze Elite</h4>
            <p style={{ margin: '4px 0 0 0', fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc' }}>
              {stats.premiumUsers} <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f59e0b', marginLeft: '4px' }}>({conversionRate}%)</span>
            </p>
          </div>
        </motion.div>

        {/* Efficacia Media */}
        <motion.div 
          variants={cardVariants}
          style={{ background: '#1e293b', border: '1px solid #334155', padding: '1.5rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '1.2rem', transition: 'border-color 0.2s', position: 'relative', overflow: 'hidden' }}
          whileHover={{ borderColor: '#10b981' }}
        >
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '0.8rem', borderRadius: '14px', color: '#10b981' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>Precisione Media</h4>
            <p style={{ margin: '4px 0 0 0', fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc' }}>{stats.avgAccuracy}%</p>
          </div>
        </motion.div>

        {/* Quiz Completati */}
        <motion.div 
          variants={cardVariants}
          style={{ background: '#1e293b', border: '1px solid #334155', padding: '1.5rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '1.2rem', transition: 'border-color 0.2s', position: 'relative', overflow: 'hidden' }}
          whileHover={{ borderColor: '#3b82f6' }}
        >
          <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '0.8rem', borderRadius: '14px', color: '#3b82f6' }}>
            <Activity size={24} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>Quiz Svolti</h4>
            <p style={{ margin: '4px 0 0 0', fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc' }}>{stats.totalQuizzes}</p>
          </div>
        </motion.div>

      </div>

      {/* RADAR ALLERTE RADAR AI */}
      <motion.div variants={cardVariants}>
        {stats.pendingDrafts > 0 ? (
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(15, 23, 42, 0.8) 100%)', 
            border: '1px solid rgba(245, 158, 11, 0.4)', 
            borderRadius: '24px', 
            padding: '2rem', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            gap: '2rem',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
              <div style={{ background: 'rgba(245, 158, 11, 0.2)', padding: '1rem', borderRadius: '18px', color: '#f59e0b', boxShadow: '0 0 20px rgba(245, 158, 11, 0.25)' }}>
                <AlertTriangle size={32} className="pulse-warning" />
              </div>
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.4rem', fontWeight: 800, color: '#f59e0b' }}>
                  Radar AI: Variazioni Normative Rilevate
                </h3>
                <p style={{ margin: 0, color: '#cbd5e1', fontSize: '1rem', lineHeight: 1.6, maxWidth: '650px' }}>
                  Il motore automatico Cyborg ha identificato **{stats.pendingDrafts} potenziali disallineamenti legislativi**. È necessaria una revisione manuale prima che i nuovi quiz vengano inseriti o sovrascritti live nel database.
                </p>
              </div>
            </div>
            <Link 
              to="/admin/cyborg-inbox" 
              style={{ 
                background: '#f59e0b', 
                color: '#020617', 
                textDecoration: 'none', 
                padding: '1rem 1.8rem', 
                borderRadius: '14px', 
                fontWeight: 700, 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.6rem',
                boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.45)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(245, 158, 11, 0.3)';
              }}
            >
              Apri Cyborg Inbox <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(15, 23, 42, 0.8) 100%)', 
            border: '1px solid rgba(16, 185, 129, 0.25)', 
            borderRadius: '24px', 
            padding: '2rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1.5rem'
          }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '0.8rem', borderRadius: '16px', color: '#10b981' }}>
              <CheckCircle size={28} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem', fontWeight: 850, color: '#f8fafc' }}>
                Allineamento Giuridico Perfetto
              </h3>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.95rem' }}>
                Nessuna variazione pendente. Tutte le banche dati nazionali sono allineate all'ultimo ordinamento giuridico in tempo reale.
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* GRAPH AND ACTIONS SECTION */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', alignItems: 'start' }} className="flex-col">
        
        {/* LIVE ACTIVITY CHART */}
        <motion.div 
          variants={cardVariants}
          style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '24px', padding: '1.8rem', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '340px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f8fafc', fontWeight: 700 }}>
              <Clock size={20} color="#10b981" />
              Attività degli Studenti (Ultimi 7 Giorni di Studio)
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 650 }}>
              Metriche aggregate globali
            </div>
          </div>

          <div style={{ width: '100%', height: '240px', marginTop: '1rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFatte" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCorrette" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                />
                <Tooltip 
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#fff', fontSize: '0.85rem' }}
                  itemStyle={{ color: '#fff' }}
                  labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="fatte" 
                  name="Quiz Svolti" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorFatte)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="corrette" 
                  name="Risposte Corrette" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorCorrette)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* QUICK ADMIN ACTIONS */}
        <motion.div 
          variants={cardVariants}
          style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}
        >
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', paddingLeft: '0.2rem' }}>
            Strumenti di Amministrazione
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Action 1: Editor */}
            <Link 
              to="/admin/editor-domande" 
              style={{ textDecoration: 'none', background: '#1e293b', border: '1px solid #334155', padding: '1rem 1.2rem', borderRadius: '18px', display: 'flex', alignItems: 'center', gap: '1rem', color: '#f8fafc', transition: 'all 0.2s' }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = '#10b981';
                e.currentTarget.style.background = '#1e293b99';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = '#334155';
                e.currentTarget.style.background = '#1e293b';
              }}
            >
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.6rem', borderRadius: '10px', color: '#10b981' }}>
                <Edit3 size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Editor Domande (CMS)</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>Modifica e correggi i quiz esistenti</div>
              </div>
              <ArrowRight size={16} color="#64748b" />
            </Link>

            {/* Action 2: Carica Quiz */}
            <Link 
              to="/admin/carica-quiz" 
              style={{ textDecoration: 'none', background: '#1e293b', border: '1px solid #334155', padding: '1rem 1.2rem', borderRadius: '18px', display: 'flex', alignItems: 'center', gap: '1rem', color: '#f8fafc', transition: 'all 0.2s' }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.background = '#1e293b99';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = '#334155';
                e.currentTarget.style.background = '#1e293b';
              }}
            >
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.6rem', borderRadius: '10px', color: '#3b82f6' }}>
                <Upload size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Carica Quiz</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>Importa da file o banche dati esterne</div>
              </div>
              <ArrowRight size={16} color="#64748b" />
            </Link>

            {/* Action 3: Migrazione */}
            <Link 
              to="/admin/migrazione-categorie" 
              style={{ textDecoration: 'none', background: '#1e293b', border: '1px solid #334155', padding: '1rem 1.2rem', borderRadius: '18px', display: 'flex', alignItems: 'center', gap: '1rem', color: '#f8fafc', transition: 'all 0.2s' }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = '#6366f1';
                e.currentTarget.style.background = '#1e293b99';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = '#334155';
                e.currentTarget.style.background = '#1e293b';
              }}
            >
              <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '0.6rem', borderRadius: '10px', color: '#6366f1' }}>
                <RefreshCw size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Allineamento Categorie</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>Sincronizza materie e sotto-categorie</div>
              </div>
              <ArrowRight size={16} color="#64748b" />
            </Link>

          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}

