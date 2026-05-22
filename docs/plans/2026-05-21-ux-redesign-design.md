# Design Doc: Riprogettazione UX/UI per Piattaforma Quiz Concorsi Polizia Locale

**Data:** 2026-05-21  
**Owner:** Antigravity  
**Stato:** Validato  

---

## 1. Contesto
La piattaforma web per la preparazione ai concorsi della Polizia Locale italiana ha come obiettivo principale l'aiuto allo studio intensivo per candidati in una fascia d'età compresa tra i 20 e i 40 anni. Questo target utilizza molto frequentemente dispositivi mobili per sessioni quotidiane rapide e ad alta intensità. Per massimizzare le performance di business (conversione premium) e pedagogiche (ritenzione del sapere), è necessaria una riprogettazione dell'esperienza utente (UX) e dell'interfaccia visiva (UI).

---

## 2. Obiettivi e non-obiettivi

### Obiettivi
- **Massimizzare la Retention (D1, D7, D30):** Creare abitudini di studio quotidiane tramite gamification non invasiva e flussi di onboarding personalizzati.
- **Aumentare il Tempo Medio di Sessione:** Offrire interfacce prive di distrazioni (Zen Mode) e percorsi guidati ("Prossimo Passo") per facilitare lo stato di focus.
- **Incentivare il Completamento dei Quiz:** Ridurre la frustrazione da errore (Rage Quit) con spiegazioni immediate, micro-break motivazionali e salvataggio automatico dello stato.
- **Aumentare la Conversione Premium:** Inserire paywall contestuali e non bloccanti basati su feature ad alto valore aggiunto (es. Simulazioni ufficiali illimitate, predittore di idoneità AI).

### Non-obiettivi
- Modificare l'algoritmo SM-2 o il motore del database (architettura backend già ottimizzata).
- Creare illustrazioni o elementi grafici complessi che appesantiscano il caricamento dell'applicazione (rimanendo fedeli a uno stile minimalista).

---

## 3. Requisiti

### Funzionali
- **Onboarding interattivo in 4 passaggi** per raccogliere obiettivi di studio e generare il piano adattivo.
- **Schermata quiz ottimizzata per il touch** con area di spiegazione normativa a comparsa fluida.
- **Dashboard a due aree principali:** focalizzata sull'azione odierna ("Continua Studio") e sulle statistiche di padronanza delle materie.
- **Integrazione visiva dei Ranks e delle Streak** nell'header di navigazione.
- **Mappa termica dei punti deboli** (argomenti/sotto-categorie) interattiva.

### Non funzionali
- **Performance:** Tempo di caricamento iniziale < 1.5s su reti mobili 4G.
- **Accessibilità:** Contrasti conformi allo standard WCAG AA (uso di ardesia scuro ad alto contrasto con viola/indaco vivace per le CTA e testo ad alta leggibilità).
- **Responsiveness:** Approccio prioritario mobile-first.

---

## 4. Assunzioni e dipendenze
- **Assunzioni:** L'utente ha una connessione dati sufficiente a caricare i quiz leggeri memorizzati nella cache locale.
- **Dipendenze:** Librerie React esistenti (Framer Motion per le micro-animazioni, Lucide React per le icone minimali).

---

## 5. Approcci considerati

### Opzione A: Stile Notion/Linear Slate Dark (Raccomandata)
Design minimale, professionale, estremamente pulito. Dark mode dominante con accenti indaco. Gamification integrata come widget informativi e barre di progresso eleganti.
- *Pro:* Estremamente professionale e istituzionale, riduce l'affaticamento visivo durante sessioni di studio prolungate, attrae un pubblico adulto di candidati a concorsi pubblici.
- *Contro:* Richiede una cura meticolosa delle micro-interazioni e delle ombreggiature per non sembrare "piatto".

### Opzione B: Stile Duolingo Ultra-Gamificato
Interfaccia colorata, bottoni tridimensionali spessi, mascotte animate, toni accesi.
- *Pro:* Altissimo livello di engagement emotivo a breve termine.
- *Contro:* Può apparire infantile o poco serio per la preparazione a un concorso pubblico istituzionale; affaticamento visivo nelle sessioni notturne.

---

## 6. Design proposto

### 🎨 Palette Colori (Notion/Linear Slate)
- **Sfondo principale:** Slate Dark (`#090d16` / `#0f172a`)
- **Sfondo componenti:** Deep Slate (`#1e293b`)
- **CTA Primaria:** Indigo Vivid (`#6366f1`)
- **Successo:** Emerald Clean (`#10b981`)
- **Errore:** Rose Vibrant (`#f43f5e`)
- **Streak & Alert:** Amber Warm (`#f59e0b`)

---

### 📱 Wireframe Testuali dei Componenti Chiave

