/* =============================================================================
   RADA · droni.js — il riquadro delle tenute

   Quattro quadranti come quelli delle frasi, ma per la seconda classe di
   eventi. La differenza sta tutta in cosa si disegna dentro: le gocce sono
   punti, perché accadono in un istante; le tenute sono ARCHI, perché durano —
   e la durata è la loro sostanza. Un punto non la potrebbe mostrare.

   Due tele, perché due riquadri con un bordo proprio non possono condividerne
   una. Il ciclo di fotogrammi però resta uno solo — `ciclo` in sketch.js
   disegna le frasi e poi chiama `drawDroni` — così le due tele restano
   sincronizzate e non si sommano due animazioni indipendenti. Da sketch.js
   arrivano anche la palette, `lerp`, `fontPila` e `trackedText`: quando
   questo file è nato l'altro parlava p5 e non aveva nulla da prestare.

   Legge dal PIANO e dalla coda dei cicli, mai dai valori correnti: le stesse
   insidie del disegno principale valgono qui identiche (vedi CLAUDE.md).
============================================================================= */

const DR_TICKS      = 48;
const DR_R_INNER    = 0.815;   // estremo interno dei trattini
/* Gli archi occupano una fascia radiale molto più larga di quella delle
   gocce: essendo linee e non punti, due archi vicini di registro si
   confonderebbero in una macchia. Allargandola si legge il profilo delle
   altezze, che è l'informazione che l'arco porta oltre alla durata.
   Il limite esterno resta sotto la corona dei trattini (0,815), quello
   interno sopra il testo centrale.                                       */
const DR_R_ARCO     = 0.780;   // raggio massimo degli archi (registro acuto)
const DR_R_ARCO_LO  = 0.440;   // raggio minimo (registro grave)
const DR_R_HAND     = 0.704;
const DR_W_TICK     = 1.2 / 54;
const DR_STRIP_FRAC = 0.34;    // altezza della fascia, in frazioni del lato della cella

let drCv = null, dr2d = null, drHolder = null;
const drSize  = { w: 0, h: 0, cols: 0, rows: 0, cell: 0, stripH: 0 };
const drCells = droni.map(() => ({ L: null, cx: 0, cy: 0, r: 0 }));
const drZones = [];
let drDaRiposizionare = true;

/* Il bersaglio del ↻, come nei quadranti sopra: mai sotto il polpastrello. */
const drRegenHit = r => Math.max(r * 0.22, 22);

function drCanvasSize() {
  const avail = drHolder ? drHolder.clientWidth : 320;
  const wide  = avail >= 720;
  drSize.cols = wide ? 4 : 2;
  drSize.rows = wide ? 1 : 2;
  drSize.cell = Math.min(avail / drSize.cols, 260);
  drSize.stripH = drSize.cell * DR_STRIP_FRAC;
  drSize.w = drSize.cell * drSize.cols;
  drSize.h = drSize.cell * drSize.rows + drSize.stripH;
  return drSize;
}

function drLayout(s) {
  for (let i = 0; i < drCells.length; i++) {
    const c = drCells[i], col = i % s.cols, row = Math.floor(i / s.cols);
    c.L  = droni[i];
    c.cx = (col + 0.5) * s.cell;
    c.cy = (row + 0.5) * s.cell;
    c.r  = s.cell * 0.32;
  }
}

function setupDroni() {
  drHolder = document.getElementById("drone-holder");
  if (!drHolder) return;
  drCv = document.createElement("canvas");
  drCv.className = "droneCanvas";
  drHolder.appendChild(drCv);
  dr2d = drCv.getContext("2d");
  drBuildZones();
}

/* --- il disegno ----------------------------------------------------------- */
function drawDroni() {
  if (!dr2d) return;
  const s = drCanvasSize();

  /* Il rapporto fra pixel del dispositivo e pixel CSS: senza, su uno schermo
     ad alta densità il disegno esce sfocato. Stesso conto dell'altra tela. */
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  if (drCv.width !== Math.round(s.w * dpr) || drCv.height !== Math.round(s.h * dpr)) {
    drCv.width  = Math.round(s.w * dpr);
    drCv.height = Math.round(s.h * dpr);
    drCv.style.width  = s.w + "px";
    drCv.style.height = s.h + "px";
    drDaRiposizionare = true;
  }
  dr2d.setTransform(dpr, 0, 0, dpr, 0, 0);
  dr2d.clearRect(0, 0, s.w, s.h);

  drLayout(s);
  if (drDaRiposizionare) { drPlaceZones(); drDaRiposizionare = false; }

  const now = audioNow();
  for (const c of drCells) drawQuadranteTenute(c, now);
  drawFasciaTessuti(s, now);
}

