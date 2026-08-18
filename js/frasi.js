/* =============================================================================
   RADA · frasi.js — la parte visiva delle frasi, e il ciclo di fotogrammi

   Tutti e quattro i quadranti vivono su UN SOLO canvas. È una scelta
   deliberata: avere un unico piano di disegno permette, in futuro, effetti
   che attraversano le frasi — scie, linee di relazione, campi che reagiscono
   all'insieme — cosa impossibile con quattro tele separate.

   Disegnato con l'API 2D nativa. Prima c'era p5, ed è stato tolto: di quella
   libreria si usavano una ventina di nomi — `line`, `circle`, `text`, `cos`,
   `dist`, `lerp` — che qui hanno tutti un equivalente di una riga, e in cinque
   punti il codice scavalcava già p5 per arrivare al contesto vero. In cambio
   la pagina si apre senza rete, il riquadro dei tessuti e questo parlano la
   stessa lingua, e i tocchi arrivano da una parte sola.

   IL CICLO DI FOTOGRAMMI È UNO SOLO, e sta qui: `ciclo` disegna le frasi e
   poi chiama `drawDroni`. Due animazioni indipendenti si sfaserebbero, e su
   un telefono costerebbero il doppio.

   Le proporzioni sono espresse in frazioni del raggio, così il disegno regge
   a qualunque dimensione. I colori vengono letti dalle variabili CSS: cambia
   la palette in style.css e il canvas la segue.
============================================================================= */

/* proporzioni del quadrante, come frazioni del raggio esterno */
const TICKS      = 48;
const R_INNER    = 0.815;   // estremo interno dei trattini
const R_ACTIVE   = 0.741;   // estremo interno dei trattini nella zona attiva
/* La fascia delle gocce non arriva ai trattini e non entra nel numero. I due
   margini sono misurati sulla goccia ACCESA (R_DROP_HOT, la più grande):
   0,041 del raggio verso la corona, 0,026 verso il centro. Il trattino va
   contato con la testa tonda, che sporge di mezzo spessore oltre il proprio
   estremo; il limite di dentro lo detta il giapponese, perché "17.0秒" è
   largo 0,397 del raggio contro 0,343 di "17,0s".                          */
const R_DROPS    = 0.620;   // raggio massimo delle gocce (registro più acuto)
const R_DROPS_LO = 0.490;   // raggio minimo delle gocce (registro più grave)
const R_HAND     = 0.704;   // lunghezza della lancetta
const W_TICK_ON  = 1.4 / 54, W_TICK_OFF = 0.95 / 54;
const R_DROP     = 2.1 / 54, R_DROP_HOT = 3.6 / 54;
const LINK_WINDOW = 0.18;   // scarto massimo, in secondi, fra due gocce "vicine"

let COL = {};               // palette letta dal CSS
let holder = null, cvEl = null, cv2d = null;

/* Strutture riusate a ogni fotogramma. Il disegno non deve allocare
   (CLAUDE.md): qui nascevano un array e cinque oggetti nuovi sessanta volte
   al secondo, più uno per ogni goccia accesa. Ora si scrive dentro queste,
   che esistono una volta sola.                                             */
const SIZE  = { w: 0, h: 0, cols: 0, rows: 0, cell: 0, stripH: 0 };
const cells = loops.map(() => ({ L: null, cx: 0, cy: 0, r: 0 }));
const HOT_MAX = 96;
const hotPool = Array.from({ length: HOT_MAX }, () => ({ x: 0, y: 0, t: 0, loop: 0 }));
let hotCount = 0;

/* Il bersaglio del ↻ non può scendere sotto il polpastrello: su un telefono
   r·0,22 vale una quindicina di pixel, contro i 44 raccomandati.           */
const regenHit = r => Math.max(r * 0.22, 22);

/* Due utilità che erano di p5 e ora sono di casa. `lerp` la usa anche
   droni.js: una interpolazione lineare in due copie sarebbe ridicola.      */
const lerp = (a, b, t) => a + (b - a) * t;
const fontPila = () =>
  '"Helvetica Neue", -apple-system, system-ui, Roboto, Arial, ' +
  '"Hiragino Sans", "Yu Gothic", "Noto Sans CJK JP", sans-serif';

function setupTele() {
  holder = document.getElementById("canvas-holder");
  if (!holder) return;
  cvEl = document.createElement("canvas");
  holder.appendChild(cvEl);
  cv2d = cvEl.getContext("2d");
  buildZones();
  setupDroni();      // il riquadro dei tessuti, con la sua tela
  readPalette();
}

