/* =============================================================================
   RADA · sketch.js — la parte visiva (p5.js, modalità globale)

   Tutti e quattro i quadranti vivono su UN SOLO canvas. È una scelta
   deliberata: avere un unico piano di disegno permette, in futuro, effetti
   che attraversano le frasi — scie, linee di relazione, campi che reagiscono
   all'insieme — cosa impossibile con quattro tele separate.

   Le proporzioni sono espresse in frazioni del raggio, così il disegno regge
   a qualunque dimensione. I colori vengono letti dalle variabili CSS: cambia
   la palette in style.css e il canvas la segue.
============================================================================= */

/* proporzioni del quadrante, come frazioni del raggio esterno */
const TICKS      = 48;
const R_INNER    = 0.815;   // estremo interno dei trattini
const R_ACTIVE   = 0.741;   // estremo interno dei trattini nella zona attiva
const R_DROPS    = 0.741;   // raggio massimo delle gocce (registro più acuto)
const R_DROPS_LO = 0.580;   // raggio minimo delle gocce (registro più grave)
const R_HAND     = 0.704;   // lunghezza della lancetta
const W_TICK_ON  = 1.8 / 54, W_TICK_OFF = 1.2 / 54;
const R_DROP     = 2.1 / 54, R_DROP_HOT = 3.6 / 54;
const LINK_WINDOW = 0.18;   // scarto massimo, in secondi, fra due gocce "vicine"

let COL = {};               // palette letta dal CSS
let holder;

/* Strutture riusate a ogni fotogramma. `draw` non deve allocare (CLAUDE.md):
   qui nascevano un array e cinque oggetti nuovi sessanta volte al secondo,
   più uno per ogni goccia accesa. Ora si scrive dentro queste, che esistono
   una volta sola — lo stesso principio già applicato a handTrail.          */
const SIZE  = { w: 0, h: 0, cols: 0, rows: 0, cell: 0, stripH: 0 };
const cells = loops.map(() => ({ L: null, cx: 0, cy: 0, r: 0 }));
const HOT_MAX = 96;
const hotPool = Array.from({ length: HOT_MAX }, () => ({ x: 0, y: 0, t: 0, loop: 0 }));
let hotCount = 0;

/* Chi ha chiesto meno movimento non riceve la coda della lancetta: resta la
   punta, che è informazione, non decorazione.                              */
const menoMoto = typeof matchMedia === "function"
               ? matchMedia("(prefers-reduced-motion: reduce)") : null;

/* Il bersaglio del ↻ non può scendere sotto il polpastrello: su un telefono
   r·0,22 vale una quindicina di pixel, contro i 44 raccomandati.           */
const regenHit = r => Math.max(r * 0.22, 22);

/* Coda della lancetta: gli ultimi HAND_TRAIL_LEN angoli, per suggerire il
   moto anche nei giri lunghi dove lo spostamento fra un fotogramma e
   l'altro è appena percettibile. Buffer allocato una sola volta qui, non
   dentro draw: ogni fotogramma vi scrive sopra, non ne crea uno nuovo.    */
const HAND_TRAIL_LEN = 10;
const handTrail = loops.map(() => { const a = new Float32Array(HAND_TRAIL_LEN); a.fill(NaN); return a; });
const handTrailPos = new Int32Array(loops.length);

let cvEl = null;                 // l'elemento canvas, per convertire le coordinate