/* ---------------------------------------------------------------------------
   LA FASCIA DEI TESSUTI, gemella di quella delle frasi e diversa per una cosa
   sola: là ogni evento è un punto, qui è un SEGMENTO. Una goccia accade in un
   istante e un punto la dice tutta; un tessuto occupa un tratto di tempo, e
   solo un segmento può mostrare quanto.

   È anche il posto dove la sovrapposizione — l'Intreccio — smette di essere
   un numero e si vede: quattro corsie di segmenti che si accavallano, o che
   lasciano dei vuoti.

   Qui NON si disegnano le quattro guide continue che stanno sotto le gocce.
   Là servono: un punto isolato, senza una riga che lo sostenga, galleggia.
   Un tessuto invece è già una linea orizzontale, e la guida gli passerebbe
   esattamente sotto — stessa forma, stessa corsia, un segno sopra l'altro.
   Restano soltanto i suoni: dove non si suona la corsia è vuota, ed è
   un'informazione anche quella.

   Legge `toneHistory`, scritta dallo scheduler: mostra ciò che è stato
   davvero suonato, non ciò che è in programma.                            */
function drawFasciaTessuti(s, now) {
  const g = dr2d;
  const top   = s.rows * s.cell + s.stripH * 0.16;
  const h     = s.stripH * 0.76;
  const laneH = h / droni.length;
  const left  = s.w * 0.03, right = s.w * 0.97;

  g.save();
  g.lineCap = "butt";

  /* le due barre che chiudono la fascia: a destra è adesso, a sinistra il
     fondo della memoria — identiche a quelle del riquadro sopra           */
  g.strokeStyle = COL.dust;
  g.lineWidth = 1;
  g.beginPath();
  g.moveTo(left,  top - laneH * 0.1); g.lineTo(left,  top + h + laneH * 0.1);
  g.moveTo(right, top - laneH * 0.1); g.lineTo(right, top + h + laneH * 0.1);
  g.stroke();

  if (!ctx) { g.restore(); return; }

  const ascissa = t => right + (left - right) * ((now - t) / TIMELINE_SEC);
  /* Un tratto solo, sottile, per tutti: la lunghezza dice la durata e il
     grigio dice se il suono è ancora aperto. Ingrossare quelli in corso
     aggiungerebbe una terza variabile a un segno che ne regge due.       */
  g.lineWidth = Math.max(1, laneH * 0.07);
  for (const ev of toneHistory) {
    if (ev.fino < now - TIMELINE_SEC) continue;
    const x0 = Math.max(left,  ascissa(ev.t));
    const x1 = Math.min(right, ascissa(Math.min(ev.fino, now)));
    if (x1 <= x0) continue;

    const aperto = ev.fino > now;          // sta ancora suonando: arriva fino a destra
    const spento = droni[ev.loop].muted || !tessutiOn;
    const ly = top + (ev.loop + 0.5) * laneH;
    g.strokeStyle = aperto ? COL.dust : COL.hair;
    g.globalAlpha = spento ? 0.3 : 1;
    g.beginPath(); g.moveTo(x0, ly); g.lineTo(x1, ly); g.stroke();
  }
  g.restore();
}