function readPalette() {
  const cs = getComputedStyle(document.documentElement);
  const v = n => cs.getPropertyValue(n).trim();
  COL = {
    ink:   v("--ink"),
    ink2:  v("--ink-2"),
    dust:  v("--dust"),
    hair:  v("--hair"),
    amber: v("--amber"),
  };
}

/* Quattro celle quadrate: in fila su schermo largo, due per due su stretto.
   Sotto, una fascia alta STRIP_FRAC del lato della cella ospita la linea del
   tempo condivisa.                                                         */
const STRIP_FRAC = 0.34;

function canvasSize() {
  const avail = holder ? holder.clientWidth : 320;
  const wide  = avail >= 720;
  SIZE.cols   = wide ? 4 : 2;
  SIZE.rows   = wide ? 1 : 2;
  SIZE.cell   = Math.min(avail / SIZE.cols, 260);
  SIZE.stripH = SIZE.cell * STRIP_FRAC;
  SIZE.w      = SIZE.cell * SIZE.cols;
  SIZE.h      = SIZE.cell * SIZE.rows + SIZE.stripH;
  return SIZE;
}

function layout(s) {
  for (let i = 0; i < cells.length; i++) {
    const c = cells[i], col = i % s.cols, row = Math.floor(i / s.cols);
    c.L  = loops[i];
    c.cx = (col + 0.5) * s.cell;
    c.cy = (row + 0.5) * s.cell;
    c.r  = s.cell * 0.32;
  }
}

/* ---------------------------------------------------------------------------
   IL CICLO. Un solo `requestAnimationFrame` per tutta la pagina.

   Il ritmo non è quello dello schermo ma sessanta al secondo: su un pannello
   a 120 Hz disegnare a ogni occasione raddoppierebbe il costo senza che si
   veda nulla di più — le gocce lampeggiano per mezzo secondo, le lancette
   percorrono gradi.

   Le due soglie stanno appena SOTTO il periodo che si vuole, e non sopra: i
   fotogrammi arrivano a passi discreti, e una soglia di 1/60 esatti verrebbe
   mancata per frazioni di millisecondo saltando un giro su due — trenta al
   secondo invece di sessanta. Con 1/61 a 60 Hz non se ne perde nessuno, e a
   120 Hz ne passa uno sì e uno no. Stesso conto per la pausa: 1/13 fa cadere
   il disegno ogni cinque fotogrammi di uno schermo a 60 Hz, cioè dodici volte
   al secondo. Bastano: i cursori rispondono, e non si scalda la batteria per
   ridisegnare l'identico.

   `requestAnimationFrame` si ferma da sé quando la pagina non si vede — è il
   browser a deciderlo, ed è giusto così: il suono intanto continua, perché
   vive sul suo thread.                                                     */
const PASSO_VIVO  = 1000 / 61;
const PASSO_FERMO = 1000 / 13;
let ultimoFotogramma = 0;

function ciclo(ms) {
  requestAnimationFrame(ciclo);
  if (ms - ultimoFotogramma < (running ? PASSO_VIVO : PASSO_FERMO)) return;
  ultimoFotogramma = ms;
  disegna();
}

function disegna() {
  tickParams();                 // smussa i parametri e applica la palette oraria
  if (!cv2d) return;
  const s = canvasSize();

  /* Il rapporto fra pixel del dispositivo e pixel CSS: senza, su uno schermo
     ad alta densità il disegno esce sfocato. Il contenitore può anche cambiare
     larghezza senza che la finestra venga ridimensionata — succede quando
     compare la barra di scorrimento — e il confronto qui sotto se ne accorge
     comunque, perché guarda la misura vera e non un evento.                */
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  if (cvEl.width !== Math.round(s.w * dpr) || cvEl.height !== Math.round(s.h * dpr)) {
    cvEl.width  = Math.round(s.w * dpr);
    cvEl.height = Math.round(s.h * dpr);
    cvEl.style.width  = s.w + "px";
    cvEl.style.height = s.h + "px";
    daRiposizionare = true;
  }
  cv2d.setTransform(dpr, 0, 0, dpr, 0, 0);
  cv2d.clearRect(0, 0, s.w, s.h);
  cv2d.textAlign = "center";
  cv2d.textBaseline = "middle";

  layout(s);
  if (daRiposizionare) { placeZones(); daRiposizionare = false; }
  const now = audioNow();
  hotCount = 0;
  for (const c of cells) drawDial(c, now);
  drawLinks(now);
  drawTimeline(s, now);

  /* La seconda tela vive nello stesso ciclo: due animazioni indipendenti si
     sfaserebbero, e su un telefono costerebbero il doppio.                 */
  drawDroni();
}

