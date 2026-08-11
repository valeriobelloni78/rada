/* =============================================================================
   RADA · model.js — lo stato del collage
   Nessuna dipendenza: non conosce né l'audio né la grafica. Descrive soltanto
   che cosa sono le quattro frasi e come nascono le loro idee musicali.
============================================================================= */

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* --- parametri globali: valore corrente (G) e target smussato (GT) --------- */
const G  = { spread: 45, warmth: 70, rev: 72, dens: 5, head: 30 };
const GT = { ...G };
const PARAMS = ["spread", "warmth", "rev", "dens", "head"];

/* --- mood: preset sonori + configurazione temporale delle quattro frasi ----
   I periodi di ogni serie sono a due a due coprimi: è ciò che tiene le frasi
   sfasate a lungo. Cambiare mood rigenera anche le quattro idee.

   Le chiavi sono IDENTIFICATORI, non etichette: il nome visibile di ogni mood
   sta in i18n.js, una voce per lingua. Prima le due cose coincidevano, e un
   mood non si poteva rinominare senza rinominare anche il preset.          */
const MOODS = {
  sereno:     { spread: 45, warmth: 70, rev: 72, dens: 5,  head: 30, periods: [7, 11, 13, 17]  },
  pioggia:    { spread: 60, warmth: 55, rev: 58, dens: 11, head: 45, periods: [5, 7, 9, 11]    },
  vespro:     { spread: 35, warmth: 85, rev: 85, dens: 3,  head: 22, periods: [17, 19, 23, 29] },
  carillon:   { spread: 70, warmth: 45, rev: 66, dens: 8,  head: 35, periods: [4, 9, 17, 25]   },
  arcipelago: { spread: 72, warmth: 58, rev: 80, dens: 3,  head: 18, periods: [13, 16, 21, 25] },
  collina:    { spread: 40, warmth: 75, rev: 55, dens: 6,  head: 38, periods: [8, 13, 19, 27]  },
  finestra:   { spread: 55, warmth: 30, rev: 40, dens: 4,  head: 20, periods: [9, 14, 23, 25]  },
  nuvola:     { spread: 63, warmth: 4,  rev: 92, dens: 14, head: 64, periods: [6, 11, 19, 25]  },
};

/* --- palette oraria -------------------------------------------------------
   L'ora del giorno inclina registro (filtro), calore (timbro) e spazio
   (riverbero). È l'unica influenza esterna sul suono: non chiede permessi,
   non usa sensori, e rende l'ascolto notturno diverso da quello diurno.

   Come per i mood, qui viaggia un `id`: la parola che si legge nella riga di
   stato la sceglie i18n.js. Il modello resta senza lingua.                 */
function timePalette(h) {
  if (h >= 5  && h < 8)  return { id: "alba",       toneBias:  +6, warmBias:  +6, spaceBias:  +6 };
  if (h >= 8  && h < 12) return { id: "mattino",    toneBias: +14, warmBias:  -6, spaceBias:  -6 };
  if (h >= 12 && h < 17) return { id: "pomeriggio", toneBias: +18, warmBias: -10, spaceBias: -10 };
  if (h >= 17 && h < 20) return { id: "tramonto",   toneBias:  +4, warmBias:  +8, spaceBias:  +6 };
  if (h >= 20 && h < 23) return { id: "sera",       toneBias: -10, warmBias: +12, spaceBias: +10 };
  return                        { id: "notturna",   toneBias: -20, warmBias: +18, spaceBias: +14 };
}

let currentPalette = { id: "", toneBias: 0, warmBias: 0, spaceBias: 0 };
/* valori efficaci = posizione del fader + inclinazione oraria */
let effWarmth = 0.70, effRev = 0.72, lastHead = 30;

/* --- scala consonante -----------------------------------------------------
   Pentatonica maggiore su quattro ottave: qualunque combinazione di note
   suona bene, non è possibile ottenere una dissonanza sgradevole.          */
const SCALE = (() => {
  const penta = [0, 2, 4, 7, 9], out = [];
  for (let oct = -2; oct <= 1; oct++)
    for (const s of penta) out.push(261.63 * Math.pow(2, (oct * 12 + s) / 12));
  return out.sort((a, b) => a - b);
})();

