/* =============================================================================
   RADA · audio.js — il motore sonoro

   Usa la Web Audio API direttamente, non p5.sound: il cuore di Rada è uno
   SCHEDULER A LOOKAHEAD che prenota le gocce sul clock del motore audio, con
   precisione al campione. I timer di JavaScript sono troppo imprecisi per
   frasi che devono restare in fase per ore; p5.sound è pensato per gesti
   immediati, non per pianificazione temporale rigorosa. Qui la precisione
   è il punto, quindi si parla con l'API nativa.

   Catena: [gocce] → filtro passa-basso → (diretto + riverbero) → uscita
============================================================================= */

let ctx = null, master, verb, wetGain, dryGain, filt;
let running = false;

/* Storia delle gocce suonate di recente, per la fascia temporale condivisa
   del disegno: gli ultimi TIMELINE_SEC secondi di tutte e quattro le frasi
   sulla stessa riga del tempo. Scritta qui perché è lo scheduler a sapere
   con esattezza quando una goccia suona davvero; il disegno la legge soltanto,
   come già fa con L.cycles per la lancetta.                                */
const TIMELINE_SEC = 30;
const history = [];

/* --- costruzione del grafo ----------------------------------------------- */
function buildAudio() {
  ctx = new (window.AudioContext || window.webkitAudioContext)();

  master = ctx.createGain();
  master.gain.value = 0;

  verb = ctx.createConvolver();
  verb.buffer = makeImpulse(5.5);
  wetGain = ctx.createGain(); wetGain.gain.value = 0.6;
  dryGain = ctx.createGain(); dryGain.gain.value = 0.6;

  filt = ctx.createBiquadFilter();
  filt.type = "lowpass";
  filt.frequency.value = 4000;
  filt.Q.value = 0.6;

  filt.connect(dryGain); dryGain.connect(master);
  filt.connect(verb);    verb.connect(wetGain); wetGain.connect(master);
  master.connect(ctx.destination);

  restartCycles();
  setInterval(schedule, 25);
}

/* Impulso di riverbero: rumore con decadimento esponenziale. Sintetico, così
   non serve caricare un file esterno.                                      */
function makeImpulse(sec) {
  const len = Math.floor(ctx.sampleRate * sec);
  const b = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = b.getChannelData(ch);
    for (let i = 0; i < len; i++)
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.4);
  }
  return b;
}

/* Ripartenza dei cicli.
   La zona attiva di ogni frase comincia in un punto qualsiasi della
   circonferenza, quindi la sua prima goccia potrebbe cadere molto avanti nel
   giro: all'apertura si resterebbe in silenzio per parecchi secondi. Qui ogni
   ciclo viene quindi posizionato all'indietro, in modo che la prima goccia
   arrivi entro un attimo — con ingressi comunque sfalsati, perché le quattro
   frasi non attacchino all'unisono.                                        */
function restartCycles() {
  if (!ctx) return;
  const now = ctx.currentTime;
  loops.forEach((L, i) => {
    const firstPh = L.plan.length ? L.plan[0].ph : 0;
    const entrata = 0.2 + i * 0.28 + Math.random() * 0.25;   // 0,2 – 1,3 s
    L.cycleStart = now + entrata - firstPh * L.period;
    L.idx = 0;
    L.cycles = [{ start: L.cycleStart, period: L.period }];
  });
}

/* --- SCHEDULER ------------------------------------------------------------
   Ogni 25 ms guarda 150 ms avanti e prenota gli eventi sul clock audio.    */
function schedule() {
  if (!ctx || !running) return;
  const now = ctx.currentTime, horizon = now + 0.15;

  while (history.length && history[0].t < now - TIMELINE_SEC) history.shift();

  loops.forEach(L => {
    let guard = 0;
    while (guard++ < 300) {

      if (L.idx >= L.plan.length) {          // ciclo concluso → giro successivo
        L.cycleStart += L.period;
        L.period = L.target;                 // la nuova durata entra qui
        /* Lo scheduler corre avanti rispetto all'ascolto, quindi il disegno
           non può usare cycleStart/period: descrivono il ciclo in
           pianificazione, non quello udibile. La coda conserva
           l'informazione esatta per la lancetta.                          */
        L.cycles.push({ start: L.cycleStart, period: L.period });
        if (L.cycles.length > 8) L.cycles.shift();
        buildPlan(L);
        L.idx = 0;
        if (L.cycleStart > horizon) break;
        continue;
      }

      const p = L.plan[L.idx];
      const t = L.cycleStart + p.ph * L.period;
      if (t >= horizon) break;

      if (!L.muted && t >= now - 0.25) {
        /* Una goccia lievemente in ritardo (scatto di frame) si suona subito
           invece di perderla. Oltre il quarto di secondo è obsoleta — per
           esempio una scheda tornata in primo piano — e va scartata,
           altrimenti se ne scaricherebbero decine tutte insieme.          */
        const at = Math.max(t, now);
        playDrop(at, p.ev, L);
        p.ev.flash = at;
        history.push({ t: at, loop: L.i, rel: p.ev.rel });
      }
      L.idx++;
    }
  });
}