function drawDial(cell, now) {
  const { L, cx, cy, r } = cell;
  const g = cv2d;
  g.save();
  /* Spenta la classe, i quadranti impallidiscono come una frase silenziata:
     il piano continua a girare, ma non si sente — e si deve vedere.        */
  g.globalAlpha = (L.muted || !gocceOn) ? 0.3 : 1;

  /* etichetta e comando di rigenerazione, sopra il quadrante. I pesi sono
     dichiarati sempre, mai lasciati al valore di prima: la tela dei tessuti
     disegna gli stessi tre elementi con gli stessi pesi (400, 300, 200), e
     due riquadri affiancati che scrivono la stessa cosa in due modi si
     notano subito.                                                         */
  g.fillStyle = COL.dust;
  g.font = "400 " + clamp(r * 0.10, 7, 10).toFixed(1) + "px " + fontPila();
  trackedText(g, CANVAS.phrase[L.i], cx, cy - r * 1.20, r * 0.028 * CANVAS.trackMul);

  const sopraRegen = puntatore.x >= 0 &&
    Math.hypot(puntatore.x - (cx + r * 0.95), puntatore.y - (cy - r * 1.20)) < regenHit(r);
  g.fillStyle = sopraRegen ? COL.amber : COL.dust;
  g.font = "300 " + clamp(r * 0.17, 12, 17).toFixed(1) + "px " + fontPila();
  g.fillText("↻", cx + r * 0.95, cy - r * 1.20);

  /* corona di trattini: scuri nella zona attiva, tenui nella coda vuota.
     L'addensamento viene dal PIANO, non dal valore live del cursore, così
     quel che vedi coincide sempre con quel che suona.                      */
  const head = L.planHead;
  g.lineCap = "round";
  for (let i = 0; i < TICKS; i++) {
    const a = -Math.PI / 2 + i * Math.PI * 2 / TICKS;
    const on = ((i / TICKS) - L.offset + 1) % 1 < head;
    const ri = (on ? R_ACTIVE : R_INNER) * r;
    g.strokeStyle = on ? COL.ink : COL.hair;
    g.lineWidth   = (on ? W_TICK_ON : W_TICK_OFF) * r;
    g.beginPath();
    g.moveTo(cx + Math.cos(a) * ri, cy + Math.sin(a) * ri);
    g.lineTo(cx + Math.cos(a) * r,  cy + Math.sin(a) * r);
    g.stroke();
  }

  /* le gocce, che si accendono quando suonano. La distanza dal centro segue
     il registro (ev.rel): più acute verso il bordo, più gravi verso il
     centro, così il profilo melodico dell'idea diventa visibile.           */
  for (const p of L.plan) {
    const a = -Math.PI / 2 + p.ph * Math.PI * 2;
    const dt = now - p.ev.flash;
    const hot = dt >= 0 && dt < 0.45;
    const rad = (hot ? R_DROP_HOT : R_DROP) * r;
    const rr = lerp(R_DROPS_LO, R_DROPS, (p.ev.rel + 1) / 2) * r;
    const dx = cx + Math.cos(a) * rr, dy = cy + Math.sin(a) * rr;
    g.fillStyle = hot ? COL.amber : COL.ink2;
    g.beginPath();
    g.arc(dx, dy, rad, 0, Math.PI * 2);
    g.fill();
    if (hot && hotCount < HOT_MAX) {
      const o = hotPool[hotCount++];
      o.x = dx; o.y = dy; o.t = p.ev.flash; o.loop = L.i;
    }
  }

  /* lancetta: fase udibile esatta, presa dalla coda dei cicli. Una linea
     sola, come nei tessuti — la coda sfumata che la seguiva è stata tolta:
     suggeriva un moto che il quadrante racconta già con la punta.          */
  if (ctx && running && gocceOn && !L.muted && L.cycles.length) {
    while (L.cycles.length > 1 && now >= L.cycles[0].start + L.cycles[0].period)
      L.cycles.shift();
    const c = L.cycles[0];
    const a = -Math.PI / 2 + clamp((now - c.start) / c.period, 0, 1) * Math.PI * 2;
    g.strokeStyle = COL.amber;
    g.lineWidth = 1.4 / 54 * r;
    g.lineCap = "round";
    g.beginPath();
    g.moveTo(cx, cy);
    g.lineTo(cx + Math.cos(a) * R_HAND * r, cy + Math.sin(a) * R_HAND * r);
    g.stroke();
  }

  /* al centro: la durata, e nient'altro. Il separatore decimale segue la
     lingua (7,0s in italiano, 7.0秒 in giapponese): se ne occupa il
     formattatore costruito una volta sola in i18n.js — crearne uno qui
     costerebbe più di tutto il resto del fotogramma.                       */
  g.fillStyle = COL.ink;
  durataAlCentro(g, fmtOne(L.target), CANVAS.seconds, cx, cy, r);

  g.restore();
}

