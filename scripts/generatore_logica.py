import random
import json
import uuid
import logging
from typing import List, Dict, Tuple, Union, Callable
from dataclasses import dataclass, field

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
logger = logging.getLogger(__name__)


@dataclass
class ConfigGeneratore:
    """Configurazione centralizzata: modifica qui per cambiare comportamento globale."""
    livello_difficolta: int = 2
    categoria_id: str = "logica"
    strato: str = "core"
    legge_riferimento: str = "Abilità Logico-Matematiche"
    simboli: List[str] = field(default_factory=lambda: [
        '⭐', '🌙', '☀️', '🌸', '🌹', '🍎', '🍊', '💎', '🔷', '🔶', '🟢', '🔵', '🔴'
    ])


class GeneratoreQuizLogici:
    def __init__(self, config: ConfigGeneratore = None):
        self.config = config or ConfigGeneratore()
        self.quiz_generati: List[Dict] = []

    # ─── Utilities ────────────────────────────────────────────────────────────

    def _genera_id(self) -> str:
        return f"log_{uuid.uuid4().hex[:12]}"

    def _shuffle_opzioni(
        self,
        corretta: Union[int, str, float],
        varianti: List[Union[int, str, float]],
    ) -> Tuple[List[str], int]:
        """Mescola le opzioni, deduplica le varianti, restituisce (lista_str, indice_corretta).

        FIX rispetto alla versione precedente:
        - Deduplicazione: rimuove varianti uguali alla risposta corretta (evita duplicati nell'elenco).
        - Confronto con str(v) per evitare mismatch int/float/str.
        - Usa opzioni_str.index(...) anziché opzioni_valori.index(...) per garantire
          che l'indice corrisponda sempre alla stringa già formattata.
        """
        varianti_uniche = [v for v in varianti if str(v) != str(corretta)][:3]
        opzioni_valori = [corretta] + varianti_uniche
        random.shuffle(opzioni_valori)
        opzioni_str = [str(val) for val in opzioni_valori]
        indice_corretta = opzioni_str.index(str(corretta))
        return opzioni_str, indice_corretta

    def _formatta_domanda_pl(
        self,
        sottotipo: str,
        testo: str,
        opzioni: List[str],
        corretta_idx: int,
        spiegazione: str,
        tags: List[str],
        layout_grafico: Dict = None,
    ) -> Dict:
        domanda = {
            "id": self._genera_id(),
            "categoriaId": self.config.categoria_id,
            "strato": self.config.strato,
            "sottoCategoriaId": sottotipo,
            "testo": testo,
            "opzioni": opzioni,
            "rispostaCorretta": corretta_idx,
            "spiegazione": spiegazione,
            "riferimentoNormativo": {"legge": self.config.legge_riferimento},
            "livelloDifficolta": self.config.livello_difficolta,
            "tags": tags,
        }
        if layout_grafico:
            domanda["layoutGrafico"] = layout_grafico
        return domanda

    # ═════════════════════════════════════════════════════════════════════════
    # PATTERN ORIGINALI (6)
    # ═════════════════════════════════════════════════════════════════════════

    def pattern_serie_incrementi(self) -> Dict:
        """Serie con incremento progressivo crescente (+N, +N+1, +N+2, ...).

        Logica:
          - n_visibili = 5 → la serie mostrata ha 5 elementi (indici 0-4).
          - Vengono generati 5 incrementi; quelli tra i 5 visibili sono i
            primi 4 (incrementi[0..3]), il 5° è l'incremento per trovare
            la risposta corretta (serie[5]).
        """
        start = random.randint(15, 45)
        base_incr = random.randint(2, 6)
        n_visibili = 5  # quanti numeri mostrare prima del "?"

        serie = [start]
        incrementi = []
        for i in range(n_visibili):          # produce n_visibili nuovi elementi → serie ha n_visibili+1 elementi
            incr = base_incr + i
            incrementi.append(incr)
            serie.append(serie[-1] + incr)

        # serie[:n_visibili]  → parte mostrata (5 numeri)
        # serie[n_visibili]   → risposta corretta (6° numero)
        corretta = serie[n_visibili]
        incr_risposta = incrementi[n_visibili - 1]   # l'incremento che porta al risultato

        varianti = [
            corretta + random.randint(1, 4),
            corretta - random.randint(1, 3),
            corretta + random.randint(5, 8),
        ]
        opzioni, corretta_idx = self._shuffle_opzioni(corretta, varianti)

        serie_visibile = " - ".join(str(n) for n in serie[:n_visibili])
        incr_mostrati = ", ".join(f"+{i}" for i in incrementi[:n_visibili - 1])  # 4 incrementi tra i 5 visibili
        testo = f"Quale numero completa la serie logica?\n\n{serie_visibile} - ?"
        spiegazione = (
            f"La serie usa incrementi progressivi crescenti: {incr_mostrati}. "
            f"L'incremento successivo è +{incr_risposta}, "
            f"quindi {serie[n_visibili - 1]} + {incr_risposta} = {corretta}."
        )
        return self._formatta_domanda_pl(
            "serie-numerica", testo, opzioni, corretta_idx, spiegazione,
            ["serie", "aritmetica", "incrementi"],
        )

    def pattern_operazioni_simboli(self) -> Dict:
        """Sistema lineare a due equazioni mascherato da simboli grafici."""
        simbolo1, simbolo2 = random.sample(self.config.simboli, 2)
        val2 = random.randint(12, 45)
        differenza = random.randint(6, 18)
        val1 = val2 + differenza
        somma = val1 + val2
        eq1 = f"{simbolo1} + {simbolo2} = {somma}"
        eq2 = f"{simbolo1} = {simbolo2} + {differenza}"
        varianti = [val2 - differenza, val2 + random.randint(2, 8), val1]
        opzioni, corretta_idx = self._shuffle_opzioni(val2, varianti)
        testo = f"Trova il valore logico del simbolo {simbolo2} sapendo che:\n\n1)  {eq1}\n2)  {eq2}"
        spiegazione = (
            f"Sostituiamo {simbolo1} = {simbolo2} + {differenza} nella prima equazione:\n"
            f"({simbolo2} + {differenza}) + {simbolo2} = {somma}\n"
            f"2 × {simbolo2} = {somma - differenza}  →  {simbolo2} = {val2}.\n"
            f"(Verifica: {simbolo1} = {val1}, {val1} + {val2} = {somma} ✓)"
        )
        return self._formatta_domanda_pl(
            "operazioni-simboliche", testo, opzioni, corretta_idx, spiegazione,
            ["equazioni", "simboli", "algebra"],
        )

    def pattern_volumi(self) -> Dict:
        """Calcolo del volume di un insieme di cubi identici."""
        lato_lista = [1.5, 2.0, 2.5, 3.0, 4.0]
        lato = random.choice(lato_lista)
        nx, ny, nz = random.randint(3, 5), random.randint(3, 5), random.randint(2, 4)
        num_cubi = nx * ny * nz
        vol_sing = lato ** 3
        vol_tot = round(vol_sing * num_cubi, 2)

        def fmt(n):
            return f"{n:g}".replace(".", ",")

        corretta_str = f"{fmt(vol_tot)} cm³"
        varianti = [
            f"{fmt(round(vol_tot * 0.8, 2))} cm³",
            f"{fmt(round(lato * 3 * num_cubi, 2))} cm³",   # errore comune: lato×3 invece di lato³
            f"{fmt(round(vol_tot + vol_sing * 2, 2))} cm³",
        ]
        opzioni, corretta_idx = self._shuffle_opzioni(corretta_str, varianti)
        testo = (
            f"Un blocco da costruzione è composto da esattamente {num_cubi} cubi perfetti uguali.\n"
            f"Il lato di ciascun cubo misura {fmt(lato)} cm. Qual è il volume totale del blocco?"
        )
        spiegazione = (
            f"Volume del singolo cubo: {fmt(lato)}³ = {fmt(round(vol_sing, 2))} cm³.\n"
            f"Volume totale: {fmt(round(vol_sing, 2))} × {num_cubi} = {corretta_str}."
        )
        layout = {"tipo": "cubi", "dati": {"numX": nx, "numY": ny, "numZ": nz, "lato": lato}}
        return self._formatta_domanda_pl(
            "geometria", testo, opzioni, corretta_idx, spiegazione,
            ["geometria", "volumi", "cubi"], layout,
        )

    def pattern_sequenze_doppie(self) -> Dict:
        """Terne numeriche con regola n → n×2 → n×2−1."""
        n1 = random.randint(4, 9)
        seq1 = [n1, n1 * 2, n1 * 2 - 1]
        n2 = random.randint(11, 28)
        seq2 = [n2, n2 * 2, n2 * 2 - 1]
        n3 = random.randint(31, 55)
        r1, r2 = n3 * 2, n3 * 2 - 1
        corretta_str = f"{r1} e {r2}"
        varianti = [
            f"{r1 - 2} e {r2 - 1}",
            f"{r2} e {r1}",         # invertiti
            f"{n3 + n3} e {n3 + n3 + 1}",   # errore segno (+1 anziché −1)
        ]
        opzioni, corretta_idx = self._shuffle_opzioni(corretta_str, varianti)
        testo = (
            f"Individua i due numeri mancanti per completare la serie:\n\n"
            f"{seq1[0]} - {seq1[1]} - {seq1[2]}   /   {seq2[0]} - {seq2[1]} - {seq2[2]}   /   {n3} - ... - ..."
        )
        spiegazione = (
            f"Ogni terna segue la regola: 2° = 1°×2, 3° = 2°−1.\n"
            f"Terza terna: {n3} → {r1} → {r2}."
        )
        return self._formatta_domanda_pl(
            "sequenza-logica", testo, opzioni, corretta_idx, spiegazione,
            ["sequenze", "pattern", "moltiplicazione"],
        )

    def pattern_prezzi(self) -> Dict:
        """Problema pratico: trova la combinazione di prodotti con costo esatto.

        FIX: tutti i distrattori usano max(1, ...) per garantire quantità ≥ 1.
        """
        prodotti = [
            ("taccuino", round(random.uniform(2.5, 4.5), 1)),
            ("penna", round(random.uniform(1.2, 2.8), 1)),
            ("evidenziatore", round(random.uniform(1.8, 3.5), 1)),
            ("pizza", round(random.uniform(4.0, 8.0), 1)),
            ("hotdog", round(random.uniform(3.0, 5.0), 1)),
            ("bibita", round(random.uniform(2.0, 3.5), 1)),
        ]
        scelti = random.sample(prodotti, 3)
        q1, q2, q3 = random.randint(2, 6), random.randint(3, 8), random.randint(2, 5)
        totale = round(q1 * scelti[0][1] + q2 * scelti[1][1] + q3 * scelti[2][1], 2)

        def fmt(n):
            return f"{n:g}€".replace(".", ",")

        corretta_str = f"{q1} {scelti[0][0]} + {q2} {scelti[1][0]} + {q3} {scelti[2][0]}"
        varianti = [
            # distrattore 1: meno del primo, uno in più del secondo
            f"{max(1, q1 - 1)} {scelti[0][0]} + {q2 + 1} {scelti[1][0]} + {q3} {scelti[2][0]}",
            # distrattore 2: uno in più del primo, meno degli altri due
            f"{q1 + 1} {scelti[0][0]} + {max(1, q2 - 1)} {scelti[1][0]} + {max(1, q3 - 1)} {scelti[2][0]}",
            # distrattore 3: stesso del primo e secondo, due in più del terzo
            f"{q1} {scelti[0][0]} + {q2} {scelti[1][0]} + {q3 + 2} {scelti[2][0]}",
        ]
        opzioni, corretta_idx = self._shuffle_opzioni(corretta_str, varianti)
        testo = (
            f"I prezzi: {scelti[0][0]} {fmt(scelti[0][1])}, "
            f"{scelti[1][0]} {fmt(scelti[1][1])}, {scelti[2][0]} {fmt(scelti[2][1])}.\n"
            f"Quale combinazione ha un costo esatto di {fmt(totale)}?"
        )
        spiegazione = (
            f"- {q1} × {fmt(scelti[0][1])} = {fmt(round(q1 * scelti[0][1], 2))}\n"
            f"- {q2} × {fmt(scelti[1][1])} = {fmt(round(q2 * scelti[1][1], 2))}\n"
            f"- {q3} × {fmt(scelti[2][1])} = {fmt(round(q3 * scelti[2][1], 2))}\n"
            f"Totale: {fmt(totale)}"
        )
        layout = {"tipo": "vassoio", "dati": [{scelti[0][0]: q1, scelti[1][0]: q2, scelti[2][0]: q3}]}
        return self._formatta_domanda_pl(
            "problema-pratico", testo, opzioni, corretta_idx, spiegazione,
            ["aritmetica", "prezzi"], layout,
        )

    def pattern_torta(self) -> Dict:
        """Interpretazione di un grafico a torta con percentuali."""
        categorie = ["Lingue", "Chimica", "Lettere", "Medicina"]
        dati = {cat: random.randint(10, 50) for cat in categorie}
        totale = sum(dati.values())
        percentuali = {k: round((v / totale) * 100, 1) for k, v in dati.items()}
        conf_corretta = " ; ".join([f"{k} {v}%" for k, v in percentuali.items()])
        varianti = []
        for _ in range(3):
            pv = percentuali.copy()
            k1, k2 = random.sample(categorie, 2)
            pv[k1] = round(pv[k1] * random.uniform(0.7, 1.3), 1)
            pv[k2] = round(pv[k2] * random.uniform(0.7, 1.3), 1)
            varianti.append(" ; ".join([f"{k} {v}%" for k, v in pv.items()]))
        opzioni, corretta_idx = self._shuffle_opzioni(conf_corretta, varianti)
        testo = "Fare riferimento al grafico a torta proposto. Quale configurazione rappresenta correttamente le proporzioni mostrate?"
        spiegazione = f"Le proporzioni corrette lette dal grafico sono: {conf_corretta}."
        layout = {"tipo": "torta", "dati": dati}
        return self._formatta_domanda_pl(
            "interpretazione-grafico", testo, opzioni, corretta_idx, spiegazione,
            ["grafici", "percentuali"], layout,
        )

    # ═════════════════════════════════════════════════════════════════════════
    # NUOVI PATTERN (9)
    # ═════════════════════════════════════════════════════════════════════════

    def pattern_analogia_verbale(self) -> Dict:
        """Analogie verbali: A : B = C : ?"""
        coppie = [
            ("cane", "cucciolo", "gatto", "gattino", ["micino", "felino", "micio"]),
            ("giorno", "sole", "notte", "luna", ["stella", "buio", "cielo"]),
            ("libro", "leggere", "musica", "ascoltare", ["cantare", "suonare", "vedere"]),
            ("medico", "ospedale", "giudice", "tribunale", ["prigione", "polizia", "legge"]),
            ("calcolatrice", "numero", "dizionario", "parola", ["frase", "lettera", "testo"]),
            ("freddo", "inverno", "caldo", "estate", ["primavera", "sole", "autunno"]),
            ("ape", "alveare", "formica", "formicaio", ["nido", "tana", "buco"]),
            ("pennello", "pittore", "bisturi", "chirurgo", ["dottore", "operatore", "infermiere"]),
            ("foglia", "albero", "pinna", "pesce", ["ala", "squama", "pinza"]),
            ("martello", "chiodo", "cacciavite", "vite", ["bullone", "dado", "perno"]),
            ("pilota", "aereo", "capitano", "nave", ["porto", "mare", "sottomarino"]),
            ("occhio", "vedere", "orecchio", "sentire", ["udire", "toccare", "parlare"]),
        ]
        a, b, c, corretta, sbagli = random.choice(coppie)
        varianti = random.sample(sbagli, min(3, len(sbagli)))
        opzioni, corretta_idx = self._shuffle_opzioni(corretta, varianti)
        testo = f"Completa l'analogia verbale:\n\n{a} : {b}  =  {c} : ?"
        spiegazione = (
            f"La relazione logica è la stessa nelle due coppie: "
            f"'{a}' sta a '{b}' esattamente come '{c}' sta a '{corretta}'."
        )
        return self._formatta_domanda_pl(
            "analogia-verbale", testo, opzioni, corretta_idx, spiegazione,
            ["analogia", "verbale", "logica"],
        )

    def pattern_sillogismo(self) -> Dict:
        """Sillogismi deduttivi: data premessa 1 e premessa 2, qual è la conclusione corretta?"""
        scenari = [
            {
                "premessa1": "Tutti i mammiferi sono vertebrati.",
                "premessa2": "Il delfino è un mammifero.",
                "conclusione_corretta": "Il delfino è un vertebrato.",
                "distrattori": ["Il delfino è un pesce.", "I vertebrati sono tutti mammiferi.", "Il delfino non è un vertebrato."],
            },
            {
                "premessa1": "Tutti i quadrati hanno quattro lati uguali.",
                "premessa2": "ABCD è un quadrato.",
                "conclusione_corretta": "ABCD ha quattro lati uguali.",
                "distrattori": ["ABCD è un rettangolo.", "ABCD ha quattro angoli diversi.", "I quadrati sono rettangoli."],
            },
            {
                "premessa1": "Nessun pesce può camminare.",
                "premessa2": "Il salmone è un pesce.",
                "conclusione_corretta": "Il salmone non può camminare.",
                "distrattori": ["Il salmone può nuotare.", "I pesci non respirano.", "Il salmone è un mammifero."],
            },
            {
                "premessa1": "Tutti i pianeti orbitano attorno a una stella.",
                "premessa2": "Marte è un pianeta.",
                "conclusione_corretta": "Marte orbita attorno a una stella.",
                "distrattori": ["Marte è più grande della Terra.", "Marte ha vita.", "Le stelle orbitano attorno ai pianeti."],
            },
            {
                "premessa1": "Tutti i funghi sono organismi eucarioti.",
                "premessa2": "Il porcino è un fungo.",
                "conclusione_corretta": "Il porcino è un organismo eucariota.",
                "distrattori": ["Il porcino è una pianta.", "I funghi sono procarioti.", "Il porcino è commestibile."],
            },
            {
                "premessa1": "Tutti gli uccelli hanno le piume.",
                "premessa2": "Il pinguino è un uccello.",
                "conclusione_corretta": "Il pinguino ha le piume.",
                "distrattori": ["Il pinguino può volare.", "Gli uccelli sono tutti volatili.", "Il pinguino è un pesce."],
            },
            {
                "premessa1": "Nessun numero primo è divisibile per 4.",
                "premessa2": "Il 7 è un numero primo.",
                "conclusione_corretta": "Il 7 non è divisibile per 4.",
                "distrattori": ["Il 7 è pari.", "Il 4 è un numero primo.", "Il 7 è divisibile per 2."],
            },
        ]
        s = random.choice(scenari)
        opzioni, corretta_idx = self._shuffle_opzioni(s["conclusione_corretta"], s["distrattori"])
        testo = (
            f"Analizza le premesse e individua la conclusione logicamente necessaria:\n\n"
            f"Premessa 1: {s['premessa1']}\n"
            f"Premessa 2: {s['premessa2']}\n\n"
            f"Quale conclusione segue necessariamente?"
        )
        spiegazione = (
            f"Dal sillogismo deduttivo: se '{s['premessa1']}' e '{s['premessa2']}', "
            f"la conclusione necessaria è: '{s['conclusione_corretta']}'."
        )
        return self._formatta_domanda_pl(
            "sillogismo", testo, opzioni, corretta_idx, spiegazione,
            ["sillogismo", "deduzione", "logica-formale"],
        )

    def pattern_sequenza_alfabetica(self) -> Dict:
        """Sequenze di lettere con salti fissi o crescenti nell'alfabeto."""
        if random.random() < 0.5:
            # Salti crescenti
            start_idx = random.randint(0, 4)
            salto_base = random.randint(1, 2)
            indici = [start_idx]
            salti = []
            for i in range(4):
                s = salto_base + i
                salti.append(s)
                indici.append(indici[-1] + s)
            if max(indici) > 25:        # fallback sicuro
                start_idx, indici, salti = 0, [0], []
                for i in range(4):
                    salti.append(1 + i)
                    indici.append(indici[-1] + salti[-1])
            lettere = [chr(65 + i) for i in indici]
            corretta = lettere[-1]
            visibili = lettere[:-1]
            spiegazione = (
                f"La sequenza usa salti crescenti: "
                f"{', '.join(f'+{s}' for s in salti[:-1])}. "
                f"L'ultimo salto è +{salti[-1]}, quindi dopo {visibili[-1]} viene {corretta}."
            )
        else:
            # Salto fisso
            start_idx = random.randint(0, 3)
            salto = random.randint(2, 4)
            indici = [start_idx + salto * i for i in range(5)]
            if max(indici) > 25:
                indici = [salto * i for i in range(5)]
            lettere = [chr(65 + i) for i in indici]
            corretta = lettere[-1]
            visibili = lettere[:-1]
            spiegazione = (
                f"Ogni lettera avanza di +{salto} posizioni nell'alfabeto. "
                f"Dopo {visibili[-1]} (pos. {indici[-2] + 1}) viene {corretta} (pos. {indici[-1] + 1})."
            )

        varianti = []
        for delta in [1, -1, 2]:
            idx_var = indici[-1] + delta
            if 0 <= idx_var <= 25:
                varianti.append(chr(65 + idx_var))
        opzioni, corretta_idx = self._shuffle_opzioni(corretta, varianti)
        testo = f"Quale lettera completa la sequenza alfabetica?\n\n{' - '.join(visibili)} - ?"
        return self._formatta_domanda_pl(
            "sequenza-alfabetica", testo, opzioni, corretta_idx, spiegazione,
            ["sequenze", "alfabeto", "pattern"],
        )

    def pattern_venn_insiemi(self) -> Dict:
        """Diagrammi di Venn: calcolo di unione, intersezione, differenza."""
        scenari = [
            {"A": "studenti che suonano pianoforte", "n_A": 18, "B": "studenti che suonano chitarra", "n_B": 24, "intersezione": 7, "domanda_tipo": "unione"},
            {"A": "dipendenti che parlano inglese", "n_A": 30, "B": "dipendenti che parlano francese", "n_B": 20, "intersezione": 8, "domanda_tipo": "unione"},
            {"A": "atleti che praticano nuoto", "n_A": 22, "B": "atleti che praticano corsa", "n_B": 35, "intersezione": 10, "domanda_tipo": "solo_A"},
            {"A": "clienti che comprano pane", "n_A": 40, "B": "clienti che comprano latte", "n_B": 28, "intersezione": 12, "domanda_tipo": "unione"},
        ]
        s = random.choice(scenari)
        nA, nB, nAB = s["n_A"], s["n_B"], s["intersezione"]
        if s["domanda_tipo"] == "unione":
            corretta = nA + nB - nAB
            testo = (
                f"In un gruppo: {nA} {s['A']}, {nB} {s['B']}, "
                f"{nAB} fanno entrambe le cose.\n"
                f"Quante persone praticano almeno una delle due attività?"
            )
            spiegazione = (
                f"Formula dell'unione: |A ∪ B| = |A| + |B| − |A ∩ B| = "
                f"{nA} + {nB} − {nAB} = {corretta}.\n"
                f"Si sottrae l'intersezione per non contarla due volte."
            )
        else:
            corretta = nA - nAB
            testo = (
                f"In un gruppo: {nA} {s['A']}, {nB} {s['B']}, "
                f"{nAB} praticano entrambe.\n"
                f"Quante praticano solo la prima attività (esclusivamente)?"
            )
            spiegazione = f"Solo A = |A| − |A ∩ B| = {nA} − {nAB} = {corretta}."

        varianti = [corretta + nAB, max(1, corretta - random.randint(1, 3)), nA + nB]
        opzioni, corretta_idx = self._shuffle_opzioni(corretta, varianti)
        layout = {"tipo": "venn", "dati": {"A": s["A"], "B": s["B"], "nA": nA, "nB": nB, "nAB": nAB}}
        return self._formatta_domanda_pl(
            "diagramma-venn", testo, opzioni, corretta_idx, spiegazione,
            ["venn", "insiemi", "logica"], layout,
        )

    def pattern_percentuali_pratiche(self) -> Dict:
        """Calcolo percentuale applicato: sconti, aumenti, IVA."""
        tipo = random.choice(["sconto", "aumento", "iva"])
        if tipo == "sconto":
            prezzo = random.choice([80, 120, 150, 200, 250, 320])
            perc = random.choice([10, 15, 20, 25, 30])
            sconto = round(prezzo * perc / 100, 2)
            corretta = prezzo - sconto
            testo = f"Un articolo costa {prezzo}€. Viene applicato uno sconto del {perc}%. Qual è il prezzo finale scontato?"
            spiegazione = f"Sconto = {prezzo} × {perc}/100 = {sconto}€. Prezzo finale = {prezzo} − {sconto} = {corretta}€."
        elif tipo == "aumento":
            stipendio = random.choice([1200, 1500, 1800, 2000, 2400])
            perc = random.choice([5, 8, 10, 12, 15])
            aumento = round(stipendio * perc / 100, 2)
            corretta = stipendio + aumento
            testo = f"Uno stipendio di {stipendio}€ viene aumentato del {perc}%. Qual è il nuovo importo mensile?"
            spiegazione = f"Aumento = {stipendio} × {perc}/100 = {aumento}€. Nuovo stipendio = {stipendio} + {aumento} = {corretta}€."
        else:
            imponibile = random.choice([100, 150, 200, 250, 400])
            iva = random.choice([10, 22])
            imp_iva = round(imponibile * iva / 100, 2)
            corretta = imponibile + imp_iva
            testo = f"Un prodotto ha un imponibile di {imponibile}€ con IVA al {iva}%. Qual è il prezzo totale IVA inclusa?"
            spiegazione = f"IVA = {imponibile} × {iva}/100 = {imp_iva}€. Totale = {imponibile} + {imp_iva} = {corretta}€."

        varianti = [
            round(corretta * 0.9, 2),
            round(corretta * 1.1, 2),
            round(corretta + random.randint(5, 20), 2),
        ]
        opzioni, corretta_idx = self._shuffle_opzioni(corretta, varianti)
        return self._formatta_domanda_pl(
            "percentuali", testo, opzioni, corretta_idx, spiegazione,
            ["percentuali", "aritmetica", "pratica"],
        )

    def pattern_sequenza_figure(self) -> Dict:
        """Sequenze di figure rappresentate con simboli Unicode."""
        sequenze = [
            {
                "elementi": ["■", "■■", "■■■", "■■■■"],
                "regola": "Si aggiunge un quadrato (■) a ogni passo (+1).",
                "corretta": "■■■■■",
                "distrattori": ["■■■■■■", "■■■", "■■■■■■■"],
            },
            {
                "elementi": ["●", "●●", "●●●●", "●●●●●●●●"],
                "regola": "Il numero di cerchi raddoppia a ogni passo (×2).",
                "corretta": "●●●●●●●●●●●●●●●●",
                "distrattori": ["●●●●●●●●●●●●●●●●●●", "●●●●●●●●●●", "●●●●●●●●●●●●"],
            },
            {
                "elementi": ["▲", "▲▽", "▲▽▲", "▲▽▲▽"],
                "regola": "La sequenza alterna i simboli ▲ e ▽.",
                "corretta": "▲▽▲▽▲",
                "distrattori": ["▲▽▲▽▽", "▽▲▽▲▽", "▲▲▽▲▽"],
            },
            {
                "elementi": ["◆", "◆◆◆", "◆◆◆◆◆◆", "◆◆◆◆◆◆◆◆◆"],
                "regola": "Il numero di rombi aumenta di 3 a ogni passo (+3).",
                "corretta": "◆◆◆◆◆◆◆◆◆◆◆◆",
                "distrattori": ["◆◆◆◆◆◆◆◆◆◆", "◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆", "◆◆◆◆◆◆◆◆◆◆◆"],
            },
        ]
        s = random.choice(sequenze)
        opzioni, corretta_idx = self._shuffle_opzioni(s["corretta"], s["distrattori"])
        testo = f"Individua la figura successiva nella sequenza:\n\n{' → '.join(s['elementi'])} → ?"
        return self._formatta_domanda_pl(
            "sequenza-figure", testo, opzioni, corretta_idx, s["regola"],
            ["figure", "pattern", "logica-visiva"],
        )

    def pattern_proporzioni(self) -> Dict:
        """Proporzioni: a:b = c:? (quarto proporzionale)."""
        # Garantisce valori interi e quarto proporzionale intero positivo
        for _ in range(100):   # max tentativi per evitare loop infinito teorico
            a = random.randint(2, 12)
            b = random.randint(3, 20)
            c = random.randint(2, 10)
            if (b * c) % a == 0:
                d = (b * c) // a
                if d > 0:
                    break
        testo = (
            f"Risolvi la proporzione e trova il valore mancante:\n\n"
            f"{a} : {b}  =  {c} : ?"
        )
        spiegazione = (
            f"Nelle proporzioni il prodotto dei medi è uguale al prodotto degli estremi.\n"
            f"{a} × ? = {b} × {c}  →  ? = {b * c} ÷ {a} = {d}."
        )
        varianti = [
            d + random.randint(1, 4),
            max(1, d - random.randint(1, 3)),
            d + random.randint(5, 9),
        ]
        opzioni, corretta_idx = self._shuffle_opzioni(d, varianti)
        return self._formatta_domanda_pl(
            "proporzioni", testo, opzioni, corretta_idx, spiegazione,
            ["proporzioni", "aritmetica", "algebra"],
        )

    def pattern_problema_eta(self) -> Dict:
        """Problemi di età: calcola l'età presente, futura o passata."""
        eta_A = random.randint(10, 35)
        diff = random.randint(3, 15)
        eta_B = eta_A + diff
        anni = random.randint(3, 10)
        tipo = random.choice(["futuro", "passato", "somma", "differenza"])
        if tipo == "futuro":
            corretta = eta_A + anni
            testo = f"Alice ha {eta_A} anni, Bruno ne ha {eta_B}. Quanti anni avrà Alice tra {anni} anni?"
            spiegazione = f"Alice oggi ha {eta_A} anni. Tra {anni} anni: {eta_A} + {anni} = {corretta} anni."
        elif tipo == "passato":
            corretta = eta_B - anni
            testo = f"Alice ha {eta_A} anni, Bruno ne ha {eta_B}. Quanti anni aveva Bruno {anni} anni fa?"
            spiegazione = f"Bruno oggi ha {eta_B} anni. {anni} anni fa: {eta_B} − {anni} = {corretta} anni."
        elif tipo == "somma":
            corretta = eta_A + eta_B
            testo = f"Alice ha {eta_A} anni e Bruno ha {eta_B} anni. Qual è la somma delle loro età attuali?"
            spiegazione = f"Somma = {eta_A} + {eta_B} = {corretta} anni."
        else:
            corretta = diff
            testo = f"Alice ha {eta_A} anni, Bruno ne ha {eta_B}. Di quanti anni è più grande Bruno rispetto ad Alice?"
            spiegazione = f"Differenza = {eta_B} − {eta_A} = {corretta} anni."

        varianti = [
            corretta + random.randint(1, 5),
            max(1, corretta - random.randint(1, 4)),
            corretta + random.randint(6, 10),
        ]
        opzioni, corretta_idx = self._shuffle_opzioni(corretta, varianti)
        return self._formatta_domanda_pl(
            "problema-eta", testo, opzioni, corretta_idx, spiegazione,
            ["età", "aritmetica", "problemi"],
        )

    def pattern_velocita_distanza(self) -> Dict:
        """Formula v = d/t applicata in tre direzioni: trova d, t o v."""
        v = random.choice([40, 60, 80, 90, 100, 120])
        t_ore = random.choice([0.5, 1, 1.5, 2, 2.5, 3])
        d = round(v * t_ore)
        tipo = random.choice(["distanza", "tempo", "velocita"])

        def fmt_ore(t: float) -> str:
            if t == int(t):
                return f"{int(t)} ora{'e' if t > 1 else ''}"
            return f"{int(t * 60)} minuti"

        if tipo == "distanza":
            corretta = d
            testo = f"Un veicolo viaggia a {v} km/h per {fmt_ore(t_ore)}. Quanti km percorre in totale?"
            spiegazione = f"d = v × t = {v} × {t_ore} = {corretta} km."
            varianti = [corretta + random.randint(10, 30), max(1, corretta - random.randint(10, 25)), corretta + random.randint(40, 60)]
        elif tipo == "tempo":
            corretta = t_ore
            testo = f"Un veicolo percorre {d} km a velocità costante di {v} km/h. Quante ore impiega?"
            spiegazione = f"t = d ÷ v = {d} ÷ {v} = {corretta} ore."
            varianti = [round(corretta + 0.5, 1), max(0.5, round(corretta - 0.5, 1)), round(corretta + 1, 1)]
        else:
            corretta = v
            testo = f"Un veicolo percorre {d} km in {fmt_ore(t_ore)}. Qual è la sua velocità media in km/h?"
            spiegazione = f"v = d ÷ t = {d} ÷ {t_ore} = {corretta} km/h."
            varianti = [corretta + random.randint(10, 20), max(10, corretta - random.randint(10, 15)), corretta + random.randint(25, 40)]

        opzioni, corretta_idx = self._shuffle_opzioni(corretta, varianti)
        return self._formatta_domanda_pl(
            "velocita-distanza", testo, opzioni, corretta_idx, spiegazione,
            ["velocità", "fisica", "problemi"],
        )

    # ═════════════════════════════════════════════════════════════════════════
    # PATTERN VISIVI (4) — layout SVG renderizzato dal frontend
    # ═════════════════════════════════════════════════════════════════════════

    def pattern_ruota_numerica(self) -> Dict:
        """Ruota con 6 raggi: ogni coppia di raggi opposti somma a S. Trova il raggio mancante."""
        S = random.randint(12, 25)
        coppie = []
        usati: set = set()
        for _ in range(200):                   # max tentativi
            a = random.randint(2, S - 2)
            b = S - a
            if a not in usati and b not in usati and a != b:
                coppie.append((a, b))
                usati.update([a, b])
            if len(coppie) == 3:
                break
        if len(coppie) < 3:                    # fallback deterministico
            coppie = [(3, S - 3), (5, S - 5), (7, S - 7)]
        # Incrocio ciclico: (0,3), (1,4), (2,5) sono opposti
        raggi = [
            coppie[0][0], coppie[1][0], coppie[2][0],
            coppie[0][1], coppie[1][1], coppie[2][1],
        ]
        idx_nascosto = random.randint(0, 5)
        corretta = raggi[idx_nascosto]
        opposto = S - corretta
        raggi_vis = list(raggi)
        raggi_vis[idx_nascosto] = "?"
        varianti = [
            max(1, corretta - random.randint(1, 4)),
            corretta + random.randint(1, 4),
            max(1, opposto + random.randint(1, 3)),
        ]
        opzioni, corretta_idx = self._shuffle_opzioni(corretta, varianti)
        testo = (
            "Osserva la ruota numerica. I due numeri di ogni coppia di raggi "
            "diametralmente opposti hanno sempre la stessa somma.\n"
            "Qual è il numero mancante indicato con '?'?"
        )
        spiegazione = (
            f"Ogni coppia di raggi opposti somma a {S}. "
            f"Il raggio opposto al '?' vale {opposto}, "
            f"quindi '?' = {S} \u2212 {opposto} = {corretta}."
        )
        layout = {
            "tipo": "ruota",
            "dati": {"raggi": raggi_vis, "sommaOpposti": S, "indiceMancante": idx_nascosto},
        }
        return self._formatta_domanda_pl(
            "ruota-numerica", testo, opzioni, corretta_idx, spiegazione,
            ["ruota", "visiva", "logica-numerica"], layout,
        )

    def pattern_serie_poligoni(self) -> Dict:
        """Sequenza di poligoni a lati crescenti. Individua la figura successiva."""
        nomi = {
            3: "triangolo", 4: "quadrato", 5: "pentagono",
            6: "esagono", 7: "ettagono", 8: "ottagono", 9: "nonagono",
        }
        def nome(n: int) -> str:
            return nomi.get(n, f"poligono a {n} lati")

        start_lati = random.randint(3, 5)
        incremento = random.choice([1, 2])
        n_visibili = random.randint(3, 4)
        sequenza = [start_lati + incremento * i for i in range(n_visibili)]
        corretta_lati = sequenza[-1] + incremento
        corretta_str = f"{nome(corretta_lati).capitalize()} ({corretta_lati} lati)"
        varianti: List[str] = []
        for delta in [-1, 1, -2, 2, 3, -3]:
            n = corretta_lati + delta
            if n >= 3:
                v = f"{nome(n).capitalize()} ({n} lati)"
                if v not in varianti and v != corretta_str:
                    varianti.append(v)
            if len(varianti) == 3:
                break
        opzioni, corretta_idx = self._shuffle_opzioni(corretta_str, varianti)
        seq_nomi = " \u2192 ".join(f"{nome(n).capitalize()} ({n})" for n in sequenza)
        testo = (
            f"Osserva la sequenza di figure geometriche e individua la figura successiva:\n\n"
            f"{seq_nomi} \u2192 ?"
        )
        spiegazione = (
            f"Ogni figura aggiunge {incremento} lato rispetto alla precedente. "
            f"Dopo il {nome(sequenza[-1])} ({sequenza[-1]} lati) viene il "
            f"{nome(corretta_lati)} ({corretta_lati} lati)."
        )
        layout = {
            "tipo": "poligoni",
            "dati": {
                "sequenza": sequenza,
                "prossimo": corretta_lati,
                "incremento": incremento,
                "fill": random.choice(["empty", "filled"]),
            },
        }
        return self._formatta_domanda_pl(
            "serie-poligoni", testo, opzioni, corretta_idx, spiegazione,
            ["figure", "poligoni", "sequenza-visiva"], layout,
        )

    def pattern_punto_mobile(self) -> Dict:
        """Punto che si sposta in una griglia 3\u00d73 seguendo una regola. Trova la posizione successiva."""
        label_pos = {
            (0, 0): "in alto a sinistra",  (0, 1): "in alto al centro",  (0, 2): "in alto a destra",
            (1, 0): "al centro a sinistra", (1, 1): "al centro",          (1, 2): "al centro a destra",
            (2, 0): "in basso a sinistra",  (2, 1): "in basso al centro", (2, 2): "in basso a destra",
        }
        percorsi = [
            {"pos": [(0,0),(0,1),(0,2),(1,0)], "prossima": (1,1),
             "regola": "Il punto scorre orizzontalmente riga per riga da sinistra a destra."},
            {"pos": [(0,0),(0,1),(0,2),(1,2)], "prossima": (2,2),
             "regola": "Il punto si sposta lungo il bordo in senso orario."},
            {"pos": [(0,0),(1,0),(2,0),(2,1)], "prossima": (2,2),
             "regola": "Il punto scende lungo la colonna sinistra poi prosegue a destra."},
            {"pos": [(0,2),(1,2),(2,2),(2,1)], "prossima": (2,0),
             "regola": "Il punto scende lungo la colonna destra poi prosegue a sinistra."},
            {"pos": [(0,0),(1,1),(2,2)], "prossima": (0,0),
             "regola": "Il punto percorre la diagonale principale e poi ricomincia dall\u2019inizio."},
            {"pos": [(0,0),(0,2),(2,2)], "prossima": (2,0),
             "regola": "Il punto salta agli angoli in senso orario."},
            {"pos": [(0,0),(2,0),(2,2),(0,2)], "prossima": (0,0),
             "regola": "Il punto percorre il perimetro in senso orario e poi ricomincia."},
            {"pos": [(2,2),(2,1),(2,0),(1,0)], "prossima": (0,0),
             "regola": "Il punto risale verso l\u2019angolo in alto a sinistra."},
        ]
        perc = random.choice(percorsi)
        posizioni = perc["pos"]
        prossima = perc["prossima"]
        corretta_str = f"Casella {label_pos[prossima]}"
        tutte_pos = [(r, c) for r in range(3) for c in range(3)]
        set_visibili = set(posizioni[-2:])
        altre_pos = [p for p in tutte_pos if p != prossima and p not in set_visibili]
        random.shuffle(altre_pos)
        varianti = [f"Casella {label_pos[p]}" for p in altre_pos[:3]]
        opzioni, corretta_idx = self._shuffle_opzioni(corretta_str, varianti)
        passi = " \u2192 ".join(label_pos[p] for p in posizioni)
        testo = (
            f"Il punto si sposta nella griglia seguendo una regola logica.\n"
            f"Sequenza osservata: {passi} \u2192 ?\n\n"
            f"In quale casella si trover\u00e0 il punto al passo successivo?"
        )
        spiegazione = f"{perc['regola']} La prossima posizione \u00e8: {label_pos[prossima]}."
        layout = {
            "tipo": "punto-mobile",
            "dati": {
                "dimensione": 3,
                # Firestore vieta array annidati → usiamo mappe {"r": row, "c": col}
                "posizioni": [{"r": r, "c": c} for r, c in posizioni],
                "prossima":  {"r": prossima[0], "c": prossima[1]},
            },
        }
        return self._formatta_domanda_pl(
            "punto-mobile", testo, opzioni, corretta_idx, spiegazione,
            ["visiva", "spaziale", "griglia"], layout,
        )

    def pattern_matrice_raven(self) -> Dict:
        """Matrice 3\u00d73 con forme e riempimento progressivo. Trova la cella mancante (in basso a destra)."""
        forme_disponibili = ["cerchio", "quadrato", "triangolo", "rombo"]
        fill_names = {0: "vuoto", 0.5: "met\u00e0 pieno", 1: "pieno"}
        fills = [0, 0.5, 1]
        forme_scelte = random.sample(forme_disponibili, 3)
        # Costruisce 9 celle: riga=forma, colonna=fill
        celle: List = []
        for forma in forme_scelte:
            for fill in fills:
                celle.append({"forma": forma, "fill": fill})
        # L'ultima (indice 8) \u00e8 la risposta corretta
        corretta_cella = dict(celle[8])
        celle[8] = {"forma": "?", "fill": -1}  # sentinel Firestore-safe (no null in nested arrays)
        corretta_str = f"{corretta_cella['forma'].capitalize()} {fill_names[corretta_cella['fill']]}"
        quarta_forma = [f for f in forme_disponibili if f not in forme_scelte][0]
        varianti = [
            f"{corretta_cella['forma'].capitalize()} {fill_names[0]}",    # stessa forma, vuoto
            f"{forme_scelte[0].capitalize()} {fill_names[0.5]}",          # prima forma, met\u00e0
            f"{quarta_forma.capitalize()} {fill_names[0.5]}",             # forma nuova
        ]
        varianti = [v for v in varianti if v != corretta_str][:3]
        opzioni, corretta_idx = self._shuffle_opzioni(corretta_str, varianti)
        testo = (
            "Osserva la matrice 3\u00d73. Ogni riga contiene la stessa figura con "
            "riempimento progressivo (vuota \u2192 met\u00e0 piena \u2192 piena). "
            "Ogni colonna mantiene lo stesso livello di riempimento.\n"
            "Quale figura completa la casella mancante (in basso a destra)?"
        )
        spiegazione = (
            f"Nella terza riga la forma \u00e8 {corretta_cella['forma']}. "
            f"Nella terza colonna il riempimento \u00e8 'pieno'. "
            f"La risposta \u00e8: {corretta_str}."
        )
        layout = {
            "tipo": "matrice-raven",
            "dati": {"celle": celle, "forme": forme_scelte, "fills": fills},
        }
        return self._formatta_domanda_pl(
            "matrice-raven", testo, opzioni, corretta_idx, spiegazione,
            ["raven", "matrice", "logica-visiva", "spaziale"], layout,
        )

    # ═════════════════════════════════════════════════════════════════════════
    # BATTERIA PRINCIPALE
    # ═════════════════════════════════════════════════════════════════════════

    def genera_batteria(self, quantita_per_pattern: int = 20) -> List[Dict]:
        """
        Genera una batteria bilanciata di quiz.

        Con quantita_per_pattern=20 e 19 pattern → 380 quiz totali.
        Resetta quiz_generati ad ogni chiamata per permettere ri-esecuzioni pulite.
        """
        pattern_list: List[Callable] = [
            # Originali (6)
            self.pattern_serie_incrementi,
            self.pattern_operazioni_simboli,
            self.pattern_volumi,
            self.pattern_sequenze_doppie,
            self.pattern_prezzi,
            self.pattern_torta,
            # Nuovi (9)
            self.pattern_analogia_verbale,
            self.pattern_sillogismo,
            self.pattern_sequenza_alfabetica,
            self.pattern_venn_insiemi,
            self.pattern_percentuali_pratiche,
            self.pattern_sequenza_figure,
            self.pattern_proporzioni,
            self.pattern_problema_eta,
            self.pattern_velocita_distanza,
            # Visivi (4)
            self.pattern_ruota_numerica,
            self.pattern_serie_poligoni,
            self.pattern_punto_mobile,
            self.pattern_matrice_raven,
        ]

        self.quiz_generati.clear()
        errori = 0
        for pattern_fn in pattern_list:
            for _ in range(quantita_per_pattern):
                try:
                    self.quiz_generati.append(pattern_fn())
                except Exception as e:
                    logger.warning(f"Errore in {pattern_fn.__name__}: {e}")
                    errori += 1

        random.shuffle(self.quiz_generati)
        logger.info(
            f"✅ Generati {len(self.quiz_generati)} quiz "
            f"({len(pattern_list)} pattern × {quantita_per_pattern} ciascuno)"
            + (f" | ⚠️ {errori} errori saltati" if errori else "")
        )
        return self.quiz_generati


# ═════════════════════════════════════════════════════════════════════════════
# ENTRY POINT
# ═════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    import os

    QUANTITA_PER_PATTERN = 20          # 19 pattern × 20 = 380 quiz totali
    OUTPUT_FILE = os.path.join(
        os.path.dirname(__file__), "database_quiz_logica.json"
    )

    config = ConfigGeneratore(livello_difficolta=2)
    gen = GeneratoreQuizLogici(config)
    quiz = gen.genera_batteria(quantita_per_pattern=QUANTITA_PER_PATTERN)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(quiz, f, indent=2, ensure_ascii=False)

    sottotipi = sorted(set(q["sottoCategoriaId"] for q in quiz))
    print(f"\n✅  Salvati {len(quiz)} quiz in '{OUTPUT_FILE}'")
    print(f"    Pattern totali : 15  (6 originali + 9 nuovi)")
    print(f"    Quiz per pattern: {QUANTITA_PER_PATTERN}")
    print(f"    Sottotipi generati ({len(sottotipi)}):")
    for st in sottotipi:
        count = sum(1 for q in quiz if q["sottoCategoriaId"] == st)
        print(f"      • {st:<30} {count} quiz")