/* --- le quattro frasi ------------------------------------------------------ */
const PERIOD_MIN = 3, PERIOD_MAX = 30;

const loops = [7, 11, 13, 17].map((p, i) => ({
  i,
  period: p,          // durata in vigore ora
  target: p,          // durata scelta: entra al giro successivo
  cycleStart: 0,
  idx: 0,
  cycles: [],         // coda dei cicli udibili {start, period}
  idea: [],           // le gocce, con posizione relativa alla zona attiva
  plan: [],           // le gocce collocate sul giro, in ordine di fase
  planHead: 0.30,     // addensamento con cui il piano è stato costruito
  offset: Math.random(), // da dove parte la zona attiva sulla circonferenza
  muted: false,
  pan: (i - 1.5) / 1.5 * 0.65, // ogni frase ha la sua posizione stereo
}));

/* Un'idea: N gocce concentrate nella testa della frase.
   ev.t  ∈ 0..1  posizione entro la zona attiva
   ev.rel ∈ -1..1 registro relativo, poi dilatato da "ampiezza registro"   */
function makeIdea() {
  const n = 1 + Math.floor(Math.random() * Math.max(1, Math.round(G.dens)));
  const ev = [];
  for (let k = 0; k < n; k++) {
    ev.push({
      t: Math.pow(Math.random(), 1.25),  // lievemente addensate verso l'inizio
      rel: Math.random() * 2 - 1,
      vel: 0.7 + Math.random() * 0.3,
      flash: -99,                        // istante in cui è stata suonata
    });
  }
  return ev.sort((a, b) => a.t - b.t);
}

function regenerate(L) {
  L.idea = makeIdea();
  L.offset = Math.random();   // nuova posizione della zona attiva
  buildPlan(L);
  L.idx = 0;
}

/* Il "piano" del ciclo: ogni goccia riceve la sua fase assoluta 0..1 entro il
   giro, partendo dall'offset della frase. Se la zona attiva scavalca la fine del
   ciclo le fasi rientrano dall'inizio: per questo vanno riordinate, così lo
   scheduler le percorre sempre in sequenza crescente.                      */
function buildPlan(L) {
  const head = G.head / 100;
  L.planHead = head;          // il quadrante disegnerà questo, non il valore live
  L.plan = L.idea
    .map(ev => ({ ph: (L.offset + ev.t * head) % 1, ev }))
    .sort((a, b) => a.ph - b.ph);
}

/* Quanto avanti lo scheduler prenota le gocce, in secondi.

   Vive qui, e non in audio.js, perché rebuildPlans deve usare ESATTAMENTE la
   stessa finestra dello scheduler: se le due divergessero, una ricostruzione
   del piano potrebbe riposizionare gocce già prenotate, e si sentirebbero due
   volte. Il valore lo cambia audio.js quando la pagina passa in secondo
   piano — il modello si limita a custodirlo, senza sapere perché.          */
let LOOKAHEAD = 0.15;

/* Fin dove lo scheduler ha REALMENTE prenotato, in tempo assoluto.

   Non basta condividere LOOKAHEAD: mentre la pagina è nascosta si prenota tre
   secondi avanti, ma al ritorno in primo piano la finestra torna stretta. Se
   in quell'istante rebuildPlans calcolasse l'orizzonte con la finestra nuova,
   riporterebbe l'indice su gocce prenotate con quella vecchia e le farebbe
   risuonare. Serve ricordare il confine vero, non ricalcolarlo.            */
let bookedUntil = 0;

/* Ricostruzione a caldo, quando cambia l'addensamento: riposiziona l'indice
   sulla prima goccia non ancora pianificata. Il confronto avviene su TEMPI
   ASSOLUTI, non su fasi: cycleStart può trovarsi nel futuro, e avvolgere la
   fase porterebbe a saltare gocce o interi cicli.                          */