/* ---------------------------------------------------------------------------
   Legami effimeri: quando due gocce di frasi DIVERSE suonano a meno di
   LINK_WINDOW secondi l'una dall'altra, un filo sottile le unisce sul
   canvas condiviso e sfuma con loro. È il momento in cui il collage per un
   istante quasi coincide — mai per davvero, perché i periodi sono coprimi.
   Legge le posizioni raccolte in hotPool durante drawDial di questo stesso
   fotogramma: nessun nuovo array, solo lettura di ciò che è già lì.        */
function drawLinks(now) {
  const g = cv2d;
  g.save();
  g.lineCap = "round";
  g.strokeStyle = COL.amber;
  g.lineWidth = 1;
  for (let i = 0; i < hotCount; i++) {
    for (let j = i + 1; j < hotCount; j++) {
      const a = hotPool[i], b = hotPool[j];
      if (a.loop === b.loop) continue;
      const gap = Math.abs(a.t - b.t);
      if (gap > LINK_WINDOW) continue;
      const age = now - Math.max(a.t, b.t);
      const fade = clamp(1 - age / 0.45, 0, 1) * clamp(1 - gap / LINK_WINDOW, 0, 1);
      if (fade <= 0) continue;
      g.globalAlpha = fade * 0.5;
      g.beginPath();
      g.moveTo(a.x, a.y); g.lineTo(b.x, b.y);
      g.stroke();
    }
  }
  g.restore();
}

/* ---------------------------------------------------------------------------
   Fascia temporale condivisa: gli ultimi TIMELINE_SEC secondi di tutte e
   quattro le frasi, una corsia per frase, sulla stessa riga del tempo. È il
   modo più diretto per vedere lo sfasamento reale — cosa che i quattro
   quadranti, isole indipendenti, non possono mostrare da soli.

   Legge `dropHistory`, scritta dallo scheduler in audio.js (stesso principio
   di L.cycles per la lancetta): il disegno non ricalcola nulla, mostra
   soltanto ciò che è stato davvero suonato.                                */
function drawTimeline(s, now) {
  const g = cv2d;
  const top = s.rows * s.cell + s.stripH * 0.16;
  const h = s.stripH * 0.76;
  const laneH = h / loops.length;
  /* Senza i numeri romani non serve più riservare spazio a sinistra: le
     corsie arrivano ai due estremi, alla stessa distanza dal bordo.        */
  const left = s.w * 0.03, right = s.w * 0.97;

  g.save();
  g.lineWidth = 1;
  g.strokeStyle = COL.hair;
  g.beginPath();
  for (let i = 0; i < loops.length; i++) {
    const ly = top + (i + 0.5) * laneH;
    g.moveTo(left, ly); g.lineTo(right, ly);
  }
  g.stroke();

  /* Le due barre che chiudono la fascia, identiche e simmetriche: a destra
     è "adesso", a sinistra il fondo della memoria, trenta secondi prima.   */
  g.strokeStyle = COL.dust;
  g.beginPath();
  g.moveTo(left,  top - laneH * 0.1); g.lineTo(left,  top + h + laneH * 0.1);
  g.moveTo(right, top - laneH * 0.1); g.lineTo(right, top + h + laneH * 0.1);
  g.stroke();

  if (!ctx) { g.restore(); return; }

  for (const ev of dropHistory) {
    const age = now - ev.t;
    if (age < 0 || age > TIMELINE_SEC) continue;
    const x = lerp(right, left, age / TIMELINE_SEC);
    const ly = top + (ev.loop + 0.5) * laneH;
    const hot = age < 0.45;
    g.fillStyle = hot ? COL.amber : COL.ink2;
    g.beginPath();
    g.arc(x, ly, (hot ? 0.17 : 0.10) * laneH, 0, Math.PI * 2);
    g.fill();
  }
  g.restore();
}

