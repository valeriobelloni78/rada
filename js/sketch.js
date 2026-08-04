/* =============================================================================
   RADA · sketch.js — la parte visiva (p5.js, modalità globale)

   Tutti e quattro i quadranti vivono su UN SOLO canvas. È una scelta
   deliberata: avere un unico piano di disegno permette, in futuro, effetti
   che attraversano i loop — scie, linee di relazione, campi che reagiscono
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
let cells = [];             // geometria corrente dei quadranti
let hotDrops = [];          // gocce accese in questo fotogramma, per i legami effimeri
let holder;

/* Coda della lancetta: gli ultimi HAND_TRAIL_LEN angoli, per suggerire il
   moto anche nei giri lunghi dove lo spostamento fra un fotogramma e
   l'altro è appena percettibile. Buffer allocato una sola volta qui, non
   dentro draw: ogni fotogramma vi scrive sopra, non ne crea uno nuovo.    */
const HAND_TRAIL_LEN = 10;
const handTrail = loops.map(() => { const a = new Float32Array(HAND_TRAIL_LEN); a.fill(NaN); return a; });
const handTrailPos = new Int32Array(loops.length);

function setup() {
  holder = document.getElementById("canvas-holder");
  const s = canvasSize();
  const c = createCanvas(s.w, s.h);
  c.parent(holder);
  readPalette();
  textFont('"Helvetica Neue", -apple-system, system-ui, Roboto, Arial, sans-serif');
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
  const cols  = wide ? 4 : 2;
  const rows  = wide ? 1 : 2;
  const cell  = Math.min(avail / cols, 260);
  const stripH = cell * STRIP_FRAC;
  return { w: cell * cols, h: cell * rows + stripH, cols, rows, cell, stripH };
}

function windowResized() {
  const s = canvasSize();
  resizeCanvas(s.w, s.h);
}

function layout(s) {
  return loops.map((L, i) => {
    const col = i % s.cols, row = Math.floor(i / s.cols);
    return { L,
             cx: (col + 0.5) * s.cell,
             cy: (row + 0.5) * s.cell,
             r:  s.cell * 0.32 };
  });
}

