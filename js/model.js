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

/* Ricostruzione a caldo, quando cambia l'addensamento: riposiziona l'indice
   sulla prima goccia non ancora pianificata. Il confronto avviene su TEMPI
   ASSOLUTI, non su fasi: cycleStart può trovarsi nel futuro, e avvolgere la
   fase porterebbe a saltare gocce o interi cicli.                          */
function rebuildPlans(now) {
  loops.forEach(L => {
    buildPlan(L);
    if (now === null) { L.idx = 0; return; }
    const horizon = now + 0.15;
    const k = L.plan.findIndex(p => (L.cycleStart + p.ph * L.period) >= horizon);
    L.idx = (k < 0) ? L.plan.length : k;
  });
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