function drawQuadranteTenute(cell, now) {
  const { L, cx, cy, r } = cell;
  const g = dr2d;
  g.save();
  const spento = L.muted || !tessutiOn;
  g.globalAlpha = spento ? 0.3 : 1;

  /* etichetta e comando di rigenerazione */
  g.fillStyle = COL.dust;
  g.font = "400 " + clamp(r * 0.10, 7, 10).toFixed(1) + "px " + fontPila();
  g.textAlign = "center"; g.textBaseline = "middle";
  trackedText(dr2d, CANVAS.drone[L.i], cx, cy - r * 1.20, r * 0.028 * CANVAS.trackMul);

  const sopraRegen = drPuntatore.x >= 0 &&
    Math.hypot(drPuntatore.x - (cx + r * 0.95), drPuntatore.y - (cy - r * 1.20)) < drRegenHit(r);
  g.fillStyle = sopraRegen ? COL.amber : COL.dust;
  g.font = "300 " + clamp(r * 0.17, 12, 17).toFixed(1) + "px " + fontPila();
  g.fillText("↻", cx + r * 0.95, cy - r * 1.20);

  /* corona di trattini: qui è sempre tenue e uniforme. Nei quadranti delle
     frasi la corona distingue la zona attiva dalla coda vuota; le tenute non
     hanno una zona attiva — si distribuiscono su tutto il giro — quindi non
     c'è nulla da distinguere, e una corona uniforme lo dice.               */
  g.strokeStyle = COL.hair;
  g.lineWidth = DR_W_TICK * r;
  g.lineCap = "round";
  for (let i = 0; i < DR_TICKS; i++) {
    const a = -Math.PI / 2 + i * Math.PI * 2 / DR_TICKS;
    const ri = DR_R_INNER * r;
    g.beginPath();
    g.moveTo(cx + Math.cos(a) * ri, cy + Math.sin(a) * ri);
    g.lineTo(cx + Math.cos(a) * r,  cy + Math.sin(a) * r);
    g.stroke();
  }

  /* GLI ARCHI. Ognuno copre la porzione di giro in cui la tenuta resta
     aperta; la distanza dal centro segue il registro, come per le gocce.
     Quello che sta suonando adesso si accende — e si accende per tutto il
     tempo in cui suona, non per un lampo: è la differenza fra le due classi,
     resa visibile.                                                        */
  g.lineCap = "butt";
  for (const p of L.plan) {
    const ev = p.ev;
    const suona = now >= ev.flash && now < ev.fino;
    const appena = suona && now - ev.flash < 0.45;   // l'istante in cui si apre
    const a0 = -Math.PI / 2 + p.ph * Math.PI * 2;
    const a1 = a0 + clamp(ev.dur, 0.02, 1) * Math.PI * 2;
    const rr = lerp(DR_R_ARCO_LO, DR_R_ARCO, (ev.rel + 1) / 2) * r;

    /* Tre stati, e l'arancione ne occupa solo uno. Una goccia lampeggia per
       meno di mezzo secondo; una tenuta resta aperta anche trenta secondi, e
       tenerla arancione per tutto quel tempo riempirebbe la pagina dell'unico
       accento che il progetto vuole raro. Quindi: arancione solo nell'istante
       in cui si apre — lo stesso lampo delle gocce, per lo stesso motivo —
       poi inchiostro pieno finché suona, filo tenue quando tace.          */
    g.strokeStyle = appena ? COL.amber : suona ? COL.ink : COL.ink2;
    /* Tratto sottile: un arco è lungo — copre spesso mezzo giro — e a parità
       di spessore pesa molto più di una goccia. Il minimo di un pixel evita
       che su un telefono, dove il raggio si dimezza, sparisca del tutto.   */
    g.lineWidth = Math.max(1, (suona ? 1.2 : 0.7) / 54 * r);
    g.globalAlpha = (spento ? 0.3 : 1) * (suona ? 1 : 0.5);
    g.beginPath();
    g.arc(cx, cy, rr, a0, a1);
    g.stroke();
  }
  g.globalAlpha = spento ? 0.3 : 1;

  /* lancetta: fase udibile esatta, dalla coda dei cicli */
  if (ctx && running && tessutiOn && !L.muted && L.cycles.length) {
    while (L.cycles.length > 1 && now >= L.cycles[0].start + L.cycles[0].period)
      L.cycles.shift();
    const c = L.cycles[0];
    const a = -Math.PI / 2 + clamp((now - c.start) / c.period, 0, 1) * Math.PI * 2;
    g.strokeStyle = COL.amber;
    g.lineWidth = 1.4 / 54 * r;
    g.lineCap = "round";
    g.beginPath();
    g.moveTo(cx, cy);
    g.lineTo(cx + Math.cos(a) * DR_R_HAND * r, cy + Math.sin(a) * DR_R_HAND * r);
    g.stroke();
  }

  /* al centro: la durata, e nient'altro */
  g.fillStyle = COL.ink;
  g.font = "200 " + (r * 0.30).toFixed(1) + "px " + fontPila();
  g.fillText(fmtOne(L.target) + CANVAS.seconds, cx, cy);

  g.restore();
}