function draw() {
  tickParams();                 // smussa i parametri e applica la palette oraria
  clear();
  const s = canvasSize();
  cells = layout(s);
  const now = audioNow();
  hotDrops.length = 0;
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
  trackedText("LOOP " + ROMAN[L.i], cx, cy - r * 1.20, r * 0.028);

  const overRegen = dist(mouseX, mouseY, cx + r * 0.95, cy - r * 1.20) < r * 0.22;
  fill(overRegen ? COL.amber : COL.dust);
  textSize(clamp(r * 0.17, 12, 17));
  text("↻", cx + r * 0.95, cy - r * 1.20);

  /* corona di trattini: scuri nella zona attiva, tenui nella coda vuota.
     L'addensamento viene dal PIANO, non dal valore live del cursore, così
     quel che vedi coincide sempre con quel che suona.                     */
  const head = L.planHead;
  for (let i = 0; i < TICKS; i++) {
    const a = -HALF_PI + i * TWO_PI / TICKS;
    const on = ((i / TICKS) - L.offset + 1) % 1 < head;
    const ri = (on ? R_ACTIVE : R_INNER) * r;
    stroke(on ? COL.ink : COL.hair);
    strokeWeight((on ? W_TICK_ON : W_TICK_OFF) * r);
    strokeCap(ROUND);
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
    if (hot) hotDrops.push({ x: dx, y: dy, t: p.ev.flash, loop: L.i });
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
    for (let k = 0; k < HAND_TRAIL_LEN; k++) {
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

  /* al centro: durata e numero di gocce */
  noStroke();
  fill(COL.ink);
  textSize(r * 0.30);
  text(L.target.toFixed(1) + "s", cx, cy - r * 0.04);
  fill(COL.dust);
  textSize(clamp(r * 0.085, 6.5, 8.5));
  const n = L.idea.length;
  trackedText((n + (n === 1 ? " GOCCIA" : " GOCCE")), cx, cy + r * 0.26, r * 0.022);

  pop();
}

/* ---------------------------------------------------------------------------
   Legami effimeri: quando due gocce di loop DIVERSI suonano a meno di
   LINK_WINDOW secondi l'una dall'altra, un filo sottile le unisce sul
   canvas condiviso e sfuma con loro. È il momento in cui il collage per un
   istante quasi coincide — mai per davvero, perché i periodi sono coprimi.
   Legge le posizioni raccolte in hotDrops durante drawDial di questo stesso
   fotogramma: nessun nuovo array, solo lettura di ciò che è già lì.        */
function drawLinks(now) {
  strokeCap(ROUND);
  for (let i = 0; i < hotDrops.length; i++) {
    for (let j = i + 1; j < hotDrops.length; j++) {
      const a = hotDrops[i], b = hotDrops[j];
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
   Fascia temporale condivisa: gli ultimi TIMELINE_SEC secondi di tutti e
   quattro i loop, una corsia per loop, sulla stessa riga del tempo. È il modo
   più diretto per vedere lo sfasamento reale — cosa che i quattro quadranti,
   isole indipendenti, non possono mostrare da soli.

   Legge `history`, scritta dallo scheduler in audio.js (stesso principio di
   L.cycles per la lancetta): il disegno non ricalcola nulla, mostra soltanto
   ciò che è stato davvero suonato.                                         */
function drawTimeline(s, now) {
  const top = s.rows * s.cell + s.stripH * 0.30;
  const h = s.stripH * 0.62;
  const laneH = h / loops.length;
  const left = s.w * 0.09, right = s.w * 0.97;

  noStroke();
  fill(COL.dust);
  textSize(clamp(s.stripH * 0.11, 7, 9));
  trackedText("ULTIMI 30 SECONDI", s.w / 2, s.rows * s.cell + s.stripH * 0.13, 1.3);

  for (let i = 0; i < loops.length; i++) {
    const ly = top + (i + 0.5) * laneH;
    stroke(COL.hair);
    strokeWeight(1);
    line(left, ly, right, ly);
    noStroke();
    fill(COL.dust);
    textSize(clamp(laneH * 0.4, 6, 8.5));
    trackedText(ROMAN[i], left - s.w * 0.035, ly, 0.5);
  }

  stroke(COL.dust);
  strokeWeight(1);
  line(right, top - laneH * 0.1, right, top + h + laneH * 0.1);   // "adesso"

  if (!ctx) return;
  noStroke();
  for (const ev of history) {
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
   Il simbolo ↻ rigenera l'idea di quel loop.
--------------------------------------------------------------------------- */
let drag = null, dragY = 0, dragV = 0, dragMoved = 0, dragT0 = 0;

function cellAt(x, y) {
  for (const c of cells) {
    if (dist(x, y, c.cx + c.r * 0.95, c.cy - c.r * 1.20) < c.r * 0.22)
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
  onRealignChange();                 // definita in ui.js
  return true;
}

function releaseDrag() {
  if (!drag) return;
  if (dragMoved < 5 && Date.now() - dragT0 < 350) {   // clic secco, non trascinamento
    drag.muted = !drag.muted;
    onLoopsChange();                 // definita in ui.js
  }
  onRealignChange();
  drag = null;
}

function mousePressed()  { if (pressAt(mouseX, mouseY)) return false; }
function mouseDragged()  { if (moveAt(mouseY)) return false; }
function mouseReleased() { releaseDrag(); }

function touchStarted() { if (touches.length && pressAt(touches[0].x, touches[0].y)) return false; }
function touchMoved()   { if (touches.length && moveAt(touches[0].y)) return false; }
function touchEnded()   { releaseDrag(); }
