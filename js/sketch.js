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
const R_DROPS    = 0.741;   // corona su cui siedono le gocce
const R_HAND     = 0.704;   // lunghezza della lancetta
const W_TICK_ON  = 1.8 / 54, W_TICK_OFF = 1.2 / 54;
const R_DROP     = 2.1 / 54, R_DROP_HOT = 3.6 / 54;

let COL = {};               // palette letta dal CSS
let cells = [];             // geometria corrente dei quadranti
let holder;

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

/* Quattro celle quadrate: in fila su schermo largo, due per due su stretto. */
function canvasSize() {
  const avail = holder ? holder.clientWidth : 320;
  const wide  = avail >= 720;
  const cols  = wide ? 4 : 2;
  const rows  = wide ? 1 : 2;
  const cell  = Math.min(avail / cols, 260);
  return { w: cell * cols, h: cell * rows, cols, rows, cell };
}

function windowResized() {
  const s = canvasSize();
  resizeCanvas(s.w, s.h);
}

function layout() {
  const s = canvasSize();
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
  cells = layout();
  const now = audioNow();
  for (const c of cells) drawDial(c, now);
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

  /* le gocce, che si accendono quando suonano */
  noStroke();
  for (const p of L.plan) {
    const a = -HALF_PI + p.ph * TWO_PI;
    const dt = now - p.ev.flash;
    const hot = dt >= 0 && dt < 0.45;
    fill(hot ? COL.amber : COL.ink2);
    const rad = (hot ? R_DROP_HOT : R_DROP) * r;
    circle(cx + cos(a) * R_DROPS * r, cy + sin(a) * R_DROPS * r, rad * 2);
  }

  /* lancetta: fase udibile esatta, presa dalla coda dei cicli */
  if (ctx && running && !L.muted && L.cycles.length) {
    while (L.cycles.length > 1 && now >= L.cycles[0].start + L.cycles[0].period)
      L.cycles.shift();
    const c = L.cycles[0];
    const a = -HALF_PI + clamp((now - c.start) / c.period, 0, 1) * TWO_PI;
    stroke(COL.amber);
    strokeWeight(1.4 * s);
    line(cx, cy, cx + cos(a) * R_HAND * r, cy + sin(a) * R_HAND * r);
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