function rebuildPlans(now) {
  loops.forEach(L => {
    buildPlan(L);
    if (now === null) { L.idx = 0; return; }
    const horizon = Math.max(now + LOOKAHEAD, bookedUntil);
    const k = L.plan.findIndex(p => (L.cycleStart + p.ph * L.period) >= horizon);
    L.idx = (k < 0) ? L.plan.length : k;
  });
}

/* =============================================================================
   LA SECONDA CLASSE: LE TENUTE

   Le gocce sono istanti — attacco e coda, e la nota è già passata. Le tenute
   invece durano: si aprono lentamente, restano, si chiudono. Sovrapponendosi
   fra loro e alle gocce formano le tessiture, che è la ragione per cui
   esistono.

   Stesso principio di sempre: quattro linee, quattro periodi coprimi a due a
   due. Qui però i periodi sono NUMERI PRIMI DA 19 IN SU, e non per gusto:
   così sono coprimi anche con i 7·11·13·17 delle gocce, e le due classi non
   tornano insieme più di quanto non facciano le quattro frasi fra loro. Il
   collage vale ora su otto linee invece che su quattro.

   Le tenute non hanno cursori propri: tutto viene dal mood. Sono uno sfondo,
   e uno sfondo non si regola mentre si ascolta.
============================================================================= */
const DRONE_MIN = 12, DRONE_MAX = 60;

/* I CINQUE COMANDI DEI TESSUTI, in unità vere e non in percentuali astratte:
   secondi, hertz, numero di sovrapposizioni. Un pannello che dice "3,0 s" è
   più utile di uno che dice "45%", e qui le grandezze hanno un significato
   fisico preciso.

     spread   estensione del registro, in centesimi delle quattro ottave
     apri     secondi perché un tessuto affiori
     chiudi   secondi perché si dissolva
     sovr     quanti tessuti restano aperti in media su ogni linea
     battito  hertz della pulsazione fra le due voci

   `dens` e `liv` restano al preset: quanti tessuti per giro e quanto stanno
   sotto alle gocce sono il carattere del mood, non una manopola.

   Prima `apri`, `chiudi` e `battito` erano un solo parametro, `warmth`, che
   li governava tutti e tre insieme. Separarli è ciò che permette di regolarli
   davvero: si può volere un affioramento lentissimo con un battito nervoso,
   e con un parametro solo non si poteva.                                  */
const DRONI_MOODS = {
  velo:    { spread: 55, apri: 3.0, chiudi: 4.3, sovr: 1.10, battito: 0.57, dens: 2, liv: 32, periods: [19, 23, 29, 31] },
  fondale: { spread: 22, apri: 3.5, chiudi: 5.0, sovr: 0.82, battito: 0.41, dens: 1, liv: 38, periods: [29, 31, 37, 41] },
  bordone: { spread: 38, apri: 3.2, chiudi: 4.7, sovr: 2.10, battito: 0.48, dens: 3, liv: 28, periods: [19, 23, 31, 37] },
  respiro: { spread: 66, apri: 2.6, chiudi: 3.8, sovr: 0.72, battito: 0.70, dens: 2, liv: 30, periods: [23, 29, 41, 43] },
  bruma:   { spread: 70, apri: 2.9, chiudi: 4.1, sovr: 0.88, battito: 0.63, dens: 2, liv: 26, periods: [31, 37, 43, 47] },
  radice:  { spread: 18, apri: 3.5, chiudi: 5.0, sovr: 1.76, battito: 0.39, dens: 2, liv: 42, periods: [19, 29, 37, 47] },
  vetrata: { spread: 60, apri: 2.0, chiudi: 3.0, sovr: 1.50, battito: 0.92, dens: 3, liv: 28, periods: [23, 31, 41, 53] },
  marea:   { spread: 45, apri: 3.3, chiudi: 4.8, sovr: 0.92, battito: 0.44, dens: 1, liv: 36, periods: [29, 41, 47, 53] },
};

/* I cinque che l'utente muove. Gli altri due arrivano dal mood e basta. */
const DPARAMS = ["spread", "apri", "chiudi", "sovr", "battito"];

const D = { ...DRONI_MOODS.velo };
delete D.periods;

