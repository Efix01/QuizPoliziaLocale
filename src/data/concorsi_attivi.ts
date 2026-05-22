export interface ConcorsoAttivo {
  id: string;
  comuneId: string;
  regioneId: string;
  citta: string;
  regione: string;
  titoloBando: string;
  posti: number;
  scadenza: string;
  dataScadenza: string; // YYYY-MM-DD per ordinamento
  linkUfficiale: string;
  materie: string[];
  quizConsigliati: {
    categoriaId: string;
    nome: string;
    domandeCount: number;
  }[];
  simulazione: {
    titolo: string;
    domandeCount: number;
    durataMinuti: number;
  };
}

export const CONCORSI_ATTIVI: ConcorsoAttivo[] = [
  {
    id: 'roma-capitale',
    comuneId: 'roma',
    regioneId: 'lazio',
    citta: 'Roma',
    regione: 'Lazio',
    titoloBando: 'Bando Istruttori Polizia Locale - Roma Capitale',
    posti: 800,
    scadenza: '15 Giugno 2026',
    dataScadenza: '2026-06-15',
    linkUfficiale: 'https://www.comune.roma.it/web/it/scheda-servizio.page?contentId=INF1145290',
    materie: [
      'Codice della Strada (CdS)',
      'Ordinamento degli Enti Locali (TUEL)',
      'Diritto Amministrativo e Penale',
      'Disciplina della Polizia Locale in Lazio'
    ],
    quizConsigliati: [
      { categoriaId: 'cds', nome: 'Codice della Strada (CdS)', domandeCount: 20 },
      { categoriaId: 'tuel', nome: 'Ordinamento degli Enti Locali (TUEL)', domandeCount: 20 }
    ],
    simulazione: {
      titolo: 'Simulazione Esame Roma Capitale',
      domandeCount: 80,
      durataMinuti: 60
    }
  },
  {
    id: 'milano-municipale',
    comuneId: 'milano',
    regioneId: 'lombardia',
    citta: 'Milano',
    regione: 'Lombardia',
    titoloBando: 'Selezione pubblica Agenti Polizia Locale - Comune di Milano',
    posti: 120,
    scadenza: '30 Giugno 2026',
    dataScadenza: '2026-06-30',
    linkUfficiale: 'https://www.comune.milano.it/aree-tematiche/lavoro-e-formazione/concorsi-e-selezioni',
    materie: [
      'Codice della Strada (CdS)',
      'Legge 689/81 (Sanzioni Amministrative)',
      'Diritto e Procedura Penale',
      'Legge Regionale Lombardia n. 6/2015'
    ],
    quizConsigliati: [
      { categoriaId: 'cds', nome: 'Codice della Strada (CdS)', domandeCount: 20 },
      { categoriaId: 'l689', nome: 'Legge 689/81 - Sanzioni Amministrative', domandeCount: 20 }
    ],
    simulazione: {
      titolo: 'Simulazione Esame Comune di Milano',
      domandeCount: 100,
      durataMinuti: 90
    }
  },
  {
    id: 'torino-municipale',
    comuneId: 'torino',
    regioneId: 'piemonte',
    citta: 'Torino',
    regione: 'Piemonte',
    titoloBando: 'Concorso Pubblico Agenti Polizia Municipale - Città di Torino',
    posti: 50,
    scadenza: '20 Luglio 2026',
    dataScadenza: '2026-07-20',
    linkUfficiale: 'https://www.comune.torino.it/concorsi/',
    materie: [
      'Codice della Strada (CdS)',
      'Ordinamento degli Enti Locali (TUEL)',
      'Elementi di Diritto Costituzionale',
      'Nozioni di Primo Soccorso e Sicurezza sul Lavoro'
    ],
    quizConsigliati: [
      { categoriaId: 'cds', nome: 'Codice della Strada (CdS)', domandeCount: 20 },
      { categoriaId: 'costituzionale', nome: 'Diritto Costituzionale', domandeCount: 20 }
    ],
    simulazione: {
      titolo: 'Simulazione Esame Città di Torino',
      domandeCount: 80,
      durataMinuti: 60
    }
  },
  {
    id: 'napoli-municipale',
    comuneId: 'napoli',
    regioneId: 'campania',
    citta: 'Napoli',
    regione: 'Campania',
    titoloBando: 'Bando di Concorso per Agenti Polizia Municipale - Napoli',
    posti: 150,
    scadenza: '10 Luglio 2026',
    dataScadenza: '2026-07-10',
    linkUfficiale: 'https://www.comune.napoli.it/concorsi',
    materie: [
      'Codice della Strada (CdS)',
      'Ordinamento degli Enti Locali (TUEL)',
      'Diritto dell\'Edilizia e Tutela Ambientale',
      'Ordinamento Polizia Locale Nazionale (L. 65/86)'
    ],
    quizConsigliati: [
      { categoriaId: 'cds', nome: 'Codice della Strada (CdS)', domandeCount: 20 },
      { categoriaId: 'amministrativo', nome: 'Diritto Amministrativo', domandeCount: 20 }
    ],
    simulazione: {
      titolo: 'Simulazione Esame Comune di Napoli',
      domandeCount: 80,
      durataMinuti: 60
    }
  },
  {
    id: 'bologna-locale',
    comuneId: 'bologna',
    regioneId: 'emilia_romagna',
    citta: 'Bologna',
    regione: 'Emilia-Romagna',
    titoloBando: 'Procedura concorsuale Agenti Polizia Locale - Comune di Bologna',
    posti: 40,
    scadenza: '05 Luglio 2026',
    dataScadenza: '2026-07-05',
    linkUfficiale: 'https://www.comune.bologna.it/concorsi-selezioni',
    materie: [
      'Codice della Strada (CdS)',
      'Legge 241/90 (Procedimento Amministrativo)',
      'Diritto Penale e Procedura Penale',
      'Legge Regionale Emilia-Romagna n. 24/2003'
    ],
    quizConsigliati: [
      { categoriaId: 'cds', nome: 'Codice della Strada (CdS)', domandeCount: 20 },
      { categoriaId: 'l241', nome: 'Legge 241/90 - Procedimento Amministrativo', domandeCount: 20 }
    ],
    simulazione: {
      titolo: 'Simulazione Esame Comune di Bologna',
      domandeCount: 100,
      durataMinuti: 90
    }
  },
  {
    id: 'bari-locale',
    comuneId: 'bari',
    regioneId: 'puglia',
    citta: 'Bari',
    regione: 'Puglia',
    titoloBando: 'Concorso Istruttori di Vigilanza - Comune di Bari',
    posti: 30,
    scadenza: '12 Luglio 2026',
    dataScadenza: '2026-07-12',
    linkUfficiale: 'https://www.comune.bari.it/bandi-di-concorso',
    materie: [
      'Codice della Strada (CdS)',
      'Ordinamento degli Enti Locali (TUEL)',
      'Legge Quadro sull\'Ordinamento della Polizia Locale (L. 65/1986)'
    ],
    quizConsigliati: [
      { categoriaId: 'cds', nome: 'Codice della Strada (CdS)', domandeCount: 20 },
      { categoriaId: 'tuel', nome: 'Ordinamento degli Enti Locali (TUEL)', domandeCount: 20 }
    ],
    simulazione: {
      titolo: 'Simulazione Esame Comune di Bari',
      domandeCount: 80,
      durataMinuti: 60
    }
  },
  {
    id: 'firenze-municipale',
    comuneId: 'firenze',
    regioneId: 'toscana',
    citta: 'Firenze',
    regione: 'Toscana',
    titoloBando: 'Selezione pubblica per Istruttori di Polizia Municipale - Firenze',
    posti: 60,
    scadenza: '18 Giugno 2026',
    dataScadenza: '2026-06-18',
    linkUfficiale: 'https://www.comune.fi.it/pagina/amministrazione-trasparente/bandi-di-concorso',
    materie: [
      'Codice della Strada (CdS)',
      'Ordinamento degli Enti Locali (TUEL)',
      'Diritto Penale e Procedura Penale',
      'Ordinamento Polizia Locale in Toscana'
    ],
    quizConsigliati: [
      { categoriaId: 'cds', nome: 'Codice della Strada (CdS)', domandeCount: 20 },
      { categoriaId: 'penale', nome: 'Diritto Penale e Proc. Penale', domandeCount: 20 }
    ],
    simulazione: {
      titolo: 'Simulazione Esame Comune di Firenze',
      domandeCount: 80,
      durataMinuti: 60
    }
  }
];