function setup() {
  holder = document.getElementById("canvas-holder");
  const s = canvasSize();
  const c = createCanvas(s.w, s.h);
  c.parent(holder);
  cvEl = c.elt;
  buildZones();
  readPalette();
  /* La pila include i grotteschi giapponesi di sistema: per il latino non
     cambia nulla (risolve sui primi), ma evita che il giapponese finisca su
     un ripiego qualsiasi quando i glifi mancano dai font occidentali.      */
  textFont('"Helvetica Neue", -apple-system, system-ui, Roboto, Arial, ' +
           '"Hiragino Sans", "Yu Gothic", "Noto Sans CJK JP", sans-serif');
  textAlign(CENTER, CENTER);
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

function windowResized() {
  const s = canvasSize();
  resizeCanvas(s.w, s.h);
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

let lastRunning = null;

function draw() {
  tickParams();                 // smussa i parametri e applica la palette oraria
  const s = canvasSize();

  /* Il contenitore può cambiare larghezza senza che la finestra venga
     ridimensionata: senza questo il disegno userebbe misure che il canvas
     non ha ancora preso, e finirebbe tagliato.                            */
  if (width !== s.w || height !== s.h) { resizeCanvas(s.w, s.h); daRiposizionare = true; }

  /* A motore fermo non si muove quasi nulla: dodici fotogrammi al secondo
     bastano a far rispondere i cursori, e non scaldano la batteria per
     ridisegnare l'identico.                                               */
  if (running !== lastRunning) { lastRunning = running; frameRate(running ? 60 : 12); }

  clear();
  layout(s);
  if (daRiposizionare) { placeZones(); daRiposizionare = false; }
  const now = audioNow();
  hotCount = 0;
  for (const c of cells) drawDial(c, now);
  drawLinks(now);
  drawTimeline(s, now);
}

function drawDial(cell, now) {
  const { L, cx, cy, r } = cell;
  const s = r / 54;                      // fattore di scala del disegno
  const dim = L.muted ? 0.3 : 1;

  push();
  drawingContext.globalAlpha = dim;

  /* etichetta e comando di rigenerazione, sopra il quadrante */
  noStroke();
  fill(COL.dust);
  textSize(clamp(r * 0.10, 7, 10));
  trackedText(CANVAS.phrase[L.i], cx, cy - r * 1.20, r * 0.028 * CANVAS.trackMul);

  const overRegen = dist(mouseX, mouseY, cx + r * 0.95, cy - r * 1.20) < regenHit(r);
  fill(overRegen ? COL.amber : COL.dust);
  textSize(clamp(r * 0.17, 12, 17));
  text("↻", cx + r * 0.95, cy - r * 1.20);

  /* corona di trattini: scuri nella zona attiva, tenui nella coda vuota.
     L'addensamento viene dal PIANO, non dal valore live del cursore, così
     quel che vedi coincide sempre con quel che suona.                     */
  const head = L.planHead;
  strokeCap(ROUND);              // una volta, non a ogni trattino
  for (let i = 0; i < TICKS; i++) {
    const a = -HALF_PI + i * TWO_PI / TICKS;
    const on = ((i / TICKS) - L.offset + 1) % 1 < head;
    const ri = (on ? R_ACTIVE : R_INNER) * r;
    stroke(on ? COL.ink : COL.hair);
    strokeWeight((on ? W_TICK_ON : W_TICK_OFF) * r);
    line(cx + cos(a) * ri, cy + sin(a) * ri, cx + cos(a) * r, cy + sin(a) * r);
  }

  /* le gocce, che si accendono quando suonano. La distanza dal centro segue
     il registro (ev.rel): più acute verso il bordo, più gravi verso il
     centro, così il profilo melodico dell'idea diventa visibile.          */
  noStroke();
  for (const p of L.plan) {
    const a = -HALF_PI + p.ph * TWO_PI;
    const dt = now - p.ev.flash;
    const hot = dt >= 0 && dt < 0.45;
    fill(hot ? COL.amber : COL.ink2);
    const rad = (hot ? R_DROP_HOT : R_DROP) * r;
    const rr = lerp(R_DROPS_LO, R_DROPS, (p.ev.rel + 1) / 2) * r;
    const dx = cx + cos(a) * rr, dy = cy + sin(a) * rr;
    circle(dx, dy, rad * 2);
    if (hot && hotCount < HOT_MAX) {
      const o = hotPool[hotCount++];
      o.x = dx; o.y = dy; o.t = p.ev.flash; o.loop = L.i;
    }
  }

  /* lancetta: fase udibile esatta, presa dalla coda dei cicli. Una breve
     coda sfumata dietro alla punta suggerisce il moto anche nei giri
     lunghi, dove lo spostamento fra un fotogramma e l'altro è minimo.     */
  if (ctx && running && !L.muted && L.cycles.length) {
    while (L.cycles.length > 1 && now >= L.cycles[0].start + L.cycles[0].period)
      L.cycles.shift();
    const c = L.cycles[0];
    const a = -HALF_PI + clamp((now - c.start) / c.period, 0, 1) * TWO_PI;

    const trail = handTrail[L.i];
    let pos = handTrailPos[L.i];
    trail[pos] = a;
    pos = (pos + 1) % HAND_TRAIL_LEN;
    handTrailPos[L.i] = pos;

    strokeCap(ROUND);
    const passi = (menoMoto && menoMoto.matches) ? 1 : HAND_TRAIL_LEN;
    for (let k = 0; k < passi; k++) {
      const idx = (pos - 1 - k + HAND_TRAIL_LEN * 2) % HAND_TRAIL_LEN;
      const ta = trail[idx];
      if (Number.isNaN(ta)) continue;
      const age = k / (HAND_TRAIL_LEN - 1);
      stroke(COL.amber);
      strokeWeight((1.4 - age * 0.9) * s);
      drawingContext.globalAlpha = k === 0 ? 1 : (1 - age) * 0.3;
      line(cx, cy, cx + cos(ta) * R_HAND * r, cy + sin(ta) * R_HAND * r);
    }
    drawingContext.globalAlpha = 1;
  }

  /* al centro: durata e numero di gocce. Il separatore decimale segue la
     lingua (7,0s in italiano, 7.0秒 in giapponese): se ne occupa il
     formattatore costruito una volta sola in i18n.js — crearne uno qui
     costerebbe più di tutto il resto del fotogramma.                      */
  noStroke();
  fill(COL.ink);
  textSize(r * 0.30);
  text(fmtOne(L.target) + CANVAS.seconds, cx, cy - r * 0.04);
  fill(COL.dust);
  textSize(clamp(r * 0.085, 6.5, 8.5));
  trackedText(dropsLabel(L.idea.length), cx, cy + r * 0.26, r * 0.022 * CANVAS.trackMul);

  pop();
}

/* ---------------------------------------------------------------------------
   Legami effimeri: quando due gocce di frasi DIVERSE suonano a meno di
   LINK_WINDOW secondi l'una dall'altra, un filo sottile le unisce sul
   canvas condiviso e sfuma con loro. È il momento in cui il collage per un
   istante quasi coincide — mai per davvero, perché i periodi sono coprimi.
   Legge le posizioni raccolte in hotPool durante drawDial di questo stesso
   fotogramma: nessun nuovo array, solo lettura di ciò che è già lì.        */
function drawLinks(now) {
  strokeCap(ROUND);
  for (let i = 0; i < hotCount; i++) {
    for (let j = i + 1; j < hotCount; j++) {
      const a = hotPool[i], b = hotPool[j];
      if (a.loop === b.loop) continue;
      const gap = Math.abs(a.t - b.t);
      if (gap > LINK_WINDOW) continue;
      const age = now - Math.max(a.t, b.t);
      const fade = clamp(1 - age / 0.45, 0, 1) * clamp(1 - gap / LINK_WINDOW, 0, 1);
      if (fade <= 0) continue;
      stroke(COL.amber);
      strokeWeight(1);
      drawingContext.globalAlpha = fade * 0.5;
      line(a.x, a.y, b.x, b.y);
    }
  }
  drawingContext.globalAlpha = 1;
}

/* ---------------------------------------------------------------------------
   Fascia temporale condivisa: gli ultimi TIMELINE_SEC secondi di tutte e
   quattro le frasi, una corsia per frase, sulla stessa riga del tempo. È il
   modo più diretto per vedere lo sfasamento reale — cosa che i quattro
   quadranti, isole indipendenti, non possono mostrare da soli.

   Legge `history`, scritta dallo scheduler in audio.js (stesso principio di
   L.cycles per la lancetta): il disegno non ricalcola nulla, mostra soltanto
   ciò che è stato davvero suonato.                                         */
function drawTimeline(s, now) {
  const top = s.rows * s.cell + s.stripH * 0.16;
  const h = s.stripH * 0.76;
  const laneH = h / loops.length;
  /* Senza i numeri romani non serve più riservare spazio a sinistra: le
     corsie arrivano ai due estremi, alla stessa distanza dal bordo.       */
  const left = s.w * 0.03, right = s.w * 0.97;

  for (let i = 0; i < loops.length; i++) {
    const ly = top + (i + 0.5) * laneH;
    stroke(COL.hair);
    strokeWeight(1);
    line(left, ly, right, ly);
  }

  /* Le due barre che chiudono la fascia, identiche e simmetriche: a destra
     è "adesso", a sinistra il fondo della memoria, trenta secondi prima. */
  stroke(COL.dust);
  strokeWeight(1);
  line(left,  top - laneH * 0.1, left,  top + h + laneH * 0.1);
  line(right, top - laneH * 0.1, right, top + h + laneH * 0.1);

  if (!ctx) return;
  noStroke();
  for (const ev of dropHistory) {
    const age = now - ev.t;
    if (age < 0 || age > TIMELINE_SEC) continue;
    const x = lerp(right, left, age / TIMELINE_SEC);
    const ly = top + (ev.loop + 0.5) * laneH;
    const hot = age < 0.45;
    fill(hot ? COL.amber : COL.ink2);
    const rad = (hot ? 0.17 : 0.10) * laneH;
    circle(x, ly, rad * 2);
  }
}

/* p5 non conosce la spaziatura fra lettere, che qui è parte dell'identità
   tipografica: la si compone lettera per lettera.                         */
function trackedText(str, x, y, tracking) {
  const chars = [...str];
  let w = 0;
  for (const c of chars) w += textWidth(c) + tracking;
  w -= tracking;
  let cx = x - w / 2;
  for (const c of chars) {
    const cw = textWidth(c);
    text(c, cx + cw / 2, y);
    cx += cw + tracking;
  }
}

/* ---------------------------------------------------------------------------
   Interazione: trascinamento verticale = durata · clic secco = silenzia
   Il simbolo ↻ rigenera l'idea di quella frase.
--------------------------------------------------------------------------- */
let drag = null, dragY = 0, dragV = 0, dragMoved = 0, dragT0 = 0;

/* Il disegno non chiama più per nome le funzioni dei comandi: annuncia che
   qualcosa è cambiato, e chi se ne occupa ascolta. Sketch e ui stanno sullo
   stesso piano — model ← audio ← sketch/ui — e una chiamata diretta fra pari
   è un legame che nessuna delle due parti dichiara.                        */
const annuncia = che => dispatchEvent(new CustomEvent("rada:" + che));

function cellAt(x, y) {
  for (const c of cells) {
    /* Finché il primo fotogramma non è passato, le celle esistono ma sono
       vuote: nessuna frase e raggio zero. E siccome regenHit non scende mai
       sotto i 22 px — serve al polpastrello — un tocco vicino all'origine
       troverebbe comunque il ↻ e chiederebbe di rigenerare il nulla.      */
    if (!c.L) continue;
    if (dist(x, y, c.cx + c.r * 0.95, c.cy - c.r * 1.20) < regenHit(c.r))
      return { cell: c, regen: true };
    if (dist(x, y, c.cx, c.cy) < c.r * 1.06)
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
   canvas — come faceva p5 — su un telefono non si riusciva a scorrere la
   pagina passando sopra mezza schermata di quadranti.

   La soluzione è spostare il bersaglio: il canvas lascia scorrere, e sopra ai
   quadranti stanno quattro riquadri trasparenti che invece trattengono il
   dito. Coprono il cerchio e il suo ↻, non tutta la cella, così le fasce fra
   un quadrante e l'altro tornano al browser.

   Perché non bastava restituire `false` dalle callback di p5: p5 2.x consegna
   i tocchi come POINTER EVENT, e per quelli lo scorrimento lo decide solo
   `touch-action` — `preventDefault` su pointerdown non lo ferma. Quindi
   l'unica leva è quale elemento riceve il tocco, ed è questa.

   Da qui viene anche tutta l'interazione col mouse: p5 ascolta su `window`,
   quindi le sue callback si sommerebbero a queste facendo scattare ogni
   gesto due volte. mousePressed/mouseDragged/mouseReleased sono state tolte.
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
  return { x: (e.clientX - r.left) * (width  / r.width),
           y: (e.clientY - r.top)  * (height / r.height) };
}

function armaZona(z) {
  z.addEventListener("pointerdown", e => {
    const p = puntoCanvas(e);
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
    if (!drag) return;
    moveAt(puntoCanvas(e).y);
    e.preventDefault();
  });

  const chiudi = e => {
    releaseDrag();
    if (z.hasPointerCapture(e.pointerId)) z.releasePointerCapture(e.pointerId);
  };
  z.addEventListener("pointerup", chiudi);
  z.addEventListener("pointercancel", chiudi);
}

/* Rete di sicurezza: se la cattura non è riuscita, o se il sistema porta via
   il gesto, il dito si alza lontano dal riquadro e `chiudi` non scatta — il
   trascinamento resterebbe attivo per sempre. Qui `releaseDrag` esce subito
   quando non c'è nulla da chiudere, quindi il doppio passaggio è innocuo.  */
addEventListener("pointerup",     () => { if (drag) releaseDrag(); });
addEventListener("pointercancel", () => { if (drag) releaseDrag(); });