#### 1. Onboarding Interattivo (Flusso d'Ingresso)
```
+-------------------------------------------------------------+
| [ Onboarding: Passo 1 di 4 ]                                |
|                                                             |
|   Qual è il tuo obiettivo principale di studio?              |
|                                                             |
|   +-----------------------------------------------------+   |
|   | ( ) Superare il concorso di Agente Polizia Locale   |   |
|   +-----------------------------------------------------+   |
|   | ( ) Aggiornamento professionale / Avanzamento       |   |
|   +-----------------------------------------------------+   |
|   | ( ) Allenamento libero                              |   |
|   +-----------------------------------------------------+   |
|                                                             |
|   [ Indietro ]                            [ Avanti (Invio) ]|
+-------------------------------------------------------------+
```

#### 2. Dashboard Moderna (Mobile-first View)
```
+-------------------------------------------------------------+
| [👤 Agente Scelto] [🔥 12 Giorni] [❄️ Attivo]  [⚙️]          |
| Progresso Livello: [||||||||||||||........] 64% (2400/3000 XP)|
+-------------------------------------------------------------+
|                                                             |
|  IL TUO PIANO DI OGGI                                       |
|  +-------------------------------------------------------+  |
|  | Completato: 7/20 domande                              |  |
|  | [=====================>.............................]  |  |
|  |                                                       |  |
|  |  [ CONTINUA STUDIO ODIERNO ]  <-- CTA Primaria (Vivid) |  |
|  +-------------------------------------------------------+  |
|                                                             |
|  LE TUE MATERIE                                             |
|  +---------------------------+ +--------------------------+ |
|  | Codice della Strada       | | Diritto Amministrativo   | |
|  | [=======>.......] 42%      | | [==============>] 90%    | |
|  +---------------------------+ +--------------------------+ |
|                                                             |
|  STRUMENTI RAPIDI                                           |
|  [ Ripassa 5 Errori ]   [ Simulazione Ufficiale ]            |
|                                                             |
+-------------------------------------------------------------+
```

#### 3. Schermata Quiz con Spiegazione a Comparsa (Mobile View)
```
+-------------------------------------------------------------+
| [X] Abbandona        [=========>....................] 35%   |
+-------------------------------------------------------------+
|  Art. 193 Codice della Strada                               |
|  Qual è la sanzione per chi circola senza assicurazione?    |
|                                                             |
|  +-------------------------------------------------------+  |
|  | A. Sanzione pecuniaria e sequestro del veicolo        |  |
|  +-------------------------------------------------------+  |
|  | B. Solo sanzione pecuniaria                           |  |
|  +-------------------------------------------------------+  |
|  | C. Sospensione della patente                          |  |
|  +-------------------------------------------------------+  |
|  | D. Confisca immediata del mezzo                       |  |
|  +-------------------------------------------------------+  |
|                                                             |
|  +-------------------------------------------------------+  |
|  | 🔴 Errato! La risposta corretta era A.                 |  |
|  |                                                       |  |
|  | Spiegazione: L'art. 193 del CdS prevede la sanzione    |  |
|  | amministrativa del pagamento di una somma da euro 866 |  |
|  | a euro 3.464, oltre al sequestro amministrativo.      |  |
|  |                                                       |  |
|  | [⭐ Salva nei Segnalibri]          [ CAPITO (Invio) ]  |  |
|  +-------------------------------------------------------+  |
+-------------------------------------------------------------+
```

---

### ⚡ UX per lo Studio Intensivo & Anti-Abbandono
- **Zen Mode:** Un toggle in alto a destra permette di nascondere ogni contatore e badge grafico, lasciando solo la scheda della domanda e le opzioni. Massimizza il focus durante sessioni intense di tarda notte.
- **Rage Quit Prevention:** Se l'utente sbaglia 3 risposte consecutive nella stessa sessione, il quiz mostra una schermata di pausa incoraggiante: *"Nessun problema, stiamo imparando. Vuoi che approfondiamo questo concetto insieme prima di proseguire?"*.
- **Micro-interazioni tattili:** I bottoni delle opzioni utilizzano un effetto scala leggero (`scale(0.97)`) ed un'illuminazione del bordo indaco al click prima di inviare la risposta per trasmettere stabilità e controllo all'utente.

---

## 7. Piano test
- **User Testing su Mobile:** Conduzione di sessioni di test con utenti reali (candidati reali ai concorsi pubblici) misurando il tasso di errore di tocco (taps accidentali) sulle opzioni di resposta.
- **A/B Testing su Paywall:** Testare due tipologie di posizionamento del paywall premium (Subito dopo l'onboarding vs. Solo al terzo tentativo di accesso alle simulazioni d'esame).

---

## 8. Piano di rollout
1. **Fase 1:** Implementazione del nuovo header grafico con integrazione dei Ranks e dello Streak Freeze.
2. **Fase 2:** Riprogettazione del layout mobile-first del quiz ed integrazione dell'animazione della correzione.
3. **Fase 3:** Lancio della nuova Dashboard focalizzata sul "Piano Odierno" e rilascio dell'onboarding interattivo.