/* --- VOCE: una goccia -----------------------------------------------------
   Sintesi FM morbida: portante + modulante a rapporto armonico basso, più un
   filo di parziale "campana" scordata dell'1% per un battimento lento.
   L'inviluppo ha attacco brevissimo e coda lunga.                          */
function playDrop(when, ev, L) {
  const spread = G.spread / 100;
  const warmth = effWarmth;                 // calore già inclinato dall'ora
  const half = SCALE.length / 2;
  const freq = SCALE[clamp(Math.round(half + ev.rel * spread * half), 0, SCALE.length - 1)];

  const car = ctx.createOscillator();
  car.type = "sine"; car.frequency.value = freq;

  const mod = ctx.createOscillator();
  mod.type = "sine"; mod.frequency.value = freq * (warmth > 0.5 ? 2 : 3);
  const modGain = ctx.createGain();
  modGain.gain.value = freq * (0.6 - warmth * 0.45);
  mod.connect(modGain); modGain.connect(car.frequency);

  const par = ctx.createOscillator();
  par.type = "sine"; par.frequency.value = freq * 2.01;
  const parGain = ctx.createGain();
  parGain.gain.value = (1 - warmth) * 0.11;

  const env = ctx.createGain();
  env.gain.value = 0;
  const peak = 0.15 * ev.vel;
  const rel = 1.9 + warmth * 2.8;
  env.gain.setValueAtTime(0, when);
  env.gain.linearRampToValueAtTime(peak, when + 0.012);
  env.gain.exponentialRampToValueAtTime(0.0008, when + rel);

  const pan = ctx.createStereoPanner();
  pan.pan.value = clamp(L.pan + (Math.random() * 2 - 1) * 0.18, -1, 1);

  car.connect(env);
  par.connect(parGain); parGain.connect(env);
  env.connect(pan); pan.connect(filt);

  car.start(when); mod.start(when); par.start(when);
  const stop = when + rel + 0.1;
  car.stop(stop); mod.stop(stop); par.stop(stop);
}

/* --- modulazione lenta ----------------------------------------------------
   Chiamata a ogni fotogramma da draw(): smussa i parametri e applica la
   palette oraria. Gira anche a motore spento, così i cursori rispondono
   subito.                                                                  */
function tickParams() {
  for (const k in GT) G[k] += (GT[k] - G[k]) * 0.06;

  // se l'addensamento è cambiato, ricolloca le gocce senza risuonare quelle già emesse
  if (Math.abs(G.head - lastHead) > 0.3) {
    lastHead = G.head;
    rebuildPlans(ctx ? ctx.currentTime : null);
  }

  const pal = currentPalette;
  effWarmth = clamp(G.warmth + pal.warmBias,  0, 100) / 100;
  effRev    = clamp(G.rev    + pal.spaceBias, 0, 100) / 100;

  if (!ctx) return;
  const openness = clamp(45 + pal.toneBias, 0, 100);
  filt.frequency.setTargetAtTime(600 * Math.pow(16, openness / 100), ctx.currentTime, 0.5);
  wetGain.gain.setTargetAtTime(0.32 + effRev * 0.55, ctx.currentTime, 0.6);
  dryGain.gain.setTargetAtTime(0.75 - effRev * 0.25, ctx.currentTime, 0.6);
}

/* --- avvio / pausa --------------------------------------------------------
   La pausa non azzera nulla: dopo una breve dissolvenza ferma il clock del
   motore audio. Fermandolo, tutti i tempi già prenotati restano coerenti, e
   alla ripresa il collage riparte esattamente da dov'era invece di
   ricominciare da capo. È ciò che la parola "pausa" promette.             */
let sospensione = null;

async function togglePower() {
  if (!ctx) buildAudio();

  if (running) {
    running = false;
    onPowerChange(false);
    master.gain.setTargetAtTime(0, ctx.currentTime, 0.25);
    clearTimeout(sospensione);
    sospensione = setTimeout(() => {
      if (!running && ctx.state === "running") ctx.suspend();
    }, 900);
  } else {
    clearTimeout(sospensione);
    if (ctx.state === "suspended") { try { await ctx.resume(); } catch (e) {} }
    running = true;
    onPowerChange(true);
    master.gain.setTargetAtTime(0.9, ctx.currentTime, 0.4);
  }
}

/* tempo audio corrente, 0 se il motore non esiste ancora */
function audioNow() { return ctx ? ctx.currentTime : 0; }