/* La durata al centro del quadrante: il numero grande e, accanto, l'unità
   più piccola. Sono due disegni e non uno perché "7,0s" con la esse della
   stessa misura della cifra la fa leggere come una lettera del numero; a
   sette decimi diventa quello che è, un'unità di misura. Vale identico per
   il 秒 giapponese, che è un'unità anche lui.

   Il testo resta centrato sul quadrante: si misurano i due pezzi, si somma,
   e si parte da metà larghezza a sinistra del centro.                     */
function durataAlCentro(g, numero, unita, cx, cy, r) {
  const grande  = "200 " + (r * 0.30).toFixed(1) + "px " + fontPila();
  const piccola = "200 " + (r * 0.21).toFixed(1) + "px " + fontPila();
  g.font = grande;  const wN = g.measureText(numero).width;
  g.font = piccola; const wU = g.measureText(unita).width;
  const prima = g.textAlign;
  g.textAlign = "left";
  const x = cx - (wN + wU) / 2;
  g.font = grande;  g.fillText(numero, x, cy);
  g.font = piccola; g.fillText(unita, x + wN, cy);
  g.textAlign = prima;
}

/* Il contesto 2D non conosce la spaziatura fra lettere, che qui è parte
   dell'identità tipografica: la si compone lettera per lettera. Prende il
   contesto come primo argomento perché la usano tutt'e due le tele.        */
function trackedText(g, str, x, y, tracking) {
  const chars = [...str];
  let w = 0;
  for (const c of chars) w += g.measureText(c).width + tracking;
  w -= tracking;
  let cx = x - w / 2;
  const prima = g.textAlign;
  g.textAlign = "left";
  for (const c of chars) {
    g.fillText(c, cx, y);
    cx += g.measureText(c).width + tracking;
  }
  g.textAlign = prima;
}

/* ---------------------------------------------------------------------------
   Interazione: trascinamento verticale = durata · clic secco = silenzia
   Il simbolo ↻ rigenera l'idea di quella frase.
--------------------------------------------------------------------------- */
const puntatore = { x: -1, y: -1 };
let drag = null, dragY = 0, dragV = 0, dragMoved = 0, dragT0 = 0;

/* Il disegno non chiama più per nome le funzioni dei comandi: annuncia che
   qualcosa è cambiato, e chi se ne occupa ascolta. Disegno e ui stanno sullo
   stesso piano — model ← audio ← disegno/ui — e una chiamata diretta fra pari
   è un legame che nessuna delle due parti dichiara.                        */
const annuncia = che => dispatchEvent(new CustomEvent("rada:" + che));

function cellAt(x, y) {
  for (const c of cells) {
    /* Finché il primo fotogramma non è passato, le celle esistono ma sono
       vuote: nessuna frase e raggio zero. E siccome regenHit non scende mai
       sotto i 22 px — serve al polpastrello — un tocco vicino all'origine
       troverebbe comunque il ↻ e chiederebbe di rigenerare il nulla.       */
    if (!c.L) continue;
    if (Math.hypot(x - (c.cx + c.r * 0.95), y - (c.cy - c.r * 1.20)) < regenHit(c.r))
      return { cell: c, regen: true };
    if (Math.hypot(x - c.cx, y - c.cy) < c.r * 1.06)
      return { cell: c, regen: false };
  }
  return null;
}

function pressAt(x, y) {
  const h = cellAt(x, y);
  if (!h) return false;
  if (h.regen) { regenerate(h.cell.L); return true; }
  drag = h.cell.L;
  dragMoved = 0;
  dragT0 = Date.now();
  dragY = y;
  dragV = drag.target;
  return true;
}

function moveAt(y) {
  if (!drag) return false;
  const dy = dragY - y;
  dragMoved = Math.max(dragMoved, Math.abs(dy));
  drag.target = clamp(dragV + dy / 130 * (PERIOD_MAX - PERIOD_MIN), PERIOD_MIN, PERIOD_MAX);
  annuncia("realign");
  return true;
}

function releaseDrag() {
  if (!drag) return;
  if (dragMoved < 5 && Date.now() - dragT0 < 350) {   // clic secco, non trascinamento
    drag.muted = !drag.muted;
    annuncia("loops");
  }
  annuncia("realign");
  drag = null;
}

