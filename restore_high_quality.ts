
import fs from 'fs';

const originalData = [
  {
    "id": "0001",
    "categoria": "Elementi di diritto penale e procedura penale",
    "domanda": "In quale delle seguenti ipotesi gli ufficiali e gli agenti di polizia giudiziaria sono tenuti a procedere all'arresto obbligatorio in flagranza?",
    "opzioni": [
      "A. Danneggiamento aggravato (art. 635, co. 2, c.p.)",
      "B. Violenza o minaccia a pubblico ufficiale (art. 336, co. 2, c.p.)",
      "C. Lesioni personali colpose lievi in occasione di sinistro stradale",
      "D. Omicidio colposo stradale aggravato (art. 589-bis, co. 2 e 3, c.p.)"
    ],
    "corretta": "D",
    "spiegazione": "L'art. 380 co. 2 lett. m-quater c.p.p. prevede l'arresto obbligatorio in flagranza per l'omicidio colposo stradale aggravato (art. 589-bis co. 2 e 3 c.p.). Attenzione: la L. 138/2023 ha introdotto un'eccezione — l'arresto non si applica se il conducente si ferma immediatamente e si adopera per prestare o attivare i soccorsi.",
    "source": "Art. 380 co. 2 lett. m-quater c.p.p.; L. 138/2023"
  },
  {
    "id": "0002",
    "categoria": "Elementi di diritto penale e procedura penale",
    "domanda": "Chi viene sorpreso subito dopo la commissione del reato con cose o tracce che rivelano la sua responsabilità si trova in stato di flagranza?",
    "opzioni": [
      "A. Sì, ma solo se il reato è un delitto e non una contravvenzione.",
      "B. No, la flagranza sussiste solo per chi è colto nell'atto stesso di commettere il reato.",
      "C. Sì, si tratta di quasi flagranza prevista dall'art. 382 c.p.p.",
      "D. No, è necessario che si trovi nelle immediate adiacenze del luogo del fatto."
    ],
    "corretta": "C",
    "spiegazione": "L'art. 382 c.p.p. disciplina la quasi flagranza: è in tale stato chi è sorpreso con cose o tracce che rivelano che ha appena commesso il reato, oppure chi è inseguito subito dopo il fatto dalla polizia giudiziaria, dalla persona offesa o da altre persone.",
    "source": "Art. 382 c.p.p."
  },
  {
    "id": "0003",
    "categoria": "Elementi di diritto penale e procedura penale",
    "domanda": "Quale dei seguenti reati rientra nei delitti dei pubblici ufficiali contro la Pubblica Amministrazione, disciplinati nel Capo I, Titolo II, Libro II del Codice Penale?",
    "opzioni": [
      "A. Oltraggio a pubblico ufficiale",
      "B. Millantato credito presso un pubblico ufficiale",
      "C. Turbata libertà degli incanti",
      "D. Rivelazione e utilizzazione di segreti d'ufficio"
    ],
    "corretta": "D",
    "spiegazione": "La rivelazione e utilizzazione di segreti d'ufficio (art. 326 c.p.) è inserita nel Capo I del Titolo II del Libro II del c.p., che raccoglie i delitti dei pubblici ufficiali contro la P.A. Il soggetto attivo è un p.u. o incaricato di pubblico servizio.",
    "source": "Art. 326 c.p., Capo I Titolo II Libro II c.p."
  },
  {
    "id": "0004",
    "categoria": "Elementi di diritto penale e procedura penale",
    "domanda": "In quale categoria di reati si colloca il delitto di falsità ideologica commessa dal privato in atto pubblico (art. 483 c.p.)?",
    "opzioni": [
      "A. Delitti contro la fede pubblica – falsità personali",
      "B. Delitti dei pubblici ufficiali contro la pubblica amministrazione",
      "C. Delitti contro la fede pubblica – falsità in atti",
      "D. Delitti contro l'amministrazione della giustizia"
    ],
    "corretta": "C",
    "spiegazione": "L'art. 483 c.p. è collocato nel Titolo VII del Libro II (delitti contro la fede pubblica), Capo III (falsità in atti). Punisce il privato che attesta falsamente al pubblico ufficiale fatti dei quali l'atto è destinato a provare la verità.",
    "source": "Art. 483 c.p., Titolo VII Capo III Libro II c.p."
  },
  {
    "id": "0005",
    "categoria": "Elementi di diritto penale e procedura penale",
    "domanda": "Quali sono le pene detentive o restrittive della libertà personale previste dall'art. 18 del codice penale?",
    "opzioni": [
      "A. Ergastolo e reclusione soltanto",
      "B. Reclusione e arresto soltanto",
      "C. Ergastolo, reclusione, arresto e multa",
      "D. Ergastolo, reclusione e arresto"
    ],
    "corretta": "D",
    "spiegazione": "L'art. 18 c.p. classifica come pene detentive l'ergastolo, la reclusione (per i delitti) e l'arresto (per le contravvenzioni). La multa è una pena pecuniaria, non detentiva, e non rientra in questo elenco.",
    "source": "Art. 18 c.p."
  },
  {
    "id": "0006",
    "categoria": "Elementi di diritto penale e procedura penale",
    "domanda": "Quale delle seguenti conseguenze deriva dall'interdizione perpetua dai pubblici uffici ai sensi dell'art. 28 c.p.?",
    "opzioni": [
      "A. Divieto di esercitare qualsiasi professione",
      "B. Sospensione dalla potestà genitoriale per la durata della pena",
      "C. Divieto di contrarre matrimonio per cinque anni",
      "D. Privazione dell'ufficio di tutore o di curatore, anche provvisorio"
    ],
    "corretta": "D",
    "spiegazione": "L'art. 28 co. 2 n. 3 c.p. prevede espressamente, tra gli effetti dell'interdizione perpetua dai pubblici uffici, la privazione dell'ufficio di tutore o di curatore, anche provvisorio, e di ogni altro ufficio attinente alla tutela o alla cura.",
    "source": "Art. 28 co. 2 n. 3 c.p."
  },
  {
    "id": "0007",
    "categoria": "Elementi di diritto penale e procedura penale",
    "domanda": "Quale pena è classificata come pena principale per le contravvenzioni dall'art. 17 del codice penale?",
    "opzioni": [
      "A. Reclusione",
      "B. Ergastolo",
      "C. Ammenda",
      "D. Multa"
    ],
    "corretta": "C",
    "spiegazione": "L'art. 17 c.p. prevede per le contravvenzioni due pene principali: l'arresto (detentiva) e l'ammenda (pecuniaria). l'ammenda è l'unica pena pecuniaria per le contravvenzioni, distinta dalla multa che è invece la pena pecuniaria dei delitti.",
    "source": "Art. 17 c.p."
  },
  {
    "id": "0008",
    "categoria": "Elementi di diritto penale e procedura penale",
    "domanda": "In quale categoria di illeciti si inquadra il peculato mediante profitto dell'errore altrui previsto dall'art. 316 c.p.?",
    "opzioni": [
      "A. Delitti contro la fede pubblica",
      "B. Delitti contro il patrimonio mediante frode",
      "C. Delitti contro la pubblica amministrazione",
      "D. Delitti contro l'amministrazione della giustizia"
    ],
    "corretta": "C",
    "spiegazione": "L'art. 316 c.p. è inserito nel Capo I del Titolo II del Libro II del c.p. (delitti dei pubblici ufficiali contro la P.A.). Punisce il p.u. o incaricato di p.s. che, nell'esercizio delle funzioni, riceve o ritiene indebitamente denaro o altra cosa dal privato che versa in errore.",
    "source": "Art. 316 c.p."
  },
  {
    "id": "0009",
    "categoria": "Elementi di diritto penale e procedura penale",
    "domanda": "Chi può essere soggetto attivo del delitto di corruzione per un atto contrario ai doveri d'ufficio (art. 319 c.p.)?",
    "opzioni": [
      "A. Solo il pubblico ufficiale",
      "B. Il pubblico ufficiale o l'incaricato di pubblico servizio",
      "C. Chiunque, anche estraneo alla pubblica amministrazione",
      "D. Solo l'incaricato di pubblico servizio"
    ],
    "corretta": "A",
    "spiegazione": "L'art. 319 c.p. individua come soggetto attivo esclusivamente il pubblico ufficiale. L'incaricato di pubblico servizio risponde per estensione ai sensi dell'art. 320 c.p. (con pena ridotta), mentre il privato corruttore risponde ex art. 321 c.p.",
    "source": "Artt. 319, 320 e 321 c.p."
  },
  {
    "id": "0010",
    "categoria": "Elementi di diritto penale e procedura penale",
    "domanda": "In quale circostanza l'art. 112 c.p. prevede l'aumento di pena nel concorso di persone nel reato?",
    "opzioni": [
      "A. Solo per chi ha organizzato la cooperazione nel reato",
      "B. Per chi ha partecipato al reato con ruolo meramente esecutivo",
      "C. Per chi ha determinato a commettere il reato un minore degli anni 18 o una persona in stato di infermità psichica, fuori dal caso dell'art. 111 c.p.",
      "D. Se il numero dei concorrenti è pari a tre"
    ],
    "corretta": "C",
    "spiegazione": "L'art. 112 n. 2 c.p. aggrava la pena per chi determina a commettere il reato un minore di anni 18 o una persona in stato di infermità o deficienza psichica, fuori dai casi dell'art. 111 c.p. La soglia numerica che aggrava ex art. 112 n. 1 è di cinque concorrenti, non tre.",
    "source": "Art. 112 c.p."
  },
  {
    "id": "0011",
    "categoria": "Elementi di diritto penale e procedura penale",
    "domanda": "Il soggetto A vuole percuotere B, ma la condotta gli cagiona la morte. A quale titolo risponde A?",
    "opzioni": [
      "A. Delitto secondo l'intenzione",
      "B. Delitto doloso",
      "C. Delitto colposo",
      "D. Delitto preterintenzionale"
    ],
    "corretta": "D",
    "spiegazione": "Si tratta di omicidio preterintenzionale (art. 584 c.p.): il soggetto agisce con dolo di percosse o lesioni, ma dall'azione deriva la morte, evento più grave non voluto. L'art. 43 c.p. definisce il delitto preterintenzionale come quello che va 'oltre l'intenzione' dell'agente.",
    "source": "Art. 43 c.p.; art. 584 c.p."
  },
  {
    "id": "0012",
    "categoria": "Elementi di diritto penale e procedura penale",
    "domanda": "In quale categoria di reati si inquadra la corruzione per l'esercizio della funzione prevista dall'art. 318 c.p.?",
    "opzioni": [
      "A. Delitti contro il patrimonio",
      "B. Delitti contro l'amministrazione della giustizia",
      "C. Delitti contro la fede pubblica",
      "D. Delitti contro la pubblica amministrazione"
    ],
    "corretta": "D",
    "spiegazione": "L'art. 318 c.p. (corruzione per l'esercizio della funzione) è collocato nel Capo I del Titolo II del Libro II del c.p., dedicato ai delitti dei pubblici ufficiali contro la pubblica amministrazione, insieme agli artt. 319 e 320 c.p.",
    "source": "Art. 318 c.p., Capo I Titolo II Libro II c.p."
  },
  {
    "id": "0013",
    "categoria": "Elementi di diritto penale e procedura penale",
    "domanda": "Entro quale limite temporale si estingue la pena della reclusione per decorso del tempo, ai sensi dell'art. 172 c.p.?",
    "opzioni": [
      "A. In un tempo pari al triplo della pena inflitta, non superiore a trenta anni e non inferiore a dieci",
      "B. In un tempo pari al doppio della pena inflitta, non superiore a venti anni e non inferiore a dieci",
      "C. In un tempo pari al doppio della pena inflitta, non superiore a trenta anni e non inferiore a dieci",
      "D. In un tempo pari al doppio della pena inflitta, non superiore a trenta anni e non inferiore a venti"
    ],
    "corretta": "C",
    "spiegazione": "L'art. 172 c.p. stabilisce che la pena della reclusione si estingue per decorso del tempo in un periodo pari al doppio della pena inflitta, con un massimo di trenta anni e un minimo di dieci anni.",
    "source": "Art. 172 c.p."
  },
  {
    "id": "0014",
    "categoria": "Elementi di diritto penale e procedura penale",
    "domanda": "Cosa prevede l'art. 380 c.p.p. per il delitto di devastazione e saccheggio di cui all'art. 419 c.p.?",
    "opzioni": [
      "A. Gli ufficiali e gli agenti di polizia giudiziaria possono procedere all'arresto solo previa autorizzazione del pubblico ministero",
      "B. Gli ufficiali e gli agenti di polizia giudiziaria procedono all'arresto obbligatorio in flagranza",
      "C. Solo gli ufficiali di polizia giudiziaria procedono all'arresto obbligatorio in flagranza",
      "D. È in facoltà degli ufficiali e degli agenti di polizia giudiziaria procedere all'arresto facoltativo in flagranza"
    ],
    "corretta": "B",
    "spiegazione": "L'art. 380 co. 2 lett. l) c.p.p. include il delitto di devastazione e saccheggio (art. 419 c.p.) tra i reati per i quali sia gli ufficiali sia gli agenti di polizia giudiziaria sono obbligati a procedere all'arresto in flagranza, senza distinzione di grado.",
    "source": "Art. 380 co. 2 lett. l) c.p.p.; art. 419 c.p."
  },
  {
    "id": "0015",
    "categoria": "Elementi di diritto penale e procedura penale",
    "domanda": "Quale condotta integra il reato di corruzione per un atto contrario ai doveri d'ufficio previsto dall'art. 319 c.p.?",
    "opzioni": [
      "A. L'incaricato di pubblico servizio che, avendo il possesso di una cosa mobile altrui per ragioni d'ufficio, se ne appropria",
      "B. Il pubblico ufficiale che rivela notizie d'ufficio destinate a restare segrete al fine di procurare a sé un vantaggio patrimoniale",
      "C. L'incaricato di pubblico servizio che, abusando della sua qualità, costringe taluno a promettergli indebitamente denaro",
      "D. Il pubblico ufficiale che, per aver omesso o ritardato un atto del suo ufficio o per aver compiuto un atto contrario ai doveri d'ufficio, riceve o accetta la promessa di denaro o altra utilità"
    ],
    "corretta": "D",
    "spiegazione": "L'art. 319 c.p. punisce il pubblico ufficiale che riceve, per sé o per un terzo, denaro o altra utilità, o ne accetta la promessa, per omettere o ritardare un atto del suo ufficio, ovvero per compiere un atto contrario ai doveri d'ufficio. Le opzioni C e A descrivono rispettivamente la concussione (art. 317 c.p.) e il peculato (art. 314 c.p.); la B descrive la rivelazione di segreti d'ufficio (art. 326 c.p.).",
    "source": "Art. 319 c.p."
  },
  {
    "id": "0016",
    "categoria": "Elementi di diritto penale e procedura penale",
    "domanda": "Chi commette il reato di falsità ideologica in certificati o autorizzazioni amministrative previsto dall'art. 480 c.p.?",
    "opzioni": [
      "A. Il pubblico ufficiale che contraffà o altera certificati o autorizzazioni amministrative per far apparire adempiute le condizioni di validità",
      "B. Il privato che, in una dichiarazione sostitutiva, attesta falsamente fatti dei quali l'atto è destinato a provare la verità",
      "C. Il pubblico ufficiale che, ricevendo o formando un atto, attesta falsamente fatti avvenuti alla sua presenza o dichiara come ricevute dichiarazioni mai rese",
      "D. Il pubblico ufficiale che, nell'esercizio delle sue funzioni, attesta falsamente in certificati o autorizzazioni amministrative fatti dei quali l'atto è destinato a provare la verità"
    ],
    "corretta": "D",
    "spiegazione": "L'art. 480 c.p. punisce il pubblico ufficiale che, nell'esercizio delle sue funzioni, attesta falsamente in certificati o autorizzazioni amministrative fatti dei quali l'atto è destinato a provare la verità (reclusione da 3 mesi a 2 anni). L'opzione C descrive la falsità ideologica in atti pubblici (art. 479 c.p.); la A descrive la falsità materiale (art. 476 c.p.); la B è riconducibile all'art. 483 c.p.",
    "source": "Art. 480 c.p."
  },
  {
    "id": "0017",
    "categoria": "Elementi di diritto penale e procedura penale",
    "domanda": "Se una persona pone altri in stato di incapacità di intendere o di volere al fine di fargli commettere un reato, chi risponde del reato commesso dall'incapace?",
    "opzioni": [
      "A. Entrambi in concorso, in parti uguali",
      "B. Nessuno, salvo prova che chi ha commesso materialmente il reato era imputabile",
      "C. Colui che ha commesso materialmente il reato",
      "D. Colui che ha cagionato lo stato di incapacità"
    ],
    "corretta": "D",
    "spiegazione": "L'art. 86 c.p. prevede che, quando il reato è commesso da chi si trovava in stato di incapacità determinato da altri al fine di fargli commettere il reato, del reato risponde esclusivamente colui che ha cagionato lo stato di incapacità. L'incapace è strumento inconsapevole: si configura la c.d. autoria mediata.",
    "source": "Art. 86 c.p."
  },
  {
    "id": "0018",
    "categoria": "Elementi di diritto penale e procedura penale",
    "domanda": "Come è punito il reato di impiego di beni culturali provenienti da delitto previsto dall'art. 518-quinquies c.p.?",
    "opzioni": [
      "A. Con la sola multa, senza pena detentiva",
      "B. Con sanzione amministrativa pecuniaria",
      "C. Con la reclusione da cinque a tredici anni e con la multa da euro 6.000 a euro 30.000",
      "D. Con l'ergastolo"
    ],
    "corretta": "C",
    "spiegazione": "L'art. 518-quinquies c.p. (introdotto dal D.Lgs. 8 novembre 2021, n. 184, in vigore dal 23 marzo 2022) punisce chiunque impieghi in attività economiche o finanziarie beni culturali provenienti da delitto con la reclusione da cinque a tredici anni e con la multa da euro 6.000 a euro 30.000.",
    "source": "Art. 518-quinquies c.p., introdotto da D.Lgs. 184/2021"
  },
  {
    "id": "0019",
    "categoria": "Elementi di diritto penale e procedura penale",
    "domanda": "In quale categoria si colloca il delitto di falsità materiale commessa dal pubblico ufficiale in atti pubblici (art. 476 c.p.)?",
    "opzioni": [
      "A. Delitti contro l'amministrazione della giustizia",
      "B. Delitti contro la fede pubblica – falsità in atti",
      "C. Delitti dei pubblici ufficiali contro la pubblica amministrazione",
      "D. Delitti contro la fede pubblica – falsità personali"
    ],
    "corretta": "B",
    "spiegazione": "L'art. 476 c.p. è collocato nel Titolo VII del Libro II (delitti contro la fede pubblica), Capo III (falsità in atti). La falsità materiale consiste nel contraffare o alterare un atto pubblico da parte del pubblico ufficiale che lo forma.",
    "source": "Art. 476 c.p., Titolo VII Capo III Libro II c.p."
  },
  {
    "id": "0020",
    "categoria": "Elementi di diritto penale e procedura penale",
    "domanda": "Chi commette il reato di falsità in foglio firmato in bianco – atto pubblico – previsto dall'art. 487 c.p.?",
    "opzioni": [
      "A. Il privato che abusa di un foglio firmato in bianco consegnatogli fiducialmente per farvi scrivere un atto diverso da quello concordato",
      "B. Il pubblico ufficiale che, supponendo esistente un atto pubblico, ne simula una copia e la rilascia in forma legale",
      "C. Il pubblico ufficiale che attesta falsamente che un fatto è avvenuto alla sua presenza o omette dichiarazioni da lui ricevute",
      "D. Il pubblico ufficiale che, abusando di un foglio firmato in bianco di cui ha il possesso per ragioni d'ufficio, vi scrive un atto pubblico diverso da quello a cui era obbligato o autorizzato"
    ],
    "corretta": "D",
    "spiegazione": "L'art. 487 c.p. punisce il pubblico ufficiale che, avendo il possesso per ragioni d'ufficio di un foglio firmato in bianco, vi scrive un atto pubblico diverso da quello a cui era obbligato o autorizzato. L'opzione C descrive l'art. 479 c.p.; la B l'art. 478 c.p.; la A è la fattispecie del privato ex art. 488 c.p.",
    "source": "Art. 487 c.p."
  },
  {
    "id": "0021",
    "categoria": "Elementi di diritto penale e procedura penale",
    "domanda": "Quale delle seguenti conseguenze deriva dall'interdizione perpetua dai pubblici uffici ai sensi dell'art. 28 c.p.?",
    "opzioni": [
      "A. Divieto di contrarre matrimonio per cinque anni",
      "B. Privazione dell'ufficio di tutore o di curatore, anche provvisorio",
      "C. Divieto di accedere ai servizi della pubblica amministrazione",
      "D. Sospensione dall'esercizio della professione per la durata della pena"
    ],
    "corretta": "B",
    "spiegazione": "L'art. 28 co. 2 n. 3 c.p. include espressamente, tra gli effetti dell'interdizione perpetua dai pubblici uffici, la privazione dell'ufficio di tutore o di curatore, anche provvisorio, e di ogni altro ufficio attinente alla tutela o alla cura.",
    "source": "Art. 28 co. 2 n. 3 c.p."
  },
  {
    "id": "0022",
    "categoria": "Elementi di diritto penale e procedura penale",
    "domanda": "Quale effetto produce la condanna per istigazione alla corruzione (art. 322 c.p.) ai sensi dell'art. 317-bis, co. 1, c.p.?",
    "opzioni": [
      "A. Sospensione temporanea dai pubblici uffici per la durata della pena principale",
      "B. Interdizione perpetua dai pubblici uffici e incapacità in perpetuo di contrattare con la pubblica amministrazione",
      "C. Incapacità di contrattare con la pubblica amministrazione ma non interdizione dai pubblici uffici",
      "D. Interdizione dai pubblici uffici ma non incapacità di contrattare con la pubblica amministrazione"
    ],
    "corretta": "B",
    "spiegazione": "L'art. 317-bis co. 1 c.p. (nel testo vigente dopo la L. 9 gennaio 2019, n. 3, c.d. Spazza-Corrotti) prevede che la condanna per i reati di cui agli artt. 314, 317, 318, 319, 319-bis, 319-ter, 319-quater co. 1, 320, 321, 322, 322-bis e 346-bis c.p. importi l'interdizione perpetua dai pubblici uffici e l'incapacità in perpetuo di contrattare con la pubblica amministrazione. Entrambe le sanzioni accessorie si applicano cumulativamente.",
    "source": "Art. 317-bis co. 1 c.p.; L. 3/2019 (Spazza-Corrotti)"
  },
  {
    "id": "0023",
    "categoria": "Elementi di diritto penale e procedura penale",
    "domanda": "Quale tra i seguenti è un delitto dei pubblici ufficiali contro la pubblica amministrazione?",
    "opzioni": [
      "A. Attentato contro la Costituzione dello Stato (art. 283 c.p.)",
      "B. Esercizio arbitrario delle proprie ragioni con violenza alle persone (art. 393 c.p.)",
      "C. Appropriazione indebita (art. 646 c.p.)",
      "D. Corruzione per un atto contrario ai doveri d'ufficio (art. 319 c.p.)"
    ],
    "corretta": "D",
    "spiegazione": "L'art. 319 c.p. è collocato nel Capo I del Titolo II del Libro II del c.p., dedicato ai delitti dei pubblici ufficiali contro la P.A. Le altre opzioni appartengono a titoli diversi: appropriazione indebita (art. 646) ai delitti contro il patrimonio (Titolo XIII); attentato alla Costituzione (art. 283) ai delitti contro la personalità dello Stato (Titolo I); esercizio arbitrario (art. 393) ai delitti contro l'amministrazione della giustizia (Titolo III).",
    "source": "Art. 319 c.p., Capo I Titolo II Libro II c.p."
  },
  {
    "id": "0024",
    "categoria": "Elementi di diritto penale e procedura penale",
    "domanda": "Tra quali categorie di delitti è compreso il reato di appropriazione indebita (art. 646 c.p.)?",
    "opzioni": [
      "A. Delitti contro la fede pubblica",
      "B. Delitti contro la pubblica amministrazione",
      "C. Delitti contro il patrimonio",
      "D. Delitti contro la persona"
    ],
    "corretta": "C",
    "spiegazione": "L'art. 646 c.p. è collocato nel Titolo XIII del Libro II del c.p. (delitti contro il patrimonio), Capo II (delitti contro il patrimonio mediante frode). Punisce chi si appropria del denaro o della cosa mobile altrui di cui ha il possesso a titolo diverso dalla proprietà.",
    "source": "Art. 646 c.p., Titolo XIII Libro II c.p."
  },
  {
    "id": "0025",
    "categoria": "Elementi di diritto penale e procedura penale",
    "domanda": "Quale reato commette il pubblico ufficiale che indebitamente rifiuta un atto del suo ufficio che, per ragioni di sicurezza pubblica, deve essere compiuto senza ritardo?",
    "opzioni": [
      "A. Omissione di atti d'ufficio per negligenza inescusabile (art. 328, co. 3, c.p.)",
      "B. Rifiuto di uffici legalmente dovuti (art. 366 c.p.)",
      "C. Rifiuto di atti d'ufficio – atti qualificati (art. 328, co. 1, c.p.)",
      "D. Rifiuto di atti d'ufficio – atti non qualificati (art. 328, co. 2, c.p.)"
    ],
    "corretta": "C",
    "spiegazione": "L'art. 328 co. 1 c.p. punisce il pubblico ufficiale o l'incaricato di pubblico servizio che indebitamente rifiuta un atto del suo ufficio che, per ragioni di giustizia, sicurezza pubblica, ordine pubblico o igiene e sanità, deve essere compiuto senza ritardo (reclusione da 6 mesi a 2 anni). Il co. 2 disciplina invece il caso residuale dell'omissione o del ritardo di atti non urgenti, previa richiesta scritta dell'interessato senza risposta entro 30 giorni.",
    "source": "Art. 328 co. 1 c.p."
  },
  {
    "id": "0026",
    "categoria": "Elementi di diritto costituzionale e di diritto amministrativo",
    "domanda": "Dinanzi a quale organo il Presidente della Repubblica presta giuramento?",
    "opzioni": [
      "A. Dinanzi al Presidente della Corte costituzionale",
      "B. Dinanzi al Presidente del Consiglio dei ministri e all'intero Governo",
      "C. Dinanzi al Parlamento in seduta comune",
      "D. Dinanzi alla Corte costituzionale in composizione plenaria"
    ],
    "corretta": "C",
    "spiegazione": "L'art. 91 Cost. stabilisce che il Presidente della Repubblica, prima di assumere le sue funzioni, presta giuramento di fedeltà alla Repubblica e di osservanza della Costituzione dinanzi al Parlamento in seduta comune.",
    "source": "Art. 91 Costituzione italiana"
  },
  {
    "id": "0027",
    "categoria": "Elementi di diritto costituzionale e di diritto amministrativo",
    "domanda": "A quale organo l'art. 87 della Costituzione attribuisce il potere di emanare i regolamenti?",
    "opzioni": [
      "A. Al Consiglio di Stato",
      "B. Al Presidente del Consiglio dei ministri",
      "C. Al Ministro della giustizia",
      "D. Al Presidente della Repubblica"
    ],
    "corretta": "D",
    "spiegazione": "L'art. 87 co. 5 Cost. attribuisce espressamente al Presidente della Repubblica il potere di promulgare le leggi, emanare i decreti aventi valore di legge e i regolamenti. Il Consiglio di Stato interviene solo in veste consultiva sullo schema di regolamento, ma non è titolare del potere di emanazione.",
    "source": "Art. 87 Costituzione italiana"
  },
  {
    "id": "0028",
    "categoria": "Elementi di diritto costituzionale e di diritto amministrativo",
    "domanda": "Quale tipologia di accesso può essere esercitata da chi ha un interesse diretto, concreto e attuale, collegato a una situazione giuridicamente tutelata e connessa al documento richiesto?",
    "opzioni": [
      "A. Accesso civico",
      "B. Accesso riservato",
      "C. Accesso generalizzato",
      "D. Accesso documentale"
    ],
    "corretta": "D",
    "spiegazione": "L'art. 22 della L. 241/1990 definisce l'accesso documentale (o accesso procedimentale) come il diritto degli interessati — soggetti privati portatori di un interesse diretto, concreto e attuale, collegato a una situazione giuridicamente tutelata — di prendere visione e ottenere copia dei documenti amministrativi. Si distingue dall'accesso civico semplice (obbligo di pubblicazione) e dall'accesso generalizzato ex D.Lgs. 33/2013 (FOIA), che non richiedono motivazione.",
    "source": "Art. 22 L. 241/1990"
  },
  {
    "id": "0029",
    "categoria": "Elementi di diritto costituzionale e di diritto amministrativo",
    "domanda": "Quale soggetto istituzionale completa l'elenco: \"La Repubblica è costituita _______, dalle Province, dalle Città metropolitane, dalle Regioni e dallo Stato\"?",
    "opzioni": [
      "A. Dalle comunità montane",
      "B. Dagli enti territoriali",
      "C. Dai Comuni",
      "D. Dagli enti economici"
    ],
    "corretta": "C",
    "spiegazione": "L'art. 114 co. 1 Cost. recita: «La Repubblica è costituita dai Comuni, dalle Province, dalle Città metropolitane, dalle Regioni e dallo Stato». I Comuni sono il primo elemento dell'elenco costituzionale degli enti che compongono la Repubblica.",
    "source": "Art. 114 Costituzione italiana"
  },
  {
    "id": "0030",
    "categoria": "Elementi di diritto costituzionale e di diritto amministrativo",
    "domanda": "A chi si rivolge la Costituzione quando richiede l'adempimento dei doveri inderogabili di solidarietà politica, economica e sociale?",
    "opzioni": [
      "A. Ai soli cittadini maggiorenni residenti nel territorio nazionale",
      "B. Ai cittadini cui sono affidate funzioni pubbliche",
      "C. A tutti, cittadini e stranieri",
      "D. Ai pubblici ufficiali e agli esercenti servizi di pubblica necessità"
    ],
    "corretta": "C",
    "spiegazione": "L'art. 2 Cost. richiede l'adempimento dei doveri inderogabili di solidarietà politica, economica e sociale a «tutti», senza limitarsi ai soli cittadini. La norma, riferendosi ai diritti inviolabili «dell'uomo» (non del cittadino), ha portata universale e si estende anche agli stranieri presenti nel territorio della Repubblica.",
    "source": "Art. 2 Costituzione italiana"
  },
  {
    "id": "0031",
    "categoria": "Elementi di diritto costituzionale e di diritto amministrativo",
    "domanda": "Quale causa limita il diritto all'elettorato passivo impedendo la contemporanea titolarità di una carica con altra carica elettiva o meno?",
    "opzioni": [
      "A. La decadenza dalla carica",
      "B. L'incapacità elettorale",
      "C. L'ineleggibilità assoluta",
      "D. L'incompatibilità"
    ],
    "corretta": "D",
    "spiegazione": "L'incompatibilità (artt. 60-63 D.Lgs. 267/2000, TUEL) non impedisce di essere eletti, ma vieta la coesistenza simultanea di due cariche. Chi si trova in situazione di incompatibilità deve optare per una delle due: se non lo fa, decade. Si distingue dall'ineleggibilità, che preclude ab origine l'elezione, e dall'incandidabilità, che esclude in radice la presentazione della candidatura.",
    "source": "Artt. 60-63 D.Lgs. 267/2000 (TUEL)"
  }
];