/* --- interazione: gli stessi quattro riquadri trasparenti dei quadranti ----
   Stessa ragione di sempre: il canvas lascia scorrere la pagina, i riquadri
   trattengono il dito dove c'è qualcosa da trascinare.                     */
const drPuntatore = { x: -1, y: -1 };
let drDrag = null, drDragY = 0, drDragV = 0, drMosso = 0, drT0 = 0;

function drBuildZones() {
  for (let i = 0; i < droni.length; i++) {
    const z = document.createElement("div");
    z.className = "dialZone";
    drHolder.appendChild(z);
    drArmaZona(z);
    drZones.push(z);
  }
}

function drPlaceZones() {
  if (!drCv) return;
  const offL = drCv.offsetLeft, offT = drCv.offsetTop;
  drCells.forEach((c, i) => {
    const hit   = drRegenHit(c.r);
    const left  = c.cx - 1.06 * c.r;
    const right = Math.max(c.cx + 1.06 * c.r, c.cx + 0.95 * c.r + hit);
    const top   = Math.min(c.cy - 1.06 * c.r, c.cy - 1.20 * c.r - hit);
    const bot   = c.cy + 1.06 * c.r;
    const st = drZones[i].style;
    st.left   = (offL + left) + "px";
    st.top    = (offT + top)  + "px";
    st.width  = (right - left) + "px";
    st.height = (bot - top)    + "px";
  });
}

function drPunto(e) {
  const r = drCv.getBoundingClientRect();
  return { x: (e.clientX - r.left) * (drSize.w / r.width),
           y: (e.clientY - r.top)  * (drSize.h / r.height) };
}

function drCellAt(x, y) {
  for (const c of drCells) {
    if (!c.L) continue;
    if (Math.hypot(x - (c.cx + c.r * 0.95), y - (c.cy - c.r * 1.20)) < drRegenHit(c.r))
      return { cell: c, regen: true };
    if (Math.hypot(x - c.cx, y - c.cy) < c.r * 1.06)
      return { cell: c, regen: false };
  }
  return null;
}

function drArmaZona(z) {
  z.addEventListener("pointerdown", e => {
    const p = drPunto(e);
    drPuntatore.x = p.x; drPuntatore.y = p.y;
    const h = drCellAt(p.x, p.y);
    if (!h) return;
    e.preventDefault();
    if (h.regen) { regeneraTenute(h.cell.L); return; }
    drDrag = h.cell.L; drMosso = 0; drT0 = Date.now();
    drDragY = p.y; drDragV = drDrag.target;
    try { z.setPointerCapture(e.pointerId); } catch (err) {}
  });

  z.addEventListener("pointermove", e => {
    const p = drPunto(e);
    drPuntatore.x = p.x; drPuntatore.y = p.y;
    if (!drDrag) return;
    const dy = drDragY - p.y;
    drMosso = Math.max(drMosso, Math.abs(dy));
    drDrag.target = clamp(drDragV + dy / 130 * (DRONE_MAX - DRONE_MIN), DRONE_MIN, DRONE_MAX);
    onDroniChange();
    e.preventDefault();
  });

  const chiudi = e => {
    drReleaseDrag();
    if (z.hasPointerCapture(e.pointerId)) z.releasePointerCapture(e.pointerId);
  };
  z.addEventListener("pointerup", chiudi);
  z.addEventListener("pointercancel", chiudi);
  z.addEventListener("pointerleave", () => { drPuntatore.x = -1; drPuntatore.y = -1; });
}

function drReleaseDrag() {
  if (!drDrag) return;
  if (drMosso < 5 && Date.now() - drT0 < 350) {   // clic secco, non trascinamento
    drDrag.muted = !drDrag.muted;
  }
  onDroniChange();
  drDrag = null;
}

addEventListener("pointerup",     () => { if (drDrag) drReleaseDrag(); });
addEventListener("pointercancel", () => { if (drDrag) drReleaseDrag(); });