/* ---------------------------------------------------------------------------
   QUATTRO RIQUADRI SENSIBILI, uno per quadrante.

   Il canvas è uno solo e il CSS non sa distinguere le sue regioni: o il dito
   comanda tutto, o non comanda niente. Con `touch-action:none` sull'intero
   canvas, su un telefono non si riuscirebbe a scorrere la pagina passando
   sopra mezza schermata di quadranti.

   La soluzione è spostare il bersaglio: il canvas lascia scorrere, e sopra ai
   quadranti stanno quattro riquadri trasparenti che invece trattengono il
   dito. Coprono il cerchio e il suo ↻, non tutta la cella, così le fasce fra
   un quadrante e l'altro tornano al browser.

   I riquadri sono nati quando c'era p5, che consegnava i tocchi come pointer
   event e ascoltava su `window`: allora servivano anche a evitare che ogni
   gesto scattasse due volte. Quel motivo è caduto con la libreria, ma il
   primo resta intero — per i pointer event lo scorrimento lo decide solo
   `touch-action`, e `preventDefault` su pointerdown non lo ferma. Quindi
   l'unica leva è quale elemento riceve il tocco, ed è questa.
--------------------------------------------------------------------------- */
const zones = [];
let daRiposizionare = true;

function buildZones() {
  for (let i = 0; i < loops.length; i++) {
    const z = document.createElement("div");
    z.className = "dialZone";
    holder.appendChild(z);
    armaZona(z);
    zones.push(z);
  }
}

/* Il riquadro abbraccia il quadrante e il suo ↻, che sporge in alto a destra */
function placeZones() {
  if (!cvEl) return;
  const offL = cvEl.offsetLeft, offT = cvEl.offsetTop;
  cells.forEach((c, i) => {
    const hit   = regenHit(c.r);
    const left  = c.cx - 1.06 * c.r;
    const right = Math.max(c.cx + 1.06 * c.r, c.cx + 0.95 * c.r + hit);
    const top   = Math.min(c.cy - 1.06 * c.r, c.cy - 1.20 * c.r - hit);
    const bot   = c.cy + 1.06 * c.r;
    const st = zones[i].style;
    st.left   = (offL + left) + "px";
    st.top    = (offT + top)  + "px";
    st.width  = (right - left) + "px";
    st.height = (bot - top)    + "px";
  });
}

/* Coordinate del puntatore nello spazio del disegno */
function puntoCanvas(e) {
  const r = cvEl.getBoundingClientRect();
  return { x: (e.clientX - r.left) * (SIZE.w / r.width),
           y: (e.clientY - r.top)  * (SIZE.h / r.height) };
}

function armaZona(z) {
  z.addEventListener("pointerdown", e => {
    const p = puntoCanvas(e);
    puntatore.x = p.x; puntatore.y = p.y;
    if (!pressAt(p.x, p.y)) return;
    e.preventDefault();
    /* La cattura tiene il gesto legato a questo riquadro anche quando il dito
       ne esce: il trascinamento copre 130 px, molto più del riquadro.

       Protetta, perché solleva un'eccezione se il puntatore nel frattempo non
       è più attivo — cosa che capita davvero, per esempio quando il sistema
       interrompe il gesto. Senza la rete, l'eccezione uscirebbe da qui e il
       trascinamento resterebbe appeso.                                     */
    if (drag) { try { z.setPointerCapture(e.pointerId); } catch (err) {} }
  });

  z.addEventListener("pointermove", e => {
    const p = puntoCanvas(e);
    puntatore.x = p.x; puntatore.y = p.y;
    if (!drag) return;
    moveAt(p.y);
    e.preventDefault();
  });

  const chiudi = e => {
    releaseDrag();
    if (z.hasPointerCapture(e.pointerId)) z.releasePointerCapture(e.pointerId);
  };
  z.addEventListener("pointerup", chiudi);
  z.addEventListener("pointercancel", chiudi);
  z.addEventListener("pointerleave", () => { puntatore.x = -1; puntatore.y = -1; });
}

/* Rete di sicurezza: se la cattura non è riuscita, o se il sistema porta via
   il gesto, il dito si alza lontano dal riquadro e `chiudi` non scatta — il
   trascinamento resterebbe attivo per sempre. Qui `releaseDrag` esce subito
   quando non c'è nulla da chiudere, quindi il doppio passaggio è innocuo.  */
addEventListener("pointerup",     () => { if (drag) releaseDrag(); });
addEventListener("pointercancel", () => { if (drag) releaseDrag(); });

/* Gli script stanno in fondo al documento: quando questa riga viene eseguita
   il contenitore esiste già, e non serve aspettare nessun evento.          */
setupTele();
requestAnimationFrame(ciclo);
