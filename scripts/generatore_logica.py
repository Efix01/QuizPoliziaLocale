import random
import json
import uuid
from typing import List, Dict, Tuple, Union

class GeneratoreQuizLogici:
    def __init__(self):
        self.quiz_generati = []
        
        self.simboli = ['⭐', '🌙', '☀️', '🌸', '🌹', '🍎', '🍊', '💎', '🔷', '🔶', '🟢', '🔵', '🔴']
    
    def _genera_id(self) -> str:
        # Genera ID randomico log_1a2b3c4d per prevenire le collisioni
        return f"log_{uuid.uuid4().hex[:12]}"
    
    def _shuffle_opzioni(self, corretta: Union[int, str, float], varianti: List[Union[int, str, float]]) -> Tuple[List[str], int]:
        opzioni_valori = [corretta] + varianti
        random.shuffle(opzioni_valori)
        # Array di 4 stringhe come da schema DomandaPL
        opzioni_str = [str(val) for val in opzioni_valori]
        indice_corretta = opzioni_valori.index(corretta)
        return opzioni_str, indice_corretta
        
    def _formatta_domanda_pl(self, sottotipo: str, testo: str, opzioni: List[str], corretta_idx: int, spiegazione: str, tags: List[str], layout_grafico: Dict = None):
        domanda = {
            "id": self._genera_id(),
            "categoriaId": "logica",
            "strato": "core", 
            "sottoCategoriaId": sottotipo,
            "testo": testo,
            "opzioni": opzioni,
            "rispostaCorretta": corretta_idx,
            "spiegazione": spiegazione,
            "riferimentoNormativo": { "legge": "Abilità Logico-Matematiche" },
            "livelloDifficolta": 2, # Fissato a media difficoltà (2)
        }
        if layout_grafico:
            domanda["layoutGrafico"] = layout_grafico
        return domanda
    
    # 1. SERIE NUMERICHE (Incremento progressivo crescente)
    def pattern_serie_incrementi(self) -> Dict:
        start = random.randint(15, 45)
        base_incr = random.randint(2, 6) # Es. parte con +2, +3, +4
        lunghezza = 6 # Es. 15, 17 (+2), 20 (+3), 24 (+4), 29 (+5), 35 (+6). Richiesta la successiva (+7)
        
        serie = [start]
        incrementi = []
        for i in range(lunghezza - 1):
            incr = base_incr + i
            incrementi.append(incr)
            serie.append(serie[-1] + incr)
            
        corretta = serie[-1]
        
        varianti = [
            corretta + random.randint(1, 4),
            corretta - random.randint(1, 3),
            corretta + random.randint(5, 8)
        ]
        
        opzioni, corretta_idx = self._shuffle_opzioni(corretta, varianti)
        
        testo = f"Quale numero completa la serie logica?\n\n{serie[0]} - {serie[1]} - {serie[2]} - {serie[3]} - {serie[4]} - ?"
        spiegazione = f"La serie numerica segue una regola di incremento progressivo (sempre maggiore di 1 rispetto al precedente). Gli incrementi sono: {', '.join([f'+{i}' for i in incrementi])}. Dunque {serie[-2]} + {incrementi[-1]} = {corretta}."
        
        return self._formatta_domanda_pl("serie-numerica", testo, opzioni, corretta_idx, spiegazione, ["serie", "aritmetica", "incrementi"])

    # 2. OPERAZIONI CON SIMBOLI (Sistema lineare mascherato)
    def pattern_operazioni_simboli(self) -> Dict:
        # Sotto il cofano creiamo un sistema: A + B = Somma, A = B + Differenza
        simbolo1, simbolo2 = random.sample(self.simboli, 2)
        
        # B è il valore che dobbiamo far trovare (o A)
        val2 = random.randint(12, 45) # Valore di B
        differenza = random.randint(6, 18) 
        val1 = val2 + differenza # Valore di A
        
        somma = val1 + val2
        
        eq1 = f"{simbolo1} + {simbolo2} = {somma}"
        eq2 = f"{simbolo1} = {simbolo2} + {differenza}"
        
        varianti = [
            val2 - differenza,
            val2 + random.randint(2, 8),
            val1 # Distrattore forte (il valore dell'altro simbolo)
        ]
        
        opzioni, corretta_idx = self._shuffle_opzioni(val2, varianti)
        
        testo = f"Trova il valore logico del simbolo {simbolo2} sapendo che:\n\n1)  {eq1}\n2)  {eq2}"
        spiegazione = f"Risolviamo inserendo il valore di {simbolo1} (dalla seconda equazione) nella prima:\n({simbolo2} + {differenza}) + {simbolo2} = {somma}\nQuindi: 2 \u00d7 {simbolo2} = {somma} - {differenza} = {somma - differenza}\nE infine {simbolo2} = {somma - differenza} \u00f7 2 = {val2}.\n(Verifica: {simbolo1} vale {val1}, {val1} + {val2} = {somma})."
        
        return self._formatta_domanda_pl("operazioni-simboliche", testo, opzioni, corretta_idx, spiegazione, ["equazioni", "simboli", "algebra"])

    # 3. VOLUMI E CUBI
    def pattern_volumi(self) -> Dict:
        lato_lista = [1.5, 2.0, 2.5, 3.0, 4.0]
        lato = random.choice(lato_lista)
        num_cubi_x = random.randint(3, 5)
        num_cubi_y = random.randint(3, 5)
        num_cubi_z = random.randint(2, 4)
        num_cubi = num_cubi_x * num_cubi_y * num_cubi_z
        
        volume_singolo = (lato ** 3)
        volume_totale = round(volume_singolo * num_cubi, 2)
        
        # Formattiamo i numeri visivamente
        def fmt(n): return f"{n:g}".replace('.', ',')
        
        corretta_str = f"{fmt(volume_totale)} cm\u00b3"
        varianti = [
            f"{fmt(round(volume_totale * 0.8, 2))} cm\u00b3",
            f"{fmt(round(lato * 3 * num_cubi, 2))} cm\u00b3", # Errore frequente (Lato*3)
            f"{fmt(round(volume_totale + volume_singolo*2, 2))} cm\u00b3"
        ]
        
        opzioni, corretta_idx = self._shuffle_opzioni(corretta_str, varianti)
        
        testo = f"Un blocco da costruzione è costituito da esattamente {num_cubi} cubi perfetti tutti uguali tra loro.\nSapendo che il lato (spigolo) di un singolo cubo misura {fmt(lato)} cm, qual è il volume totale del blocco formato?"
        spiegazione = f"Il volume di un singolo cubo si calcola elevando il lato al cubo (l \u00d7 l \u00d7 l): {fmt(lato)} \u00d7 {fmt(lato)} \u00d7 {fmt(lato)} = {fmt(round(volume_singolo,2))} cm\u00b3.\nEssendo il blocco formato da {num_cubi} di questi cubi, il volume totale sarà {fmt(round(volume_singolo,2))} \u00d7 {num_cubi} = {corretta_str}."
        
        layout = {
            "tipo": "cubi",
            "dati": {
                "numX": num_cubi_x,
                "numY": num_cubi_y,
                "numZ": num_cubi_z,
                "lato": lato
            }
        }
        
        return self._formatta_domanda_pl("geometria", testo, opzioni, corretta_idx, spiegazione, ["geometria", "volumi", "cubi"], layout)

    # 4. SEQUENZE LOGICHE DOPPIE (n -> n*2 -> n*2-1)
    def pattern_sequenze_doppie(self) -> Dict:
        # Tre sotto-gruppi di numeri. Ultimo mancante.
        n1 = random.randint(4, 9)
        seq1 = [n1, n1 * 2, n1 * 2 - 1]
        
        n2 = random.randint(11, 28)
        seq2 = [n2, n2 * 2, n2 * 2 - 1]
        
        n3 = random.randint(31, 55)
        risposta1 = n3 * 2
        risposta2 = n3 * 2 - 1
        
        corretta_str = f"{risposta1} e {risposta2}"
        
        varianti = [
            f"{risposta1 - 2} e {risposta2 - 1}",
            f"{risposta2} e {risposta1}", # Invertiti
            f"{n3 + n3} e {n3 + n3 + 1}"  # Errore segno (+1 anzichè -1)
        ]
        
        opzioni, corretta_idx = self._shuffle_opzioni(corretta_str, varianti)
        
        testo = f"Individua i due numeri mancanti per completare correttamente la serie logica:\n\n{seq1[0]} - {seq1[1]} - {seq1[2]}   /   {seq2[0]} - {seq2[1]} - {seq2[2]}   /   {n3} - ... - ..."
        spiegazione = f"La serie è composta da terne di numeri indipendenti. La regola per ogni terna è la medesima:\nil secondo numero è il doppio del primo (\u00d72), il terzo numero è il secondo meno uno (-1).\nVediamo la terza: parte con {n3}. Il doppio è {risposta1}. Togliendo 1 si ottiene {risposta2}."
        
        return self._formatta_domanda_pl("sequenza-logica", testo, opzioni, corretta_idx, spiegazione, ["sequenze", "pattern", "moltiplicazione"])

    # 5. PROBLEMI PREZZI E QUANTITA'
    def pattern_prezzi(self) -> Dict:
        prodotti = [
            ("taccuino", round(random.uniform(2.5, 4.5), 1)), 
            ("penna", round(random.uniform(1.2, 2.8), 1)),
            ("evidenziatore", round(random.uniform(1.8, 3.5), 1)),
            ("pizza", round(random.uniform(4.0, 8.0), 1)),
            ("hotdog", round(random.uniform(3.0, 5.0), 1)),
            ("bibita", round(random.uniform(2.0, 3.5), 1))
        ]
        scelti = random.sample(prodotti, 3)
        
        q1 = random.randint(2, 6)
        q2 = random.randint(3, 8)
        q3 = random.randint(2, 5)
        
        totale_corretto = round((q1 * scelti[0][1]) + (q2 * scelti[1][1]) + (q3 * scelti[2][1]), 2)
        
        def fmt(n): return f"{n:g}".replace('.', ',') + "€"
        
        opzione_corretta = f"{q1} {scelti[0][0]} + {q2} {scelti[1][0]} + {q3} {scelti[2][0]}"
        
        # Generiamo variazioni dove cambia la quantità
        varianti = [
            f"{q1-1} {scelti[0][0]} + {q2+1} {scelti[1][0]} + {q3} {scelti[2][0]}",
            f"{q1+1} {scelti[0][0]} + {q2-1} {scelti[1][0]} + {q3-1} {scelti[2][0]}",
            f"{q1} {scelti[0][0]} + {q2} {scelti[1][0]} + {q3+2} {scelti[2][0]}"
        ]
        
        opzioni, corretta_idx = self._shuffle_opzioni(opzione_corretta, varianti)
        
        testo = f"I prezzi di un menu sono i seguenti: {scelti[0][0]} costa {fmt(scelti[0][1])}, {scelti[1][0]} costa {fmt(scelti[1][1])} e {scelti[2][0]} costa {fmt(scelti[2][1])}.\nRispetto ai prezzi proposti e al vassoio mostrato in figura, quale combinazione logica ha un costo esatto di {fmt(totale_corretto)} in totale?"
        spiegazione = f"Verifichiamo la combinazione corretta calcolando il costo dei singoli:\n- {q1} {scelti[0][0]} = {q1} \u00d7 {fmt(scelti[0][1])} = {fmt(round(q1*scelti[0][1],2))}\n- {q2} {scelti[1][0]} = {q2} \u00d7 {fmt(scelti[1][1])} = {fmt(round(q2*scelti[1][1],2))}\n- {q3} {scelti[2][0]} = {q3} \u00d7 {fmt(scelti[2][1])} = {fmt(round(q3*scelti[2][1],2))}\nSommando i totali si ottiene {fmt(totale_corretto)}."
        
        layout = {
            "tipo": "vassoio",
            "dati": [
                {scelti[0][0]: q1, scelti[1][0]: q2, scelti[2][0]: q3}
            ]
        }
        
        return self._formatta_domanda_pl("problema-pratico", testo, opzioni, corretta_idx, spiegazione, ["aritmetica", "prezzi"], layout)

    def pattern_torta(self) -> Dict:
        categorie = ['Lingue', 'Chimica', 'Lettere', 'Medicina']
        dati = {cat: random.randint(10, 50) for cat in categorie}
        
        totale = sum(dati.values())
        percentuali = {k: round((v/totale)*100, 1) for k, v in dati.items()}
        
        conf_corretta = " ; ".join([f"{k} {v}%" for k, v in percentuali.items()])
        
        varianti = []
        for i in range(3):
            perc_var = percentuali.copy()
            k1, k2 = random.sample(categorie, 2)
            perc_var[k1] = round(perc_var[k1] * random.uniform(0.7, 1.3), 1)
            perc_var[k2] = round(perc_var[k2] * random.uniform(0.7, 1.3), 1)
            varianti.append(" ; ".join([f"{k} {v}%" for k, v in perc_var.items()]))
            
        opzioni, corretta_idx = self._shuffle_opzioni(conf_corretta, varianti)
        
        testo = "Fare riferimento al grafico a torta proposto. Quale configurazione rappresenta approssimativamente le proporzioni mostrate?"
        spiegazione = f"Le proporzioni corrette lette dal grafico sono: {conf_corretta}."
        
        layout = {
            "tipo": "torta",
            "dati": dati
        }
        
        return self._formatta_domanda_pl("interpretazione-grafico", testo, opzioni, corretta_idx, spiegazione, ["grafici", "percentuali"], layout)

    def genera_batteria(self, quantita_per_pattern=15):
        # Genera un mix bilanciato
        pattern_list = [
            self.pattern_serie_incrementi,
            self.pattern_operazioni_simboli,
            self.pattern_volumi,
            self.pattern_sequenze_doppie,
            self.pattern_prezzi,
            self.pattern_torta
        ]
        
        for num, pattern_fn in enumerate(pattern_list):
            for i in range(quantita_per_pattern):
                self.quiz_generati.append(pattern_fn())
        
        # Mescoliamo i quiz finali affinchè compaiano disordinati all'utente
        random.shuffle(self.quiz_generati)
        return self.quiz_generati

if __name__ == "__main__":
    gen = GeneratoreQuizLogici()
    # Peschiamo 20 quiz per pattern, generando 100 quiz misti in totale (livello medio)
    gen.genera_batteria(50)
    with open("database_100_quiz_logica.json", "w", encoding="utf-8") as f:
        json.dump(gen.quiz_generati, f, indent=2, ensure_ascii=False)
    print("✅ Generato database_100_quiz_logica.json con 100 nuovi quiz di Logica Media compatibili con DomandaPL.")