const droni = DRONI_MOODS.velo.periods.map((p, i) => ({
  i,
  period: p,
  target: p,
  cycleStart: 0,
  idx: 0,
  cycles: [],
  idea: [],           // le tenute, con posizione e durata relative
  plan: [],           // collocate sul giro, in ordine di fase
  planSovr: 1.10,     // intreccio con cui le durate sono state calcolate
  offset: Math.random(),
  muted: false,
  pan: (1.5 - i) / 1.5 * 0.5,   // stereo opposto a quello delle gocce: si allargano a vicenda
}));

/* Una tenuta.
   t    ∈ 0..1   dove comincia, sul giro intero (non su una zona attiva:
                 le tenute non si addensano in testa, si distribuiscono)
   dur  frazione del periodo per cui resta aperta
   rel  ∈ -1..1  registro relativo, poi dilatato da spread                  */
function makeTenute() {
  const n = Math.max(1, Math.round(D.dens));
  const ev = [];
  for (let k = 0; k < n; k++) {
    ev.push({
      t: (k + Math.random() * 0.6) / n,        // sparse ma non ammucchiate
      /* L'intreccio è quanti tessuti restano aperti in media su questa linea:
         diviso per quanti ce ne sono per giro, dà la durata di ciascuno come
         frazione del periodo. Così lo slider dice una cosa che si sente —
         "quanto si sovrappongono" — invece di una lunghezza astratta.    */
      dur: (D.sovr / n) * (0.7 + Math.random() * 0.6),
      rel: Math.random() * 2 - 1,
      vel: 0.75 + Math.random() * 0.25,
      flash: -99,                              // istante in cui si è aperta
      fino: -99,                               // istante in cui si chiuderà
    });
  }
  return ev.sort((a, b) => a.t - b.t);
}

function regeneraTenute(L) {
  L.idea = makeTenute();
  L.planSovr = D.sovr;        // le durate nascono con l'intreccio corrente
  L.offset = Math.random();
  buildPlanDrone(L);
  L.idx = 0;
}

/* Come `planHead` per le gocce: si ricorda con quale intreccio le durate sono
   state calcolate, e se il cursore si è mosso le riscala tutte in proporzione.

   Senza, muovere l'Intreccio non avrebbe quasi effetto: le durate vivono
   dentro l'idea, che viene costruita una volta sola, e il nuovo valore si
   sarebbe visto soltanto alla prossima rigenerazione. Riscalare conserva la
   forma dell'idea — quale tessuto è più lungo di quale — e ne cambia solo la
   misura, che è ciò che il cursore promette.                              */
function buildPlanDrone(L) {
  if (L.planSovr > 0 && Math.abs(D.sovr - L.planSovr) > 1e-6) {
    const fattore = D.sovr / L.planSovr;
    for (const ev of L.idea) ev.dur *= fattore;
    L.planSovr = D.sovr;
  }
  L.plan = L.idea
    .map(ev => ({ ph: (L.offset + ev.t) % 1, ev }))
    .sort((a, b) => a.ph - b.ph);
}

/* Riallineamento della sola seconda classe. */
function realignDroni() {
  const v = droni.map(L => Math.max(1, Math.round(L.target)));
  let l = v[0];
  for (let k = 1; k < v.length; k++) l = l * v[k] / gcd(l, v[k]);
  return l;
}

/* Tempo di riallineamento: minimo comune multiplo dei quattro periodi. È
   quanto passa prima che la combinazione si ripeta identica — con periodi
   coprimi diventa enorme, ed è il senso stesso del collage.                */
function gcd(a, b) { return b ? gcd(b, a % b) : a; }

function realignSeconds() {
  const v = loops.map(L => Math.max(1, Math.round(L.target)));
  let l = v[0];
  for (let k = 1; k < v.length; k++) l = l * v[k] / gcd(l, v[k]);
  return l;
}

/* Il modello nasce già popolato: senza questa riga le quattro frasi
   resterebbero vuote fino al primo mood, e l'app sarebbe muta all'apertura. */
loops.forEach(regenerate);
droni.forEach(regeneraTenute);