const mappedDomande = originalData.map(q => {
  const indexMap: { [key: string]: number } = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
  
  // Mappatura intelligente categoria testuale -> ID enum
  let categoriaId = 'penale';
  let prefix = 'core_penale_';
  
  const catLower = q.categoria.toLowerCase();
  
  // Priorità al Diritto Costituzionale se citata nel nome composto
  if (catLower.includes('costituzionale')) {
    categoriaId = 'costituzionale';
    prefix = 'core_cost_';
  } else if (catLower.includes('amministrativo')) {
    categoriaId = 'amministrativo';
    prefix = 'core_adm_';
  }
  
  // Casi specifici basati sul contenuto della domanda o della spiegazione
  if (q.domanda.includes('241/1990') || q.spiegazione.includes('241/1990')) {
    categoriaId = 'l241';
    prefix = 'core_l241_';
  } else if (q.source.includes('TUEL') || q.spiegazione.includes('TUEL') || q.domanda.includes('TUEL')) {
    categoriaId = 'tuel';
    prefix = 'core_tuel_';
  }
  
  return {
    id: `${prefix}${q.id}`,
    strato: 'core',
    categoriaId: categoriaId,
    testo: q.domanda,
    opzioni: q.opzioni.map(opt => opt.replace(/^[ABCD]\.\s*/, '')),
    rispostaCorretta: indexMap[q.corretta],
    spiegazione: q.spiegazione,
    riferimentoNormativo: {
      legge: q.source,
      articolo: "",
      comma: ""
    },
    livelloDifficolta: 2,
    tags: [categoriaId]
  };
});

fs.writeFileSync('./src/data/domandecore.json', JSON.stringify({
  meta: {
    version: "2.0.0-high-fidelity",
    lastUpdate: "2026-04-06",
    totalQuestions: mappedDomande.length,
    note: "Ripristino Alta Fedeltà - Primi 25 quiz originali."
  },
  domande: mappedDomande
}, null, 2));

console.log(`Ripristinati ${mappedDomande.length} quiz con successo!`);
